import pool from '../db/pool';
import AppError from '../utils/AppError';
import { PointsTable } from '../models/point.model';
import { StreaksTable } from '../models/streak.model';
import { AchievementsTable } from '../models/achievement.model';

type ActionType =
  | 'LESSON_COMPLETED'
  | 'EXERCISE_CORRECT'
  | 'PRONUNCIATION_PRACTICE';

const ACTION_XP: Record<ActionType, number> = {
  LESSON_COMPLETED: 20,
  EXERCISE_CORRECT: 10,
  PRONUNCIATION_PRACTICE: 15
};

function formatDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function addXp(userId: number, points: number) {
  try {
    const conn = pool;
    await conn.execute(`INSERT INTO ${PointsTable} (userId, points, createdAt) VALUES (?, ?, NOW())`, [userId, points]);
    const [rows] = await conn.execute<any[]>(`SELECT SUM(points) as total FROM ${PointsTable} WHERE userId = ?`, [userId]);
    const total = rows && rows[0] && rows[0].total ? Number(rows[0].total) : 0;
    return { userId, totalPoints: total };
  } catch (err: any) {
    throw new AppError('Error adding XP', 500);
  }
}

export async function getXp(userId: number) {
  try {
    const conn = pool;
    const [rows] = await conn.execute<any[]>(`SELECT SUM(points) as total FROM ${PointsTable} WHERE userId = ?`, [userId]);
    const total = rows && rows[0] && rows[0].total ? Number(rows[0].total) : 0;
    return { userId, totalPoints: total };
  } catch (err: any) {
    throw new AppError('Error fetching XP', 500);
  }
}

export async function updateStreak(userId: number) {
  try {
    const conn = pool;
    const [rows] = await conn.execute<any[]>(`SELECT * FROM ${StreaksTable} WHERE userId = ?`, [userId]);
    const today = new Date();
    const todayStr = formatDateYMD(today);

    if (!rows || rows.length === 0) {
      await conn.execute(`INSERT INTO ${StreaksTable} (userId, currentStreak, lastActivityDate) VALUES (?, ?, ?)
        `, [userId, 1, todayStr]);
      return { userId, currentStreak: 1, lastActivityDate: todayStr };
    }

    const row = rows[0];
    if (!row.lastActivityDate) {
      await conn.execute(
        `UPDATE ${StreaksTable} SET currentStreak = ?, lastActivityDate = ? WHERE userId = ?`,
        [1, todayStr, userId]
      );
      return { userId, currentStreak: 1, lastActivityDate: todayStr };
    }
    const last = new Date(row.lastActivityDate);
    const lastStr = formatDateYMD(last);

    if (lastStr === todayStr) {
      return { userId, currentStreak: row.currentStreak, lastActivityDate: row.lastActivityDate };
    }

    // compute difference in days
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const lastMidnight = new Date(row.lastActivityDate);
    lastMidnight.setHours(0, 0, 0, 0);

    const diffMs = todayMidnight.getTime() - lastMidnight.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      const newStreak = row.currentStreak + 1;
      await conn.execute(`UPDATE ${StreaksTable} SET currentStreak = ?, lastActivityDate = ? WHERE userId = ?`, [newStreak, todayStr, userId]);
      return { userId, currentStreak: newStreak, lastActivityDate: todayStr };
    }

    // reset
    await conn.execute(`UPDATE ${StreaksTable} SET currentStreak = ?, lastActivityDate = ? WHERE userId = ?`, [1, todayStr, userId]);
    return { userId, currentStreak: 1, lastActivityDate: todayStr };
  } catch (err: any) {
    throw new AppError('Error updating streak', 500);
  }
}

export async function getStreak(userId: number) {
  try {
    const conn = pool;
    const [rows] = await conn.execute<any[]>(`SELECT * FROM ${StreaksTable} WHERE userId = ?`, [userId]);
    if (!rows || rows.length === 0) {
      return { userId, currentStreak: 0, lastActivityDate: null };
    }
    const row = rows[0];
    return { userId, currentStreak: row.currentStreak, lastActivityDate: row.lastActivityDate };
  } catch (err: any) {
    throw new AppError('Error fetching streak', 500);
  }
}

export async function unlockAchievement(userId: number, achievementType: string) {
  try {
    const conn = pool;
    const [rows] = await conn.execute<any[]>(`SELECT * FROM ${AchievementsTable} WHERE userId = ? AND achievementType = ?`, [userId, achievementType]);
    if (rows && rows.length > 0) {
      return { userId, achievementType, unlockedAt: rows[0].unlockedAt };
    }
    await conn.execute(`INSERT INTO ${AchievementsTable} (userId, achievementType, unlockedAt) VALUES (?, ?, NOW())`, [userId, achievementType]);
    return { userId, achievementType, unlockedAt: new Date().toISOString() };
  } catch (err: any) {
    throw new AppError('Error unlocking achievement', 500);
  }
}

export async function getAchievements(userId: number) {
  try {
    const conn = pool;
    const [rows] = await conn.execute<any[]>(`SELECT * FROM ${AchievementsTable} WHERE userId = ? ORDER BY unlockedAt DESC`, [userId]);
    return rows.map((r: any) => ({ id: r.id, userId: r.userId, achievementType: r.achievementType, unlockedAt: r.unlockedAt }));
  } catch (err: any) {
    throw new AppError('Error fetching achievements', 500);
  }
}

export async function processUserAction(userId: number, actionType: string) {
  try {
    // 🔒 Validar actionType
    if (!(actionType in ACTION_XP)) {
      throw new AppError('Invalid action type', 400);
    }

    const typedAction = actionType as ActionType;
    const points = ACTION_XP[typedAction];

    // 🎯 1. Agregar XP
    const xpResult = await addXp(userId, points);

    // 🔥 2. Actualizar racha
    const streakResult = await updateStreak(userId);

    // 🏆 3. Evaluar logros
    const unlocked: Array<{
      userId: number;
      achievementType: string;
      unlockedAt: string;
    }> = [];

    // 🎓 Logro: primera lección
    if (typedAction === 'LESSON_COMPLETED') {
      const r = await unlockAchievement(userId, 'FIRST_LESSON');
      if (r) unlocked.push(r);
    }

    // 🔥 Logro: racha de 7 días
    if (streakResult.currentStreak >= 7) {
      const r = await unlockAchievement(userId, 'STREAK_7');
      if (r) unlocked.push(r);
    }

    // 💯 Logro: 100 XP
    if (xpResult.totalPoints >= 100) {
      const r = await unlockAchievement(userId, 'XP_100');
      if (r) unlocked.push(r);
    }

    return {
      userId,
      actionType: typedAction,
      pointsAwarded: points,
      xp: xpResult,
      streak: streakResult,
      unlocked
    };
  } catch (err: any) {
    throw new AppError('Error processing user action', 500);
  }
}

export default {
  addXp,
  getXp,
  updateStreak,
  getStreak,
  unlockAchievement,
  getAchievements,
  processUserAction
};
