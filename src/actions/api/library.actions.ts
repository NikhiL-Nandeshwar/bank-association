import { API_ENDPOINTS } from '@/constants/api.constants';
import { apiRequest, apiRequestBlob } from './client';

export type MyLibraryBook = {
  libraryId: number;
  bookId: number;
  title: string;
  author: string;
  category: string;
  coverImageUrl: string;
  totalPages: number;
  previewPages: number;
  language: string;
  pricePaid: number;
  purchasedAt: string;
  lastPageRead: number;
  progressPercent: number;
};

export type MyLibrary = {
  totalBooks: number;
  readingNow: number;
  completed: number;
  books: MyLibraryBook[];
};

export type LibraryBook = MyLibraryBook & { pdfUrl: string };

export function getMyLibrary() {
  return apiRequest<MyLibrary>(API_ENDPOINTS.library.getMyLibrary, { method: 'GET' });
}

export function getLibraryBook(bookId: number) {
  return apiRequest<LibraryBook>(`${API_ENDPOINTS.library.getLibraryBook}?bookId=${encodeURIComponent(bookId)}`, { method: 'GET' });
}

export function getPurchasedBookPdf(pdfUrl: string) {
  return apiRequestBlob(pdfUrl);
}

export function updateReadingProgress(libraryId: number, lastPageRead: number) {
  return apiRequest<unknown>(API_ENDPOINTS.library.updateReadingProgress, {
    method: 'POST',
    body: { libraryId, lastPageRead },
  });
}
