// Actions
import { apiRequest } from '@/actions/api/client';

// Constants
import { API_ENDPOINTS } from '@/constants/api.constants';

// Schemas
import type { CreateBankRequest, UpdateBankRequest } from '@/schemas/bank.schema';

// Types
import type { ApiPagedResult, Bank, BankDropdownItem } from '@/types/api.types';

export function createBank(payload: CreateBankRequest) {
  return apiRequest<Bank>(API_ENDPOINTS.bank.create, {
    method: 'POST',
    body: payload,
  });
}

export function updateBank(payload: UpdateBankRequest) {
  return apiRequest<Bank>(API_ENDPOINTS.bank.update, {
    method: 'POST',
    body: payload,
  });
}

export function getBanks() {
  return apiRequest<ApiPagedResult<Bank>>(API_ENDPOINTS.bank.getAll, {
    method: 'GET',
  });
}

export function getBankById(bankId: number) {
  return apiRequest<Bank>(API_ENDPOINTS.bank.getById(bankId), {
    method: 'GET',
  });
}

export function getBankDropdown() {
  return apiRequest<BankDropdownItem[]>(API_ENDPOINTS.bank.getDropdown, {
    method: 'GET',
  });
}

export function toggleBankActive(bankId: number) {
  return apiRequest<Bank>(API_ENDPOINTS.bank.toggleActive(bankId), {
    method: 'POST',
  });
}
