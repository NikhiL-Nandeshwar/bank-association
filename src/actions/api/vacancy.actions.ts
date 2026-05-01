import { apiRequest } from '@/actions/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { CreateVacancyRequest, UpdateVacancyRequest } from '@/schemas/vacancy.schema';
import type { ApiPagedResult, Vacancy } from '@/types/api.types';

export function createVacancy(payload: CreateVacancyRequest) {
  return apiRequest<unknown>(API_ENDPOINTS.vacancy.create, {
    method: 'POST',
    body: payload,
  });
}

export function getVacancies() {
  return apiRequest<ApiPagedResult<Vacancy> | Vacancy[]>(API_ENDPOINTS.vacancy.getAll, {
    method: 'GET',
  });
}

export function updateVacancy(payload: UpdateVacancyRequest) {
  return apiRequest<unknown>(API_ENDPOINTS.vacancy.update, {
    method: 'POST',
    body: payload,
  });
}

export function publishVacancy(vacancyId: number) {
  return apiRequest<unknown>(API_ENDPOINTS.vacancy.publish, {
    method: 'POST',
    body: { vacancyId },
  });
}
