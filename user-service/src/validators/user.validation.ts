import { z } from 'zod';

export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional()
}).strict();

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  native_language: z.string().min(2).max(10).optional(),
  learning_language: z.string().min(2).max(10).optional(),
  avatar_url: z.string().url().max(500).optional()
}).strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
}).strict();