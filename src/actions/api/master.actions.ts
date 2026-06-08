import { apiRequest } from '@/actions/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { MasterListResponse } from '@/types/api.types';

function appendQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }

  return query.toString() ? `${path}?${query.toString()}` : path;
}

export function getAllMasters() {
  return apiRequest<MasterListResponse>(API_ENDPOINTS.master.getAllMasters, {
    method: 'GET',
  });
}

export function getCategories() {
  return apiRequest<MasterListResponse>(API_ENDPOINTS.master.getCategories, {
    method: 'GET',
  });
}

export function getReligions() {
  return apiRequest<MasterListResponse>(API_ENDPOINTS.master.getReligions, {
    method: 'GET',
  });
}

export function getCastes() {
  return apiRequest<MasterListResponse>(API_ENDPOINTS.master.getCastes, {
    method: 'GET',
  });
}

export function getCastesByCategoryReligion(params: { categoryId?: number; religionId?: number }) {
  return apiRequest<MasterListResponse>(
    appendQuery(API_ENDPOINTS.master.getCastes, params),
    {
      method: 'GET',
    },
  );
}

export function getSubCastes(params: { casteId?: number }) {
  return apiRequest<MasterListResponse>(appendQuery(API_ENDPOINTS.master.getSubCastes, params), {
    method: 'GET',
  });
}

export function getNationalities() {
  return apiRequest<MasterListResponse>(API_ENDPOINTS.master.getNationalities, {
    method: 'GET',
  });
}

export function getCountries() {
  return apiRequest<MasterListResponse>(API_ENDPOINTS.master.getCountries, {
    method: 'GET',
  });
}

export function getStates(params: { countryId?: number }) {
  return apiRequest<MasterListResponse>(appendQuery(API_ENDPOINTS.master.getStates, params), {
    method: 'GET',
  });
}

export function getDistricts(params: { stateId?: number }) {
  return apiRequest<MasterListResponse>(appendQuery(API_ENDPOINTS.master.getDistricts, params), {
    method: 'GET',
  });
}

export function getTalukas(params: { districtId?: number; stateId?: number }) {
  return apiRequest<MasterListResponse>(appendQuery(API_ENDPOINTS.master.getTalukas, params), {
    method: 'GET',
  });
}
