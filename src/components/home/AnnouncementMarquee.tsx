'use client';

import { usePortalLanguage } from '@/lib/usePortalLanguage';

const copy = {
  en: {
    label: 'Notice',
    message: 'Welcome to the Kolhapur District Urban Banks Association portal. Check the latest announcements and recruitment updates here.',
  },
  mr: {
    label: '\u0938\u0942\u091a\u0928\u093e',
    message: '\u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930 \u091c\u093f\u0932\u094d\u0939\u093e \u0928\u093e\u0917\u0930\u0940 \u092c\u0945\u0902\u0915\u094d\u0938 \u0938\u0939\u0915\u093e\u0930\u0940 \u0905\u0938\u094b\u0938\u093f\u090f\u0936\u0928 \u0932\u093f. \u092e\u0927\u094d\u092f\u0947 \u0906\u092a\u0932\u0947 \u0938\u094d\u0935\u093e\u0917\u0924 \u0906\u0939\u0947. \u0911\u0928\u0932\u093e\u0907\u0928 \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0935 \u092d\u0930\u0924\u0940 \u092a\u094b\u0930\u094d\u091f\u0932\u0935\u0930\u0940\u0932 \u0924\u093e\u091c\u094d\u092f\u093e \u0938\u0942\u091a\u0928\u093e \u092f\u0947\u0925\u0947 \u092a\u093e\u0939\u093e.',
  },
} as const;

export default function AnnouncementMarquee() {
  const { language } = usePortalLanguage();
  const content = copy[language];

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
