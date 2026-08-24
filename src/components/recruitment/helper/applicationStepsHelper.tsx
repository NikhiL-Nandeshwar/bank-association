import { APPLICATION_INPUT_CLASS_NAME, EDUCATION_TEMPLATE, EMPTY_LANGUAGE_SKILLS, LanguageSkills, SUMMARY_TONE_CLASS_NAMES, SummaryTone } from "@/constants/application-wizard.constants";
import { EligibilityCriteria, MasterItem, MasterListResponse, PaymentReceipt } from "@/types/api.types";
import { ApplicationWizardProps, ExperienceEntry, FormState, MasterOption, SaveStep1and2Payload, SaveStep3ValidationPayload, SaveStepExperiencePayload } from "@/types/applicationSteps";

const EDUCATION_CRITERION_LEVEL_MAP: Record<string, string> = {
    SSC_10TH: 'SSC / 10th',
    HSC_12TH: 'HSC / 12th',
    GRADUATION: 'Graduation',
    POST_GRADUATION: 'Post Graduation',
    DIPLOMA: 'Diploma',
};

const PERSON_NAME_PATTERN = /^[A-Za-z\s]+$/;
export const MAX_PERSON_NAME_LENGTH = 40;
export const MAX_ADDRESS_LENGTH = 120;
export const MAX_EDUCATION_TEXT_LENGTH = 100;
export const MAX_EDUCATION_LEVEL_LENGTH = 50;
export const MAX_CLASS_NAME_LENGTH = 40;
export const MAX_PERCENTAGE_OR_CGPA_LENGTH = 10;
export const MAX_EXPERIENCE_TEXT_LENGTH = 100;
const PERCENTAGE_OR_CGPA_PATTERN = /^\d+(\.\d+)?$/;
const MIN_APPLICANT_AGE = 16;
const MAX_APPLICANT_AGE = 80;

export type ExistingDocument = {
    documentId: number;
    documentName: string;
    fileUrl: string;
};

export type UploadedDocuments = {
    photo?: ExistingDocument;
    signature?: ExistingDocument;
    aadhaar?: ExistingDocument;
    sscMarksheet?: ExistingDocument;
    hscMarksheet?: ExistingDocument;
    degree?: ExistingDocument;
    mscitCertificate?: ExistingDocument;
    cccCertificate?: ExistingDocument;
};

export type ErrorMap =
    Partial<Record<keyof FormState, string>> & {
        photo?: string;
        signature?: string;
        aadhaar?: string;
        sscMarksheet?: string;
        hscMarksheet?: string;
        degree?: string;
        mscitCertificate?: string;
        cccCertificate?: string;
        educationFieldErrors?: Record<string, string>;
        experienceFieldErrors?: Record<string, string>;
    };

export const initialState = (recruitment: ApplicationWizardProps['initialRecruitment']): FormState => ({
    recruitmentCode: recruitment.code,
    recruitmentName: recruitment.name,
    applicationId: generateApplicationId(recruitment),
    bankName: recruitment.name ?? '',
    postName: recruitment.postName ?? '',
    employmentType: 'full-time',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ageAsOn: '',
    gender: '',
    category: '',
    caste: '',
    religion: '',
    maharashtraDomiciled: '',
    nonCreamyLayer: '',
    maritalStatus: '',
    husbandsName: '',
    mothersName: '',
    fathersName: '',
    nationalityIndian: 'Yes',
    country: '',
    email: '',
    phone: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    taluka: '',
    district: '',
    state: '',
    subCaste: '',
    pincode: '',
    languageSkills: structuredClone(EMPTY_LANGUAGE_SKILLS),
    educationEntries: structuredClone(EDUCATION_TEMPLATE),
    // experienceLevel: '',
    experienceEntries: [{ organization: '', designation: '', location: '', fromDate: '', toDate: '', isCurrentJob: false }],
    // keySkills: '',
    documents: {
        photo: null,
        signature: null,
        aadhaar: null,
        sscMarksheet: null,
        hscMarksheet: null,
        degree: null,
        mscitCertificate: null,
        cccCertificate: null,
    },
    acceptedEligibilityCriteria: {},
    declarationAccepted: false,
    paymentStatus: '',
    // Show the published recruitment fee before the payment gateway order is created.
    paymentAmount: recruitment.applicationFee === undefined ? '' : String(recruitment.applicationFee),
    transactionNumber: '',
    paymentDate: '',
    paymentMethod: '',
});

export function generateApplicationId(recruitment: ApplicationWizardProps['initialRecruitment']) {
    const code = recruitment.code.replace(/[^a-z0-9]/gi, '').toUpperCase() || 'REC';
    return `APP-${code}-2026`;
}

