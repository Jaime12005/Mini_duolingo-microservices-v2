export interface Point {
  id?: number;
  userId: string;
  points: number;
  createdAt?: string;
}

export const PointsTable = 'points';
