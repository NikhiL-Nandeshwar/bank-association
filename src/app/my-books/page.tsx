'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, Clock3, LibraryBig } from 'lucide-react';
import { getMyLibrary, type MyLibrary } from '@/actions/api/library.actions';
import { BookCover } from '@/components/common/BookCover';
import { useAuth } from '@/lib/useAuth';
import { ROUTES } from '@/constants/routes.constants';

function progressLabel(progress: number) {
  if (progress >= 100) return 'पुन्हा वाचा';
  if (progress > 0) return 'वाचन सुरू ठेवा';
  return 'वाचा';
}

export default function MyBooksPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [library, setLibrary] = useState<MyLibrary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyLibrary();
      setLibrary(response.data);
    } catch {
      setError('तुमची पुस्तके लोड करता आली नाहीत. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.myBooks)}`);
    } else if (status === 'authenticated') {
      void loadLibrary();
    }
  }, [status, router, loadLibrary]);

  if (status === 'loading' || isLoading) {
    return <main className="mx-auto max-w-7xl px-4 py-12"><div className="section-shell p-10 text-center text-slate-600">तुमची पुस्तके लोड होत आहेत...</div></main>;
  }

  if (error) {
    return <main className="mx-auto max-w-7xl px-4 py-12"><div className="section-shell p-10 text-center"><p className="text-red-600">{error}</p><button type="button" onClick={() => void loadLibrary()} className="mt-5 rounded-full bg-[#7A2E92] px-5 py-2.5 font-semibold text-white">पुन्हा प्रयत्न करा</button></div></main>;
  }

  const books = library?.books ?? [];
  return <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A2E92]">तुमचे पुस्तकालय</p><h1 className="mt-2 text-3xl font-bold text-slate-900">माझी पुस्तके</h1><p className="mt-2 text-slate-600">तुमच्या खात्यातून खरेदी केलेली पुस्तके.</p></div>
    <section className="grid gap-4 sm:grid-cols-3">
      <Summary icon={<LibraryBig />} label="एकूण पुस्तके" value={library?.totalBooks ?? books.length} />
      <Summary icon={<Clock3 />} label="वाचन सुरू" value={library?.readingNow ?? 0} />
      <Summary icon={<CheckCircle2 />} label="पूर्ण" value={library?.completed ?? 0} />
    </section>
    {books.length === 0 ? <div className="section-shell p-10 text-center"><BookOpen className="mx-auto h-10 w-10 text-[#7A2E92]" /><h2 className="mt-4 text-xl font-semibold text-slate-900">तुम्ही अद्याप कोणतीही पुस्तके खरेदी केलेली नाहीत.</h2><Link href="/bookslist" className="mt-5 inline-flex rounded-full bg-[#7A2E92] px-5 py-3 font-semibold text-white">ई-पुस्तके पहा</Link></div> : <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{books.map((book) => { const progress = Math.min(100, Math.max(0, book.progressPercent)); return <article key={book.libraryId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative h-64 bg-slate-100"><BookCover src={book.coverImageUrl} alt={book.title} /></div><div className="space-y-3 p-5"><div><h2 className="line-clamp-2 text-xl font-semibold text-slate-900">{book.title}</h2><p className="mt-1 text-sm text-slate-600">{book.author}</p></div><div className="flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-2.5 py-1">{book.category}</span><span className="rounded-full bg-slate-100 px-2.5 py-1">{book.language}</span></div><div><div className="mb-1 flex justify-between text-xs font-medium text-slate-600"><span>वाचन प्रगती</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#7A2E92] transition-all" style={{ width: `${progress}%` }} /></div>{book.totalPages > 0 ? <p className="mt-1 text-xs text-slate-500">पृष्ठ {Math.min(book.lastPageRead, book.totalPages)} / {book.totalPages}</p> : null}</div><button type="button" onClick={() => router.push(`/reader/${book.bookId}`)} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7A2E92] px-4 py-2.5 font-semibold text-white hover:bg-[#68267d]">{progressLabel(progress)}</button></div></article>; })}</section>}
  </main>;
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="rounded-xl bg-[#7A2E92]/10 p-3 text-[#7A2E92]">{icon}</span><div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div></div>;
}
