import { z } from 'zod';

export const createCategorySchema = z.object({
  categoryName: z.string().trim().min(1, 'Category name is required.'),
  description: z.string().trim().optional(),
  thumbnailUrl: z.string().trim().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
