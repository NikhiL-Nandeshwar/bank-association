import { apiRequest } from '@/actions/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { SaveStep1and2Payload } from '@/types/applicationSteps';

export async function saveStep1and2(payload: SaveStep1and2Payload) {
  return apiRequest<unknown>(API_ENDPOINTS.application.step1and2, {
    method: 'POST',
    body: payload,
  });
}