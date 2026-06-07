'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const { status, user } = useAuth();
  const [query, setQuery] = useState<RecruitmentApplyPageQuery>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery({
      code: params.get('code') ?? undefined,
      name: params.get('name') ?? undefined,
      post: params.get('post') ?? undefined,
    });
  }, []);

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
