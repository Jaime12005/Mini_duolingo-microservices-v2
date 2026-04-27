import pool from '../db/pool';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

export async function createRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date
) {
  const tokenId = uuidv4();

  await pool.execute(
    `INSERT INTO refresh_tokens (token_id, user_id, token, expires_at)
     VALUES (?, ?, ?, ?)`,
    [tokenId, userId, token, expiresAt]
  );
}

export async function findToken(token: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1`,
    [token]
  );

  return rows[0] || null;
}

export async function revokeToken(token: string) {
  await pool.execute(
    `UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ?`,
    [token]
  );
}

export async function revokeAllUserTokens(userId: string) {
  await pool.execute(
    `UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?`,
    [userId]
  );
}