export function fieldValue(value: unknown) {
    return typeof value === 'string' ? value : '';
}

export function hasLanguageSelected(skills: LanguageSkills) {
    return Object.values(skills ?? {}).some((language) => Object.values(language).some(Boolean));
}

export function sanitizePercentageOrCgpa(value: string) {
    let next = '';
    let hasDecimal = false;

    for (const char of value) {
        if (next.length >= MAX_PERCENTAGE_OR_CGPA_LENGTH) {
            break;
        }

        if (char >= '0' && char <= '9') {
            next += char;
        } else if (char === '.' && !hasDecimal) {
            hasDecimal = true;
            next += char;
        }
    }

    return next;
}

export function sanitizeLimitedText(value: string, maxLength: number) {
    return value.slice(0, maxLength);
}

function isFutureMonthYear(value: string) {
    if (!/^\d{4}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month] = value.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return year > currentYear || (year === currentYear && month > currentMonth);
}

function isFutureDate(value: string) {
    if (!value) {
        return false;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return true;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return parsed > today;
}

function getAgeInYears(dateOfBirth: string) {
    const birthDate = new Date(dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
        return null;
    }

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDelta = today.getMonth() - birthDate.getMonth();

    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
        years -= 1;
    }

    return years;
}

function validatePercentageOrCgpa(value: string, required: boolean) {
    const score = value.trim();

    if (!score) {
        return required ? 'Percentage or CGPA is required.' : undefined;
    }

    if (score.length > MAX_PERCENTAGE_OR_CGPA_LENGTH) {
        return `Percentage or CGPA can be at most ${MAX_PERCENTAGE_OR_CGPA_LENGTH} characters.`;
    }

    if (!PERCENTAGE_OR_CGPA_PATTERN.test(score)) {
        return 'Enter a number such as 8 or 8.5. Letters are not allowed.';
    }

    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore <= 0) {
        return 'Enter a valid percentage or CGPA greater than 0.';
    }

    if (numericScore > 100) {
        return 'Percentage or CGPA cannot be greater than 100.';
    }

    return undefined;
}

export function getMandatoryEducationLevels(criteria?: EligibilityCriteria[]) {
    return Array.from(
        new Set(
            (criteria ?? [])
                .filter((item) => item.isMandatory)
                .map((item) => {
                    const directMatch = EDUCATION_CRITERION_LEVEL_MAP[item.criteriaValue?.toUpperCase?.() ?? ''];
                    if (directMatch) return directMatch;

                    const declaration = `${item.declarationEng ?? ''} ${item.declarationMrt ?? ''}`.toLowerCase();
                    if (declaration.includes('10th')) return 'SSC / 10th';
                    if (declaration.includes('12th')) return 'HSC / 12th';
                    if (declaration.includes('post graduation') || declaration.includes('postgraduate')) return 'Post Graduation';
                    if (declaration.includes('graduation')) return 'Graduation';
                    if (declaration.includes('diploma')) return 'Diploma';

                    return '';
                })
                .filter(Boolean),
        ),
    );
}

