import pool from '../db/pool';
import { RowDataPacket } from 'mysql2';
import AppError from '../utils/AppError';

export interface ExampleRow {
  id: number;
  meaning_id: number;
  example_text: string;
  created_at?: string;
}

export async function getExamplesByMeaningId(meaningId: number): Promise<ExampleRow[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[] & ExampleRow[]>(
      `SELECT id, meaning_id, example_text, created_at 
       FROM examples 
       WHERE meaning_id = ? 
       ORDER BY created_at DESC`,
       [meaningId]
    );
    return rows as ExampleRow[];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getExamplesByMeaningId error', err);
    throw new AppError('Error fetching examples', 500);
  }
}

export default {
  getExamplesByMeaningId
};
