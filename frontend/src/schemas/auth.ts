import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, "Lo username deve avere almeno 3 caratteri"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export type LoginInput = z.infer<typeof loginSchema>;