// Actions
import { apiRequest } from '@/actions/api/client';

// Constants
import { API_ENDPOINTS } from '@/constants/api.constants';

// Schemas
import type {
  LoginRequest,
  OtpRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from '@/schemas/auth.schema';

// Types
import type { LoginResponse } from '@/types/api.types';

/**
 * Authenticates a user and returns the backend session token.
 */
export function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: payload,
  });
}

export function sendOtp(payload: OtpRequest) {
  return apiRequest<unknown>(API_ENDPOINTS.auth.sendOtp, {
    method: 'POST',
    body: payload,
  });
}

export function verifyOtp(payload: VerifyOtpRequest) {
  return apiRequest<unknown>(API_ENDPOINTS.auth.verifyOtp, {
    method: 'POST',
    body: payload,
  });
}

export function forgotPassword(payload: OtpRequest) {
  return apiRequest<unknown>(API_ENDPOINTS.auth.forgotPassword, {
    method: 'POST',
    body: payload,
  });
}

export function resetPassword(payload: ResetPasswordRequest) {
  return apiRequest<unknown>(API_ENDPOINTS.auth.resetPassword, {
    method: 'POST',
    body: payload,
  });
}
