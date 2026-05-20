'use client';

import { ASSOCIATION_COMMITMENT_COPY } from '@/constants/home.constants';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function AssociationCommitment() {
  const { language } = usePortalLanguage();
  const content = ASSOCIATION_COMMITMENT_COPY[language];

  return (
    <section className="relative overflow-hidden bg-slate-100 py-16 md:py-20">
      {/* <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-[#fcd62e]/25 blur-3xl" /> */}
      <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full bg-[#f3ddf9] px-4 py-2 md:text-2xl font-semibold tracking-wide text-[#7A2E92]">
              {content.badge}
            </span>
            <h2 className="mt-4 text-lg font-semibold leading-tight text-[#7A2E92]/90 md:text-xl">{content.title}</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-relaxed text-slate-800">{content.description}</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {content.focusAreas.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-[#ead7f1] bg-[#fcf8fe] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#c084d4] hover:bg-white hover:shadow-lg"
              >
                {/* Decorative Accent */}
                {/* <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-[#fcd62e]/30 transition group-hover:bg-[#fcd62e]/45" /> */}

                <div className="relative">
                  {/* Number Badge */}
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0e0f5] text-md font-bold text-[#7A2E92] shadow-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px w-10 bg-[#d8b8e4]" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-[22px] font-semibold leading-snug text-[#7A2E92]/90">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-lg leading-relaxed text-slate-800">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
