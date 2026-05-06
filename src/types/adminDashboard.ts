import { emptyBankForm, emptyRecruitmentForm } from "@/constants/adminDashboard";

export type AdminBank = {
    bankId: number;
    bankName: string;
    bankNameMarathi?: string;
    bankCode?: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    logoUrl: string;
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
    requiredCityDistrict?: string;
    requiredStateId?: string;
    requiredEducation: string;
    isDomicileRequired: boolean;
    isNCLRequired: boolean;
    noticePdfUrl: string;
    noticePdfFileName: string;
    status: string;
    isPublished: boolean;
};

export type BankForm = typeof emptyBankForm;
export type BankFormField = keyof BankForm;
export type BankFormErrors = Partial<Record<BankFormField, string>>;
export type RecruitmentForm = typeof emptyRecruitmentForm;
export type RecruitmentFormField = keyof RecruitmentForm;
export type RecruitmentFormErrors = Partial<Record<RecruitmentFormField, string>>;