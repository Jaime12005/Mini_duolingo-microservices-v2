import { Request, Response, NextFunction } from 'express';
import pronunciationService from '../services/pronunciation.service';
import { evaluateSchema, evaluateAudioSchema } from '../validators/pronunciation.validator';
import AppError from '../utils/AppError';
import fs from 'fs';
import OpenAI from 'openai';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const evaluateAudio = async (req: any, res: any, next: any) => {
  try {
    const parsed = evaluateAudioSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(new AppError(parsed.error.issues[0].message, 400));
    }

    const { userId, word, expectedText } = parsed.data;

    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    // 🔥 MOCK TEMPORAL
    const fakeTranscriptions = [
      "hello",
      "helo",
      "hallo",
      "yellow"
    ];

    const transcribedText = fakeTranscriptions[
      Math.floor(Math.random() * fakeTranscriptions.length)
    ];

    // 🧠 Evaluación
    const result = await pronunciationService.evaluatePronunciation({
      userId: Number(userId),
      word,
      expectedText,
      transcribedText,
    });

    // 🧹 🔥 LIMPIAR ARCHIVO (AQUÍ)
    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      message: 'Audio evaluated',
      data: result,
    });

  } catch (error) {

    // 🧹 🔥 LIMPIAR TAMBIÉN SI HAY ERROR
    if (req.file) {
      try {
        fs.promises.unlink(req.file.path).catch(() => {});
      } catch (_) {}
    }

    next(error);
  }
};

export async function evaluate(req: Request, res: Response, next: NextFunction) {
  try {
    
    const parsed = evaluateSchema.safeParse(req.body);

   if (!parsed.success) {
   return next(new AppError(parsed.error.issues[0].message, 400));
   }

    const { userId, word, expectedText, transcribedText } = parsed.data;

    const result = await pronunciationService.evaluatePronunciation({ userId, word, expectedText, transcribedText });
    return res.status(201).json({ success: true, message: 'Evaluation created', data: result });
  } catch (err) {
    return next(err);
  }
}

export default { evaluate, evaluateAudio };