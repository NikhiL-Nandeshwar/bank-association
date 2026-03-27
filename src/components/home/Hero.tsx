'use client';

import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

const copy = {
  en: {
    titleLineOne: 'Online Application Portal 2026-27',
    titleLineTwo: 'Recruitment Process',
    description: 'Submit online applications for recruitment opportunities across member cooperative banks.',
    about: 'About Us',
    recruitment: 'Recruitment Updates',
  },
  mr: {
    titleLineOne: '\u0911\u0928\u0932\u093e\u0907\u0928 \u0905\u0930\u094d\u091c \u092a\u094b\u0930\u094d\u091f\u0932 2026-27 \u0938\u093e\u0920\u0940',
    titleLineTwo: '\u092d\u0930\u0924\u0940 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e',
    description: '\u0938\u0926\u0938\u094d\u092f \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915\u093e\u0902\u091a\u094d\u092f\u093e \u092a\u0926 \u092d\u0930\u0924\u0940 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u0947\u0938\u093e\u0920\u0940 \u0911\u0928\u0932\u093e\u0907\u0928 \u0905\u0930\u094d\u091c \u0938\u093e\u0926\u0930 \u0915\u0930\u093e.',
    about: '\u0906\u092e\u091a\u094d\u092f\u093e\u092c\u0926\u094d\u0926\u0932',
    recruitment: '\u092d\u0930\u0924\u0940 \u0905\u0926\u094d\u092f\u0924\u0928\u0947',
  },
} as const;

export default function Hero() {
  const { language } = usePortalLanguage();
  const content = copy[language];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.png')" }} />
      <div className="absolute inset-0 bg-slate-600/85" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold leading-snug text-white md:text-4xl">
            {content.titleLineOne}
            <br />
            <span className="text-[#fcd62e]">{content.titleLineTwo}</span>
          </h1>

          <p className="mt-4 text-sm text-white/90 md:text-base">{content.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/about" className="inline-flex items-center rounded-md bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400">
              {content.about}
            </Link>
            <Link href="/recruitment" className="inline-flex items-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">
              {content.recruitment}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
