'use client';

import {
  CURRENT_RECRUITMENTS,
  PREVIOUS_RECRUITMENTS,
  RECRUITMENT_OVERVIEW_COPY,
} from '@/constants/home.constants';
import { ROUTES } from '@/constants/routes.constants';
import Link from 'next/link';
import { useState } from 'react';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function RecruitmentOverview() {
  const { language } = usePortalLanguage();
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');
  const content = RECRUITMENT_OVERVIEW_COPY[language];
  const visibleRecruitments = activeTab === 'current' ? CURRENT_RECRUITMENTS : PREVIOUS_RECRUITMENTS;

  return (
    <section id="recruitments" className="bg-slate-100 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-4">
        <div className="rounded-xl bg-white shadow-sm md:col-span-3">
          <div className="flex border-b">
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`border-b-2 px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'current'
                  ? 'border-yellow-400 bg-blue-950 text-[#fcd62e]'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {content.current}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('previous')}
              className={`border-b-2 px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'previous'
                  ? 'border-yellow-400 bg-blue-950 text-[#fcd62e]'
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {content.previous}
            </button>
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
                {visibleRecruitments.map((item) => (
                  <tr key={item.code} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.code}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.date} <br />
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {activeTab === 'current' ? (
                        <Link
                          href={{
                            pathname: ROUTES.apply,
                            query: {
                              code: item.code,
                              name: item.name,
                            },
                          }}
                          className="inline-block rounded-md bg-[#fcd62e] px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-yellow-400"
                        >
                          {content.apply}
                        </Link>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {item.status}
                          </span>
                          <button
                            type="button"
                            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                          >
                            {content.viewArchive}
                          </button>
                        </div>
                      )}
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


