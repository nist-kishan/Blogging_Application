import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255, 'Title must be under 255 characters'),
  summary: z.string().max(500, 'Summary must be under 500 characters').optional().or(z.literal('')),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  bannerUrl: z.string().max(500, 'Banner URL must be under 500 characters').optional().or(z.literal('')),
  categoryId: z.string().uuid('Please select a valid category'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});
