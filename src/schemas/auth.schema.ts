import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

export const otpRequestSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otpCode: z.string().trim().min(1, 'OTP is required.'),
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    // otpCode: z.string().trim().min(1, 'OTP is required.'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm password is required.'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type LoginRequest = z.infer<typeof loginSchema>;
export type OtpRequest = z.infer<typeof otpRequestSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
