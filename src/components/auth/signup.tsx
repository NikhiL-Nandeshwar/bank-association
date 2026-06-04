'use client';

// Framework
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

// UI Components
import FormError from '@/components/ui/FormError';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';

// Constants
import { ROUTES } from '@/constants/routes.constants';
import OtpInputController from '../ui/OtpInputController';
import { SignupRequest, signupSchema } from '@/schemas/auth.schema';
import { getZodFieldErrors } from '@/utils/validation';
import { sendOtp } from '@/actions/api/auth.actions';
import { getErrorMessage } from '@/utils/api-error';

type SignupFieldErrors = Partial<
    Record<keyof SignupRequest, string>
>;

export default function Signup() {
    const [fullName, setFullName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});

    useEffect(() => {
        if (!isCodeSent || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isCodeSent, countdown]);

    async function handleSignup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError('');
        setFieldErrors({});

        const signupPayload = signupSchema.safeParse({
            fullName,
            email,
            mobile
        });

        if (!signupPayload.success) {
            setFieldErrors(
                getZodFieldErrors<keyof SignupRequest>(
                    signupPayload.error
                )
            );

            toast.error('Please fix the highlighted fields.');
            return;
        }

        try {
            setIsSubmitting(true);

            await sendOtp(signupPayload.data);

            setIsCodeSent(true);
            setCountdown(30);

            toast.success(`Verification code sent to ${email}`);
        } catch (caughtError) {
            console.log('Send OTP error:', caughtError);

            const errorMessage = getErrorMessage(
                caughtError,
                'Unable to send verification code. Please try again.'
            );

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleVerifyCode() {
        try {
            setIsSubmitting(true);

            // API Call
            // await verifyCode({ email, verificationCode });

            toast.success('Email verified successfully.');
        } catch {
            toast.error('Invalid verification code.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResendCode() {
        try {
            setOtp('');
            setCountdown(30);

            toast.success('Verification code resent.');
        } catch {
            toast.error('Unable to resend code.');
        }
    }

    return (
        <section className="bg-slate-100 px-4 py-10 sm:py-14">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Member Portal
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                        Create your account to continue
                    </h1>

                    <p className="mt-4 text-base leading-7 text-slate-700">
                        Enter your details below. A verification code will be sent to your
                        email address before account activation.
                    </p>
                </div>

                <form
                    onSubmit={handleSignup}
                    className="rounded-lg bg-white p-6 shadow-md ring-1 ring-slate-200"
                >
                    <div>
                        <h2 className="text-xl font-semibold text-slate-950">
                            Sign Up
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            Create your KOP Bank Association account.
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <FormInput
                            id="fullName"
                            label="Full Name"
                            value={fullName}
                            error={fieldErrors.fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name as per Aadhar"
                        />
                        <FormInput
                            id="email"
                            type="email"
                            label="Email Address"
                            value={email}
                            error={fieldErrors.email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                        />
                        <FormInput
                            id="mobile"
                            type="tel"
                            label="Mobile Number (Optional)"
                            value={mobile}
                            error={fieldErrors.mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter 10 digit mobile number"
                            maxLength={10}
                        />

                        {isCodeSent && (
                            <>
                                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Enter the 6-digit verification code sent to
                                    </p>

                                    <p className="mt-1 break-all font-medium text-slate-900">
                                        {email}
                                    </p>

                                    <OtpInputController
                                        value={otp}
                                        onChange={setOtp}
                                        ariaLabel="Enter verification code"
                                        disabled={isSubmitting}
                                        className="justify-center"
                                    />

                                    <SubmitButton
                                        type="button"
                                        onClick={handleVerifyCode}
                                        disabled={otp.length !== 6 || isSubmitting}
                                    >
                                        Verify Code
                                    </SubmitButton>
                                </div>
                            </>
                        )}
                    </div>

                    <FormError message={error} />

                    {!isCodeSent && (
                        <SubmitButton
                            className="hover:cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Sending Code...'
                                : 'Send Verification Code'}
                        </SubmitButton>
                    )}

                    {isCodeSent && (
                        <div className="mt-4 text-center">
                            {countdown > 0 ? (
                                <p className="text-sm text-slate-500">
                                    Resend code in {countdown}s
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                                >
                                    Resend Verification Code
                                </button>
                            )}
                        </div>
                    )}

                    <div className="mt-4 text-center text-sm">
                        <Link
                            href={ROUTES.login}
                            className="font-medium text-emerald-700 hover:text-emerald-800"
                        >
                            Already have an account? <span className='text-gray-800'>Login</span>
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
}