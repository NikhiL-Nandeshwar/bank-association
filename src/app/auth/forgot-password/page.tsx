'use client';

// Framework
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

// UI components
import FormError from '@/components/ui/FormError';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';

// Actions
import { forgotPassword, resetPassword, verifyOtp } from '@/actions/api';

// Constants
import { PASSWORD_RECOVERY_COPY, PASSWORD_RECOVERY_STEPS } from '@/constants/auth.constants';
import { ROUTES } from '@/constants/routes.constants';

// Schemas
import {
  otpRequestSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  type OtpRequest,
  type ResetPasswordRequest,
  type VerifyOtpRequest,
} from '@/schemas/auth.schema';

// Utils
import { getErrorMessage } from '@/utils/api-error';
import { cn } from '@/utils/classnames';
import { getZodFieldErrors } from '@/utils/validation';

type RecoveryStep = 'email' | 'otp' | 'password' | 'success';
type RecoveryFieldErrors = Partial<Record<keyof ResetPasswordRequest, string>>;

/**
 * Page component for handling the forgot password flow, which includes 
 * requesting an OTP, verifying it, and resetting the password.
 * @returns 
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RecoveryFieldErrors>({});

  async function handleRequestOtp(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError('');
    setNotice('');
    setFieldErrors({});

    const parsedPayload = otpRequestSchema.safeParse({ email });

    if (!parsedPayload.success) {
      setFieldErrors(getZodFieldErrors<keyof OtpRequest>(parsedPayload.error));
      return;
    }

    try {
      setIsSubmitting(true);
      await forgotPassword(parsedPayload.data);
      setStep('otp');
      setNotice('OTP has been sent to your registered email address.');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Unable to send OTP right now. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setFieldErrors({});

    const parsedPayload = verifyOtpSchema.safeParse({ email, otpCode });

    if (!parsedPayload.success) {
      setFieldErrors(getZodFieldErrors<keyof VerifyOtpRequest>(parsedPayload.error));
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyOtp(parsedPayload.data);
      setStep('password');
      setNotice('OTP verified. You can now create a new password.');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Unable to verify OTP. Please check the code and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setFieldErrors({});

    const parsedPayload = resetPasswordSchema.safeParse({
      email,
      otpCode,
      newPassword,
      confirmPassword,
    });

    if (!parsedPayload.success) {
      setFieldErrors(getZodFieldErrors<keyof ResetPasswordRequest>(parsedPayload.error));
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(parsedPayload.data);
      setStep('success');
      setNotice('');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Unable to reset password right now. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    router.push(ROUTES.login);
  }

  const activeStepIndex = Math.max(
    PASSWORD_RECOVERY_STEPS.findIndex((item) => item.id === step),
    0,
  );

  return (
    <section className="bg-slate-100 px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {PASSWORD_RECOVERY_COPY.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {PASSWORD_RECOVERY_COPY.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            {PASSWORD_RECOVERY_COPY.description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {PASSWORD_RECOVERY_STEPS.map((item, index) => {
              const isActive = index === activeStepIndex;
              const isComplete = index < activeStepIndex || step === 'success';

              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-lg border bg-white p-4 shadow-sm',
                    isActive && 'border-emerald-300 ring-2 ring-emerald-100',
                    isComplete && 'border-emerald-200 bg-emerald-50',
                    !isActive && !isComplete && 'border-slate-200',
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-[#fcd62e]">
                    {index + 1}
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-slate-950">{item.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{PASSWORD_RECOVERY_COPY.cardTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {step === 'email' && PASSWORD_RECOVERY_COPY.emailHelp}
              {step === 'otp' && PASSWORD_RECOVERY_COPY.otpHelp}
              {step === 'password' && PASSWORD_RECOVERY_COPY.passwordHelp}
              {step === 'success' && PASSWORD_RECOVERY_COPY.successMessage}
            </p>
          </div>

          {notice ? (
            <p className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          ) : null}

          <FormError message={error} />

          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="mt-6">
              <FormInput
                id="email"
                type="email"
                label="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                error={fieldErrors.email}
                placeholder="name@example.com"
              />

              <SubmitButton disabled={isSubmitting}>
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </SubmitButton>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="mt-6">
              <FormInput
                id="otpCode"
                label="OTP"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.trim())}
                autoComplete="one-time-code"
                error={fieldErrors.otpCode}
                placeholder="Enter OTP"
              />

              <SubmitButton disabled={isSubmitting}>
                {isSubmitting ? 'Verifying OTP...' : 'Verify OTP'}
              </SubmitButton>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRequestOtp()}
                className="mt-3 w-full text-sm font-medium text-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {PASSWORD_RECOVERY_COPY.resendOtp}
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <FormInput
                id="newPassword"
                type="password"
                label="New password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                error={fieldErrors.newPassword}
                placeholder="Enter new password"
              />

              <FormInput
                id="confirmPassword"
                type="password"
                label="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                error={fieldErrors.confirmPassword}
                placeholder="Confirm new password"
              />

              <SubmitButton disabled={isSubmitting}>
                {isSubmitting ? 'Resetting password...' : 'Reset password'}
              </SubmitButton>
            </form>
          )}

          {step === 'success' && (
            <button
              type="button"
              onClick={handleBackToLogin}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#fcd62e] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400"
            >
              {PASSWORD_RECOVERY_COPY.backToLogin}
            </button>
          )}

          <div className="mt-4 flex text-sm gap-1.5">
            <p className="font-medium text-slate-700">
              Remember password?
            </p>
            <Link href={ROUTES.login} className="font-medium text-slate-500 hover:text-yellow-500"> Login</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
