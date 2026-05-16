import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'
import * as api from '../services/auth'
import * as gamificationApi from '../services/gamification'

export default function Profile() {
  const { accessToken, logout, user: authUser } = useAuth()
  const nav = useNavigate()
  const [profile, setProfile]           = useState<any>(null)
  const [xp, setXp]                     = useState<number>(0)
  const [streak, setStreak]             = useState<number>(0)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [msg, setMsg]                   = useState('')
  const [uploading, setUploading]       = useState(false)
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (!accessToken) return
    api.getProfile(accessToken)
      .then(data => {
        setProfile(data)
        setDisplayNameInput(data?.profile?.display_name ?? '')
        setEmailInput(data?.user?.email ?? '')
        setUsernameInput(data?.user?.username ?? '')
      })
      .catch(() => setMsg('Error al cargar el perfil'))
      .finally(() => setLoading(false))
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !profile?.user?.user_id) return
    const uid = profile.user.user_id
    Promise.all([
      gamificationApi.getXp(accessToken, uid),
      gamificationApi.getStreak(accessToken, uid),
      gamificationApi.getAchievements(accessToken, uid)
    ]).then(([xpRes, streakRes, achRes]) => {
      setXp(xpRes?.totalPoints || 0)
      setStreak(streakRes?.currentStreak || 0)
      setAchievements(achRes || [])
    }).catch(() => setMsg('Error al cargar estadísticas'))
  }, [accessToken, profile?.user?.user_id])

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  const handleAvatarChange = async (file: File) => {
    if (!accessToken || !profile?.user?.user_id) return
    setUploading(true)
    setMsg('')
    try {
      const uploaded = await api.uploadAvatar(profile.user.user_id, accessToken, file)
      await api.updateProfile(accessToken, { avatar_url: uploaded.url })
      const refreshed = await api.getProfile(accessToken)
      setProfile(refreshed)
    } catch (e: any) {
      setMsg(e?.message || 'Error al subir avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!accessToken) return
    setMsg('')
    try {
      await api.updateProfile(accessToken, { display_name: displayNameInput || undefined })
      const refreshed = await api.getProfile(accessToken)
      setProfile(refreshed)
    } catch (e: any) {
      setMsg(e?.message || 'Error al guardar perfil')
    }
  }

  const handleSaveAccount = async () => {
    if (!accessToken) return
    setMsg('')
    try {
      await api.updateUser(accessToken, { username: usernameInput || undefined, email: emailInput || undefined })
      const refreshed = await api.getProfile(accessToken)
      setProfile(refreshed)
      setMsg('Cuenta actualizada')
    } catch (e: any) {
      setMsg(e?.message || 'Error al guardar cuenta')
    }
  }

  const handleChangePassword = async () => {
    if (!accessToken) return
    setMsg('')
    try {
      await api.changePassword(accessToken, { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setMsg('Password actualizado')
    } catch (e: any) {
      setMsg(e?.message || 'Error al actualizar password')
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="auth-loading-owl">🦉</div>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  const username = profile?.user?.username ?? authUser?.username ?? 'Aprendiz'
  const email    = profile?.user?.email    ?? authUser?.email    ?? '—'
  const displayName = profile?.profile?.display_name ?? username
  const avatarUrl = profile?.profile?.avatar_url || null
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="profile-page">

      {/* Header card */}
      <div className="profile-header-card">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="profile-avatar-img" />
          ) : (
            initials
          )}
        </div>
        <div className="profile-header-info">
          <h2 className="profile-username">{displayName}</h2>
          <p className="profile-email">{email}</p>
        </div>
        <button className="profile-logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Avatar</h3>
        <div className="profile-avatar-uploader">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleAvatarChange(file)
            }}
          />
          {uploading && <span className="profile-uploading">Subiendo...</span>}
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Nombre visible</h3>
        <input
          type="text"
          placeholder="Tu nombre visible"
          value={displayNameInput}
          onChange={(e) => setDisplayNameInput(e.target.value)}
        />
        <button className="primary" onClick={handleSaveProfile}>Guardar nombre</button>
      </div>

      <div className="profile-section">
       <h3 className="profile-section-title">Cuenta</h3>
        <input
          type="text"
          placeholder="Usuario"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <input
          type="email"
          placeholder="Correo"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <button className="primary" onClick={handleSaveAccount}>Guardar cuenta</button>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Seguridad</h3>
        <input
          type="password"
          placeholder="Password actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nuevo password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button className="primary" onClick={handleChangePassword}>Cambiar password</button>
      </div>

      {/* Stats grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span className="profile-stat-icon">⚡</span>
          <span className="profile-stat-value">{xp}</span>
          <span className="profile-stat-label">XP Total</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-icon">🔥</span>
          <span className="profile-stat-value">{streak}</span>
          <span className="profile-stat-label">Racha (días)</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-icon">🏆</span>
          <span className="profile-stat-value">{achievements.length}</span>
          <span className="profile-stat-label">Logros</span>
        </div>
      </div>

      {/* Achievements */}
      <div className="profile-section">
        <h3 className="profile-section-title">Logros</h3>
        {achievements.length === 0 ? (
          <div className="profile-empty">
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <p>Completa lecciones para desbloquear logros.</p>
          </div>
        ) : (
          <div className="profile-achievements-grid">
            {achievements.map(a => (
              <div key={a.id} className="profile-achievement-chip">
                <span className="achievement-emoji">🏅</span>
                <span className="achievement-name">{a.name ?? a.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {msg && <p className="lesson-msg">{msg}</p>}
    </div>
  )
}