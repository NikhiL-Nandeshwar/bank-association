/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateAgeAsOn } from '@/components/recruitment/helper/applicationStepsHelper';
import type { FormState } from '@/types/applicationSteps';

export function mapDocuments(documentStep: any[]) {
    const mappedDocuments: Record<string, any> = {};

    documentStep?.forEach((doc) => {
        switch (doc.documentType) {
            case 'Photo':
                mappedDocuments.photo = doc;
                break;

            case 'Signature':
                mappedDocuments.signature = doc;
                break;

            case 'Aadhaar':
                mappedDocuments.aadhaar = doc;
                break;

            case 'SSC_MARKSHEET':
                mappedDocuments.sscMarksheet = doc;
                break;

            case 'HSC_MARKSHEET':
                mappedDocuments.hscMarksheet = doc;
                break;

            case 'DEGREE':
                mappedDocuments.degree = doc;
                break;

            case 'MSCIT_CERTIFICATE':
                mappedDocuments.mscitCertificate = doc;
                break;

            case 'CCC_CERTIFICATE':
                mappedDocuments.cccCertificate = doc;
                break;
        }
    });

    return mappedDocuments;
}

type SupportedLanguage =
    keyof FormState['languageSkills'];

function isSupportedLanguage(
    value: string
): value is SupportedLanguage {
    return [
        'marathi',
        'hindi',
        'english',
    ].includes(value);
}

export function mapLanguageSkills(
    existingLanguageSkills: FormState['languageSkills'],
    languages: any[] = [],
) {
    const languageSkills = {
        ...existingLanguageSkills,
    };

    languages.forEach((language) => {
        const languageName =
            language.languageName?.toLowerCase();

        if (
            languageName &&
            isSupportedLanguage(languageName)
        ) {
            languageSkills[languageName] = {
                read: language.canRead,
                write: language.canWrite,
                speak: language.canSpeak,
            };
        }
    });

    return languageSkills;
}

const EDUCATION_CATEGORY_ALIASES: Record<string, string> = {
    SSC_10TH: 'SSC / 10th',
    'SSC / 10TH': 'SSC / 10th',
    'SSC/10TH': 'SSC / 10th',
    HSC_12TH: 'HSC / 12th',
    'HSC / 12TH': 'HSC / 12th',
    'HSC/12TH': 'HSC / 12th',
    GRADUATION: 'Graduation',
    POST_GRADUATION: 'Post Graduation',
    POSTGRADUATION: 'Post Graduation',
    DIPLOMA: 'Diploma',
    COMPUTER_CERTIFICATION: 'Computer Certification',
    'COMPUTER CERTIFICATION': 'Computer Certification',
};

function unwrapEducationList(educationStep: unknown): any[] {
    if (Array.isArray(educationStep)) {
        return educationStep;
    }

    if (educationStep && typeof educationStep === 'object') {
        const record = educationStep as Record<string, unknown>;
        if (Array.isArray(record.educations)) return record.educations;
        if (Array.isArray(record.education)) return record.education;
        if (Array.isArray(record.items)) return record.items;
        if (Array.isArray(record.step2)) return record.step2;
    }

    return [];
}

function normalizeEducationCategory(value: unknown): string {
    if (typeof value !== 'string') {
        return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }

    return EDUCATION_CATEGORY_ALIASES[trimmed.toUpperCase()] ?? trimmed;
}

function toMonthInputValue(passedMonthYear?: string): string {
    if (!passedMonthYear?.trim()) {
        return '';
    }

    const value = passedMonthYear.trim();
    if (/^\d{4}-\d{2}$/.test(value)) {
        return value;
    }

    const [month, year] = value.split('/');
    if (month && year) {
        return `${year}-${month.padStart(2, '0')}`;
    }

    return '';
}

