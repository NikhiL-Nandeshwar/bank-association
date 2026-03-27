'use client';

import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

const copy = {
  en: {
    noticesTitle: 'Latest Notices',
    viewAll: 'View All',
    notices: [
      'Recruitment 2026-27 online form window extended till 15 March 2026.',
      'Exam center allocation notice published for KM-015.',
      'Document verification guidelines updated for shortlisted candidates.',
    ],
    eventsTitle: 'Upcoming Events',
    events: [
      { title: 'Mock Test Window', date: '05 Mar 2026' },
      { title: 'KM-015 Online Exam', date: '12 Mar 2026' },
      { title: 'Interview Guidance Session', date: '18 Mar 2026' },
    ],
  },
  mr: {
    noticesTitle: '\u0928\u0935\u0940\u0928\u0924\u092e \u0938\u0942\u091a\u0928\u093e',
    viewAll: '\u0938\u0930\u094d\u0935 \u092a\u0939\u093e',
    notices: [
      '\u092d\u0930\u0924\u0940 2026-27 \u0905\u0911\u0928\u0932\u093e\u0907\u0928 \u0905\u0930\u094d\u091c \u0935\u093f\u0902\u0921\u094b 15 \u092e\u093e\u0930\u094d\u091a 2026 \u092a\u0930\u094d\u092f\u0902\u0924 \u0935\u093e\u0922\u0935\u0923\u094d\u092f\u093e\u0924 \u0906\u0932\u0940 \u0906\u0939\u0947.',
      'KM-015 \u0938\u093e\u0920\u0940 \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0915\u0947\u0902\u0926\u094d\u0930 \u0935\u093e\u091f\u092a \u0938\u0942\u091a\u0928\u093e \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u091d\u093e\u0932\u0940 \u0906\u0939\u0947.',
      '\u0928\u093f\u0935\u0921\u0932\u0947\u0932\u094d\u092f\u093e \u0909\u092e\u0947\u0926\u0935\u093e\u0930\u093e\u0902\u0938\u093e\u0920\u0940 \u0915\u093e\u0917\u0926\u092a\u0924\u094d\u0930 \u092a\u0921\u0924\u093e\u0933\u0923\u0940 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0915 \u0938\u0942\u091a\u0928\u093e \u0905\u0926\u094d\u092f\u0924\u0928\u093f\u0924 \u0915\u0930\u0923\u094d\u092f\u093e\u0924 \u0906\u0932\u094d\u092f\u093e \u0906\u0939\u0947\u0924.',
    ],
    eventsTitle: '\u0906\u0917\u093e\u092e\u0940 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e',
    events: [
      { title: '\u092e\u0949\u0915 \u091f\u0947\u0938\u094d\u091f \u0935\u093f\u0902\u0921\u094b', date: '05 Mar 2026' },
      { title: 'KM-015 \u0911\u0928\u0932\u093e\u0907\u0928 \u092a\u0930\u0940\u0915\u094d\u0937\u093e', date: '12 Mar 2026' },
      { title: '\u092e\u0941\u0932\u093e\u0916\u0924 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0938\u0924\u094d\u0930', date: '18 Mar 2026' },
    ],
  },
} as const;

export default function LatestUpdates() {
  const { language } = usePortalLanguage();
  const content = copy[language];

  return (
    <section className="bg-slate-400 py-14 text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-400 bg-white/90 p-6">
          <div className="mb-4 flex items-center justify-between text-blue-800">
            <h3 className="text-lg font-semibold">{content.noticesTitle}</h3>
            <Link href="/recruitment" className="font-semibold hover:underline">
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
