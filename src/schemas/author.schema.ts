import { z } from 'zod';

export const createAuthorSchema = z.object({
  authorName: z.string().trim().min(1, 'Author name is required.'),
  bio: z.string().trim().optional(),
  photoUrl: z.string().trim().optional(),
});

export type CreateAuthorRequest = z.infer<typeof createAuthorSchema>;
