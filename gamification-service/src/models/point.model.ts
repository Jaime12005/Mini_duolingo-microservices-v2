export interface Point {
  id?: number;
  userId: number;
  points: number;
  createdAt?: string;
}

export const PointsTable = 'points';
