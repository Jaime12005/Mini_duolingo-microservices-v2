import axios from 'axios';

const BASE_URL =
  process.env.VOCABULARY_SERVICE_URL || 'http://localhost:5100/api/v1/words';

export async function searchWord(word: string) {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: { word }
  });

  return response.data.data;
}
