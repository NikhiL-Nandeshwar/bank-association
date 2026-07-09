'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Note: Header/Footer are provided by the root layout — do not render them here.
import { BookCover } from '@/components/common/BookCover'
import { booksFetcher } from '@/lib/ebook'
import type { Book } from '@/types/eBook'

export default function BookDetailPage() {
  const params = useParams()
  const slug = params?.slug as string | undefined
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch (e) {
        setError('लोड करताना त्रुटी आली')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [slug])

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
                <div className="text-sm text-slate-500">{book.categoryName}</div>
                <h1 className="text-3xl font-bold text-slate-800">{book.title}</h1>
                <div className="text-lg text-slate-600">{book.authorName}</div>

                <div className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Price</p>
                    <p className="mt-2 text-2xl font-semibold">₹{book.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Format</p>
                    <p className="mt-2 text-lg font-semibold">PDF</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-semibold">{book.isOwned ? 'Owned' : 'Available'}</p>
                  </div>
                </div>

                <p className="text-base text-slate-700">{book.description ?? book.shortSummary ?? 'No description available.'}</p>

                <div className="flex gap-3">
                  <a href="#" className="inline-flex items-center justify-center rounded-full bg-[#7A2E92] px-6 py-3 text-white">Buy Now</a>
                  <a href="#" className="inline-flex items-center justify-center rounded-full border px-6 py-3">Add to cart</a>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {/* Footer rendered by root layout */}
    </main>
  )
}
