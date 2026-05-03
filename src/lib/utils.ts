import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_BASE_URL } from "@/constants/api.constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fixPdfUrl(url: string): string {
  if (!url) return url;
  return url.replace('https://localhost:7001/restapi/v1.0', API_BASE_URL);
}
