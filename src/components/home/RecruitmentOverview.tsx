'use client';

import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

const currentRecruitments = [
  {
    code: 'KM-016',
    name: '\u0936\u093f\u0935\u093e\u091c\u0940 \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915 \u0932\u093f., \u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930',
    date: '16-10-2025',
    time: '10:00 AM',
  },
  {
    code: 'KM-015',
    name: '\u092a\u0941\u0923\u0947 \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915 \u0932\u093f., \u092a\u0941\u0923\u0947',
    date: '09-01-2026',
    time: '10:00 AM',
  },
  {
    code: 'KM-014',
    name: '\u092a\u0941\u0923\u0947 \u092e\u0930\u094d\u091a\u0902\u091f\u094d\u0938 \u0915\u094b-\u0911\u092a \u092c\u0901\u0915 \u0932\u093f., \u092a\u0941\u0923\u0947',
    date: '02-01-2026',
    time: '10:00 AM',
  },
  {
    code: 'KM-013',
    name: '\u0936\u093f\u0935\u093e\u092c\u093e\u0938\u0935\u0928\u094d\u0928\u093e \u091c\u0928\u0924\u093e \u0915\u094b-\u0911\u092a \u092c\u0901\u0915 \u0932\u093f., \u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930',
    date: '31-12-2025',
    time: '10:00 AM',
  },
];

const copy = {
  en: {
    current: 'Current Recruitments',
    previous: 'Previous Recruitments',
    code: 'Recruitment Code',
    name: 'Recruitment Name',
    start: 'Start Date / Time',
    status: 'Status',
    apply: 'Apply Now',
    note: 'All recruitment processes are conducted through the respective cooperative banks.',
    acts: 'Banking Regulation Acts',
    quickLinks: 'Quick Links',
    actItems: ['Banking Regulation Act', 'Cooperative Department Circulars', 'RBI & NABARD Updates'],
    linkItems: ['Application guidelines', 'Bank recruitment circulars', 'Fees and conditions'],
  },
  mr: {
    current: '\u0938\u0927\u094d\u092f\u093e\u091a\u094d\u092f\u093e \u092d\u0930\u0924\u0940',
    previous: '\u092e\u093e\u0917\u0940\u0932 \u092d\u0930\u0924\u0940',
    code: '\u092d\u0930\u0924\u0940 \u0915\u094b\u0921',
    name: '\u092d\u0930\u0924\u0940\u091a\u0947 \u0928\u093e\u0935',
    start: '\u0938\u0941\u0930\u0941\u0935\u093e\u0924\u0940\u091a\u0940 \u0924\u093e\u0930\u0940\u0916 / \u0935\u0947\u0933',
    status: '\u0938\u094d\u0925\u093f\u0924\u0940',
    apply: '\u0905\u0930\u094d\u091c \u0915\u0930\u093e',
    note: '\u0938\u0930\u094d\u0935 \u092a\u0926 \u092d\u0930\u0924\u0940 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915\u093e\u0902\u0926\u094d\u0935\u093e\u0930\u0947 \u0930\u093e\u092c\u0935\u093f\u0923\u094d\u092f\u093e\u0924 \u092f\u0947\u0924\u0947.',
    acts: '\u092c\u0945\u0902\u0915\u093f\u0902\u0917 \u0930\u0947\u0917\u094d\u092f\u0941\u0932\u0947\u0936\u0928 \u0915\u093e\u092f\u0926\u0947',
    quickLinks: '\u0926\u094d\u0930\u0941\u0924 \u0926\u0941\u0935\u0947',
    actItems: ['\u092c\u0901\u0915\u093f\u0902\u0917 \u0930\u0947\u0917\u094d\u092f\u0941\u0932\u0947\u0936\u0928 \u0915\u093e\u092f\u0926\u093e', '\u0938\u0939\u0915\u093e\u0930 \u0935\u093f\u092d\u093e\u0917\u093e\u091a\u0940 \u092a\u0930\u093f\u092a\u0924\u094d\u0930\u0915\u0947', 'RBI \u0935 NABARD \u0905\u0926\u094d\u092f\u0924\u0928\u0947'],
    linkItems: ['\u0905\u0930\u094d\u091c \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0915 \u0938\u0942\u091a\u0928\u093e', '\u092c\u0901\u0915 \u092d\u0930\u0924\u0940 \u092a\u0930\u093f\u092a\u0924\u094d\u0930\u0915\u0947', '\u0936\u0941\u0932\u094d\u0915 \u0935 \u0905\u091f\u0940'],
  },
} as const;

export default function RecruitmentOverview() {
  const { language } = usePortalLanguage();
  const content = copy[language];

  return (
    <section id="recruitments" className="bg-slate-100 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-4">
        <div className="rounded-xl bg-white shadow-sm md:col-span-3">
          <div className="flex border-b">
            <button className="border-b-2 border-yellow-400 bg-blue-950 px-6 py-3 text-sm font-semibold text-[#fcd62e]">
              {content.current}
            </button>
            <button className="px-6 py-3 text-sm text-slate-500">{content.previous}</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">{content.code}</th>
                  <th className="px-4 py-3 text-left">{content.name}</th>
                  <th className="px-4 py-3 text-left">{content.start}</th>
                  <th className="px-4 py-3 text-center">{content.status}</th>
                </tr>
              </thead>
              <tbody>
                {currentRecruitments.map((item) => (
                  <tr key={item.code} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.code}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.date} <br />
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={{
                          pathname: '/recruitment/apply',
                          query: {
                            code: item.code,
                            name: item.name,
                          },
                        }}
                        className="inline-block rounded-md bg-[#fcd62e] px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-yellow-400"
                      >
                        {content.apply}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs text-slate-500">{content.note}</div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 rounded-lg bg-gradient-to-r from-slate-600 to-slate-800 p-2 text-sm font-semibold text-white">
              {content.acts}
            </h3>

            <ul className="space-y-3 text-sm text-slate-700">
              {content.actItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 rounded-lg bg-gradient-to-r from-slate-600 to-slate-800 p-2 text-sm font-semibold text-white">
              {content.quickLinks}
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
              {content.linkItems.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


