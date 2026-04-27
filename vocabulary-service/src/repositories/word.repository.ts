import pool from '../db/pool';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import AppError from '../utils/AppError';

export interface WordRow {
  id: number;
  word: string;
  language?: string | null;
  ipa?: string | null;
  audio_url?: string | null;
  created_at?: string;
}

export async function getAllWords(): Promise<WordRow[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[] & WordRow[]>(
      `SELECT id, word, language, ipa, audio_url, created_at 
       FROM words 
       ORDER BY created_at DESC`
    );

    return rows;
  } catch (error) {
    console.error('getAllWords error', error);
    throw new AppError('Error fetching words', 500);
  }
}

export async function getWordById(id: number): Promise<WordRow | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[] & WordRow[]>(
      `SELECT id, word, language, ipa, audio_url, created_at 
       FROM words 
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );

    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('getWordById error', error);
    throw new AppError('Error fetching word', 500);
  }
}

export async function createWord(data: {
  word: string;
  language?: string | null;
  ipa?: string | null;
  audio_url?: string | null;
}): Promise<WordRow> {
  try {
    const { word, language = null, ipa = null, audio_url = null } = data;

    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO words (word, language, ipa, audio_url, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [word, language, ipa, audio_url]
    );

    const insertId = res.insertId;

    return {
      id: insertId,
      word,
      language,
      ipa,
      audio_url,
      created_at: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('createWord error', error);

    // Manejo de duplicados (UNIQUE KEY)
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Word already exists', 400);
    }

    throw new AppError('Error creating word', 500);
  }
}

export default {
  getAllWords,
  getWordById,
  createWord
};