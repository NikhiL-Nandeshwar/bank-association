import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number.');

const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => !value || /^https?:\/\/\S+$/i.test(value), 'Enter a valid logo URL.');

export const createBankSchema = z.object({
  bankName: z.string().trim().min(1, 'Bank name is required.'),
  bankNameMarathi: z.string().trim().optional(),
  bankCode: z.string().trim().optional(),
  address: z.string().trim().min(1, 'Address is required.'),
  contactEmail: z.string().trim().email('Enter a valid contact email.'),
  contactPhone: phoneSchema,
  logoUrl: optionalUrlSchema,
});

export const updateBankSchema = createBankSchema.omit({ bankCode: true }).extend({
  bankId: z.number().int().positive('Bank id is required.'),
});

export type CreateBankRequest = z.infer<typeof createBankSchema>;
export type UpdateBankRequest = z.infer<typeof updateBankSchema>;
