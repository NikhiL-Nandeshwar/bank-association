// Constants
import { API_BASE_URL } from '@/constants/api.constants';

// Types
import type { ApiResponse } from '@/types/api.types';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
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


/**
 * Sends a request to the backend API and unwraps the shared response envelope.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
) {
  const { body, headers, ...requestOptions } = options;

  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path), {
    ...requestOptions,

    credentials: 'include', // IMPORTANT

    headers: {
      Accept: 'application/json',

      ...(isFormData
        ? {}
        : body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),

      ...headers,
    },

    body: isFormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message || 'Request failed. Please try again.',
      payload?.statusCode || response.status,
      payload?.errors ?? null,
    );
  }

  return payload;
}

