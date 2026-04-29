export interface Evaluation {
  id?: number;
  userId: string;
  word: string;
  expectedText: string;
  transcribedText: string;
  score: number;
  feedback: string;
  createdAt?: string;
}

export const EvaluationTable = 'evaluations';
