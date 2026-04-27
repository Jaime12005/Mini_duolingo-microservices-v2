export interface Achievement {
  id?: number;
  userId: number;
  achievementType: string;
  unlockedAt?: string;
}

export const AchievementsTable = 'achievements';
