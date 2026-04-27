import pool from '../db/pool';
import { RowDataPacket } from 'mysql2';
import AppError from '../utils/AppError';

export interface MeaningRow {
  id: number;
  word_id: number;
  meaning: string;
  created_at?: string;
}

export async function getMeaningsByWordId(wordId: number): Promise<MeaningRow[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[] & MeaningRow[]>(
      `SELECT id, word_id, meaning, created_at 
       FROM meanings 
       WHERE word_id = ? 
       ORDER BY created_at DESC`,
       [wordId]
    );
    return rows as MeaningRow[];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getMeaningsByWordId error', err);
    throw new AppError('Error fetching meanings', 500);
  }
}

export default {
  getMeaningsByWordId
};
