export interface Streak {
  id?: number;
  userId: string;
  currentStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

export const StreaksTable = 'streaks';
