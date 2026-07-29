import { API_ENDPOINTS } from "@/constants/api.constants";
import { apiRequest } from "./client";
import { ApiPagedResult } from "@/types/api.types";
import { Book } from "@/types/eBook";

export function getBooks(page = 1, pageSize = 12) {
  return apiRequest<ApiPagedResult<Book>>(
    `${API_ENDPOINTS.book.getAll}?page=${page}&pageSize=${pageSize}`,
    {
      method: 'GET',
    }
  );
}

export function createBook(formData: FormData) {
  return apiRequest<Book>(API_ENDPOINTS.book.create, {
    method: 'POST',
    body: formData,
  });
}

export function updateBook(formData: FormData) {
  return apiRequest<Book>(API_ENDPOINTS.book.update, {
    method: 'POST',
    body: formData,
  });
}

export function deleteBook(bookId: number) {
  return apiRequest<Book>(API_ENDPOINTS.book.delete(bookId), {
    method: 'DELETE',
  });
}

export function getBookById(bookId: number) {
  return apiRequest<Book>(API_ENDPOINTS.book.getById(bookId), {
    method: 'GET',
  });
}

export function toggleBookActive(bookId: number) {
  return apiRequest<Book>(API_ENDPOINTS.book.toggleActive(bookId), {
    method: 'POST',
  });
}