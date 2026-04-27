import { v4 as uuidv4 } from 'uuid';
import pool from '../database/connection';
import { Unit, UnitTable } from '../models/unit.model';
import { Lesson, LessonTable } from '../models/lesson.model';
import { Exercise, ExerciseTable } from '../models/exercise.model';
import * as vocabularyClient from '../clients/vocabulary.client';

export async function createUnit(data: { title: string; description?: string }) {
  const id = uuidv4();
  await pool.execute(
    `INSERT INTO ${UnitTable} (id, title, description, created_at) VALUES (?, ?, ?, NOW())`,
    [id, data.title, data.description || null]
  );
  return { id, ...data } as Unit;
}

export async function getAllUnits(): Promise<Unit[]> {
  const [rows] = await pool.execute<any[]>(`SELECT id, title, description, created_at FROM ${UnitTable} ORDER BY created_at DESC`);
  return rows as Unit[];
}

export async function createLesson(data: { unit_id: string; title: string; content?: string }) {
  const id = uuidv4();
  // Validar que la unidad exista
  const [unit] = await pool.execute<any[]>(
  `SELECT id FROM ${UnitTable} WHERE id = ? LIMIT 1`,
  [data.unit_id]
  );

  if (!unit.length) {
  const error: any = new Error('Unit not found');
  error.status = 404;
  throw error;
  }
  await pool.execute(
    `INSERT INTO ${LessonTable} (id, unit_id, title, content, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [id, data.unit_id, data.title, data.content || null]
  );
  return { id, ...data } as Lesson;
}

export async function getLessonsByUnit(unitId: string): Promise<Lesson[]> {
  const [rows] = await pool.execute<any[]>(`SELECT id, unit_id, title, content, created_at FROM ${LessonTable} WHERE unit_id = ? ORDER BY created_at DESC`, [unitId]);
  return rows as Lesson[];
}

export async function createExercise(data: { 
  lesson_id: string; 
  prompt: string; 
  correct_answer: string; 
  type: string 
}) {
  const id = uuidv4();
  // Validar que la lección exista
  const [lesson] = await pool.execute<any[]>(
  `SELECT id FROM ${LessonTable} WHERE id = ? LIMIT 1`,
  [data.lesson_id]
  );

  if (!lesson.length) {
  const error: any = new Error('Lesson not found');
  error.status = 404;
  throw error;
  }
  await pool.execute(
    `INSERT INTO ${ExerciseTable} (id, lesson_id, prompt, correct_answer, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
    [id, data.lesson_id, data.prompt, data.correct_answer, data.type]
  );
  return { id, ...data } as Exercise;
}

export async function getExercisesByLesson(lessonId: string): Promise<Exercise[]> {
  const [rows] = await pool.execute<any[]>(`SELECT id, lesson_id, prompt, correct_answer, type, created_at FROM ${ExerciseTable} WHERE lesson_id = ? ORDER BY created_at DESC`, [lessonId]);
  return rows as Exercise[];
}

export async function validateExerciseAnswer(exerciseId: string, answer: string): Promise<{ correct: boolean; expected?: string }> {
  const [rows] = await pool.execute<any[]>(`SELECT correct_answer FROM ${ExerciseTable} WHERE id = ? LIMIT 1`, [exerciseId]);
  const row = rows[0];
  if (!row) {
  const error: any = new Error('Exercise not found');
  error.status = 404;
  throw error;
  }
  const expected = row.correct_answer;
  const normalize = (text: string) =>
  text.trim().toLowerCase();

  const normalizedAnswer = String(answer).trim().toLowerCase();
  const normalizedExpected = String(expected).trim().toLowerCase();

  let correct = normalizedAnswer === normalizedExpected;

// 🔥 NUEVA LÓGICA: VALIDACIÓN CON VOCABULARY
  if (!correct) {
    try {
      const wordData = await vocabularyClient.findWord(expected);

      if (wordData) {
        const meanings = wordData.meanings || [];

        const isValid = meanings.some((m: any) =>
          m.meaning.toLowerCase().includes(normalizedAnswer)
        );

        if (isValid) {
        correct = true;
        }
      }
    } catch (error) {
    console.error('Error calling vocabulary-service:', error);
  }
}

return { correct, expected };
}
