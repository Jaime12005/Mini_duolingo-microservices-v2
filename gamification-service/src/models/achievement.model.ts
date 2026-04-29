export interface Achievement {
  id?: number;
  userId: string;
  achievementType: string;
  unlockedAt?: string;
}

export const AchievementsTable = 'achievements';
