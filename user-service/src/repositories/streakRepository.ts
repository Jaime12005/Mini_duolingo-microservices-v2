import pool from '../db/pool';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function getStreakByUserId(userId: string) {
  const [rows] = await pool.execute<RowDataPacket[] & any[]>(
    `SELECT * FROM user_streaks WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function initStreak(userId: string) {
  await pool.execute<ResultSetHeader>(`INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_freeze) VALUES (?, 0, 0, NULL, 0)`, [userId]);
}

export async function updateStreak(userId: string, fields: Partial<{current_streak:number; longest_streak:number; last_activity_date:string | null; streak_freeze:number}>) {
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const values = Object.values(fields);
  if (!sets) return;
  await pool.execute<ResultSetHeader>(`UPDATE user_streaks SET ${sets} WHERE user_id = ?`, [...values, userId]);
}
