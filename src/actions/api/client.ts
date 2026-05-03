// Constants
import { API_BASE_URL } from '@/constants/api.constants';
import { STORAGE_KEYS } from '@/constants/storage.constants';

// Types
import type { ApiResponse, CurrentUser } from '@/types/api.types';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  statusCode: number;
  errors: ApiResponse<unknown>['errors'];

  constructor(message: string, statusCode: number, errors: ApiResponse<unknown>['errors'] = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${normalizedPath}`;
}

export function readStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.authToken);
}

/**
 * Sends a request to the backend API and unwraps the shared response envelope.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, token, ...requestOptions } = options;
  const authToken = token ?? readStoredToken();

  const isFormData = body instanceof FormData;
  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message || 'Request failed. Please try again.',
      payload?.statusCode || response.status,
      payload?.errors ?? null,
    );
  }

  return payload;
}

/**
 * Persists the bearer token used by protected client-side API calls.
 */
export function storeAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEYS.authToken, token);
  }
}

export function storeAuthUser(user: CurrentUser) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user));
  }
}

export function readStoredUser(): CurrentUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedUser = window.localStorage.getItem(STORAGE_KEYS.authUser);
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as CurrentUser;
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEYS.authToken);
    window.localStorage.removeItem(STORAGE_KEYS.authUser);
  }
}
