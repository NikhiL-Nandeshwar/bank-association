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
import { cn } from '@/utils/classnames';

export default function RecruitmentOverview() {
  const { language } = usePortalLanguage();
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');
  const [selectedResultCode, setSelectedResultCode] = useState<string | null>(null);
  const content = RECRUITMENT_OVERVIEW_COPY[language];
  const visibleRecruitments = activeTab === 'current' ? CURRENT_RECRUITMENTS : PREVIOUS_RECRUITMENTS;
  const selectedResult = selectedResultCode
    ? PREVIOUS_RECRUITMENTS.find((item) => item.code === selectedResultCode)
    : null;

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
                            aria-expanded={selectedResultCode === item.code}
                            onClick={() => setSelectedResultCode((currentCode) => (currentCode === item.code ? null : item.code))}
                            className={cn(
                              'rounded-md border px-3 py-1 text-xs font-semibold transition',
                              selectedResultCode === item.code
                                ? 'border-blue-900 bg-blue-950 text-[#fcd62e]'
                                : 'bg-slate-200 border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900',
                            )}
                          >
                            {selectedResultCode === item.code ? content.hideDetails : content.viewArchive}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeTab === 'previous' && selectedResultCode && selectedResult ? (
            <div className="border-t bg-white p-4 sm:p-6">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <div className="bg-blue-950 px-5 py-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fcd62e]">{content.resultAnnouncement}</p>
                  <h3 className="mt-2 text-xl font-semibold leading-snug">{selectedResult.name}</h3>
                  <div className="mt-4 grid gap-3 text-sm text-slate-100 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-300">{content.code}</p>
                      <p className="mt-1 font-semibold">{selectedResult.code}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-300">{content.resultPublished}</p>
                      <p className="mt-1 font-semibold">{selectedResult.resultDate}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-300">{content.totalSelected}</p>
                      <p className="mt-1 font-semibold">{selectedResult.totalSelected}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[240px_1fr]">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{content.post}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{selectedResult.position}</p>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{content.resultNote}</p>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 text-left">{content.rollNo}</th>
                            <th className="px-4 py-3 text-left">{content.candidateName}</th>
                            <th className="px-4 py-3 text-left">{content.category}</th>
                            <th className="px-4 py-3 text-right">{content.marks}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedResult.candidates.map((candidate, index) => (
                            <tr key={candidate.rollNo} className="border-t">
                              <td className="px-4 py-3 font-medium text-slate-900">{candidate.rollNo}</td>
                              <td className="px-4 py-3 text-slate-700">
                                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-slate-900">
                                  {index + 1}
                                </span>
                                {candidate.name}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{candidate.category}</td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-900">{candidate.marks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

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


