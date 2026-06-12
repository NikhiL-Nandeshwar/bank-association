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

export function mapEducationEntries(
    existingEntries: FormState['educationEntries'],
    educationStep: any[] = [],
) {
    return existingEntries.map((entry) => {
        const apiEducation = educationStep.find(
            (item) =>
                item.educationLevel === entry.level,
        );

        if (!apiEducation) {
            return entry;
        }

        return {
            ...entry,
            institute:
                apiEducation.organizationName ?? '',
            educationLevel:
                apiEducation.educationLevel ?? '',
            specialization:
                apiEducation.specialization ?? '',
            score:
                apiEducation.percentageOrCGPA > 0
                    ? String(apiEducation.percentageOrCGPA)
                    : '',
            className:
                apiEducation.className ?? '',
            passedMonthYear:
                apiEducation.passedMonthYear
                    ? (() => {
                        const [month, year] =
                            apiEducation.passedMonthYear.split('/');

                        return `${year}-${month}`;
                    })()
                    : '',
            passedDate: apiEducation.passedDate
                ? apiEducation.passedDate.split('T')[0]
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