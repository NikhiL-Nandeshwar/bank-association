'use client';

import { HERO_COPY } from '@/constants/home.constants';
import { ROUTES } from '@/constants/routes.constants';
import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function Hero() {
  const { language } = usePortalLanguage();
  const content = HERO_COPY[language];

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
            <Link href={ROUTES.about} className="inline-flex items-center rounded-md bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400">
              {content.about}
            </Link>
            <Link href={ROUTES.recruitment} className="inline-flex items-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">
              {content.recruitment}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
