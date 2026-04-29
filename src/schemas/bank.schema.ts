import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number.');

export const createBankSchema = z.object({
  bankName: z.string().trim().min(1, 'Bank name is required.'),
  bankNameMarathi: z.string().trim().min(1, 'Marathi bank name is required.'),
  bankCode: z.string().trim().min(1, 'Bank code is required.'),
  address: z.string().trim().min(1, 'Address is required.'),
  contactEmail: z.string().trim().email('Enter a valid contact email.'),
  contactPhone: phoneSchema,
  logoUrl: z.string().trim(),
});

export const updateBankSchema = createBankSchema.omit({ bankCode: true }).extend({
  bankId: z.number().int().positive('Bank id is required.'),
});

export type CreateBankRequest = z.infer<typeof createBankSchema>;
export type UpdateBankRequest = z.infer<typeof updateBankSchema>;
