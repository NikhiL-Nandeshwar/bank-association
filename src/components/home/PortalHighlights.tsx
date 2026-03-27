'use client';

import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

const copy = {
  en: {
    badge: 'Candidate Services',
    title: 'Essential tools for every applicant journey',
    description: 'From exam schedules to helpdesk support, this section gives candidates faster access to the most-used recruitment actions in a clear and structured way.',
    explore: 'Explore All Services',
    cards: [
      {
        title: 'Exam Calendar',
        description: 'Track upcoming exam schedules, bank-wise windows, and important candidate timelines in one place.',
        href: '/recruitment',
        cta: 'View Schedule',
        eyebrow: 'Planning',
        badge: '01',
      },
      {
        title: 'Download Admit Card',
        description: 'Access hall tickets and candidate instructions for active recruitment cycles without the extra clutter.',
        href: '/recruitment',
        cta: 'Download Card',
        eyebrow: 'Access',
        badge: '02',
      },
      {
        title: 'Results & Merit List',
        description: 'Check published results, shortlist updates, and next-stage announcements with clearer status visibility.',
        href: '/recruitment',
        cta: 'Check Results',
        eyebrow: 'Results',
        badge: '03',
      },
      {
        title: 'Candidate Helpdesk',
        description: 'Find FAQs, process guidance, and support contact details for issues related to forms and recruitment notices.',
        href: '/about',
        cta: 'Get Support',
        eyebrow: 'Support',
        badge: '04',
      },
    ],
  },
  mr: {
    badge: '\u0909\u092e\u0947\u0926\u0935\u093e\u0930 \u0938\u0947\u0935\u093e',
    title: '\u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915 \u0905\u0930\u094d\u091c\u0926\u093e\u0930\u093e\u091a\u094d\u092f\u093e \u092a\u094d\u0930\u0935\u093e\u0938\u093e\u0938\u093e\u0920\u0940 \u0906\u0935\u0936\u094d\u092f\u0915 \u0938\u093e\u0927\u0928\u0947',
    description: '\u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0935\u0947\u0933\u093e\u092a\u0924\u094d\u0930\u0915\u093e\u092a\u093e\u0938\u0942\u0928 \u0939\u0947\u0932\u094d\u092a\u0921\u0947\u0938\u094d\u0915 \u0938\u092e\u0930\u094d\u0925\u0928\u093e\u092a\u0930\u094d\u092f\u0902\u0924, \u0939\u093e \u0935\u093f\u092d\u093e\u0917 \u092d\u0930\u0924\u0940\u0938\u0902\u092c\u0902\u0927\u093f\u0924 \u0938\u0930\u094d\u0935\u093e\u0927\u093f\u0915 \u0935\u093e\u092a\u0930\u0932\u094d\u092f\u093e \u091c\u093e\u0923\u093e\u0930\u094d\u092f\u093e \u0938\u0947\u0935\u093e \u0938\u0941\u091f\u0938\u0941\u091f\u0940\u0924\u092a\u0923\u0947 \u0926\u0947\u0924\u094b.',
    explore: '\u0938\u0930\u094d\u0935 \u0938\u0947\u0935\u093e \u092a\u0939\u093e',
    cards: [
      {
        title: '\u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0915\u0945\u0932\u0947\u0902\u0921\u0930',
        description: '\u0906\u0917\u093e\u092e\u0940 \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0935\u0947\u0933\u093e\u092a\u0924\u094d\u0930\u0915, \u092c\u0901\u0915\u0928\u093f\u0939\u093e\u092f \u0935\u093f\u0902\u0921\u094b \u0906\u0923\u093f \u092e\u0939\u0924\u094d\u0935\u093e\u091a\u094d\u092f\u093e \u0924\u093e\u0930\u0916\u093e \u090f\u0915\u093e\u091a \u0920\u093f\u0915\u093e\u0923\u0940 \u092a\u0939\u093e.',
        href: '/recruitment',
        cta: '\u0935\u0947\u0933\u093e\u092a\u0924\u094d\u0930\u0915 \u092a\u0939\u093e',
        eyebrow: '\u0928\u093f\u092f\u094b\u091c\u0928',
        badge: '01',
      },
      {
        title: '\u092a\u094d\u0930\u0935\u0947\u0936\u092a\u0924\u094d\u0930 \u0921\u093e\u0909\u0928\u0932\u094b\u0921',
        description: '\u0938\u0915\u094d\u0930\u093f\u092f \u092d\u0930\u0924\u0940\u0938\u093e\u0920\u0940 \u0939\u093e\u0932 \u091f\u093f\u0915\u093f\u091f \u0906\u0923\u093f \u0909\u092e\u0947\u0926\u0935\u093e\u0930 \u0938\u0942\u091a\u0928\u093e \u0938\u094b\u092a\u094d\u092f\u093e \u092a\u0926\u094d\u0927\u0924\u0940\u0928\u0947 \u092e\u093f\u0933\u0935\u093e.',
        href: '/recruitment',
        cta: '\u092a\u094d\u0930\u0935\u0947\u0936\u092a\u0924\u094d\u0930 \u092e\u093f\u0933\u0935\u093e',
        eyebrow: '\u092a\u094d\u0930\u0935\u0947\u0936',
        badge: '02',
      },
      {
        title: '\u0928\u093f\u0915\u093e\u0932 \u0935 \u092e\u0947\u0930\u093f\u091f \u092f\u093e\u0926\u0940',
        description: '\u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0928\u093f\u0915\u093e\u0932, \u0936\u0949\u0930\u094d\u091f\u0932\u093f\u0938\u094d\u091f \u0905\u0926\u094d\u092f\u0924\u0928\u0947 \u0906\u0923\u093f \u092a\u0941\u0922\u0940\u0932 \u091f\u092a\u094d\u092a\u094d\u092f\u093e\u091a\u0940 \u0918\u094b\u0937\u0923\u093e \u0938\u094d\u092a\u0937\u094d\u091f\u092a\u0923\u0947 \u092a\u0939\u093e.',
        href: '/recruitment',
        cta: '\u0928\u093f\u0915\u093e\u0932 \u092a\u0939\u093e',
        eyebrow: '\u0928\u093f\u0915\u093e\u0932',
        badge: '03',
      },
      {
        title: '\u0909\u092e\u0947\u0926\u0935\u093e\u0930 \u0939\u0947\u0932\u094d\u092a\u0921\u0947\u0938\u094d\u0915',
        description: '\u0905\u0930\u094d\u091c, \u092d\u0930\u0924\u0940 \u0938\u0942\u091a\u0928\u093e \u0906\u0923\u093f \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u0947\u0938\u0902\u092c\u0902\u0927\u0940\u0924 FAQ, \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0935 \u0938\u092e\u0930\u094d\u0925\u0928 \u0924\u092a\u0936\u093f\u0932 \u092e\u093f\u0933\u0935\u093e.',
        href: '/about',
        cta: '\u092e\u0926\u0924 \u092e\u093f\u0933\u0935\u093e',
        eyebrow: '\u0938\u092e\u0930\u094d\u0925\u0928',
        badge: '04',
      },
    ],
  },
} as const;

export default function PortalHighlights() {
  const { language } = usePortalLanguage();
  const content = copy[language];

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] py-16">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm">
              {content.badge}
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              {content.description}
            </p>
          </div>

          <Link
            href="/recruitment"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
          >
            {content.explore}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {content.cards.map((card) => (
            <div
              key={card.title}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    {card.title}
                  </h3>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-sm font-bold text-[#fcd62e] shadow-sm">
                  {card.badge}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {card.description}
              </p>

              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <Link
                  href={card.href}
                  className="inline-flex items-center text-sm font-semibold text-slate-800 transition hover:text-slate-950"
                >
                  {card.cta}
                </Link>
                <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700">
                  {'>'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


