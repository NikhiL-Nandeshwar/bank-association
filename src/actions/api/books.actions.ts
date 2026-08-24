import { API_ENDPOINTS } from "@/constants/api.constants";
import { apiRequest } from "./client";
import { ApiPagedResult } from "@/types/api.types";
import { Book } from "@/types/eBook";

export type BookFormPayload = {
  categoryId: number | string;
  authorId: number | string;
  title: string;
  description: string;
  language: string;
  totalPages: number | string;
  publishedYear: number | string;
  isbn: string;
  price: number | string;
  isFeatured: boolean;
  tagsRaw: string;
  pdfFile?: File | null;
  coverFile?: File | null;
};

export type UpdateBookPayload = BookFormPayload & {
  bookId: number | string;
};

export function buildBookFormData(
  payload: BookFormPayload,
  options?: { bookId?: number | string },
) {
  const formData = new FormData();

  if (options?.bookId != null && options.bookId !== '') {
    formData.append('BookId', String(options.bookId));
    formData.append('IsActive', 'true');
  }

  formData.append('CategoryId', String(payload.categoryId));
  formData.append('AuthorId', String(payload.authorId));
  formData.append('Title', payload.title);
  formData.append('Description', payload.description);
  formData.append('Language', payload.language);
  formData.append('TotalPages', String(payload.totalPages));
  formData.append('PublishedYear', String(payload.publishedYear));
  formData.append('Isbn', payload.isbn);
  formData.append('Price', String(payload.price));
  formData.append('IsFeatured', String(payload.isFeatured));
  formData.append('TagsRaw', payload.tagsRaw);

  if (payload.pdfFile) {
    formData.append(options?.bookId != null ? 'NewPdfFile' : 'PdfFile', payload.pdfFile);
  }

  if (payload.coverFile) {
    formData.append(options?.bookId != null ? 'NewCoverFile' : 'CoverFile', payload.coverFile);
  }

  return formData;
}

export function getBooks(page = 1, pageSize = 12) {
  return apiRequest<ApiPagedResult<Book>>(
    `${API_ENDPOINTS.book.getAll}?page=${page}&pageSize=${pageSize}`,
    {
      method: 'GET',
    }
  );
}

export function createBook(payload: BookFormPayload) {
  return apiRequest<Book>(API_ENDPOINTS.book.create, {
    method: 'POST',
    body: buildBookFormData(payload),
  });
}

export function updateBook(payload: UpdateBookPayload) {
  const { bookId, ...fields } = payload;

  return apiRequest<Book>(API_ENDPOINTS.book.update, {
    method: 'PUT',
    body: buildBookFormData(fields, { bookId }),
  });
}

export function deleteBook(bookId: number) {
  return apiRequest<Book>(API_ENDPOINTS.book.delete(bookId), {
    method: 'DELETE',
  });
}

export function toggleBookActive(bookId: number) {
  return apiRequest<Book>(API_ENDPOINTS.book.toggleActive(bookId), {
    method: 'PATCH',
  });
}
