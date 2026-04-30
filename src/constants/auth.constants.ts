export const PASSWORD_RECOVERY_STEPS = [
  {
    id: 'email',
    title: 'Email',
    description: 'Receive a one-time password on your registered email.',
  },
  {
    id: 'otp',
    title: 'OTP',
    description: 'Confirm the code before changing your password.',
  },
  {
    id: 'password',
    title: 'Password',
    description: 'Create a new password for your member account.',
  },
] as const;

export const PASSWORD_RECOVERY_COPY = {
  eyebrow: 'Account Recovery',
  title: 'Reset access to your member portal',
  description:
    'Use your registered email address to receive an OTP, verify it, and create a new password for your KOP Bank Association account.',
  cardTitle: 'Forgot password',
  emailHelp: 'Enter the email address linked to your member account.',
  otpHelp: 'Enter the OTP sent to your registered email address.',
  passwordHelp: 'Choose a new password with at least 8 characters.',
  successTitle: 'Password reset complete',
  successMessage: 'Your password has been updated. You can now login with the new password.',
  backToLogin: 'Back to login',
  resendOtp: 'Resend OTP',
} as const;
