'use client';

// React
import type { ReactNode } from 'react';

// Framework
import Link from 'next/link';

// Constants
import { ROUTES } from '@/constants/routes.constants';

// Utils/lib
import { usePortalLanguage } from '@/lib/usePortalLanguage';

type ActionItem = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  iconClassName: string;
  iconWrapClassName: string;
};

function RecruitmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M8 3.75h5.5L18 8.25V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z" />
      <path d="M13 3.75v4.5h4.5" />
      <path d="M9.5 12h5" />
      <path d="M9.5 15.5h5" />
    </svg>
  );
}

function NoticeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M4.75 10.5v3a1 1 0 0 0 1 1h1.5l1.5 3.75h1.75L9.4 14.5h3.35c1.97 0 3.92-.54 5.63-1.56l.87-.52V7.58l-.87-.52a10.93 10.93 0 0 0-5.63-1.56H5.75a1 1 0 0 0-1 1v4Z" />
      <path d="M19.25 8.5a3.75 3.75 0 0 1 0 7" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <rect x="5.5" y="10.25" width="13" height="9.25" rx="2" />
      <path d="M8.5 10.25V8.5a3.5 3.5 0 1 1 7 0v1.75" />
      <path d="M12 13.5v2.75" />
    </svg>
  );
}

const copy = {
  en: {
    actions: [
      {
        title: 'Active Recruitments',
        description: '4 Open Positions',
        href: ROUTES.recruitment,
        icon: <RecruitmentIcon />,
        iconClassName: 'text-blue-700',
        iconWrapClassName: 'bg-blue-50 ring-1 ring-blue-100',
      },
      {
        title: 'Notices & Circulars',
        description: 'Latest updates & instructions',
        href: ROUTES.recruitment,
        icon: <NoticeIcon />,
        iconClassName: 'text-amber-700',
        iconWrapClassName: 'bg-amber-50 ring-1 ring-amber-100',
      },
      {
        title: 'Member Login',
        description: 'Login to member portal',
        href: ROUTES.login,
        icon: <LoginIcon />,
        iconClassName: 'text-emerald-700',
        iconWrapClassName: 'bg-emerald-50 ring-1 ring-emerald-100',
      },
    ] as ActionItem[],
  },
  mr: {
    actions: [
      {
        title: '\u0938\u0915\u094d\u0930\u093f\u092f \u092d\u0930\u0924\u0940',
        description: '4 \u0916\u0941\u0932\u0940 \u092a\u0926\u0947',
        href: ROUTES.recruitment,
        icon: <RecruitmentIcon />,
        iconClassName: 'text-blue-700',
        iconWrapClassName: 'bg-blue-50 ring-1 ring-blue-100',
      },
      {
        title: '\u0938\u0942\u091a\u0928\u093e \u0935 \u092a\u0930\u093f\u092a\u0924\u094d\u0930\u0915\u0947',
        description: '\u0928\u0935\u0940\u0928\u0924\u092e \u0905\u0926\u094d\u092f\u0924\u0928\u0947 \u0935 \u0938\u0942\u091a\u0928\u093e',
        href: ROUTES.recruitment,
        icon: <NoticeIcon />,
        iconClassName: 'text-amber-700',
        iconWrapClassName: 'bg-amber-50 ring-1 ring-amber-100',
      },
      {
        title: '\u0938\u0926\u0938\u094d\u092f \u0932\u0949\u0917\u093f\u0928',
        description: '\u0938\u0926\u0938\u094d\u092f \u092a\u094b\u0930\u094d\u091f\u0932\u092e\u0927\u094d\u092f\u0947 \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u093e',
        href: ROUTES.login,
        icon: <LoginIcon />,
        iconClassName: 'text-emerald-700',
        iconWrapClassName: 'bg-emerald-50 ring-1 ring-emerald-100',
      },
    ] as ActionItem[],
  },
} as const;

export default function QuickActions() {
  const { language } = usePortalLanguage();
  const actions = copy[language].actions;

  return (
    <section className="relative z-10 bg-slate-100 py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.iconWrapClassName}`}
                >
                  <div className={action.iconClassName}>{action.icon}</div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">{action.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
