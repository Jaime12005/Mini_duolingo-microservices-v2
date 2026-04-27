import axios from 'axios';

const VOCABULARY_BASE_URL =
  process.env.VOCABULARY_SERVICE_URL || 'http://localhost:5100/api/v1/words';

export async function getAllWords() {
  const response = await axios.get(VOCABULARY_BASE_URL);
  return response.data.data;
}

export async function findWord(word: string) {
  const words = await getAllWords();

  return words.find((w: any) =>
    w.word.toLowerCase() === word.toLowerCase()
  );
}