function findEducationMatchIndex(
    entry: FormState['educationEntries'][number],
    entryIndex: number,
    apiEducations: any[],
    usedIndexes: Set<number>,
) {
    const byCategory = apiEducations.findIndex((item, itemIndex) => {
        if (usedIndexes.has(itemIndex)) {
            return false;
        }

        const category = normalizeEducationCategory(
            item.educationCategory ?? item.category ?? item.level,
        );

        return Boolean(category) && category === entry.level;
    });

    if (byCategory !== -1) {
        return byCategory;
    }

    const bySortOrder = apiEducations.findIndex((item, itemIndex) => {
        if (usedIndexes.has(itemIndex)) {
            return false;
        }

        const sortOrder = item.sortOrder ?? item.SortOrder;
        return typeof sortOrder === 'number' && sortOrder === entryIndex;
    });

    if (bySortOrder !== -1) {
        return bySortOrder;
    }

    // Legacy records stored the UI card name in educationLevel.
    return apiEducations.findIndex((item, itemIndex) => {
        if (usedIndexes.has(itemIndex)) {
            return false;
        }

        return normalizeEducationCategory(item.educationLevel) === entry.level;
    });
}

export function mapEducationEntries(
    existingEntries: FormState['educationEntries'],
    educationStep: unknown = [],
) {
    const apiEducations = unwrapEducationList(educationStep);
    const usedIndexes = new Set<number>();

    return existingEntries.map((entry, entryIndex) => {
        const matchIndex = findEducationMatchIndex(
            entry,
            entryIndex,
            apiEducations,
            usedIndexes,
        );

        if (matchIndex === -1) {
            return entry;
        }

        usedIndexes.add(matchIndex);
        const apiEducation = apiEducations[matchIndex];
        const percentageOrCGPA =
            apiEducation.percentageOrCGPA ?? apiEducation.percentageOrCgpa;

        return {
            ...entry,
            educationId: apiEducation.educationId ?? apiEducation.id ?? entry.educationId,
            sortOrder: apiEducation.sortOrder ?? entryIndex,
            institute:
                apiEducation.organizationName ?? apiEducation.institute ?? '',
            educationLevel: apiEducation.educationLevel ?? '',
            specialization: apiEducation.specialization ?? '',
            score:
                Number(percentageOrCGPA) > 0 ? String(percentageOrCGPA) : '',
            className: apiEducation.className ?? '',
            passedMonthYear: toMonthInputValue(
                apiEducation.passedMonthYear ?? apiEducation.passedMonthAndYear,
            ),
            passedDate: apiEducation.passedDate
                ? String(apiEducation.passedDate).split('T')[0]
                : '',
        };
    });
}

export function mapExperienceEntries(
    existingEntries: FormState['experienceEntries'],
    experienceStep: any[] = [],
) {
    if (!experienceStep?.length) {
        return existingEntries;
    }

    return experienceStep.map((item) => ({
        organization:
            item.organizationName ?? '',
        designation:
            item.designation ?? '',
        location:
            item.location ?? '',
        fromDate: item.fromDate
            ? item.fromDate.split('T')[0]
            : '',
        toDate: item.toDate
            ? item.toDate.split('T')[0]
            : '',
        isCurrentJob:
            item.isCurrentJob ?? false,
    }));
}

export function mapStep1ToFormState(
    prev: FormState,
    step1: any,
    educationStep: any[],
    experienceStep: any[],
    userEmail?: string,
): FormState {
    const [firstName = '', ...rest] =
        step1.fullName?.split(' ') ?? [];

    const dateOfBirth =
        step1.dateOfBirth?.split('T')[0] ?? '';

    return {
        ...prev,

        firstName,
        lastName: rest.join(' '),

        dateOfBirth,
        ageAsOn: calculateAgeAsOn(dateOfBirth),

        gender: step1.gender ?? '',
        aadhaarNumber:
            step1.aadhaarNumber ?? '',

        category: String(
            step1.categoryId ?? '',
        ),
        religion: String(
            step1.religionId ?? '',
        ),
        caste: String(
            step1.casteId ?? '',
        ),
        subCaste: String(
            step1.subCasteId ?? '',
        ),

        maharashtraDomiciled:
            step1.isMahaDomiciled
                ? 'Yes'
                : 'No',

        nonCreamyLayer:
            step1.isNonCreamyLayer
                ? 'Yes'
                : 'No',

        nationalityIndian:
            step1.nationalityId === 1
                ? 'Yes'
                : 'No',

        maritalStatus:
            step1.maritalStatus ?? '',

        fathersName:
            step1.fathersName ?? '',

        mothersName:
            step1.mothersName ?? '',

        husbandsName:
            step1.husbandsName ?? '',

        phone:
            step1.mobileNumber ?? '',

        alternatePhone:
            step1.alternateNumber ?? '',

        addressLine1:
            step1.addressLine1 ?? '',

        addressLine2:
            step1.addressLine2 ?? '',

        addressLine3:
            step1.addressLine3 ?? '',

        pincode:
            step1.pinCode ?? '',

        country: String(
            step1.countryId ?? '',
        ),

        state: String(
            step1.stateId ?? '',
        ),

        district: String(
            step1.districtId ?? '',
        ),

        taluka: String(
            step1.talukaId ?? '',
        ),

        email: userEmail ?? '',

        languageSkills: mapLanguageSkills(
            prev.languageSkills,
            step1.languages,
        ),

        educationEntries:
            mapEducationEntries(
                prev.educationEntries,
                educationStep,
            ),

        experienceEntries:
            mapExperienceEntries(
                prev.experienceEntries,
                experienceStep,
            ),
    };
}

