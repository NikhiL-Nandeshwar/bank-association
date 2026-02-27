// Components
import AnnouncementMarquee from '@/components/home/AnnouncementMarquee';
import Hero from '@/components/home/Hero';
import LatestUpdates from '@/components/home/LatestUpdates';
import PortalHighlights from '@/components/home/PortalHighlights';
import QuickActions from '@/components/home/QuickActions';
import RecruitmentOverview from '@/components/home/RecruitmentOverview';

export default function Home() {
  return (
    <>
      <Hero />
      <AnnouncementMarquee />
      <QuickActions />
      <PortalHighlights />
      <RecruitmentOverview />
      <LatestUpdates />
    </>
  );
}
