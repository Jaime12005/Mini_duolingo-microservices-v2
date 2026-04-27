export interface Unit {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string;
}

export const UnitTable = 'units';
