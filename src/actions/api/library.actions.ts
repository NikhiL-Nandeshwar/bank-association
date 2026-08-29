import { API_ENDPOINTS } from '@/constants/api.constants';
import { apiRequest } from './client';

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

export function getMyLibrary() {
  return apiRequest<MyLibrary>(API_ENDPOINTS.library.getMyLibrary, { method: 'GET' });
}
