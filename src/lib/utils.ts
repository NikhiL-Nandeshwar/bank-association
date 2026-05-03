import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_BASE_URL } from "@/constants/api.constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fixes a PDF URL by replacing the localhost base URL with the actual API base URL.
 * This is necessary because the backend may return URLs with the localhost base when running in development, 
 * which won't work in production.
 * @param url 
 * @returns 
 */
export function fixPdfUrl(url: string): string {
  if (!url) return url;
  return url.replace('https://localhost:7001/restapi/v1.0', API_BASE_URL);
}
