import { z } from 'zod';

export const evaluateSchema = z.object({
  userId: z.number(),
  word: z.string().min(1, 'word is required'),
  expectedText: z.string().min(1, 'expectedText is required'),
  transcribedText: z.string().min(1, 'transcribedText is required'),
});

export const evaluateAudioSchema = z.object({
  userId: z.coerce.number(),
  word: z.string().min(1, 'word is required'),
  expectedText: z.string().min(1, 'expectedText is required'),
});