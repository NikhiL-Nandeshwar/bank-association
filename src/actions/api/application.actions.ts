import { apiRequest } from '@/actions/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { SaveStep1and2Payload } from '@/types/applicationSteps';

export async function startOrResumeApplication(vacancyId: number) {
  return apiRequest<unknown>(`${API_ENDPOINTS.application.startOrResume}?vacancyId=${vacancyId}`, {
    method: 'POST',
  });
}

export async function saveStep1and2(payload: SaveStep1and2Payload) {
  return apiRequest<unknown>(API_ENDPOINTS.application.step1and2, {
    method: 'POST',
    body: payload,
  });
}
