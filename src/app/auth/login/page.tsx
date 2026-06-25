'use client';

// Framework
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// UI components
import FormError from '@/components/ui/FormError';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';

// Actions
import { login } from '@/actions/api';

// Constants
import { LOGIN_COPY } from '@/constants/auth.constants';
import { ROUTES } from '@/constants/routes.constants';

// Schemas
import { loginSchema, type LoginRequest } from '@/schemas/auth.schema';
import { Eye, EyeOff } from 'lucide-react';

// Utils
import { getErrorMessage } from '@/utils/api-error';
import { getZodFieldErrors } from '@/utils/validation';
import { useAuth } from '@/lib/useAuth';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

type LoginFieldErrors = Partial<Record<keyof LoginRequest, string>>;

export default function LoginPage() {
  const router = useRouter();
  const [redirect, setRedirect] = useState('');
  const { login: authLogin } = useAuth();
  const { language } = usePortalLanguage();
  const content = LOGIN_COPY[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setRedirect(query.get('redirect') ?? '');
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const loginPayload = loginSchema.safeParse({ email, password });

    if (!loginPayload.success) {
      setFieldErrors(getZodFieldErrors<keyof LoginRequest>(loginPayload.error));
      toast.error(content.fixFields);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login(loginPayload.data);

      await authLogin(response.data);

      const userRole = response.data.role?.toLowerCase() ?? '';
      const destination = userRole.includes('admin')
        ? ROUTES.adminDashboard
        : redirect
          ? redirect
          : ROUTES.recruitment;

      router.replace(destination);
    } catch (caughtError) {
      const errorMessage = getErrorMessage(caughtError, 'Unable to login right now. Please try again.');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-slate-100 px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {content.heading}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            {content.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{content.formTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">{content.formDescription}</p>
          </div>

          <div className="mt-6 space-y-4">
            <FormInput
              id="email"
              type="email"
              label={content.emailLabel}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              error={fieldErrors.email}
              placeholder={content.emailPlaceholder}
            />

            <FormInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              label={content.passwordLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              error={fieldErrors.password}
              placeholder={content.passwordPlaceholder}
              rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              onRightIconClick={() => setShowPassword((prev) => !prev)}
            />
          </div>

          <FormError message={error} />

          <SubmitButton className="hover:cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? content.submitting : content.submit}
          </SubmitButton>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link href={ROUTES.forgotPassword} className="font-medium text-emerald-700 hover:text-emerald-800">
              {content.forgotPassword}
            </Link>
            <Link
              href={redirect ? `${ROUTES.signup}?redirect=${encodeURIComponent(redirect)}` : ROUTES.signup}
              className="font-medium text-slate-700 hover:text-slate-950"
            >
              {content.signupText}
              <span className='text-emerald-700 hover:text-emerald-800'>
                {content.signupLink}
              </span>
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
