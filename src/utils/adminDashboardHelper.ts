import { AdminBank, AdminRecruitment } from "@/types/adminDashboard";
import { ApiPagedResult, Bank, Vacancy } from "@/types/api.types";

export function readStoredList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeStoredList<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function formatDate(value: string) {
  if (!value) return '';
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');

  if (year && month && day) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(Number(year), Number(month) - 1, Number(day)));
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getDateInputValue(value: string) {
  if (!value) return '';
  return value.split('T')[0] ?? '';
}

export function createRecruitmentCode(bank: AdminBank, id: number) {
  const prefix = (bank.bankCode || bank.bankName.slice(0, 2) || 'BK').replace(/[^a-z0-9]/gi, '').toUpperCase();
  return `${prefix}-${String(id).slice(-4)}`;
}

export function getVacancyItems(data: ApiPagedResult<Vacancy> | Vacancy[]) {
  return Array.isArray(data) ? data : data.items;
}

export function getBankItems(data: ApiPagedResult<Bank> | Bank[]) {
  return Array.isArray(data) ? data : data.items;
}

export function formatApiBank(item: Bank): AdminBank {
  return {
    bankId: item.bankId,
    bankName: item.bankName,
    bankNameMarathi: item.bankNameMarathi ?? '',
    bankCode: item.bankCode ?? '',
    address: item.address ?? '',
    contactEmail: item.contactEmail ?? '',
    contactPhone: item.contactPhone ?? '',
    logoUrl: item.logoUrl ?? '',
  };
}

export function formatApiRecruitment(item: Vacancy): AdminRecruitment {
  const id = item.vacancyId ?? item.id ?? Date.now();

  return {
    id,
    bankId: item.bankId,
    bankName: item.bankName || `Bank #${item.bankId}`,
    bankCode: item.bankCode,
    code: createRecruitmentCode(
      {
        bankId: item.bankId,
        bankName: item.bankName || `Bank ${item.bankId}`,
        bankCode: item.bankCode,
        address: '',
        contactEmail: '',
        contactPhone: '',
        logoUrl: '',
      },
      id,
    ),
    postName: item.postName,
    postNameMarathi: item.postNameMarathi ?? '',
    totalSeats: String(item.totalSeats ?? ''),
    applicationStartDate: item.applicationStartDate,
    applicationEndDate: item.applicationEndDate,
    applicationFee: String(item.applicationFee ?? ''),
    minAge: item.minAge ? String(item.minAge) : '',
    maxAge: item.maxAge ? String(item.maxAge) : '',
    ageAsOnDate: item.ageAsOnDate,
    requiredCityDistrict: item.requiredCityDistrict ?? '',
    requiredStateId: item.requiredStateId ? String(item.requiredStateId) : '',
    requiredEducation: item.requiredEducation,
    isDomicileRequired: item.isDomicileRequired,
    isNCLRequired: item.isNCLRequired,
    noticePdfUrl: item.noticePdfUrl ?? '',
    noticePdfFileName: item.noticePdfFileName ?? '',
    status: item.status || 'Open',
    isPublished: Boolean(item.isPublished) || item.status?.toLowerCase() === 'published',
  };
}
