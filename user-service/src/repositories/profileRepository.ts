import pool from '../db/pool';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function getProfileByUserId(userId: string) {
  const [rows] = await pool.execute<RowDataPacket[] & any[]>(
    `SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function upsertProfile(userId: string, profile: Partial<{display_name:string;native_language:string;learning_language:string;avatar_url:string}>){
  const existing = await getProfileByUserId(userId);
  if (existing) {
    const sets = Object.keys(profile).map(k => `${k} = ?`).join(', ');
    const values = Object.values(profile);
    if (!sets) return;
    await pool.execute<ResultSetHeader>(`UPDATE user_profiles SET ${sets} WHERE user_id = ?`, [...values, userId]);
    return;
  }
  await pool.execute<ResultSetHeader>(`INSERT INTO user_profiles (user_id, display_name, native_language, learning_language, avatar_url) VALUES (?, ?, ?, ?, ?)`, [
    userId,
    profile.display_name || null,
    profile.native_language || null,
    profile.learning_language || null,
    profile.avatar_url || null
  ]);
}
