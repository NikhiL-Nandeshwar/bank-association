import { apiRequest } from '@/actions/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { CreateNewsRequest, UpdateNewsRequest } from '@/schemas/news.schema';
import type { ApiPagedResult, News } from '@/types/api.types';

export function createNews(payload: CreateNewsRequest) {
  return apiRequest<News>(API_ENDPOINTS.news.create, {
    method: 'POST',
    body: payload,
  });
}

export function updateNews(payload: UpdateNewsRequest) {
  return apiRequest<News>(API_ENDPOINTS.news.update, {
    method: 'PUT',
    body: payload,
  });
}

export function getNews() {
  return apiRequest<ApiPagedResult<News> | News[]>(API_ENDPOINTS.news.getPublic, {
    method: 'GET',
  });
}
