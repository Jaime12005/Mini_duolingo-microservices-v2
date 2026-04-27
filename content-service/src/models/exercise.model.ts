export interface Exercise {
  id: string;
  lesson_id: string;
  prompt: string;
  correct_answer: string;
  created_at?: string;
}

export const ExerciseTable = 'exercises';
