export interface Word {
  id: string;
  text: string;
  ipa?: string | null;
  audio_url?: string | null;
  created_at?: string;
}

export interface Meaning {
  id: string;
  word_id: string;
  definition: string;
  pos?: string | null; // part of speech
}

export interface Example {
  id: string;
  meaning_id: string;
  text: string;
}

export const WordTable = 'words';
export const MeaningTable = 'meanings';
export const ExampleTable = 'examples';
