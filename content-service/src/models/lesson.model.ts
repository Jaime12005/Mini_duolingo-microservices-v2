export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  content?: string | null;
  created_at?: string;
}

export const LessonTable = 'lessons';
