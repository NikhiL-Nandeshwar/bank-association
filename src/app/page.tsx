'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Components
import AnnouncementMarquee from '@/components/home/AnnouncementMarquee';
import AssociationCommitment from '@/components/home/AssociationCommitment';
import Hero from '@/components/home/Hero';
import LatestUpdates from '@/components/home/LatestUpdates';
import PortalHighlights from '@/components/home/PortalHighlights';
import QuickActions from '@/components/home/QuickActions';
import RecruitmentOverview from '@/components/home/RecruitmentOverview';
import { useAuth } from '@/lib/useAuth';
import { ROUTES } from '@/constants/routes.constants';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role?.toLowerCase().includes('admin');

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.replace(ROUTES.adminDashboard);
    }
  }, [isLoading, isAdmin, router]);

  if (!isLoading && isAdmin) {
    return null;
  }

  return (
    <>
      <Hero />
      <AnnouncementMarquee />
      {/* <AssociationCommitment /> */}
      <QuickActions />
      <AssociationCommitment />

      <PortalHighlights />

      <RecruitmentOverview />
      <LatestUpdates />
    </>
  );
}
