// Constants
import { API_BASE_URL } from '@/constants/api.constants';
import { STORAGE_KEYS } from '@/constants/storage.constants';

// Types
import type { ApiResponse } from '@/types/api.types';

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

function readStoredToken() {
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

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEYS.authToken);
  }
}
