import { emptyBankForm, emptyRecruitmentForm } from "@/constants/adminDashboard";
import type { EligibilityCriteria } from "@/types/api.types";

export type AdminBank = {
    bankId: number;
    bankName: string;
    bankNameMarathi?: string;
    bankCode?: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    logoUrl: string;
    isActive: boolean;
};

export type AdminRecruitment = {
    id: number;
    bankId: number;
    bankName: string;
    bankCode?: string;
    code: string;
    postName: string;
    postNameMarathi: string;
    totalSeats: string;
    applicationStartDate: string;
    applicationEndDate: string;
    applicationFee: string;
    minAge?: string;
    maxAge?: string;
    ageAsOnDate: string;
    requiredCityDistrict?: number;
    requiredStateId?: number;
    requiredEducation: string;
    isDomicileRequired: boolean;
    isNCLRequired: boolean;
    noticePdfUrl: string;
    noticePdfFileName: string;
    eligibilityCriteria?: EligibilityCriteria[];
    status: string;
    isPublished: boolean;
    isActive: boolean;
    isOpen: boolean;
};

export type BankForm = typeof emptyBankForm;
export type BankFormField = keyof BankForm;
export type BankFormErrors = Partial<Record<BankFormField, string>>;
export type RecruitmentForm = typeof emptyRecruitmentForm;
export type RecruitmentFormField = keyof RecruitmentForm;
export type RecruitmentFormErrors = Partial<Record<RecruitmentFormField, string>>;

export type AdminNews = {
  id: number;
  newsEng: string;
  newsMrt: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  categoryId: number;
  categoryName: string;
  description?: string;
  thumbnailUrl?: string;
  sortOrder?: number;
};

export type AdminAuthor = {
  authorId: number;
  authorName: string;
  bio?: string;
  photoUrl?: string;
};

export type NewsForm = {
  newsEng: string;
  newsMrt: string;
};

export type NewsFormField = keyof NewsForm;
export type NewsFormErrors = Partial<Record<NewsFormField, string>>;

export type CategoryForm = typeof import("@/constants/adminDashboard").emptyCategoryForm;
export type CategoryFormField = keyof CategoryForm;
export type CategoryFormErrors = Partial<Record<CategoryFormField, string>>;

export type AuthorForm = typeof import("@/constants/adminDashboard").emptyAuthorForm;
export type AuthorFormField = keyof AuthorForm;
export type AuthorFormErrors = Partial<Record<AuthorFormField, string>>;
