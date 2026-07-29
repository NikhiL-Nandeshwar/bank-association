import { API_ENDPOINTS } from '@/constants/api.constants';
import { apiRequest } from './client';
import type { ApiPagedResult } from '@/types/api.types';

export function createAuthor(payload: unknown) {
  return apiRequest(API_ENDPOINTS.author.create, {
    method: 'POST',
    body: payload,
  });
}

export function updateAuthor(payload: any) {
  return apiRequest(API_ENDPOINTS.author.update, {
    method: 'PUT',
    body: payload,
  });
}

export function getAuthors(page = 1, pageSize = 50) {
  return apiRequest<ApiPagedResult<any>>(`${API_ENDPOINTS.author.getAll}?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
}

export function getAuthorById(authorId: number) {
  return apiRequest(API_ENDPOINTS.author.getById(authorId), {
    method: 'GET',
  });
}

export function deleteAuthor(authorId: number) {
  return apiRequest(API_ENDPOINTS.author.delete(authorId), {
    method: 'DELETE',
  });
}

export function toggleAuthorActive(authorId: number) {
  return apiRequest(API_ENDPOINTS.author.toggleActive(authorId), {
    method: 'POST',
  });
}
