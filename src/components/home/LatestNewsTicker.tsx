'use client';

import { ArrowUpRight, CalendarDays, Megaphone, Newspaper } from 'lucide-react';
import { useEffect, useState } from 'react';

import { LATEST_NEWS_COPY } from '@/constants/home.constants';
import { usePortalLanguage } from '@/lib/usePortalLanguage';
import { getNews } from '@/actions/api/news.actions';
import type { News } from '@/types/api.types';

const toneStyles = {
  violet: {
    badge: 'bg-[#f3e8ff] text-[#7A2E92]',
    icon: 'bg-[#7A2E92] text-white',
    border: 'border-[#ead7f1]',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700',
    icon: 'bg-emerald-600 text-white',
    border: 'border-emerald-100',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700',
    icon: 'bg-amber-500 text-white',
    border: 'border-amber-100',
  },
} as const;

type NewsItem = {
  type: string;
  title?: string;
  newsEng: string;
  newsMrt: string;
  summary: string;
  date: string;
  tone: keyof typeof toneStyles;
};

function NewsCard({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
  const styles = toneStyles[item.tone];
  const { language } = usePortalLanguage();

  // Language-wise title selection
  const newsTitle =
    language === 'mr'
      ? item.newsMrt
      : item.newsEng;

  return (
    <article
      className={`group flex h-full min-h-[190px] w-[320px] shrink-0 flex-col justify-between rounded-lg border ${styles.border} bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[380px] ${compact ? 'min-h-[210px] w-full sm:w-full' : ''
        }`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${styles.badge}`}>
            {item.type}
          </span>

          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
            <Newspaper className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        {/* Updated title */}
        <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-950">
          {newsTitle}
        </h3>

        {/* Keep summary if needed */}
        <p className="mt-2 line-clamp-3 text-md leading-6 text-slate-700">
          {item.summary}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-slate-500">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {item.date}
        </span>

        <ArrowUpRight
          className="h-5 w-5 text-[#7A2E92] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
    </article>
  );
}

const toneRotation = ['violet', 'emerald', 'amber'] as const;

function transformNewsToNewsItem(newsData: News, index: number): NewsItem {
  return {
    type: 'News',
    newsEng: newsData.newsEng,
    newsMrt: newsData.newsMrt,
    title: newsData.newsEng,
    summary: newsData.newsEng,
    date: newsData.createdAt ? new Date(newsData.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
    tone: toneRotation[index % toneRotation.length],
  };
}

export default function LatestNewsTicker() {
  const { language } = usePortalLanguage();
  const content = LATEST_NEWS_COPY[language];
  const fallbackItems: NewsItem[] = content.items.map((item) => ({
    ...item,

    newsEng: item.title,
    newsMrt: item.title, // fallback same text if Marathi unavailable
  }));

  const [newsItems, setNewsItems] = useState<NewsItem[]>(fallbackItems);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await getNews();
        const items = Array.isArray(response.data) ? response.data : response.data.items || [];

        if (items.length > 0) {
          const transformed = items.map((item, index) => transformNewsToNewsItem(item, index));
          setNewsItems(transformed);
        }
      } catch (error) {
        console.error('Failed to load news:', error);
        // Fallback to mock data
        setNewsItems(fallbackItems);
      } finally {
        setIsLoading(false);
      }
    }

    loadNews();
  }, [content]);

  const marqueeItems = [...newsItems, ...newsItems];
  const featured = newsItems[0] || content.items[0];

  return (
    <section className="overflow-hidden bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.4fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-md bg-[#f3ddf9] px-3 py-2 text-sm font-semibold uppercase tracking-wide text-[#7A2E92]">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              {content.badge}
            </span>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-700">{content.description}</p>
          </div>

          <div className="rounded-lg border border-[#ead7f1] bg-[#fcf8fe] p-5">
            {/* <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-md font-semibold uppercase tracking-wide text-[#7A2E92]">{content.featuredLabel}</p>
              <Link
                href={ROUTES.recruitment}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A2E92] hover:text-[#5c216f]"
              >
                {content.readMore}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div> */}
            {isLoading ? (
              <div className="min-h-[210px] w-full rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-center">
                <p className="text-slate-500">Loading news...</p>
              </div>
            ) : (
              <NewsCard item={featured} compact />
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 border-y border-slate-200 bg-slate-50 py-6">
        <div className="latest-news-mask overflow-hidden">
          <div className="latest-news-track flex w-max gap-5 px-4">
            {marqueeItems.map((item, index) => (
              <NewsCard key={`${item.title}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