function unwrapResumeList(value: unknown): any[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (Array.isArray(record.educations)) return record.educations;
        if (Array.isArray(record.education)) return record.education;
        if (Array.isArray(record.experiences)) return record.experiences;
        if (Array.isArray(record.experience)) return record.experience;
        if (Array.isArray(record.documents)) return record.documents;
        if (Array.isArray(record.items)) return record.items;
    }

    return [];
}

function hasProfileDetails(step1: any): boolean {
    return Boolean(
        step1?.fullName ||
        step1?.aadhaarNumber ||
        step1?.dateOfBirth ||
        step1?.gender ||
        step1?.fathersName,
    );
}

function hasContactDetails(step1: any): boolean {
    return Boolean(
        step1?.mobileNumber ||
        step1?.addressLine1 ||
        step1?.pinCode ||
        step1?.countryId ||
        step1?.stateId,
    );
}

function hasEducationDetailsFromApi(educationStep: unknown): boolean {
    return unwrapResumeList(educationStep).some((item) =>
        Boolean(
            item?.educationLevel ||
            item?.educationCategory ||
            item?.organizationName ||
            item?.specialization ||
            item?.className ||
            item?.passedMonthYear ||
            Number(item?.percentageOrCGPA ?? item?.percentageOrCgpa) > 0,
        ),
    );
}

function hasExperienceDetailsFromApi(experienceStep: unknown): boolean {
    return unwrapResumeList(experienceStep).some((item) =>
        Boolean(
            item?.organizationName ||
            item?.designation ||
            item?.location ||
            item?.fromDate,
        ),
    );
}

function hasDocumentDetailsFromApi(documentStep: unknown): boolean {
    return unwrapResumeList(documentStep).length > 0;
}

function isApplicationSubmittedOrPaid(resumeData: any): boolean {
    return Boolean(
        resumeData?.isSubmitted ||
        resumeData?.application?.isSubmitted ||
        resumeData?.submitted ||
        resumeData?.isPaymentComplete ||
        resumeData?.payment?.isPaymentComplete ||
        resumeData?.payment?.isComplete ||
        resumeData?.isPaid,
    );
}

export function resolveResumeWizardStep(resumeData: any): number {
    if (!resumeData) {
        return 0;
    }

    if (isApplicationSubmittedOrPaid(resumeData)) {
        return 7;
    }

    const step1 = resumeData.step1;
    const educationStep = resumeData.step2 ?? resumeData.educations ?? resumeData.education;
    const experienceStep = resumeData.step3 ?? resumeData.experiences ?? resumeData.experience;
    const documentStep = resumeData.step4 ?? resumeData.documents;

    let inferredStep = 0;
    if (hasProfileDetails(step1)) inferredStep = 1;
    if (hasContactDetails(step1)) inferredStep = 2;
    if (hasEducationDetailsFromApi(educationStep)) inferredStep = 3;
    if (hasExperienceDetailsFromApi(experienceStep)) inferredStep = 4;
    if (hasDocumentDetailsFromApi(documentStep)) inferredStep = 5;
    if (resumeData.declarationAccepted || resumeData.step5?.declarationAccepted) inferredStep = 6;

    if (inferredStep > 0) {
        return inferredStep;
    }

    // Application was started but personal details are not saved yet — continue from Profile.
    if (Number(resumeData.currentStep) >= 1) {
        return 1;
    }

    return 0;
}