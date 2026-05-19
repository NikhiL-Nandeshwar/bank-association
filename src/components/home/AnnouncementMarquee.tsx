'use client';

import { ANNOUNCEMENT_COPY } from '@/constants/home.constants';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function AnnouncementMarquee() {
  const { language } = usePortalLanguage();
  const content = ANNOUNCEMENT_COPY[language];

  return (
    <section className="border-y border-[#D9A9C3] bg-[#F6EAF1]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
        <span className="shrink-0 rounded-md bg-[#C0568A] px-2.5 py-1 text-sm font-semibold text-white">          
          {content.label}
        </span>

        <div className="relative flex-1 overflow-hidden">
          <div
            className="flex w-max min-w-full items-center gap-8 whitespace-nowrap text-md text-[#6B2D4F] will-change-transform"
            style={{ animation: 'marquee-scroll 22s linear infinite' }}
          >
            <span>{content.message}</span>
            <span aria-hidden="true">{content.message}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
