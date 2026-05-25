import { z } from 'zod';

export const createNewsSchema = z.object({
  newsEng: z.string().trim().min(1, 'News title (English) is required.').min(5, 'News title must be at least 5 characters.'),
  newsMrt: z.string().trim().min(1, 'News title (Marathi) is required.'),
});

export const updateNewsSchema = createNewsSchema.extend({
  id: z.number().int().positive('News id is required.'),
});

export type CreateNewsRequest = z.infer<typeof createNewsSchema>;
export type UpdateNewsRequest = z.infer<typeof updateNewsSchema>;
