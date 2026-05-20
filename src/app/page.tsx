'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Components
import AnnouncementMarquee from '@/components/home/AnnouncementMarquee';
import AssociationCommitment from '@/components/home/AssociationCommitment';
import Hero from '@/components/home/Hero';
import LatestNewsTicker from '@/components/home/LatestNewsTicker';
import { useAuth } from '@/lib/useAuth';
import { ROUTES } from '@/constants/routes.constants';

export default function Home() {
  const { user, status } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role?.toLowerCase().includes('admin');

  useEffect(() => {
    if (status !== 'loading' && isAdmin){
      router.replace(ROUTES.adminDashboard);
    }
  }, [status, isAdmin, router]);

  if (status !== 'loading' && isAdmin) {
    return null;
  }

  return (
    <>
      <Hero />
      <AnnouncementMarquee />
      {/* <AssociationCommitment /> */}
      {/* <QuickActions /> */}
      <AssociationCommitment />
      <LatestNewsTicker />
      {/* <PortalHighlights /> */}
      {/* <RecruitmentOverview /> */}
      {/* <LatestUpdates /> */}
    </>
  );
}
