import { API_ENDPOINTS } from "@/constants/api.constants";
import { apiRequest } from "./client";
import { ApiPagedResult } from "@/types/api.types";
import { Book } from "@/types/eBook";

export function getBooks(page = 1, pageSize = 12) {
  return apiRequest<ApiPagedResult<Book>>(
    `${API_ENDPOINTS.book.getAll}?page=${page}&pageSize=${pageSize}`,
    {
      method: 'GET',
    }
  );
}