'use client';

import { getVacancies } from '@/actions/api';
import { RECRUITMENT_OVERVIEW_COPY } from '@/constants/home.constants';
import { ROUTES } from '@/constants/routes.constants';
import type { ApiPagedResult, Vacancy } from '@/types/api.types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

type CurrentRecruitment = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  postName?: string;
  noticePdfUrl?: string;
  noticePdfFileName?: string;
};

type VacancyRecord = Vacancy & Record<string, unknown>;

function getStringField(item: VacancyRecord, keys: string[]) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return '';
}

function getBooleanField(item: VacancyRecord, keys: string[]) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === 'boolean') {
      return value;
    }
  }

  return false;
}

function formatDisplayDate(value: string) {
  if (!value) return '';
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');

  if (year && month && day) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(Number(year), Number(month) - 1, Number(day)));
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getVacancyItems(data: ApiPagedResult<Vacancy> | Vacancy[]) {
  return Array.isArray(data) ? data : data.items;
}

function getRecruitmentCode(item: VacancyRecord) {
  const id = item.vacancyId ?? item.id ?? item.bankId;
  const prefix = (item.bankCode || item.bankName?.slice(0, 2) || 'BK').replace(/[^a-z0-9]/gi, '').toUpperCase();

  return `${prefix}-${String(id).slice(-4)}`;
}

function mapVacancyToRecruitment(item: Vacancy): CurrentRecruitment {
  const vacancy = item as VacancyRecord;

  return {
    code: getRecruitmentCode(vacancy),
    name: item.bankName || `Bank #${item.bankId}`,
    postName: item.postName,
    startDate: formatDisplayDate(getStringField(vacancy, ['applicationStartDate', 'ApplicationStartDate', 'startDate', 'StartDate'])),
    endDate: formatDisplayDate(getStringField(vacancy, ['applicationEndDate', 'ApplicationEndDate', 'endDate', 'EndDate'])),
    status: item.status || 'Open',
    noticePdfUrl: item.noticePdfUrl ?? undefined,
    noticePdfFileName: item.noticePdfFileName ?? undefined,
  };
}

function isCurrentVacancy(item: Vacancy) {
  const status = item.status?.toLowerCase() ?? '';
  const applicationEndDate = getStringField(item as VacancyRecord, ['applicationEndDate', 'ApplicationEndDate', 'endDate', 'EndDate']);

  if (status.includes('closed') || status.includes('previous') || status.includes('result')) {
    return false;
  }

  if (!applicationEndDate) {
    return true;
  }

  const endDate = new Date(applicationEndDate);

  if (Number.isNaN(endDate.getTime())) {
    return true;
  }

  endDate.setHours(23, 59, 59, 999);

  return endDate >= new Date();
}

function isPublishedVacancy(item: Vacancy) {
  const vacancy = item as VacancyRecord;
  const status = item.status?.toLowerCase() ?? '';

  return getBooleanField(vacancy, ['isPublished', 'IsPublished', 'published', 'Published']) || status === 'published';
}

export default function RecruitmentOverview() {
  const { language } = usePortalLanguage();
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');
  const [currentRecruitments, setCurrentRecruitments] = useState<CurrentRecruitment[]>([]);
  const [previousRecruitments, setPreviousRecruitments] = useState<CurrentRecruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const content = RECRUITMENT_OVERVIEW_COPY[language];
  const visibleRecruitments = activeTab === 'current' ? currentRecruitments : previousRecruitments;

  useEffect(() => {
    let isMounted = true;

    async function loadRecruitments() {
      try {
        const response = await getVacancies();
        const vacancies = getVacancyItems(response.data);

        if (!isMounted) return;

        const publishedVacancies = vacancies.filter(isPublishedVacancy);

        setCurrentRecruitments(publishedVacancies.filter(isCurrentVacancy).map(mapVacancyToRecruitment));
        setPreviousRecruitments(publishedVacancies.filter((item) => !isCurrentVacancy(item)).map(mapVacancyToRecruitment));
      } catch {
        if (!isMounted) return;

        setCurrentRecruitments([]);
        setPreviousRecruitments([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRecruitments();

    return () => {
      isMounted = false;
    };
  }, []);

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
                  <th className="px-4 py-3 text-left">{content.end}</th>
                  <th className="px-4 py-3 text-center">{content.status}</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && visibleRecruitments.map((item) => (
                  <tr key={item.code} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.code}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.startDate || 'To be announced'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.endDate || 'To be announced'}</td>
                    <td className="px-4 py-3 text-center">
                      {activeTab === 'current' ? (
                        <div className="flex flex-col items-center gap-2">
                          <Link
                            href={{
                              pathname: ROUTES.apply,
                              query: {
                                code: item.code,
                                name: item.name,
                                post: 'postName' in item ? item.postName : undefined,
                              },
                            }}
                            className="inline-block rounded-md bg-[#fcd62e] px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-yellow-400"
                          >
                            {content.apply}
                          </Link>
                          {'noticePdfUrl' in item && item.noticePdfUrl ? (
                            <a
                              href={item.noticePdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-blue-800 underline-offset-2 hover:underline"
                            >
                              {item.noticePdfFileName || 'Recruitment notice'}
                            </a>
                          ) : null}
                        </div>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">{content.loading}</td>
                  </tr>
                ) : null}
                {!isLoading && visibleRecruitments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      {activeTab === 'current' ? content.emptyCurrent : content.emptyPrevious}
                    </td>
                  </tr>
                ) : null}
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
