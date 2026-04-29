import * as wordRepo from '../repositories/word.repository';
import * as meaningRepo from '../repositories/meaning.repository';
import * as exampleRepo from '../repositories/example.repository';
import AppError from '../utils/AppError';

export interface ExampleDTO {
  id: number;
  example_text: string;
}

export interface MeaningDTO {
  id: number;
  meaning: string;
  examples: ExampleDTO[];
}

export interface WordDTO {
  id: number;
  word: string;
  language?: string | null;
  ipa?: string | null;
  audio_url?: string | null;
  meanings: MeaningDTO[];
}

export async function getAllWords(): Promise<WordDTO[]> {
  try {
    const words = await wordRepo.getAllWords();

    const result: WordDTO[] = await Promise.all(
      words.map(async (w) => {
        const meaningsRows = await meaningRepo.getMeaningsByWordId(w.id);

        const meanings: MeaningDTO[] = await Promise.all(
          meaningsRows.map(async (m) => {
            const examplesRows = await exampleRepo.getExamplesByMeaningId(m.id);

            return {
              id: m.id,
              meaning: m.meaning,
              examples: examplesRows.map((ex) => ({
                id: ex.id,
                example_text: ex.example_text
              }))
            };
          })
        );

        return {
          id: w.id,
          word: w.word,
          language: w.language || null,
          ipa: w.ipa || null,
          audio_url: w.audio_url || null,
          meanings
        };
      })
    );

    return result;
  } catch (err: any) {
    console.error('word.service.getAllWords error', err);
    throw err instanceof AppError ? err : new AppError('Failed to get words', 500);
  }
}

export async function getWordById(id: number): Promise<WordDTO> {
  try {
    const w = await wordRepo.getWordById(id);
    if (!w) throw new AppError('Word not found', 404);

    const meaningsRows = await meaningRepo.getMeaningsByWordId(w.id);
    
    const meanings: MeaningDTO[] = await Promise.all(
      meaningsRows.map(async (m) => {
        const examplesRows = await exampleRepo.getExamplesByMeaningId(m.id);

        return {
          id: m.id,
          meaning: m.meaning,
          examples: examplesRows.map((ex) => ({
            id: ex.id,
            example_text: ex.example_text
          }))
        };
      })
    );

    return {
      id: w.id,
      word: w.word,
      language: w.language || null,
      ipa: w.ipa || null,
      audio_url: w.audio_url || null,
      meanings
    };
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('word.service.getWordById error', err);
    throw err instanceof AppError ? err : new AppError('Failed to get word', 500);
  }
}

export async function createWord(data: { word: string; language?: string | null; ipa?: string | null; audio_url?: string | null }) {
  try {
    const created = await wordRepo.createWord(data);
    return created;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('word.service.createWord error', err);
    throw err instanceof AppError ? err : new AppError('Failed to create word', 500);
  }
}

export async function searchWord(word: string): Promise<WordDTO> {
  try {
    const w = await wordRepo.findWordByText(word);

    if (!w) throw new AppError('Word not found', 404);

    const meaningsRows = await meaningRepo.getMeaningsByWordId(w.id);

    const meanings: MeaningDTO[] = await Promise.all(
      meaningsRows.map(async (m) => {
        const examplesRows = await exampleRepo.getExamplesByMeaningId(m.id);

        return {
          id: m.id,
          meaning: m.meaning,
          examples: examplesRows.map((ex) => ({
            id: ex.id,
            example_text: ex.example_text
          }))
        };
      })
    );

    return {
      id: w.id,
      word: w.word,
      language: w.language || null,
      ipa: w.ipa || null,
      audio_url: w.audio_url || null,
      meanings
    };
  } catch (err: any) {
    console.error('searchWord error', err);
    throw err instanceof AppError ? err : new AppError('Failed to search word', 500);
  }
}

export default {
  getAllWords,
  getWordById,
  createWord,
  searchWord
};
