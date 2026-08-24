import { getAuthToken } from "@/lib/auth-storage";
import { API_BASE_URL } from "@/constants/api.constants";

export function extractApplicationId(data: unknown): number {
  if (typeof data === 'number' && Number.isFinite(data)) {
    return data;
  }

  if (typeof data === 'string') {
    const parsed = Number(data);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const application = record.application as Record<string, unknown> | undefined;
    const candidates = [
      record.applicationId,
      record.id,
      record.applicationID,
      application?.applicationId,
      application?.id,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
      }

      if (typeof candidate === 'string') {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    if ('data' in record) {
      return extractApplicationId(record.data);
    }
  }

  return 0;
}

export function splitAuthName(userName?: string | null) {
  const trimmed = userName?.trim() ?? '';

  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Fetches a file from the given URL using an authenticated request and returns 
 * a blob URL that can be used to display or download the file.
 * @param fileUrl 
 * @returns 
 */
export async function getAuthenticatedFileUrl(
    fileUrl: string,
): Promise<string> {
    const token = getAuthToken();
    const resolvedFileUrl = /^[a-z][a-z\d+.-]*:/i.test(fileUrl)
        ? fileUrl
        : new URL(
            fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`,
            new URL(API_BASE_URL).origin,
        ).toString();

    const response = await fetch(resolvedFileUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to load file');
    }

    const blob = await response.blob();

    return URL.createObjectURL(blob);
}