'use client';

import { ANNOUNCEMENT_COPY } from '@/constants/home.constants';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function AnnouncementMarquee() {
  const { language } = usePortalLanguage();
  const content = ANNOUNCEMENT_COPY[language];

  return (
    <section className="border-y border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
        <span className="shrink-0 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-slate-900">
          {content.label}
        </span>

        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max min-w-full items-center gap-8 whitespace-nowrap text-sm font-medium text-slate-700 will-change-transform" style={{ animation: 'marquee-scroll 22s linear infinite' }}>
            <span>{content.message}</span>
            <span aria-hidden="true">{content.message}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
