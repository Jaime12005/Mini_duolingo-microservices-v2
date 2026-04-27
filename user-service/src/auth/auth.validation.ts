import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .transform((val) => val.trim()),

  email: z
    .string()
    .email('Invalid email')
    .transform((val) => val.trim().toLowerCase()),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
}).strict();

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .transform((val) => val.trim().toLowerCase()),

  password: z
    .string()
    .min(1, 'Password is required')
}).strict();

// Tipos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;