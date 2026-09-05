'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookCover } from '@/components/common/BookCover';
import { useCart } from '@/lib/cart';
import { booksFetcher } from '@/lib/ebook';
import type { Book } from '@/types/eBook';
import { useAuth } from '@/lib/useAuth';
import { initiateBulkBookPayment } from '@/actions/api/application.actions';
import { toast } from 'sonner';
import { useBookOwnership } from '@/lib/book-ownership';

export default function CartPage() {
  const router = useRouter();
  const { status } = useAuth();
  const { bookIds, count, remove } = useCart();
  const { purchasedBookIds, isLoading: isOwnershipLoading } = useBookOwnership(status === 'authenticated');
  const purchasableBookIds = useMemo(() => bookIds.filter((bookId) => !purchasedBookIds.has(bookId)), [bookIds, purchasedBookIds]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    void booksFetcher(1, 1000).then((result) => {
      setBooks((result.items || []).filter((book) => purchasableBookIds.includes(book.bookId)));
    }).finally(() => setLoading(false));
  }, [status, bookIds, purchasableBookIds]);

  const total = books.reduce((sum, book) => sum + Number(book.price || 0), 0);
  const extractString = (value: unknown, keys: string[]): string | undefined => {
    if (!value || typeof value !== 'object') return undefined;
    const record = value as Record<string, unknown>;
    for (const key of keys) if (typeof record[key] === 'string' && record[key]) return record[key] as string;
    return typeof record.data === 'object' ? extractString(record.data, keys) : undefined;
  };
  const proceedToPayment = async () => {
    if (isProcessingPayment || !books.length) return;
    if (books.length === 1) {
      window.sessionStorage.setItem('pending-book-action', JSON.stringify({ action: 'buy', bookId: books[0].bookId, couponCode }));
      router.push(`/books/${books[0].slug}`);
      return;
    }
    setCheckoutMessage(null);
    setIsProcessingPayment(true);
    try {
      if (typeof window.loadBillDeskSdk !== 'function') throw new Error('Payment service is still loading. Please try again.');
      const response = await initiateBulkBookPayment(purchasableBookIds, couponCode);
      const data = response.data;
      console.debug('[Book payment] InitiateBulkBook response:', response);
      const bdOrderId = extractString(data, ['bdOrderId', 'bdorderid']);
      const authToken = extractString(data, ['authToken', 'auth_token']);
      const gatewayOrderId = extractString(data, ['gatewayOrderId', 'gatewayorderid', 'gateway_order_id']);
      console.debug('[Book payment] gatewayOrderId before sessionStorage:', gatewayOrderId);
      if (!bdOrderId || !authToken || !gatewayOrderId) throw new Error('The payment service did not return a complete BillDesk order. Please try again.');
      window.sessionStorage.setItem('billdesk_book_merchant_order_id', gatewayOrderId);
      console.debug('[Book payment] gatewayOrderId after sessionStorage:', window.sessionStorage.getItem('billdesk_book_merchant_order_id'));
      console.debug('[Book payment] before launching BillDesk:', { bdOrderId, gatewayOrderId });
      window.loadBillDeskSdk({ flowConfig: { merchantId: 'KOPBASSOV2', bdOrderId, authToken, returnUrl: 'https://www.kopbankasso-recruit-book.com/payment/billdesk-return?module=BOOK', childWindow: false, retryCount: 3 }, flowType: 'payments', responseHandler: () => toast.info('Payment response received. Verifying payment...') });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not initiate payment. Please try again.';
      setCheckoutMessage(message);
      toast.error(message);
    } finally { setIsProcessingPayment(false); }
  };
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('billdesk-sdk-module')) return;
    const script = document.createElement('script'); script.id = 'billdesk-sdk-module'; script.type = 'module'; script.src = 'https://pay.billdesk.com/websdk/shared/billdesksdk.esm.js'; script.async = true; document.head.appendChild(script);
  }, []);
  if (status === 'loading' || loading || isOwnershipLoading) return <main className="mx-auto max-w-5xl p-8">Loading cart…</main>;
  if (!purchasableBookIds.length) return <main className="mx-auto max-w-5xl p-8"><h1 className="text-3xl font-bold">Your Cart</h1><p className="mt-6 text-slate-600">Your cart is empty.</p></main>;

  return <main className="mx-auto max-w-5xl space-y-6 p-6 sm:p-8">
    <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
    <div className="space-y-4">
      {books.map((book) => <article key={book.bookId} className="flex items-center gap-4 rounded-xl border bg-white p-4">
        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded"><BookCover src={book.coverImageUrl} alt={book.title} /></div>
        <div className="min-w-0 flex-1"><h2 className="font-semibold">{book.title}</h2><p className="text-sm text-slate-600">{book.authorName}</p><p className="mt-1 font-medium">₹{Number(book.price).toLocaleString('en-IN')}</p></div>
        <button type="button" onClick={() => remove(book.bookId)} className="rounded-md border px-3 py-2 text-sm text-red-600">Remove</button>
      </article>)}
    </div>
    <div className="flex flex-wrap items-end justify-between gap-4 border-t pt-5"><div><p className="text-sm text-slate-600">Total books: {count}</p><p className="text-2xl font-bold">₹{total.toLocaleString('en-IN')}</p><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code (optional)" className="mt-2 rounded-full border px-4 py-2 text-sm" />{checkoutMessage ? <p className="mt-2 max-w-xl text-sm text-amber-700">{checkoutMessage}</p> : null}</div><button type="button" onClick={() => void proceedToPayment()} disabled={!books.length || isProcessingPayment} className="rounded-full bg-[#7A2E92] px-6 py-3 font-semibold text-white disabled:opacity-50">{isProcessingPayment ? 'Starting payment…' : 'Proceed to payment'}</button></div>
  </main>;
}
