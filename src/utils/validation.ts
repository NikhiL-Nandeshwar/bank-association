import { ZodError } from 'zod';

/**
 * Converts Zod issues into a field-to-message map for form rendering.
 */
export function getZodFieldErrors<T extends string>(error: ZodError) {
  return error.issues.reduce<Partial<Record<T, string>>>((fieldErrors, issue) => {
    const fieldName = issue.path[0];

    if (typeof fieldName === 'string' && !fieldErrors[fieldName as T]) {
      fieldErrors[fieldName as T] = issue.message;
    }

    return fieldErrors;
  }, {});
}
