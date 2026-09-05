'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShoppingCart } from 'lucide-react'

// Note: Header/Footer are provided by the root layout — do not render them here.
import { BookCover } from '@/components/common/BookCover'
import { booksFetcher } from '@/lib/ebook'
import type { Book } from '@/types/eBook'
import { useAuth } from '@/lib/useAuth'
import { initiateBookPayment } from '@/actions/api/application.actions'
import { useCart } from '@/lib/cart'
import { useBookOwnership } from '@/lib/book-ownership'

export default function BookDetailPage() {
  const params = useParams()
  const slug = params?.slug as string | undefined
  const router = useRouter()
  const { status } = useAuth()
  const { purchasedBookIds, isLoading: isOwnershipLoading } = useBookOwnership(status === 'authenticated')
  const { add: addCartItem } = useCart()
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [cartMessage, setCartMessage] = useState<string | null>(null)
  const isOwned = book ? purchasedBookIds.has(book.bookId) : false

  const extractString = (value: unknown, keys: string[]): string | undefined => {
    if (!value || typeof value !== 'object') return undefined
    const record = value as Record<string, unknown>
    for (const key of keys) if (typeof record[key] === 'string' && record[key]) return record[key] as string
    return typeof record.data === 'object' ? extractString(record.data, keys) : undefined
  }

  const startPayment = async (couponCodeOverride?: string) => {
    if (!book) return
    if (status !== 'authenticated') {
      window.sessionStorage.setItem('pending-book-action', JSON.stringify({ action: 'buy', bookId: book.bookId }))
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setPaymentError(null)
    setIsProcessingPayment(true)
    try {
      const response = await initiateBookPayment(book.bookId, couponCodeOverride ?? couponCode)
      const data = response.data
      const bdOrderId = extractString(data, ['bdOrderId', 'bdorderid'])
      const authToken = extractString(data, ['authToken', 'auth_token'])
      const gatewayOrderId = extractString(data, ['gatewayOrderId', 'gatewayorderid', 'gateway_order_id'])
      console.debug('[Book payment] InitiateBook response:', response)
      console.debug('[Book payment] gatewayOrderId before sessionStorage:', gatewayOrderId)
      if (!bdOrderId || !authToken || !gatewayOrderId || typeof window.loadBillDeskSdk !== 'function') {
        throw new Error('The payment service did not return a complete BillDesk order. Please try again.')
      }
      window.sessionStorage.setItem('billdesk_book_merchant_order_id', gatewayOrderId)
      console.debug('[Book payment] gatewayOrderId after sessionStorage:', window.sessionStorage.getItem('billdesk_book_merchant_order_id'))
      console.debug('[Book payment] before launching BillDesk:', { bdOrderId, gatewayOrderId })
      window.loadBillDeskSdk({
        flowConfig: {
          merchantId: 'KOPBASSOV2',
          bdOrderId,
          authToken,
          returnUrl: 'https://www.kopbankasso-recruit-book.com/payment/billdesk-return?module=BOOK',
          childWindow: false,
          retryCount: 3,
        },
        flowType: 'payments',
        responseHandler: () => toast.info('Payment response received. Verifying payment...'),
      })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not initiate payment. Please try again.'
      setPaymentError(message)
      toast.error(message)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const addToCart = () => {
    if (!book) return
    if (isOwned) {
      setCartMessage('You already own this book.')
      return
    }
    if (status !== 'authenticated') {
      window.sessionStorage.setItem('pending-book-action', JSON.stringify({ action: 'cart', bookId: book.bookId }))
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    if (!addCartItem(book.bookId)) {
      setCartMessage('This book is already in your cart.')
      return
    }
    setCartMessage('Book added to cart.')
    toast.success('Book added to cart.')
  }

  useEffect(() => {
    if (status !== 'authenticated' || !book || typeof window === 'undefined') return
    const raw = window.sessionStorage.getItem('pending-book-action')
    if (!raw) return
    try {
      const pending = JSON.parse(raw) as { action?: string; bookId?: number; couponCode?: string }
      if (pending.action === 'buy' && pending.bookId === book.bookId) {
        window.sessionStorage.removeItem('pending-book-action')
        void startPayment(pending.couponCode)
      } else if (pending.action === 'cart' && pending.bookId === book.bookId) {
        window.sessionStorage.removeItem('pending-book-action')
        addToCart()
      }
    } catch { window.sessionStorage.removeItem('pending-book-action') }
  // The action handlers intentionally run only when the authenticated book changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, book])

  useEffect(() => {
    if (!slug) return

    const load = async () => {
      setIsLoading(true)
      try {
        const data = await booksFetcher(1, 1000)
        const found = (data?.items ?? []).find((b: Book) => b.slug === slug)
        if (!found) {
          setError('पुस्तक सापडले नाही')
        } else {
          setBook(found)
        }
      } catch {
        setError('लोड करताना त्रुटी आली')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [slug])

  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('billdesk-sdk-module')) return
    const script = document.createElement('script')
    script.id = 'billdesk-sdk-module'
    script.type = 'module'
    script.src = 'https://pay.billdesk.com/websdk/shared/billdesksdk.esm.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:space-y-10">
        <Link href="/bookslist" className="inline-block text-sm text-slate-600">
          ← Back to books
        </Link>

        {isLoading ? (
          <div className="section-shell p-10 text-center text-slate-600">पुस्तक माहिती लोड करत आहे...</div>
        ) : error ? (
          <div className="section-shell p-10 text-center text-red-600">{error}</div>
        ) : book ? (
          <section className="section-shell p-6">
            <div className="grid gap-2 lg:grid-cols-[0.9fr_1.1fr] items-start">
              <div>
                <div className="relative overflow-hidden rounded-[28px] bg-white md:h-[450px] h-[350px]">
                  <BookCover src={book.coverImageUrl} alt={book.title} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-500"><span>{book.categoryName}</span>{isOwned ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">खरेदी केले ✓</span> : null}</div>
                <h1 className="text-3xl font-bold text-slate-800">{book.title}</h1>
                <div className="text-lg text-slate-600">{book.authorName}</div>

                <div className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Price</p>
                    <p className="mt-2 text-2xl font-semibold">{isOwned ? 'खरेदी केले ✓' : `₹${book.price.toLocaleString('en-IN')}`}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Format</p>
                    <p className="mt-2 text-lg font-semibold">PDF</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-semibold">{isOwned ? 'Owned' : 'Available'}</p>
                  </div>
                </div>

                <p className="text-base text-slate-700">{book.description ?? book.shortSummary ?? 'No description available.'}</p>

                <div className="flex flex-wrap items-center gap-3">
                  {!isOwned ? <>
                    <button type="button" disabled={isProcessingPayment} onClick={() => void startPayment()} className="inline-flex items-center justify-center rounded-full bg-[#7A2E92] px-6 py-3 text-white disabled:opacity-60">
                      {isProcessingPayment ? 'Starting payment…' : 'Buy Now'}
                    </button>
                    <input aria-label="Coupon code (optional)" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code (optional)" className="rounded-full border px-4 py-3 text-sm" />
                    <button type="button" onClick={addToCart} disabled={isOwnershipLoading} className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#7A2E92]/30 bg-white px-6 py-3 font-semibold text-[#7A2E92] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#7A2E92] hover:bg-[#7A2E92] hover:text-white hover:shadow-lg active:translate-y-0 disabled:opacity-60">
                      <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" /> Add to cart
                    </button>
                  </> : <button type="button" onClick={() => router.push(`/reader/${book.bookId}`)} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white"><span aria-hidden="true">📖</span> वाचा</button>}
                </div>
                {paymentError ? <p className="text-sm text-red-600">{paymentError}</p> : null}
                {cartMessage ? <p className="text-sm text-emerald-700">{cartMessage}</p> : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {/* Footer rendered by root layout */}
    </main>
  )
}
