import { getBooks, getUserBooks } from '@/actions/api/books.actions';

export const BOOK_OWNERSHIP_REFRESH_KEY = 'book-ownership-refresh-needed';

export async function booksFetcher(
  page: number,
  pageSize = 12,
  options?: { isAdmin?: boolean }
) {
  const response = await (options?.isAdmin ? getBooks(page, pageSize) : getUserBooks(page, pageSize))

  return response.data
}
