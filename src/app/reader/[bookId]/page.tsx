'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minus, Plus, RotateCcw } from 'lucide-react';
import { getLibraryBook, getPurchasedBookPdf, updateReadingProgress, type LibraryBook } from '@/actions/api/library.actions';
import { ROUTES } from '@/constants/routes.constants';
import { useAuth } from '@/lib/useAuth';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type ReaderMode = 'book' | 'scroll';

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useAuth();
  const bookId = Number(params?.bookId);
  const [book, setBook] = useState<LibraryBook | null>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [mode, setMode] = useState<ReaderMode>('book');
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const scrollPageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const modeSwitchTargetRef = useRef<number | null>(null);
  const modeSwitchPositioningRef = useRef(false);
  const pdfObjectUrlRef = useRef<string | null>(null);
  const pageRef = useRef(page);
  const bookRef = useRef<LibraryBook | null>(null);
  const progressDirtyRef = useRef(false);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRequestRef = useRef<Promise<unknown> | null>(null);
  const scrollInitializedRef = useRef(false);

  const loadBook = useCallback(async () => {
    if (!Number.isInteger(bookId) || bookId <= 0) { setError('Invalid book.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const response = await getLibraryBook(bookId);
      console.log('GetLibraryBook response:', response);
      console.log('GetLibraryBook data:', response?.data);
      console.log('PDF URL:', response?.data?.pdfUrl);
      setBook(response.data);
      bookRef.current = response.data;
      setPage(Math.max(1, response.data.lastPageRead || 1));
      pageRef.current = Math.max(1, response.data.lastPageRead || 1);
    } catch { setError('Unable to load this purchased book. Please try again.'); }
    finally { setLoading(false); }
  }, [bookId]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`${ROUTES.login}?redirect=/reader/${bookId}`);
    else if (status === 'authenticated') void loadBook();
  }, [status, router, bookId, loadBook]);

  useEffect(() => {
    if (mode !== 'scroll' || !numPages) return;
    const observer = new IntersectionObserver((entries) => {
      if (modeSwitchPositioningRef.current) return;
      const intersectingEntries = entries.filter((entry) => entry.isIntersecting);
      if (modeSwitchTargetRef.current !== null) {
        const targetEntry = intersectingEntries.find((entry) => entry.target.getAttribute('data-page') === String(modeSwitchTargetRef.current));
        if (!targetEntry) return;
        modeSwitchTargetRef.current = null;
      }
      const visible = intersectingEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const next = visible?.target.getAttribute('data-page');
      if (next) {
        const nextPage = Number(next);
        if (!scrollInitializedRef.current) scrollInitializedRef.current = true;
        else if (nextPage !== pageRef.current) progressDirtyRef.current = true;
        pageRef.current = nextPage;
        setPage(nextPage);
      }
    }, { threshold: [0.5], root: isFullscreen ? readerRef.current : null });
    scrollPageRefs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, [mode, numPages, isFullscreen]);

  useEffect(() => {
    if (!book?.pdfUrl) return;
    let cancelled = false;
    if (pdfObjectUrlRef.current) {
      URL.revokeObjectURL(pdfObjectUrlRef.current);
      pdfObjectUrlRef.current = null;
    }
    setPdfSource(null);
    setPdfError(null);
    void getPurchasedBookPdf(book.pdfUrl).then((blob) => {
      if (!cancelled) {
        const objectUrl = URL.createObjectURL(blob);
        pdfObjectUrlRef.current = objectUrl;
        setPdfSource(objectUrl);
      }
    }).catch(() => {
      if (!cancelled) setPdfError('Unable to load the purchased book PDF.');
    });
    return () => {
      cancelled = true;
      if (pdfObjectUrlRef.current) URL.revokeObjectURL(pdfObjectUrlRef.current);
      pdfObjectUrlRef.current = null;
    };
  }, [book?.pdfUrl]);

  const changePage = (next: number) => {
    const nextPage = Math.max(1, Math.min(numPages || 1, next));
    if (nextPage !== pageRef.current) progressDirtyRef.current = true;
    pageRef.current = nextPage;
    setPage(nextPage);
  };
  const flushProgress = useCallback(() => {
    const currentBook = bookRef.current;
    if (!currentBook || !progressDirtyRef.current || progressRequestRef.current) return;
    const currentPage = pageRef.current;
    progressDirtyRef.current = false;
    const request = updateReadingProgress(currentBook.libraryId, currentPage)
      .catch(() => {
        progressDirtyRef.current = true;
        console.warn('Reading progress could not be saved; a later page change will retry.');
      })
      .finally(() => {
        progressRequestRef.current = null;
        if (progressDirtyRef.current && progressTimerRef.current === null) {
          progressTimerRef.current = setTimeout(() => {
            progressTimerRef.current = null;
            flushProgress();
          }, 1500);
        }
      });
    progressRequestRef.current = request;
  }, []);

  useEffect(() => {
    if (!book || !progressDirtyRef.current) return;
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    progressTimerRef.current = setTimeout(() => {
      progressTimerRef.current = null;
      flushProgress();
    }, 1500);
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    };
  }, [page, book, flushProgress]);

  useEffect(() => {
    const saveBeforeLeave = () => flushProgress();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveBeforeLeave();
    };
    window.addEventListener('pagehide', saveBeforeLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', saveBeforeLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      saveBeforeLeave();
    };
  }, [flushProgress]);

  const switchMode = (nextMode: ReaderMode) => {
    if (nextMode === mode) return;
    if (nextMode === 'scroll') {
      const targetPage = pageRef.current;
      modeSwitchTargetRef.current = targetPage;
      modeSwitchPositioningRef.current = true;
      scrollInitializedRef.current = false;
      pageRef.current = targetPage;
      setPage(targetPage);
      setMode(nextMode);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPageRefs.current[targetPage - 1]?.scrollIntoView({ block: 'center', behavior: 'auto' });
          setTimeout(() => {
            pageRef.current = targetPage;
            setPage(targetPage);
            modeSwitchTargetRef.current = null;
            modeSwitchPositioningRef.current = false;
            scrollInitializedRef.current = true;
          }, 100);
        });
      });
      return;
    }
    modeSwitchTargetRef.current = null;
    modeSwitchPositioningRef.current = false;
    setMode(nextMode);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === readerRef.current;
      setIsFullscreen(active);
      if (mode === 'scroll') {
        setTimeout(() => scrollPageRefs.current[page - 1]?.scrollIntoView({ block: 'center', behavior: 'auto' }), 0);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [mode, page]);
  const toggleFullscreen = async () => {
    if (!readerRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (readerRef.current.requestFullscreen) await readerRef.current.requestFullscreen();
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (mode !== 'book' || event.target instanceof HTMLInputElement) return;
      if (event.key === 'ArrowLeft') changePage(page - 1);
      if (event.key === 'ArrowRight') changePage(page + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // Keyboard navigation intentionally uses the current page snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, page]);

  if (status === 'loading' || loading) return <main className="flex min-h-[calc(100vh-180px)] items-center justify-center bg-slate-950 text-white">Loading book...</main>;
  if (error || !book) return <main className="mx-auto max-w-2xl px-4 py-16 text-center"><p className="text-red-600">{error || 'Book not found.'}</p><button type="button" onClick={() => void loadBook()} className="mt-5 rounded-full bg-[#7A2E92] px-5 py-2.5 font-semibold text-white">Try again</button><Link href={ROUTES.myBooks} className="ml-3 inline-flex rounded-full border px-5 py-2.5">Back to My Books</Link></main>;
  if (!book.pdfUrl) return <main className="mx-auto max-w-2xl px-4 py-16 text-center"><p className="text-red-600">This book is not currently available for reading.</p><Link href={ROUTES.myBooks} className="mt-5 inline-flex rounded-full bg-[#7A2E92] px-5 py-2.5 font-semibold text-white">Back to My Books</Link></main>;

  return <main ref={readerRef} className={`isolate bg-slate-950 text-white ${isFullscreen ? 'h-screen min-h-0 overflow-x-hidden overflow-y-auto' : 'min-h-[calc(100vh-180px)]'}`}>
    <div className="sticky top-0 z-30 bg-slate-950">
      <header className="relative z-30 shrink-0 border-b border-white/10 bg-slate-950 px-4 py-3"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><Link href={ROUTES.myBooks} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to My Books</Link><h1 className="max-w-[60vw] truncate font-semibold">{book.title}</h1><div className="flex items-center gap-1 rounded-lg bg-white/10 p-1 text-sm"><button type="button" onClick={() => switchMode('book')} className={`rounded-md px-3 py-1.5 ${mode === 'book' ? 'bg-white text-slate-900' : 'text-white'}`}>Book Mode</button><button type="button" onClick={() => switchMode('scroll')} className={`rounded-md px-3 py-1.5 ${mode === 'scroll' ? 'bg-white text-slate-900' : 'text-white'}`}>Scroll Mode</button></div></div></header>
      <div className="relative z-20 border-b border-white/10 bg-slate-950 px-4 py-3 text-sm shadow-md"><div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-start gap-2 overflow-x-auto whitespace-nowrap md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><button type="button" onClick={() => changePage(page - 1)} disabled={mode !== 'book' || page <= 1} className="shrink-0 rounded-md bg-white/10 p-2 disabled:opacity-40" aria-label="Previous page"><ChevronLeft /></button><label className="flex shrink-0 items-center gap-2">Page <input type="number" min={1} max={numPages || undefined} value={page} onChange={(event) => changePage(Number(event.target.value) || 1)} className="w-16 rounded-md bg-white/10 px-2 py-1 text-center" /> of {numPages || '…'}</label><button type="button" onClick={() => changePage(page + 1)} disabled={mode !== 'book' || !numPages || page >= numPages} className="shrink-0 rounded-md bg-white/10 p-2 disabled:opacity-40" aria-label="Next page"><ChevronRight /></button><span className="mx-2 h-5 w-px shrink-0 bg-white/20" /><button type="button" onClick={() => setScale((value) => Math.min(2, value + 0.15))} className="shrink-0 rounded-md bg-white/10 p-2" aria-label="Zoom in"><Plus /></button><button type="button" onClick={() => setScale((value) => Math.max(0.6, value - 0.15))} className="shrink-0 rounded-md bg-white/10 p-2" aria-label="Zoom out"><Minus /></button><button type="button" onClick={() => setScale(1)} className="shrink-0 rounded-md bg-white/10 p-2" aria-label="Reset zoom"><RotateCcw /></button><button type="button" onClick={() => void toggleFullscreen()} className="shrink-0 rounded-md bg-white/10 p-2" aria-label="Fullscreen"><Maximize /></button></div></div>
    </div>
    <section className="mx-auto max-w-6xl px-3 pb-10">{pdfSource ? <Document file={pdfSource} onLoadSuccess={({ numPages: total }) => { setNumPages(total); }}
      onLoadError={(error) => {
        console.error('PDF load error:', error);
        console.error('PDF URL:', book.pdfUrl);
        setPdfError(
          error instanceof Error
            ? `Unable to render this PDF: ${error.message}`
            : 'Unable to render this PDF.'
        );
      }}
      loading={<div className="py-20 text-center text-slate-300">Loading PDF...</div>}
      error={<div className="py-20 text-center text-red-300">{pdfError || 'Unable to render this PDF.'}</div>}>{mode === 'book' ? <div className="flex justify-center overflow-auto"><Page pageNumber={page} scale={scale} renderTextLayer renderAnnotationLayer /></div> : <div className="space-y-6">{Array.from({ length: numPages }, (_, index) => <div key={index + 1} ref={(element) => { scrollPageRefs.current[index] = element; }} data-page={index + 1} className="flex justify-center"><Page pageNumber={index + 1} scale={scale} renderTextLayer renderAnnotationLayer /></div>)}</div>}</Document> : <div className="py-20 text-center text-red-300">{pdfError || 'Loading PDF...'}</div>}</section>
  </main>;
}
