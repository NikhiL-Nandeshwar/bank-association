export interface Book {
  bookId: number
  title: string
  slug: string
  authorName: string
  categoryName: string
  coverImageUrl: string
  shortSummary: string | null
  description?: string | null
  bookPdfUrl?: string | null
  language: string
  price: number
  isFeatured: boolean
  isActive: boolean
  totalPurchases: number
}
