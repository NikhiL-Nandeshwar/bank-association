'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import ApplicationWizard from '@/components/recruitment/ApplicationWizard';
import { useAuth } from '@/lib/useAuth';
import { ROUTES } from '@/constants/routes.constants';

type RecruitmentApplyPageQuery = {
  code?: string;
  name?: string;
  post?: string;
};

export default function RecruitmentApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user } = useAuth();

  const query = useMemo<RecruitmentApplyPageQuery>(() => ({
    code: searchParams.get('code') ?? undefined,
    name: searchParams.get('name') ?? undefined,
    post: searchParams.get('post') ?? undefined,
  }), [searchParams]);

  useEffect(() => {
    if (status === 'loading') return;

    const applyPath = `${ROUTES.apply}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    if (status === 'unauthenticated') {
      router.replace(`${ROUTES.signup}?redirect=${encodeURIComponent(applyPath)}`);
      return;
    }

    if (!user?.role?.toLowerCase().includes('candidate')) {
      router.replace(ROUTES.recruitment);
    }
  }, [status, user, router, searchParams]);

  if (status !== 'authenticated' || !user?.role?.toLowerCase().includes('candidate')) {
    return null;
  }

  return (
    <ApplicationWizard
      initialRecruitment={{
        code: query.code ?? 'KM-016',
        name: query.name ?? 'Kolhapur District Urban Banks Association Recruitment',
        postName: query.post,
      }}
    />
  );
}
