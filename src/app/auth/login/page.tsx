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
import { login, storeAuthToken } from '@/actions/api';

// Constants
import { ROUTES } from '@/constants/routes.constants';

// Schemas
import { loginSchema, type LoginRequest } from '@/schemas/auth.schema';

// Utils
import { getErrorMessage } from '@/utils/api-error';
import { getZodFieldErrors } from '@/utils/validation';

type LoginFieldErrors = Partial<Record<keyof LoginRequest, string>>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const loginPayload = loginSchema.safeParse({ email, password });

    if (!loginPayload.success) {
      setFieldErrors(getZodFieldErrors<keyof LoginRequest>(loginPayload.error));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login(loginPayload.data);
      storeAuthToken(response.data.token);
      router.push(ROUTES.recruitment);
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Unable to login right now. Please try again.'));
    } finally {
      setIsSubmitting(false);
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
            Login to continue with recruitment and member services
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            Use the email and password shared by the association team. Your session token will be used for protected account and bank APIs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Login</h2>
            <p className="mt-1 text-sm text-slate-600">Access your KOP Bank Association account.</p>
          </div>

          <div className="mt-6 space-y-4">
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

            <FormInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              error={fieldErrors.password}
              placeholder="Enter password"
            />
          </div>

          <FormError message={error} />

          <SubmitButton disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </SubmitButton>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link href={ROUTES.forgotPassword} className="font-medium text-emerald-700 hover:text-emerald-800">
              Forgot password?
            </Link>
            <Link href={ROUTES.apply} className="font-medium text-slate-700 hover:text-slate-950">
              New application
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
