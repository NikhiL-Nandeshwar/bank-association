'use client';

// Framework
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { sendOtp, verifyOtp } from '@/actions/api/auth.actions';
import { getErrorMessage } from '@/utils/api-error';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

type SignupFieldErrors = Partial<
    Record<keyof SignupRequest, string>
>;

const SIGNUP_COPY = {
    en: {
        memberPortal: 'Member Portal',
        heading: 'Create your account to continue',
        description: 'Enter your details below. A verification code will be sent to your email address before account activation.',
        formTitle: 'Sign Up',
        formDescription: 'Create your KOP Bank Association account.',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your full name as per Aadhar',
        email: 'Email Address',
        emailPlaceholder: 'name@example.com',
        mobile: 'Mobile Number (Optional)',
        mobilePlaceholder: 'Enter 10 digit mobile number',
        verificationPrompt: 'Enter the 6-digit verification code sent to',
        verifyCode: 'Verify Code',
        sendingCode: 'Sending Code...',
        sendVerificationCode: 'Send Verification Code',
        resendVerificationCode: 'Resend Verification Code',
        resendTimer: (seconds: number) => `Resend code in ${seconds}s`,
        alreadyHaveAccount: 'Already have an account? ',
        login: 'Login',
        sendingError: 'Unable to send verification code. Please try again.',
        verified: 'Email verified successfully — password sent to your email.',
        invalidCode: 'Invalid verification code.',
        resendError: 'Unable to resend code.',
        fixFields: 'Please fix the highlighted fields.',
        otpSent: (email: string) => `Verification code sent to ${email}`,
    },
    mr: {
        memberPortal: 'सदस्य पोर्टल',
        heading: 'सुरू ठेवण्यासाठी आपले खाते तयार करा',
        description: 'खाली आपली माहिती भरा. खातं सक्रिय करण्यापूर्वी तुमच्या ईमेल पत्त्यावर पुष्टीकरण कोड पाठवला जाईल.',
        formTitle: 'नोंदणी करा',
        formDescription: 'आपले KOP बँक असोसिएशन खाते तयार करा.',
        fullName: 'पूर्ण नाव',
        fullNamePlaceholder: 'आधारप्रमाणे आपले पूर्ण नाव भरा',
        email: 'ईमेल पत्ता',
        emailPlaceholder: 'name@example.com',
        mobile: 'मोबाईल क्रमांक (ऐच्छिक)',
        mobilePlaceholder: '10 अंकी मोबाइल क्रमांक भरा',
        verificationPrompt: 'पाठविलेले 6-अंकी सत्यापन कोड टाका',
        verifyCode: 'कोड सत्यापित करा',
        sendingCode: 'कोड पाठवत आहे...',
        sendVerificationCode: 'सत्यापन कोड पाठवा',
        resendVerificationCode: 'सत्यापन कोड पुन्हा पाठवा',
        resendTimer: (seconds: number) => `पुन्हा कोड पाठवा ${seconds} सेकंदात`,
        alreadyHaveAccount: 'आधीच खाते आहे का? ',
        login: 'लॉगिन',
        sendingError: 'सत्यापन कोड पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.',
        verified: 'ईमेल सत्यापित झाले — पासवर्ड तुमच्या ईमेलवर पाठवला गेला.',
        invalidCode: 'अवैध सत्यापन कोड.',
        resendError: 'कोड पुन्हा पाठवता आला नाही.',
        fixFields: 'कृपया हायलाइट केलेले फील्ड दुरुस्त करा.',
        otpSent: (email: string) => `${email} वर सत्यापन कोड पाठवला गेला आहे`,
    },
};

export default function Signup() {
    const router = useRouter();
    const [redirect, setRedirect] = useState('');
    const { language } = usePortalLanguage();
    const content = SIGNUP_COPY[language];
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

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        setRedirect(query.get('redirect') ?? '');
    }, []);

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

            toast.error(content.fixFields);
            return;
        }

        try {
            setIsSubmitting(true);

            await sendOtp(signupPayload.data);

            setIsCodeSent(true);
            setCountdown(30);

            toast.success(content.otpSent(email));
        } catch (caughtError) {
            const errorMessage = getErrorMessage(
                caughtError,
                content.sendingError
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

            await verifyOtp({
                email,
                otpCode: otp,
            });

            toast.success(content.verified);

            router.push(
              redirect
                ? `${ROUTES.login}?redirect=${encodeURIComponent(redirect)}`
                : ROUTES.login
            );
        } catch (caughtError) {
            const errorMessage = getErrorMessage(
                caughtError,
                content.invalidCode
            );

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResendCode() {

        try {
            setIsSubmitting(true);

            await sendOtp({
                email,
            });

            setOtp('');
            setCountdown(30);

            toast.success(content.resendVerificationCode);
        } catch (caughtError) {
            const errorMessage = getErrorMessage(
                caughtError,
                content.resendError
            );

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="bg-slate-100 px-4 py-10 sm:py-14">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.09em] text-emerald-700">
                        {content.memberPortal}
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                        {content.heading}
                    </h1>

                    <p className="mt-4 text-base leading-7 text-slate-700">
                        {content.description}
                    </p>
                </div>

                <form
                    onSubmit={handleSignup}
                    className="rounded-lg bg-white p-6 shadow-md ring-1 ring-slate-200"
                >
                    <div>
                        <h2 className="text-xl font-semibold text-slate-950">
                            {content.formTitle}
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            {content.formDescription}
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <FormInput
                            id="fullName"
                            label={content.fullName}
                            value={fullName}
                            error={fieldErrors.fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={content.fullNamePlaceholder}
                        />
                        <FormInput
                            id="email"
                            type="email"
                            label={content.email}
                            value={email}
                            error={fieldErrors.email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={content.emailPlaceholder}
                        />
                        <FormInput
                            id="mobile"
                            type="tel"
                            label={content.mobile}
                            value={mobile}
                            error={fieldErrors.mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder={content.mobilePlaceholder}
                            maxLength={10}
                        />

                        {isCodeSent && (
                            <>
                                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 space-y-4">
                                    <p className="text-sm text-slate-600">
                                        {content.verificationPrompt}
                                    </p>

                                    <p className="mt-1 break-all font-medium text-slate-900">
                                        {email}
                                    </p>

                                    <OtpInputController
                                        value={otp}
                                        onChange={setOtp}
                                        ariaLabel={content.verificationPrompt}
                                        disabled={isSubmitting}
                                        className="justify-center"
                                    />

                                    <SubmitButton
                                        type="button"
                                        onClick={handleVerifyCode}
                                        disabled={otp.length !== 6 || isSubmitting}
                                    >
                                        {content.verifyCode}
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
                                ? content.sendingCode
                                : content.sendVerificationCode}
                        </SubmitButton>
                    )}

                    {isCodeSent && (
                        <div className="mt-4 text-center">
                            {countdown > 0 ? (
                                <p className="text-sm text-slate-500">
                                    {content.resendTimer(countdown)}
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                                >
                                    {content.resendVerificationCode}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="mt-4 text-center text-sm">
                        <Link
                            href={redirect ? `${ROUTES.login}?redirect=${encodeURIComponent(redirect)}` : ROUTES.login}
                            className="font-medium text-emerald-700 hover:text-emerald-800"
                        >
                            {content.alreadyHaveAccount}
                            <span className='text-gray-800'>{content.login}</span>
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
}