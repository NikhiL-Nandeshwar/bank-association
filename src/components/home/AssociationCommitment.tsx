'use client';

import { usePortalLanguage } from '@/lib/usePortalLanguage';

const copy = {
  en: {
    badge: 'Our Commitment',
    title: 'Strong support for member banks',
    description:
      'Kolhapur District Urban Banks Association helps member institutions with planning, training, and implementation support so they can build stronger, more people-focused banking operations.',
    focusAreas: [
      {
        title: 'Guidance and policy support',
        description:
          'We help member banks with regulatory clarity, operational direction, and policy guidance for day-to-day administration and better decision-making.',
      },
      {
        title: 'Training and capability building',
        description:
          'Practical training programs for directors, officers, and staff improve institutional capability and strengthen service delivery.',
      },
      {
        title: 'Recovery and coordination assistance',
        description:
          'We support overdue and recovery-related matters through coordination, process guidance, and documentation assistance to move action forward effectively.',
      },
      {
        title: 'Rebuilding and revival support',
        description:
          'Banks facing operational challenges receive structured guidance on revival planning, risk control, and external technical support where needed.',
      },
    ],
  },
  mr: {
    badge: '\u0906\u092e\u091a\u0940 \u092c\u093e\u0902\u0927\u093f\u0932\u0915\u0940',
    title: '\u0938\u0926\u0938\u094d\u092f \u092c\u0901\u0915\u093e\u0902\u0938\u093e\u0920\u0940 \u0920\u094b\u0938 \u0938\u093e\u0925',
    description:
      '\u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930 \u091c\u093f\u0932\u094d\u0939\u093e \u0928\u093e\u0917\u0930\u0940 \u092c\u0901\u0915\u094d\u0938 \u0938\u0939\u0915\u093e\u0930\u0940 \u0905\u0938\u094b\u0938\u093f\u090f\u0936\u0928 \u0938\u0926\u0938\u094d\u092f \u0938\u0902\u0938\u094d\u0925\u093e\u0902\u0928\u093e \u0928\u093f\u092f\u094b\u091c\u0928, \u092a\u094d\u0930\u0936\u093f\u0915\u094d\u0937\u0923 \u0906\u0923\u093f \u0905\u0902\u092e\u0932\u092c\u091c\u093e\u0935\u0923\u0940 \u092f\u093e \u0924\u093f\u0928\u094d\u0939\u0940 \u0938\u094d\u0924\u0930\u093e\u0902\u0935\u0930 \u0920\u094b\u0938 \u0938\u0939\u093e\u092f\u094d\u092f \u0926\u0947\u090a\u0928 \u0905\u0927\u093f\u0915 \u0938\u0915\u094d\u0937\u092e \u0906\u0923\u093f \u0932\u094b\u0915\u093e\u092d\u093f\u092e\u0941\u0916 \u092c\u0901\u0915\u093f\u0902\u0917 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u0947\u0915\u0921\u0947 \u0935\u093e\u091f\u091a\u093e\u0932 \u0918\u0921\u0935\u0924\u0947.',
    focusAreas: [
      {
        title: '\u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0906\u0923\u093f \u0927\u094b\u0930\u0923 \u0938\u0939\u093e\u092f\u094d\u092f',
        description:
          '\u0938\u0926\u0938\u094d\u092f \u092c\u0901\u0915\u093e\u0902\u0928\u093e \u0928\u093f\u092f\u092e\u092a\u093e\u0932\u0928, \u092a\u094d\u0930\u0936\u093e\u0938\u0915\u0940\u092f \u0928\u093f\u0930\u094d\u0923\u092f \u0906\u0923\u093f \u0926\u0948\u0928\u0902\u0926\u093f\u0928 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0928\u093e\u0924 \u0938\u094d\u092a\u0937\u094d\u091f \u0926\u093f\u0936\u093e \u092e\u093f\u0933\u093e\u0935\u0940 \u092f\u093e\u0938\u093e\u0920\u0940 \u0924\u091c\u094d\u091c\u094d\u091e \u0938\u0932\u094d\u0932\u093e \u0926\u093f\u0932\u093e \u091c\u093e\u0924\u094b.',
      },
      {
        title: '\u092a\u094d\u0930\u0936\u093f\u0915\u094d\u0937\u0923 \u0906\u0923\u093f \u0915\u094c\u0936\u0932\u094d\u092f \u0935\u093f\u0915\u093e\u0938',
        description:
          '\u0938\u0902\u091a\u093e\u0932\u0915, \u0905\u0927\u093f\u0915\u093e\u0930\u0940 \u0906\u0923\u093f \u0915\u0930\u094d\u092e\u091a\u093e\u0930\u0940 \u092f\u093e\u0902\u091a\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u0935\u094d\u092f\u0935\u0939\u093e\u0930\u094d\u092f \u092a\u094d\u0930\u0936\u093f\u0915\u094d\u0937\u0923 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e \u0930\u093e\u092c\u0935\u0942\u0928 \u0938\u0902\u0938\u094d\u0925\u0947\u091a\u0940 \u0915\u093e\u092e\u0917\u093f\u0930\u0940 \u0905\u0927\u093f\u0915 \u0938\u0915\u094d\u0937\u092e \u0915\u0947\u0932\u0940 \u091c\u093e\u0924\u0947.',
      },
      {
        title: '\u0935\u0938\u0941\u0932\u0940 \u0935 \u0938\u092e\u0928\u094d\u0935\u092f \u092e\u0926\u0924',
        description:
          '\u0925\u0915\u092c\u093e\u0915\u0940 \u092a\u094d\u0930\u0915\u0930\u0923\u093e\u0902\u092e\u0927\u094d\u092f\u0947 \u0938\u092e\u0928\u094d\u0935\u092f, \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e\u0924\u094d\u092e\u0915 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0906\u0923\u093f \u0906\u0935\u0936\u094d\u092f\u0915 \u0915\u093e\u0917\u0926\u092a\u0924\u094d\u0930\u0940\u092f \u0938\u0939\u093e\u092f\u094d\u092f \u0926\u0947\u090a\u0928 \u092a\u0930\u093f\u0923\u093e\u092e\u0915\u093e\u0930\u0915 \u0915\u0943\u0924\u0940\u0938 \u0917\u0924\u0940 \u0926\u093f\u0932\u0940 \u091c\u093e\u0924\u0947.',
      },
      {
        title: '\u092a\u0941\u0928\u0930\u094d\u092c\u093e\u0902\u0927\u0923\u0940 \u0935 \u092a\u0941\u0928\u0930\u0941\u091c\u094d\u091c\u0940\u0935\u0928 \u0938\u092e\u0930\u094d\u0925\u0928',
        description:
          '\u0905\u0921\u091a\u0923\u0940\u0924 \u0905\u0938\u0932\u0947\u0932\u094d\u092f\u093e \u092c\u0901\u0915\u093e\u0902\u0938\u093e\u0920\u0940 \u091f\u092a\u094d\u092a\u094d\u092f\u093e\u091f\u092a\u094d\u092a\u094d\u092f\u093e\u0928\u0947 \u092a\u0941\u0928\u0930\u094d\u092c\u093e\u0902\u0927\u0923\u0940 \u0906\u0930\u093e\u0916\u0921\u093e, \u091c\u094b\u0916\u0940\u092e \u0928\u093f\u092f\u0902\u0924\u094d\u0930\u0923 \u0906\u0923\u093f \u092c\u093e\u0939\u094d\u092f \u0924\u093e\u0902\u0924\u094d\u0930\u093f\u0915 \u092e\u0926\u0924\u0940\u091a\u0947 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0915\u0947\u0932\u0947 \u091c\u093e\u0924\u0947.',
      },
    ],
  },
} as const;

export default function AssociationCommitment() {
  const { language } = usePortalLanguage();
  const content = copy[language];

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
