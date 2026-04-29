export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[] | Record<string, string[]> | string | null;
  timestamp: string;
};

export type ApiPagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type LoginResponse = {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: number;
  candidateId?: number | null;
  email?: string;
  role?: string;
};

export type CurrentUser = {
  userId: number;
  candidateId: number | null;
  email: string;
  role: string;
};

export type Bank = {
  bankId: number;
  bankName: string;
  bankNameMarathi: string;
  bankCode: string;
  logoUrl: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

export type BankDropdownItem = {
  bankId: number;
  bankName: string;
  bankCode: string;
};
