// Actions
import { apiRequest } from '@/actions/api/client';

// Constants
import { API_ENDPOINTS } from '@/constants/api.constants';

// Types
import type { CurrentUser } from '@/types/api.types';

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function getCurrentUser() {
  return apiRequest<CurrentUser>(API_ENDPOINTS.account.me, {
    method: 'GET',
  });
}

export function changePassword(payload: ChangePasswordRequest) {
  return apiRequest<unknown>(API_ENDPOINTS.account.changePassword, {
    method: 'POST',
    body: payload,
  });
}
