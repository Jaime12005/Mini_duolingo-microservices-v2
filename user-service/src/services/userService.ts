import * as userRepo from '../repositories/userRepository';
import * as profileRepo from '../repositories/profileRepository';
import * as streakRepo from '../repositories/streakRepository';

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

export async function updateUser(
  userId: string,
  fields: Partial<{ username: string; email: string; is_active: number }>
) {
  await userRepo.updateUser(userId, fields as any);
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