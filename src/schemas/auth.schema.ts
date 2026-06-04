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

export const firstNameSchema = z
  .string()
  .trim()
  .min(1, 'First name is required.')
  .max(50, 'First name cannot exceed 50 characters.')
  .regex(/^[A-Za-z\s]+$/, 'First name can only contain letters.');

export const lastNameSchema = z
  .string()
  .trim()
  .min(1, 'Last name is required.')
  .max(50, 'Last name cannot exceed 50 characters.')
  .regex(/^[A-Za-z\s]+$/, 'Last name can only contain letters.');

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, 'Full name is required.')
  .max(100, 'Full name cannot exceed 100 characters.')
  .regex(
    /^[A-Za-z\s]+$/,
    'Full name can only contain letters and spaces.'
  );

export const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.');

export const signupSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  mobile: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^[6-9]\d{9}$/.test(value),
      'Enter a valid 10-digit mobile number.'
    )
    .optional(),
});

export type SignupRequest = z.infer<typeof signupSchema>;

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
