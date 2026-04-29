'use client';

import { ASSOCIATION_COMMITMENT_COPY } from '@/constants/home.constants';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function AssociationCommitment() {
  const { language } = usePortalLanguage();
  const content = ASSOCIATION_COMMITMENT_COPY[language];

  return (
    <section className="relative overflow-hidden bg-slate-100 py-16 md:py-20">
      <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-[#fcd62e]/25 blur-3xl" />
      <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full bg-blue-950 px-4 py-1.5 md:text-[14px] font-semibold tracking-wide text-amber-300">
              {content.badge}
            </span>
            <h2 className="mt-4 text-lg font-bold leading-tight text-slate-900 md:text-2xl">{content.title}</h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{content.description}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {content.focusAreas.map((item, index) => (
              <article key={item.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg">
                <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-[#fcd62e]/35 transition group-hover:bg-[#fcd62e]/50" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-xs font-bold text-[#fcd62e]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px w-10 bg-slate-300" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold leading-snug text-slate-900 md:text-base">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
