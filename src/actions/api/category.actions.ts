import { API_ENDPOINTS } from '@/constants/api.constants';
import { apiRequest } from './client';
import type { ApiPagedResult } from '@/types/api.types';

export function createCategory(payload: unknown) {
  return apiRequest(API_ENDPOINTS.category.create, {
    method: 'POST',
    body: payload,
  });
}

export function updateCategory(payload: unknown) {
  return apiRequest(API_ENDPOINTS.category.update, {
    method: 'PUT',
    body: payload,
  });
}

export function getCategories(page = 1, pageSize = 50) {
  return apiRequest<ApiPagedResult<any>>(`${API_ENDPOINTS.category.getAll}?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
}

export function getCategoryById(categoryId: number) {
  return apiRequest(API_ENDPOINTS.category.getById(categoryId), {
    method: 'GET',
  });
}

export function deleteCategory(categoryId: number) {
  return apiRequest(API_ENDPOINTS.category.delete(categoryId), {
    method: 'DELETE',
  });
}

export function toggleCategoryActive(categoryId: number) {
  return apiRequest(API_ENDPOINTS.category.toggleActive(categoryId), {
    method: 'PATCH',
  });
}
