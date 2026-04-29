'use client';

import { PORTAL_HIGHLIGHTS_COPY } from '@/constants/home.constants';
import { ROUTES } from '@/constants/routes.constants';
import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function PortalHighlights() {
  const { language } = usePortalLanguage();
  const content = PORTAL_HIGHLIGHTS_COPY[language];

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
            href={ROUTES.recruitment}
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


