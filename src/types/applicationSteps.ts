import { EducationEntry, LanguageSkills } from "@/constants/application-wizard.constants";
import { EligibilityCriteria } from "./api.types";

export type ApplicationWizardProps = {
  initialRecruitment: {
    vacancyId?: number;
    code: string;
    name: string;
    postName?: string;
    bankName?: string;
    eligibilityCriteria?: EligibilityCriteria[];
  };
};

export type ExperienceEntry = {
  experienceId?: number;
  organization: string;
  designation: string;
  location: string;
  fromDate: string;
  toDate: string;
  isCurrentJob: boolean;
};

export type SaveStepExperienceItemPayload = {
  experienceId: number;
  organizationName: string;
  designation: string;
  location: string;
  fromDate: string;
  toDate: string | null;
  isCurrentJob: boolean;
};

export type MasterOption = {
  id?: number;
  value: string;
  label: string;
};

export type FormState = {
  recruitmentCode: string;
  recruitmentName: string;
  applicationId: string;
  bankName: string;
  postName: string;
  employmentType: string;
  aadhaarNumber?: string;
  firstName: string;
  aadharNo?: string;
  lastName: string;
  fullName?: string;
  fullNameMarathi?: string;
  dateOfBirth: string;
  ageAsOn: string;
  gender: string;
  category: string;
  caste: string;
  religion: string;
  maharashtraDomiciled: string;
  nonCreamyLayer: string;
  maritalStatus: string;
  husbandsName?: string;
  mothersName?: string;
  fathersName?: string;
  nationalityIndian: string;
  country: string;
  email: string;
  phone: string;
  alternatePhone: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  taluka: string;
  district: string;
  state: string;
  subCaste: string;
  pincode: string;
  languageSkills: LanguageSkills;
  educationEntries: EducationEntry[];
  experienceEntries: ExperienceEntry[];
  documents: {
    photo: File | null;
    signature: File | null;
    aadhaar: File | null;
    sscMarksheet: File | null;
    hscMarksheet: File | null;
    degree: File | null;
    mscitCertificate: File | null;
    cccCertificate: File | null;
  }
  acceptedEligibilityCriteria: Record<number, boolean>;
  declarationAccepted: boolean;
  paymentMethod: string;
  paymentStatus: string;
  transactionNumber: string;
  paymentDate: string;
};

export type SaveStep1and2Payload = {
  vacancyId: number;
  aadhaarNumber: string;
  fullName: string;
  fullNameMarathi: string;
  dateOfBirth: string;           // ISO string
  gender: string;
  categoryId: number;
  religionId: number;
  casteId: number;
  subCasteId: number;
  nationalityId: number;
  isMahaDomiciled: boolean;
  isNonCreamyLayer: boolean;
  maritalStatus: string;
  fathersName: string;
  mothersName: string;
  husbandsName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  countryId: number;
  stateId: number;
  districtId: number;
  talukaId: number;
  pinCode: string;
  mobileNumber: string;
  alternateNumber: string;
  languages: { languageName: string; canRead: boolean; canWrite: boolean; canSpeak: boolean }[];
};

export type SaveStep3EducationPayload = {
  educationId: number;
  educationLevel: string;
  specialization: string;
  organizationName: string;
  percentageOrCGPA: number;
  className: string;
  passedMonthYear: string;
  passedDate: string | null;
  sortOrder: number;
};

export type SaveStep3Payload = {
  applicationId: number;
  educations: SaveStep3EducationPayload[];
};

export type SaveStepExperiencePayload = {
  applicationId: number;
  experiences: SaveStepExperienceItemPayload[];
};
