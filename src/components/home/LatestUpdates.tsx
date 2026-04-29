'use client';

import { LATEST_UPDATES_COPY } from '@/constants/home.constants';
import { ROUTES } from '@/constants/routes.constants';
import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function LatestUpdates() {
  const { language } = usePortalLanguage();
  const content = LATEST_UPDATES_COPY[language];

  return (
    <section className="bg-slate-400 py-14 text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-400 bg-white/90 p-6">
          <div className="mb-4 flex items-center justify-between text-blue-800">
            <h3 className="text-lg font-semibold">{content.noticesTitle}</h3>
            <Link href={ROUTES.recruitment} className="font-semibold hover:underline">
              {content.viewAll}
            </Link>
          </div>
          <ul className="space-y-3 text-slate-900">
            {content.notices.map((notice) => (
              <li key={notice} className="border-b border-slate-600 pb-3 last:border-b-0 last:pb-0">
                {notice}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-400 bg-white/90 p-6">
          <h3 className="mb-4 text-lg font-semibold text-blue-800">{content.eventsTitle}</h3>
          <div className="space-y-3">
            {content.events.map((event) => (
              <div
                key={event.title}
                className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-600/70 px-4 py-3"
              >
                <p className="text-white">{event.title}</p>
                <span className="rounded-md bg-[#fcd62e] px-2 py-1 text-xs font-semibold text-slate-900">
                  {event.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
