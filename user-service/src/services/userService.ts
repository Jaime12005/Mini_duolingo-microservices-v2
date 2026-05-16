import * as userRepo from '../repositories/userRepository';
import * as profileRepo from '../repositories/profileRepository';
import * as streakRepo from '../repositories/streakRepository';
import { comparePassword, hashPassword } from '../utils/hash';

export async function getUserById(userId: string) {
  const user = await userRepo.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  const profile = await profileRepo.getProfileByUserId(userId);
  const streak = await streakRepo.getStreakByUserId(userId);

  // 🔥 ELIMINAR password_hash
  const { password_hash, ...safeUser } = user;

  return {
    user: safeUser,
    profile,
    streak
  };
}

export async function removeUser(userId: string) {
  await userRepo.deleteUser(userId);
}

export async function getProfile(userId: string) {
  return await profileRepo.getProfileByUserId(userId);
}

export async function updateProfile(userId: string, data: any) {
  await profileRepo.upsertProfile(userId, data);
}

export async function getStreak(userId: string) {
  return await streakRepo.getStreakByUserId(userId);
}

export async function updateStreak(
  userId: string,
  data: Partial<{
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    streak_freeze: number;
  }>
) {
  await streakRepo.updateStreak(userId, data);
}

export async function updateUser(
  userId: string,
  fields: Partial<{ username: string; email: string }>
) {
  const updates: any = {};

  if (fields.username) {
    const existing = await userRepo.findByUsername(fields.username);
    if (existing && existing.user_id !== userId) throw { status: 400, message: 'Username already in use' };
    updates.username = fields.username;
  }

  if (fields.email) {
    const existing = await userRepo.findByEmail(fields.email);
    if (existing && existing.user_id !== userId) throw { status: 400, message: 'Email already in use' };
    updates.email = fields.email.toLowerCase();
  }

  await userRepo.updateUser(userId, updates);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await userRepo.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  const ok = await comparePassword(currentPassword, user.password_hash);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };

  const password_hash = await hashPassword(newPassword);
  await userRepo.updatePassword(userId, password_hash);
}