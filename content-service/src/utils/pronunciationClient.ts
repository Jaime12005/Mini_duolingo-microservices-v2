import axios from 'axios';
import FormData from 'form-data';

const PRONUNCIATION_URL =
  process.env.PRONUNCIATION_SERVICE_URL ||
  'http://127.0.0.1:3000/api/v1/pronunciation';

export async function evaluatePronunciation(
  token: string,
  data: {
    word: string;
    expectedText: string;
    transcribedText?: string;
  }
) {
  try {
    const res = await axios.post(
      `${PRONUNCIATION_URL}/evaluate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error('❌ pronunciation error:', error?.response?.data || error.message);
    throw new Error('Pronunciation service failed');
  }
}

export async function evaluatePronunciationAudio(
  token: string | undefined,
  userId: string,
  data: {
    word: string;
    expectedText: string;
    audioBuffer: Buffer;
    audioFilename: string;
    audioMimeType: string;
  }
) {
  try {
    const form = new FormData();
    form.append('word', data.word);
    form.append('expectedText', data.expectedText);
    form.append('audio', data.audioBuffer, {
      filename: data.audioFilename,
      contentType: data.audioMimeType,
    });

    const res = await axios.post(
      `${PRONUNCIATION_URL}/evaluate-audio`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-id': userId,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error('❌ pronunciation audio error:', error?.response?.data || error.message);
    throw new Error('Pronunciation service failed');
  }
}