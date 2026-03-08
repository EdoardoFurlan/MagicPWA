import { z } from 'zod';

export const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const;

export const logSchema = z.object({
  level: z.enum(logLevels),
  message: z.string(),
  timestamp: z.string().datetime(), // Valida che sia una stringa ISO valida
  userAgent: z.string(),
  context: z.record(z.string(), z.any()).optional(), 
});

export type LogEntry = z.infer<typeof logSchema>;