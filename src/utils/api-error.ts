import { ZodError } from 'zod';

// Actions
import { ApiError } from '@/actions/api/client';

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Converts API, validation, and unknown errors into a message safe for UI display.
 */
export function getErrorMessage(error: unknown, fallback = FALLBACK_ERROR_MESSAGE) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
