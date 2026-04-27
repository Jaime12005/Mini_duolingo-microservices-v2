export interface Streak {
  id?: number;
  userId: number;
  currentStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

export const StreaksTable = 'streaks';
