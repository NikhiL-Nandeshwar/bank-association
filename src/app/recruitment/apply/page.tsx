'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ApplicationWizard from '@/components/recruitment/ApplicationWizard';
import { useAuth } from '@/lib/useAuth';
import { ROUTES } from '@/constants/routes.constants';
import { getPublicList } from '@/actions/api';
import type { Vacancy } from '@/types/api.types';

type RecruitmentApplyPageQuery = {
  code?: string;
  name?: string;
  post?: string;
  bankName?: string;
};

function getVacancyCode(vacancy: Vacancy): string {
  const id = vacancy.vacancyId ?? vacancy.id ?? vacancy.bankId;
  const prefix = (vacancy.bankCode || vacancy.bankName?.slice(0, 2) || 'BK').replace(/[^a-z0-9]/gi, '').toUpperCase();
  return `${prefix}-${String(id).slice(-4)}`;
}

export default function RecruitmentApplyPage() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [query, setQuery] = useState<RecruitmentApplyPageQuery>({});
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery({
      code: params.get('code') ?? undefined,
      name: params.get('name') ?? undefined,
      post: params.get('post') ?? undefined,
      bankName: params.get('bankName') ?? undefined,
    });
  }, []);

  useEffect(() => {
    if (!query.code) {
      setSelectedVacancy(null);
      setIsLoading(false);
      return;
    }

    async function fetchVacancy() {
      try {
        const response = await getPublicList();
        const vacancies = Array.isArray(response.data) ? response.data : response.data.items;
        const vacancy = vacancies.find((v) => getVacancyCode(v) === query.code);
        setSelectedVacancy(vacancy || null);
      } catch {
        setSelectedVacancy(null);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchVacancy();
  }, [query.code]);

  useEffect(() => {
    if (status === 'loading') return;

    const params = new URLSearchParams(window.location.search);
    const applyPath = `${ROUTES.apply}${params.toString() ? `?${params.toString()}` : ''}`;

    if (status === 'unauthenticated') {
      router.replace(`${ROUTES.signup}?redirect=${encodeURIComponent(applyPath)}`);
      return;
    }

    if (!user?.role?.toLowerCase().includes('candidate')) {
      router.replace(ROUTES.recruitment);
    }
  }, [status, user, router]);

  if (status !== 'authenticated' || !user?.role?.toLowerCase().includes('candidate')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading recruitment details...</p>
      </div>
    );
  }

  return (
    <ApplicationWizard
      initialRecruitment={{
        vacancyId: selectedVacancy?.vacancyId ?? selectedVacancy?.id,
        code: query.code ?? 'KM-016',
        name: query.name ?? 'Kolhapur District Urban Banks Association Recruitment',
        postName: selectedVacancy?.postName || query.post,
        bankName: selectedVacancy?.bankName || query.bankName,
        eligibilityCriteria: selectedVacancy?.eligibilityCriteria ?? [],
      }}
    />
  );
}
