import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../state/auth'
import * as contentApi from '../services/content'
import Confetti from 'react-confetti'

export default function LessonExercises() {
  const { accessToken } = useAuth()
  const { lessonId } = useParams()
  const nav = useNavigate()
  const location = useLocation()
  const lessonTitle = (location.state as any)?.lessonTitle

  const [exercises, setExercises]             = useState<any[]>([])
  const [loadingExercises, setLoadingExercises] = useState(false)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({})
  const [exerciseResults, setExerciseResults] = useState<Record<string, any>>({})
  const [audioResults, setAudioResults]       = useState<Record<string, any>>({})
  const [lessonLives, setLessonLives]         = useState<number | null>(null)
  const [nextLifeSeconds, setNextLifeSeconds] = useState(0)
  const [msg, setMsg]                         = useState('')
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [showConfetti, setShowConfetti]       = useState(false)
  const [checking, setChecking]               = useState(false)

  const [recordingExerciseId, setRecordingExerciseId] = useState<string | null>(null)
  const [recordedAudio, setRecordedAudio]     = useState<Record<string, { blob: Blob; url: string }>>({})
  const [hasFreshRecording, setHasFreshRecording] = useState<Record<string, boolean>>({})
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef   = React.useRef<Blob[]>([])

  const totalExercises  = exercises.length
  const answeredCount   = exercises.filter(ex => {
    if (ex.type === 'PRONUNCIATION') {
      return !!exerciseResults[ex.id]?.correct
    }
    return !!(exerciseResults[ex.id] || audioResults[ex.id])
  }).length
  const progressPercent = totalExercises ? Math.round((answeredCount / totalExercises) * 100) : 0
  const currentExercise = exercises[currentExerciseIndex]
  const isLast          = currentExerciseIndex === totalExercises - 1
  const currentResult  = currentExercise ? exerciseResults[currentExercise.id] : null

  // An exercise is "done" if it has a text result OR an audio result (pronunciation)
  const isAnswered = currentExercise
    ? currentExercise.type === 'PRONUNCIATION'
      ? !!currentResult?.correct
      : !!(exerciseResults[currentExercise.id] || audioResults[currentExercise.id])
    : false
  const isCorrect      = currentResult?.correct

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2,'0')}:${Math.floor(s % 60).toString().padStart(2,'0')}`

  /* ── Timer ────────────────────────────────────── */
  useEffect(() => {
    if (nextLifeSeconds <= 0) return
    const id = setInterval(() => setNextLifeSeconds(p => p > 0 ? p - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [nextLifeSeconds])

  /* ── Load exercises ───────────────────────────── */
  useEffect(() => {
    if (!accessToken || !lessonId) return
    setLoadingExercises(true)
    Promise.all([
      contentApi.getExercisesByLesson(accessToken, lessonId),
      contentApi.getLessonLives(accessToken, lessonId),
    ])
      .then(([data, livesData]) => {
        setExercises(data || [])
        setCurrentExerciseIndex(0)
        if (typeof livesData?.lives === 'number') setLessonLives(livesData.lives)
        if (typeof livesData?.nextLifeInSeconds === 'number') setNextLifeSeconds(livesData.nextLifeInSeconds)
      })
      .catch(err => setMsg(err?.message || 'Error al cargar ejercicios'))
      .finally(() => setLoadingExercises(false))
  }, [accessToken, lessonId])

  /* ── Validate text answer ─────────────────────── */
  const handleValidate = async () => {
    if (!accessToken || !currentExercise || checking) return
    const answer = exerciseAnswers[currentExercise.id] || ''
    if (!answer.trim()) { setMsg('Escribe tu respuesta antes de verificar.'); return }
    setMsg(''); setChecking(true)
    try {
      const result = await contentApi.validateExercise(accessToken, currentExercise.id, answer)
      setExerciseResults(prev => ({ ...prev, [currentExercise.id]: result }))
      if (typeof result?.lives === 'number') setLessonLives(result.lives)
      const livesData = await contentApi.getLessonLives(accessToken, lessonId!)
      if (typeof livesData?.nextLifeInSeconds === 'number') setNextLifeSeconds(livesData.nextLifeInSeconds)
    } catch (err: any) {
      setMsg(err?.message || 'Error al verificar')
    } finally {
      setChecking(false)
    }
  }

  /* ── Recording ────────────────────────────────── */
  const startRecording = async (exerciseId: string) => {
    if (!navigator.mediaDevices?.getUserMedia) { setMsg('Tu navegador no soporta grabación.'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus'
      ]
      const chosenType = preferredTypes.find(t => MediaRecorder.isTypeSupported(t))
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream, chosenType ? { mimeType: chosenType } : undefined)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = e => { if (e.data?.size > 0) audioChunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: chosenType || 'audio/webm' })
        setRecordedAudio(prev => ({ ...prev, [exerciseId]: { blob, url: URL.createObjectURL(blob) } }))
        setHasFreshRecording(prev => ({ ...prev, [exerciseId]: true }))
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      setRecordingExerciseId(exerciseId)
    } catch { setMsg('Permiso de micrófono denegado.') }
  }

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecordingExerciseId(null) }

  const sendRecording = async (exercise: any) => {
    if (!accessToken) return
    const rec = recordedAudio[exercise.id]
    if (!rec) { setMsg('Graba tu pronunciación primero.'); return }
    setMsg(''); setChecking(true)
    try {
      const file = new File([rec.blob], `rec-${exercise.id}.webm`, { type: 'audio/webm' })
      const result = await contentApi.validateExerciseAudio(accessToken, exercise.id, {
        word: exercise.correct_answer,
        expectedText: exercise.correct_answer,
        audio: file,
      })
      // Save in audioResults AND mark as answered in exerciseResults so the button unlocks
      setAudioResults(prev => ({ ...prev, [exercise.id]: result }))
      setExerciseResults(prev => ({ ...prev, [exercise.id]: { correct: result.correct, ...result } }))
      setHasFreshRecording(prev => ({ ...prev, [exercise.id]: false }))
    } catch (err: any) {
      setMsg(err?.message || 'Error al evaluar pronunciación')
    } finally {
      setChecking(false)
    }
  }

  /* ── Finish ───────────────────────────────────── */
  const handleFinish = () => {
    setShowConfetti(true)
    setTimeout(() => nav('/content', { state: { showConfetti: true } }), 900)
  }

  if (!accessToken || !lessonId) return null

  return (
    <div className="lesson-page">
      {showConfetti && <Confetti recycle={false} numberOfPieces={160} />}

      {/* ── Top bar ─────────────────────────────── */}
      <div className="lesson-topbar">
        <button className="lesson-exit-btn" onClick={() => nav('/content')}>✕</button>

        <div className="lesson-progress-wrap">
          <div className="lesson-progress-bar-outer">
            <div className="lesson-progress-bar-inner" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="lesson-progress-meta">
            {currentExercise?.type === 'PRONUNCIATION'
              ? `Intentos ${answeredCount}/${totalExercises}`
              : `Progreso ${answeredCount}/${totalExercises}`}
          </div>
        </div>

        <div className="lesson-lives-wrap">
          {typeof lessonLives === 'number' && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < lessonLives ? 'heart' : 'heart empty'}>
                  {i < lessonLives ? '❤️' : '🤍'}
                </span>
              ))}
            </>
          )}
          {nextLifeSeconds > 0 && (
            <span className="lesson-lives-timer">{fmt(nextLifeSeconds)}</span>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────── */}
      <div className="lesson-body">
        {loadingExercises && (
          <div className="lesson-loading">Cargando ejercicios...</div>
        )}

        {!loadingExercises && exercises.length === 0 && (
          <div className="lesson-empty">No hay ejercicios para esta lección.</div>
        )}

        {currentExercise && (
          <>
            {/* Type pill */}
            <div className="lesson-exercise-type">{currentExercise.type}</div>

            {/* Prompt */}
            <h2 className="lesson-prompt">{currentExercise.prompt}</h2>

            {/* ── Text input (non-pronunciation) ── */}
            {currentExercise.type !== 'PRONUNCIATION' && (
              <input
                className="lesson-input"
                placeholder="Escribe tu respuesta..."
                value={exerciseAnswers[currentExercise.id] || ''}
                onChange={e => {
                  if (isAnswered) return
                  setExerciseAnswers(prev => ({ ...prev, [currentExercise.id]: e.target.value }))
                }}
                onKeyDown={e => { if (e.key === 'Enter' && !isAnswered) handleValidate() }}
                disabled={isAnswered}
                autoFocus
              />
            )}

            {/* ── Pronunciation controls ─────────── */}
            {currentExercise.type === 'PRONUNCIATION' && (
              <div className="lesson-audio-wrap">
                <button
                  className={recordingExerciseId === currentExercise.id ? 'lesson-btn-record recording' : 'lesson-btn-record'}
                  onClick={() =>
                    recordingExerciseId === currentExercise.id
                      ? stopRecording()
                      : startRecording(currentExercise.id)
                  }
                  disabled={isAnswered}
                >
                  {recordingExerciseId === currentExercise.id ? (
                    <><div className="recording-wave"><span/><span/><span/><span/></div> Detener</>
                  ) : '🎙️ Grabar'}
                </button>

                {recordedAudio[currentExercise.id] && !isAnswered && (
                  <div className="lesson-audio-controls">
                    <audio controls src={recordedAudio[currentExercise.id].url} />
                    <button
                      className="lesson-btn-send"
                      onClick={() => sendRecording(currentExercise)}
                      disabled={checking || !hasFreshRecording[currentExercise.id]}
                    >
                      {checking ? 'Evaluando...' : 'Enviar grabación'}
                    </button>
                  </div>
                )}

                {audioResults[currentExercise.id] && (
                  <div className={`lesson-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
                    <div className="feedback-icon">{isCorrect ? '✅' : '❌'}</div>
                    <div className="feedback-body">
                      <p className="feedback-title">
                        {isCorrect ? 'Pronunciación correcta' : 'Intenta de nuevo'}
                      </p>
                      <p className="feedback-detail">
                        Puntuación: {audioResults[currentExercise.id].score}
                      </p>
                      {audioResults[currentExercise.id].feedback && (
                        <p className="feedback-detail">{audioResults[currentExercise.id].feedback}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Feedback banner ────────────────── */}
            {isAnswered && currentExercise.type !== 'PRONUNCIATION' && (
              <div className={`lesson-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
                <div className="feedback-icon">{isCorrect ? '✅' : '❌'}</div>
                <div className="feedback-body">
                  <p className="feedback-title">
                    {isCorrect ? '¡Correcto!' : 'Respuesta incorrecta'}
                  </p>
                  {currentResult?.feedback && (
                    <p className="feedback-detail">{currentResult.feedback}</p>
                  )}
                  {currentResult?.vocabInfo && (
                    <div className="vocab-info">
                      {currentResult.vocabInfo.ipa && (
                        <span className="vocab-ipa">IPA: {currentResult.vocabInfo.ipa}</span>
                      )}
                      {Array.isArray(currentResult.vocabInfo.meanings) &&
                        currentResult.vocabInfo.meanings.map((m: any) => (
                          <div key={m.id}>
                            <p className="vocab-meaning-text">{m.meaning}</p>
                            {m.examples?.length > 0 && (
                              <ul className="vocab-examples">
                                {m.examples.map((ex: any) => (
                                  <li key={ex.id}>{ex.example_text}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  )}
                  {currentResult?.repeat && (
                    <p className="repeat-note">Reintento — no afecta XP ni vidas.</p>
                  )}
                  {typeof currentResult?.lives === 'number' && (
                    <div className="lives-row" style={{ marginTop: 8 }}>
                      <span className="lives-label">Vidas:</span>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={i < currentResult.lives ? 'heart' : 'heart empty'}>
                          {i < currentResult.lives ? '❤️' : '🤍'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {msg && <p className="lesson-msg">{msg}</p>}
          </>
        )}
      </div>

      {/* ── Footer action bar ───────────────────── */}
      {currentExercise && (
        <div className={`lesson-footer ${
          isAnswered
            ? isCorrect ? 'footer-correct' : 'footer-wrong'
             : ''
        }`}>
          {currentExerciseIndex > 0 && !isAnswered && (
            <button className="lesson-btn-skip" onClick={() => setCurrentExerciseIndex(i => i - 1)}>
              Anterior
            </button>
          )}

          {!isAnswered && currentExercise.type !== 'PRONUNCIATION' && (
            <button
              className="lesson-btn-check"
              onClick={handleValidate}
              disabled={checking || !exerciseAnswers[currentExercise.id]?.trim()}
            >
              {checking ? 'Verificando...' : 'VERIFICAR'}
            </button>
          )}

          {isAnswered && !isLast && (
            <button
              className="lesson-btn-check"
              onClick={() => setCurrentExerciseIndex(i => i + 1)}
              disabled={currentExercise.type === 'PRONUNCIATION' && !isCorrect}
            >
              {currentExercise.type === 'PRONUNCIATION' && !isCorrect ? 'INTENTA DE NUEVO' : 'SIGUIENTE'}
            </button>
          )}

          {isAnswered && isLast && (
            <button className="lesson-btn-check" onClick={handleFinish}>
              VER RESULTADO
            </button>
          )}
        </div>
      )}
    </div>
  )
}
