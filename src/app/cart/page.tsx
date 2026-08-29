'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookCover } from '@/components/common/BookCover';
import { useCart } from '@/lib/cart';
import { booksFetcher } from '@/lib/ebook';
import type { Book } from '@/types/eBook';
import { useAuth } from '@/lib/useAuth';

export default function CartPage() {
  const router = useRouter();
  const { status } = useAuth();
  const { bookIds, count, remove } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    void booksFetcher(1, 1000).then((result) => {
      setBooks((result.items || []).filter((book) => bookIds.includes(book.bookId)));
    }).finally(() => setLoading(false));
  }, [status, bookIds]);

  const total = books.reduce((sum, book) => sum + Number(book.price || 0), 0);
  const proceedToPayment = () => {
    if (books.length > 1) {
      setCheckoutMessage('Multiple-book checkout requires a backend cart payment endpoint. Please purchase one book at a time for now.');
      return;
    }
    if (!books[0]) return;
    window.sessionStorage.setItem('pending-book-action', JSON.stringify({ action: 'buy', bookId: books[0].bookId }));
    router.push(`/books/${books[0].slug}`);
  };
  if (status === 'loading' || loading) return <main className="mx-auto max-w-5xl p-8">Loading cart…</main>;
  if (!bookIds.length) return <main className="mx-auto max-w-5xl p-8"><h1 className="text-3xl font-bold">Your Cart</h1><p className="mt-6 text-slate-600">Your cart is empty.</p></main>;

  return <main className="mx-auto max-w-5xl space-y-6 p-6 sm:p-8">
    <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
    <div className="space-y-4">
      {books.map((book) => <article key={book.bookId} className="flex items-center gap-4 rounded-xl border bg-white p-4">
        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded"><BookCover src={book.coverImageUrl} alt={book.title} /></div>
        <div className="min-w-0 flex-1"><h2 className="font-semibold">{book.title}</h2><p className="text-sm text-slate-600">{book.authorName}</p><p className="mt-1 font-medium">₹{Number(book.price).toLocaleString('en-IN')}</p></div>
        <button type="button" onClick={() => remove(book.bookId)} className="rounded-md border px-3 py-2 text-sm text-red-600">Remove</button>
      </article>)}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5"><div><p className="text-sm text-slate-600">Total books: {count}</p><p className="text-2xl font-bold">₹{total.toLocaleString('en-IN')}</p>{checkoutMessage ? <p className="mt-2 max-w-xl text-sm text-amber-700">{checkoutMessage}</p> : null}</div><button type="button" onClick={proceedToPayment} disabled={!books.length} className="rounded-full bg-[#7A2E92] px-6 py-3 font-semibold text-white disabled:opacity-50">Proceed to payment</button></div>
  </main>;
}
