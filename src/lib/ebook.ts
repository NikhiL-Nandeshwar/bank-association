import { getBooks } from '@/actions/api/books.actions';

export const BOOK_OWNERSHIP_REFRESH_KEY = 'book-ownership-refresh-needed';

export async function booksFetcher(
  page: number,
  pageSize = 12
) {
  const response = await getBooks(page, pageSize)

  return response.data
}