function toIsoDateString(value: string) {
    if (!value.trim()) return null;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function buildSaveStep3Payload(form: FormState, applicationId: number): SaveStep3ValidationPayload {
    return {
        applicationId,
        educations: form.educationEntries.map((entry, index) => ({
            educationId: entry.educationId ?? 0,
            educationCategory: entry.level,
            educationLevel: entry.educationLevel ?? '',
            specialization: fieldValue(entry.specialization).trim(),
            organizationName: fieldValue(entry.institute).trim() || fieldValue(entry.board).trim(),
            percentageOrCGPA: Number(fieldValue(entry.score)) || 0,
            className: fieldValue(entry.className).trim(),
            passedMonthYear: (() => {
                const value = fieldValue(entry.passedMonthYear).trim();

                if (!value) return '';

                const [year, month] = value.split('-');

                return month && year
                    ? `${month}/${year}`
                    : value;
            })(),
            passedDate: toIsoDateString(fieldValue(entry.passedDate)),
            sortOrder: entry.sortOrder ?? index,
        })),
    };
}

export function buildSaveStepExperiencePayload(
    form: FormState,
    applicationId: number,
): SaveStepExperiencePayload {
    return {
        applicationId,
        experiences: form.experienceEntries
            .filter((entry) => hasExperienceDetails([entry]))
            .map((entry) => ({
                experienceId: entry.experienceId ?? 0,
                organizationName: fieldValue(entry.organization).trim(),
                designation: fieldValue(entry.designation).trim(),
                location: fieldValue(entry.location).trim(),
                fromDate: toIsoDateString(fieldValue(entry.fromDate)) ?? '',
                toDate: entry.isCurrentJob
                    ? null
                    : toIsoDateString(fieldValue(entry.toDate)),
                isCurrentJob: entry.isCurrentJob,
            })),
    };
}

export function hasExperienceDetails(entries: ExperienceEntry[]) {
    return (entries ?? []).some(
        (entry) =>
            fieldValue(entry.organization).trim() &&
            fieldValue(entry.designation).trim() &&
            fieldValue(entry.location).trim() &&
            fieldValue(entry.fromDate).trim() &&
            (entry.isCurrentJob || fieldValue(entry.toDate).trim()),
    );
}

export function parseMasterId(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function getMasterItems(response?: MasterListResponse | null) {
    return response ? (Array.isArray(response) ? response : response.items) : [];
}

export function getMasterOptionValue(item: MasterItem, fallbackIndex: number) {
    const rawId =
        item.id ??
        item.masterId ??
        item.talukaId ??
        item.districtId ??
        item.casteId ??
        item.subCasteId ??
        item.categoryId ??
        item.religionId ??
        item.stateId ??
        item.countryId;

    if (typeof rawId === 'number' && Number.isFinite(rawId)) {
        return String(rawId);
    }

    const parsedValue = Number(item.value ?? item.code ?? item.label ?? item.text ?? item.name ?? item.description ?? fallbackIndex);
    if (Number.isFinite(parsedValue) && parsedValue > 0) {
        return String(parsedValue);
    }

    const fallbackValue =
        item.value ??
        item.code ??
        item.label ??
        item.text ??
        item.name ??
        item.description ??
        item.descriptionMarathi ??
        item.nameMarathi ??
        fallbackIndex;

    return String(fallbackValue).trim();
}

export function getMasterOptionLabel(item: MasterItem) {
    const rawLabel =
        item.casteName ??
        item.subCasteName ??
        item.categoryName ??
        item.religionName ??
        item.stateName ??
        item.countryName ??
        item.districtName ??
        item.talukaName ??
        item.label ??
        item.text ??
        item.name ??
        item.description ??
        item.nameMarathi ??
        item.descriptionMarathi ??
        item.value ??
        item.code ??
        item.id ??
        item.masterId ??
        '';

    return String(rawLabel).trim();
}

export function toMasterOptions(
    response?: MasterListResponse | null,
    getLabel: (item: MasterItem) => string = getMasterOptionLabel,
    getValue: (item: MasterItem, fallbackIndex: number) => string = getMasterOptionValue,
) {
    return getMasterItems(response)
        .map((item, index): MasterOption | null => {
            const value = getValue(item, index);
            const label = getLabel(item);
            if (!value && !label) return null;
            return {
                id: parseMasterId(value),
                value: value || label,
                label: label || value,
            };
        })
        .filter((option): option is MasterOption => Boolean(option));
}

export function toCategoryOptions(response?: MasterListResponse | null) {
    return toMasterOptions(
        response,
        (item) => String(item.categoryCode ?? item.categoryName ?? item.value ?? '').trim(),
        (item, fallbackIndex) => String(item.categoryId ?? item.id ?? item.masterId ?? fallbackIndex).trim(),
    );
}

export function toReligionOptions(response?: MasterListResponse | null) {
    return toMasterOptions(
        response,
        (item) => String(item.religionName ?? item.value ?? item.name ?? '').trim(),
        (item, fallbackIndex) => String(item.religionId ?? item.id ?? item.masterId ?? fallbackIndex).trim(),
    );
}

export function getSelectedMasterId(value: string) {
    return parseMasterId(value);
}

export function sortEligibilityCriteria(criteria: EligibilityCriteria[]) {
    return [...(criteria ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function validateStep(
    step: number,
    form: FormState,
    eligibilityCriteria?: EligibilityCriteria[],
    uploadedDocuments?: UploadedDocuments,
    mandatoryDocuments: string[] = [],
): ErrorMap {

    const errors: ErrorMap = {};

    if (step === 0) {
        if (!fieldValue(form.recruitmentCode).trim()) errors.recruitmentCode = 'Recruitment code is required.';
        if (!fieldValue(form.recruitmentName).trim()) errors.recruitmentName = 'Recruitment name is required.';
        if (!fieldValue(form.applicationId).trim()) errors.applicationId = 'Application ID is required.';
        if (!fieldValue(form.bankName).trim()) errors.bankName = 'Bank name is required.';
        if (!fieldValue(form.postName).trim()) errors.postName = 'Post name is required.';

        // Validate mandatory eligibility criteria
        if (eligibilityCriteria && eligibilityCriteria.length > 0) {
            const orderedCriteria = sortEligibilityCriteria(eligibilityCriteria);
            const mandatoryIndexes = orderedCriteria
                .map((criteria, index) => (criteria.isMandatory ? index : null))
                .filter((index): index is number => index !== null);
            const allMandatoryChecked = mandatoryIndexes.every((index) => form.acceptedEligibilityCriteria[index] === true);
            if (mandatoryIndexes.length > 0 && !allMandatoryChecked) {
                errors.acceptedEligibilityCriteria = 'Please accept all mandatory eligibility criteria to proceed.';
            }
        }
    }

    if (step === 1) {
        if (!fieldValue(form.firstName).trim()) errors.firstName = 'First name is required.';
        else if (!PERSON_NAME_PATTERN.test(fieldValue(form.firstName)) || fieldValue(form.firstName).length > MAX_PERSON_NAME_LENGTH) errors.firstName = 'First name can contain only letters and spaces, up to 40 characters.';
        if (!fieldValue(form.lastName).trim()) errors.lastName = 'Last name is required.';
        else if (!PERSON_NAME_PATTERN.test(fieldValue(form.lastName)) || fieldValue(form.lastName).length > MAX_PERSON_NAME_LENGTH) errors.lastName = 'Last name can contain only letters and spaces, up to 40 characters.';
        if (!form.dateOfBirth) {
            errors.dateOfBirth = 'Date of birth is required.';
        } else if (isFutureDate(form.dateOfBirth)) {
            errors.dateOfBirth = 'Date of birth cannot be in the future.';
        } else {
            const ageInYears = getAgeInYears(form.dateOfBirth);
            if (ageInYears === null) {
                errors.dateOfBirth = 'Enter a valid date of birth.';
            } else if (ageInYears < MIN_APPLICANT_AGE) {
                errors.dateOfBirth = `Applicant must be at least ${MIN_APPLICANT_AGE} years old.`;
            } else if (ageInYears > MAX_APPLICANT_AGE) {
                errors.dateOfBirth = 'Enter a valid date of birth.';
            }
        }
        if (!fieldValue(form.ageAsOn).trim()) errors.ageAsOn = 'Age as on date is required.';
        if (!form.gender) errors.gender = 'Please select a gender.';
        if (!/^\d{12}$/.test(fieldValue(form.aadhaarNumber))) {
            errors.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number.';
        }
        if (!form.category) errors.category = 'Please select a category.';
        if (!fieldValue(form.caste).trim()) errors.caste = 'Caste is required.';
        if (!fieldValue(form.subCaste).trim()) errors.subCaste = 'Sub caste is required.';
        if (!fieldValue(form.religion).trim()) errors.religion = 'Religion is required.';
        if (!form.maharashtraDomiciled) errors.maharashtraDomiciled = 'Please select domicile status.';
        if (!form.nonCreamyLayer) errors.nonCreamyLayer = 'Please select non-creamy layer status.';
        if (!form.maritalStatus) errors.maritalStatus = 'Please select marital status.';
        if (form.maritalStatus === 'Married' && !fieldValue(form.husbandsName).trim()) {
            errors.husbandsName = 'Spouse name is required.';
        } else if (fieldValue(form.husbandsName).trim() && (!PERSON_NAME_PATTERN.test(fieldValue(form.husbandsName)) || fieldValue(form.husbandsName).length > MAX_PERSON_NAME_LENGTH)) {
            errors.husbandsName = 'Spouse name can contain only letters and spaces, up to 40 characters.';
        }
        if (!fieldValue(form.mothersName).trim()) errors.mothersName = "Mother's name is required.";
        else if (!PERSON_NAME_PATTERN.test(fieldValue(form.mothersName)) || fieldValue(form.mothersName).length > MAX_PERSON_NAME_LENGTH) errors.mothersName = "Mother's name can contain only letters and spaces, up to 40 characters.";
        if (!fieldValue(form.fathersName).trim()) errors.fathersName = "Father's name is required.";
        else if (!PERSON_NAME_PATTERN.test(fieldValue(form.fathersName)) || fieldValue(form.fathersName).length > MAX_PERSON_NAME_LENGTH) errors.fathersName = "Father's name can contain only letters and spaces, up to 40 characters.";
        if (!form.nationalityIndian) errors.nationalityIndian = 'Please confirm citizenship.';
    }

    if (step === 2) {
        if (!fieldValue(form.email).trim()) {
            errors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(fieldValue(form.email))) {
            errors.email = 'Enter a valid email address.';
        }

        if (!/^\d{10}$/.test(fieldValue(form.phone))) errors.phone = 'Enter a valid 10-digit phone number.';
        if (form.alternatePhone && !/^\d{10}$/.test(form.alternatePhone)) errors.alternatePhone = 'Enter a valid 10-digit alternate number.';
        if (form.alternatePhone && form.alternatePhone === fieldValue(form.phone)) {
            errors.alternatePhone = 'Alternate number should be different from the primary mobile number.';
        }
        if (!fieldValue(form.addressLine1).trim()) errors.addressLine1 = 'Address line 1 is required.';
        else if (fieldValue(form.addressLine1).trim().length > MAX_ADDRESS_LENGTH) {
            errors.addressLine1 = `Address line 1 can be at most ${MAX_ADDRESS_LENGTH} characters.`;
        }
        if (fieldValue(form.addressLine2).length > MAX_ADDRESS_LENGTH) {
            errors.addressLine2 = `Address line 2 can be at most ${MAX_ADDRESS_LENGTH} characters.`;
        }
        if (fieldValue(form.addressLine3).length > MAX_ADDRESS_LENGTH) {
            errors.addressLine3 = `Address line 3 can be at most ${MAX_ADDRESS_LENGTH} characters.`;
        }
        if (!fieldValue(form.country).trim()) errors.country = 'Country is required.';
        if (!fieldValue(form.taluka).trim()) errors.taluka = 'Taluka is required.';
        if (!fieldValue(form.district).trim()) errors.district = 'District is required.';
        // if (!fieldValue(form.city).trim()) errors.city = 'City is required.';
        if (!fieldValue(form.state).trim()) errors.state = 'State is required.';
        if (!/^\d{6}$/.test(fieldValue(form.pincode))) errors.pincode = 'Enter a valid 6-digit pincode.';
        if (!hasLanguageSelected(form.languageSkills)) errors.languageSkills = 'Select at least one language ability.';
    }

    if (step === 3) {
        const mandatoryEducationLevels = getMandatoryEducationLevels(eligibilityCriteria);

        form.educationEntries.forEach((entry) => {
            const isMandatory = mandatoryEducationLevels.includes(entry.level);
            const hasDetails = Boolean(
                fieldValue(entry.institute).trim() ||
                fieldValue(entry.educationLevel).trim() ||
                fieldValue(entry.specialization).trim() ||
                fieldValue(entry.score).trim() ||
                fieldValue(entry.className).trim() ||
                fieldValue(entry.passedMonthYear).trim(),
            );

            if (!isMandatory && !hasDetails) return;

            const prefix = entry.level;
            const textFields = [
                ['Institute / organization', fieldValue(entry.institute), MAX_EDUCATION_TEXT_LENGTH],
                ['Education level', fieldValue(entry.educationLevel), MAX_EDUCATION_LEVEL_LENGTH],
                ['Specialization', fieldValue(entry.specialization), MAX_EDUCATION_TEXT_LENGTH],
                ['Class / grade', fieldValue(entry.className), MAX_CLASS_NAME_LENGTH],
            ] as const;

            for (const [label, value, maxLength] of textFields) {
                if (isMandatory && !value.trim()) {
                    errors.educationEntries = `${prefix} ${label.toLowerCase()} is required.`;
                    return;
                }
                if (value.length > maxLength) {
                    errors.educationEntries = `${prefix} ${label.toLowerCase()} can be at most ${maxLength} characters.`;
                    return;
                }
            }

            const scoreError = validatePercentageOrCgpa(fieldValue(entry.score), isMandatory);
            if (scoreError) {
                errors.educationEntries = `${prefix}: ${scoreError}`;
                return;
            }

            if (isMandatory && !fieldValue(entry.passedMonthYear).trim()) {
                errors.educationEntries = `${prefix} passed month and year is required.`;
                return;
            }
            if (fieldValue(entry.passedMonthYear).trim() && isFutureMonthYear(fieldValue(entry.passedMonthYear))) {
                errors.educationEntries = `${prefix} passed month and year cannot be in the future.`;
            }
        });
    }

    if (step === 4) {
        const filledEntries = form.experienceEntries.filter(
            (entry) =>
                fieldValue(entry.organization).trim() ||
                fieldValue(entry.designation).trim() ||
                fieldValue(entry.location).trim() ||
                fieldValue(entry.fromDate).trim() ||
                fieldValue(entry.toDate).trim(),
        );

        if (
            filledEntries.length > 0 &&
            !hasExperienceDetails(form.experienceEntries)
        ) {
            errors.experienceEntries =
                'Please complete all required fields for the experience entry.';
        }
    }

    if (step === 5) {
        const hasDocument = (
            formFile: File | null,
            uploadedFile: unknown,
        ) => !!formFile || !!uploadedFile;

        if (
            !hasDocument(
                form.documents.photo,
                uploadedDocuments?.photo,
            )
        ) {
            errors.photo = 'Photo is required.';
        }

        if (
            !hasDocument(
                form.documents.signature,
                uploadedDocuments?.signature,
            )
        ) {
            errors.signature = 'Signature is required.';
        }

        if (
            !hasDocument(
                form.documents.aadhaar,
                uploadedDocuments?.aadhaar,
            )
        ) {
            errors.aadhaar = 'Aadhaar is required.';
        }

        if (
            mandatoryDocuments.includes('SSC_MARKSHEET') &&
            !hasDocument(
                form.documents.sscMarksheet,
                uploadedDocuments?.sscMarksheet,
            )
        ) {
            errors.sscMarksheet =
                'SSC marksheet is required.';
        }

        if (
            mandatoryDocuments.includes('HSC_MARKSHEET') &&
            !hasDocument(
                form.documents.hscMarksheet,
                uploadedDocuments?.hscMarksheet,
            )
        ) {
            errors.hscMarksheet =
                'HSC marksheet is required.';
        }

        if (
            mandatoryDocuments.includes('DEGREE') &&
            !hasDocument(
                form.documents.degree,
                uploadedDocuments?.degree,
            )
        ) {
            errors.degree =
                'Graduation marksheet is required.';
        }

        if (
            mandatoryDocuments.includes('MSCIT_CERTIFICATE') &&
            !hasDocument(
                form.documents.mscitCertificate,
                uploadedDocuments?.mscitCertificate,
            )
        ) {
            errors.mscitCertificate =
                'MSCIT certificate is required.';
        }

        if (
            mandatoryDocuments.includes('CCC_CERTIFICATE') &&
            !hasDocument(
                form.documents.cccCertificate,
                uploadedDocuments?.cccCertificate,
            )
        ) {
            errors.cccCertificate =
                'CCC certificate is required.';
        }
    }

    if (step === 6 && !form.declarationAccepted) {
        errors.declarationAccepted = 'You need to accept the declaration before payment.';
    }

    return errors;
}

export function generateTransactionNumber() {
    return `DEMO${Date.now().toString().slice(-10)}`;
}

export function calculateAgeAsOn(dateOfBirth: string) {
    if (!dateOfBirth) return '';

    const birthDate = new Date(dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) return '';

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        const previousMonthLastDate = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += previousMonthLastDate;
        months -= 1;
    }

    if (months < 0) {
        months += 12;
        years -= 1;
    }

    if (years < 0) return '';

    return `${years} years, ${months} months, ${days} days`;
}

export function normalizeFormState(
    recruitment: ApplicationWizardProps['initialRecruitment'],
    form: Partial<FormState>,
): FormState {
    const defaults = initialState(recruitment);
    const languageSkills = form.languageSkills ?? defaults.languageSkills;
    const educationEntries = form.educationEntries?.length ? form.educationEntries : defaults.educationEntries;
    const experienceEntries = form.experienceEntries?.length ? form.experienceEntries : defaults.experienceEntries;

    return {
        ...defaults,
        ...form,
        languageSkills: {
            marathi: { ...defaults.languageSkills.marathi, ...languageSkills.marathi },
            hindi: { ...defaults.languageSkills.hindi, ...languageSkills.hindi },
            english: { ...defaults.languageSkills.english, ...languageSkills.english },
        },
        educationEntries: educationEntries.map((entry, index) => ({
            ...(defaults.educationEntries[index] ?? EDUCATION_TEMPLATE[0]),
            ...entry,
            passedDate: fieldValue(entry.passedDate),
        })),
        experienceEntries: experienceEntries.map((entry) => ({
            experienceId: entry.experienceId,
            organization: fieldValue(entry.organization),
            designation: fieldValue(entry.designation),
            location: fieldValue(entry.location),
            fromDate: fieldValue(entry.fromDate),
            toDate: fieldValue(entry.toDate),
            isCurrentJob: entry.isCurrentJob ?? false,
        })),
    };
}

export function FormField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            {children}
            {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
        </label>
    );
}

export function LookupField({
    label,
    error,
    value,
    onChange,
    options,
    isLoading,
    placeholder,
}: {
    label: string;
    error?: string;
    value: string;
    onChange: (value: string) => void;
    options: MasterOption[];
    isLoading: boolean;
    placeholder: string;
}) {
    const hasCurrentValue = options.some((option) => option.value === value || option.label === value);
    const selectOptions = value && !hasCurrentValue ? [{ value, label: value }, ...options] : options;

    return (
        <FormField label={label} error={error}>
            {isLoading ? (
                <select disabled className={APPLICATION_INPUT_CLASS_NAME}>
                    <option value="">Loading {label.toLowerCase()}...</option>
                </select>
            ) : selectOptions.length > 0 ? (
                <select value={value} onChange={(event) => onChange(event.target.value)} className={APPLICATION_INPUT_CLASS_NAME}>
                    <option value="">{placeholder}</option>
                    {selectOptions.map((option) => (
                        <option key={`${option.value}-${option.label}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <select value={value} onChange={(event) => onChange(event.target.value)} className={APPLICATION_INPUT_CLASS_NAME}>
                    <option value="">{placeholder}</option>
                </select>
            )}
        </FormField>
    );
}

export function ChoiceButtons({
    choices,
    value,
    onChange,
}: {
    choices: string[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="mt-3 flex flex-wrap gap-3">
            {choices.map((choice) => (
                <button
                    key={choice}
                    type="button"
                    onClick={() => onChange(choice)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${value === choice ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    {choice}
                </button>
            ))}
        </div>
    );
}

export function YesNoButtons({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return <ChoiceButtons choices={['Yes', 'No']} value={value} onChange={onChange} />;
}

export function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
            <p className="text-md pt-1 font-semibold uppercase tracking-[0.08em] text-black">{label}</p>
            <p className="mt-1 text-sm leading-7 text-slate-700">{value}</p>
        </div>
    );
}

export function HallTicketPreview({ form, fullName }: { form: FormState; fullName: string }) {
    const examDate = '18 May 2026';
    const examTime = '10:30 AM to 12:30 PM';
    const reportingTime = '09:30 AM';

    return (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-amber-300 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 border-b border-amber-200 bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Hall ticket preview</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recruitment Examination Hall Ticket</h2>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Hall Ticket No.</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">HT-{form.applicationId.replace('APP-', '')}</p>
                </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_190px]">
                <div className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TicketDetail label="Candidate name" value={fullName} />
                        <TicketDetail label="Application ID" value={form.applicationId} />
                        <TicketDetail label="Recruitment code" value={form.recruitmentCode} />
                        <TicketDetail label="Post applied" value={form.postName || 'Bank recruitment post'} />
                        <TicketDetail label="Bank name" value={form.bankName} />
                        <TicketDetail label="Category" value={form.category || 'General'} />
                    </div>

                    <div className="mt-6 grid gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:grid-cols-3">
                        <TicketDetail label="Exam date" value={examDate} />
                        <TicketDetail label="Exam time" value={examTime} />
                        <TicketDetail label="Reporting" value={reportingTime} />
                    </div>

                    {/* <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                        <TicketDetail label="Exam venue" value={venue} />
                        <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
                            Carry a printed hall ticket, original photo ID, and one passport-size photograph. Entry closes 15 minutes before exam time.
                        </p>
                    </div> */}
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-6 md:border-l md:border-t-0">
                    <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white">
                        <img src="/hallticket/Display_Pic.jpg" alt="Candidate photograph" className="h-full w-full object-cover" />
                    </div>
                    <div className="mt-6 flex h-16 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white px-3 py-2">
                        <img src="/hallticket/SIGN.png" alt="Candidate signature" className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Signature</p>
                    <div className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        Verified
                    </div>
                </div>
            </div>

            <div className="grid gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-600 sm:grid-cols-3">
                <span>Payment ref: {form.transactionNumber}</span>
                <span>Issued on: {form.paymentDate || '30/04/2026'}</span>
                <span>Status: Provisional admission</span>
            </div>
        </div>
    );
}

function formatReceiptAmount(amount: number, currency: string) {
    const code = currency || 'INR';

    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: code,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${code} ${amount}`;
    }
}

export function PaymentReceiptPreview({
    receipt,
    onDownload,
}: {
    receipt: PaymentReceipt;
    onDownload: () => void;
}) {
    const application = receipt.application;

    return (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-emerald-300 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 border-b border-emerald-200 bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Payment receipt</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{receipt.orgName || 'Payment Receipt'}</h2>
                    {receipt.orgAddress ? <p className="mt-1 text-sm text-slate-600">{receipt.orgAddress}</p> : null}
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:items-end">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Receipt No.</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{receipt.receiptNumber}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onDownload}
                        className="inline-flex items-center justify-center rounded-full bg-[#fcd62e] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400"
                    >
                        Download / Print
                    </button>
                </div>
            </div>

            <div id="payment-receipt-print" className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <TicketDetail label="Paid on" value={receipt.formattedPaidAt || receipt.paidAt || 'N/A'} />
                    <TicketDetail label="Amount" value={formatReceiptAmount(receipt.amount, receipt.currency)} />
                    <TicketDetail label="Status" value={receipt.status || 'N/A'} />
                    <TicketDetail label="Payment method" value={receipt.paymentMethod || 'N/A'} />
                    <TicketDetail label="Transaction ID" value={receipt.bdTransactionId || 'N/A'} />
                    <TicketDetail label="Order ID" value={receipt.bdOrderId || 'N/A'} />
                    <TicketDetail label="Payer name" value={receipt.payerName || 'N/A'} />
                    <TicketDetail label="Payer email" value={receipt.payerEmail || 'N/A'} />
                    <TicketDetail label="Payer mobile" value={receipt.payerMobile || 'N/A'} />
                    {application ? (
                        <>
                            <TicketDetail label="Application number" value={application.applicationNumber || 'N/A'} />
                            <TicketDetail label="Candidate name" value={application.candidateName || 'N/A'} />
                            <TicketDetail label="Post name" value={application.postName || 'N/A'} />
                            <TicketDetail label="Bank name" value={application.bankName || 'N/A'} />
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export function printPaymentReceipt(receipt: PaymentReceipt) {
    if (typeof window === 'undefined') {
        return;
    }

    const escapeHtml = (value: string) =>
        value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');

    const application = receipt.application;
    const amount = escapeHtml(formatReceiptAmount(receipt.amount, receipt.currency));
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1000');

    if (!printWindow) {
        window.print();
        return;
    }

    const text = (value?: string | null) => escapeHtml(value || 'N/A');

    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${text(receipt.receiptNumber || 'Payment Receipt')}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      p { margin: 0; }
      .muted { color: #475569; font-size: 13px; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
      .label { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; }
      .value { font-size: 14px; font-weight: 700; margin-top: 4px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <p class="muted">PAYMENT RECEIPT</p>
        <h1>${text(receipt.orgName || 'Payment Receipt')}</h1>
        <p class="muted">${escapeHtml(receipt.orgAddress || '')}</p>
      </div>
      <div style="text-align:right">
        <p class="label">Receipt No.</p>
        <p class="value">${text(receipt.receiptNumber)}</p>
      </div>
    </div>
    <div class="grid">
      <div><p class="label">Paid on</p><p class="value">${text(receipt.formattedPaidAt || receipt.paidAt)}</p></div>
      <div><p class="label">Amount</p><p class="value">${amount}</p></div>
      <div><p class="label">Status</p><p class="value">${text(receipt.status)}</p></div>
      <div><p class="label">Payment method</p><p class="value">${text(receipt.paymentMethod)}</p></div>
      <div><p class="label">Transaction ID</p><p class="value">${text(receipt.bdTransactionId)}</p></div>
      <div><p class="label">Order ID</p><p class="value">${text(receipt.bdOrderId)}</p></div>
      <div><p class="label">Payer name</p><p class="value">${text(receipt.payerName)}</p></div>
      <div><p class="label">Payer email</p><p class="value">${text(receipt.payerEmail)}</p></div>
      <div><p class="label">Payer mobile</p><p class="value">${text(receipt.payerMobile)}</p></div>
      ${application ? `
      <div><p class="label">Application number</p><p class="value">${text(application.applicationNumber)}</p></div>
      <div><p class="label">Candidate name</p><p class="value">${text(application.candidateName)}</p></div>
      <div><p class="label">Post name</p><p class="value">${text(application.postName)}</p></div>
      <div><p class="label">Bank name</p><p class="value">${text(application.bankName)}</p></div>
      ` : ''}
    </div>
  </body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

export function TicketDetail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{value}</p>
        </div>
    );
}

export function SummaryCard({
    label,
    value,
    detail,
    tone,
}: {
    label: string;
    value: string;
    detail: string;
    tone: SummaryTone;
}) {
    const toneClassName = SUMMARY_TONE_CLASS_NAMES[tone];

    return (
        <div className={`rounded-3xl p-6 ${toneClassName}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{detail}</p>
        </div>
    );
}
