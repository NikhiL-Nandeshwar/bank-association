import { APPLICATION_INPUT_CLASS_NAME, EDUCATION_TEMPLATE, EMPTY_LANGUAGE_SKILLS, LanguageSkills, SUMMARY_TONE_CLASS_NAMES, SummaryTone } from "@/constants/application-wizard.constants";
import { EligibilityCriteria, MasterItem, MasterListResponse } from "@/types/api.types";
import { ApplicationWizardProps, ExperienceEntry, FormState, MasterOption, SaveStep3Payload, SaveStepExperiencePayload } from "@/types/applicationSteps";

const EDUCATION_CRITERION_LEVEL_MAP: Record<string, string> = {
    SSC_10TH: 'SSC / 10th',
    HSC_12TH: 'HSC / 12th',
    GRADUATION: 'Graduation',
    POST_GRADUATION: 'Post Graduation',
    DIPLOMA: 'Diploma',
};

export type ErrorMap = Partial<Record<keyof FormState, string>>;

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
    city: '',
    state: '',
    subCaste: '',
    pincode: '',
    languageSkills: structuredClone(EMPTY_LANGUAGE_SKILLS),
    educationEntries: structuredClone(EDUCATION_TEMPLATE),
    experienceLevel: '',
    experienceEntries: [{ organization: '', designation: '', location: '', fromDate: '', toDate: '', isCurrentJob: false }],
    keySkills: '',
    aadhaarNumber: '',
    panNumber: '',
    resumeLink: '',
    portfolioLink: '',
    preferredLocation: '',
    noticePeriod: '',
    relocate: '',
    acceptedEligibilityCriteria: {},
    declarationAccepted: false,
    paymentMethod: 'UPI',
    paymentStatus: '',
    transactionNumber: '',
    paymentDate: '',
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

export function buildSaveStep3Payload(form: FormState, applicationId: number): SaveStep3Payload {
    return {
        applicationId,
        educations: form.educationEntries.map((entry, index) => ({
            educationId: entry.educationId ?? 0,
            educationLevel: entry.level,
            specialization: fieldValue(entry.specialization).trim(),
            organizationName: fieldValue(entry.institute).trim() || fieldValue(entry.board).trim(),
            percentageOrCGPA: Number(fieldValue(entry.score)) || 0,
            className: fieldValue(entry.className).trim(),
            passedMonthYear: fieldValue(entry.passedMonthYear).trim(),
            passedDate: toIsoDateString(fieldValue(entry.passedDate)),
            sortOrder: entry.sortOrder ?? index,
        })),
    };
}

export function buildSaveStepExperiencePayload(form: FormState, applicationId: number): SaveStepExperiencePayload {
    if (form.experienceLevel === 'fresher') {
        return {
            applicationId,
            experiences: [],
        };
    }

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
                toDate: entry.isCurrentJob ? null : toIsoDateString(fieldValue(entry.toDate)),
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

export function validateStep(step: number, form: FormState, eligibilityCriteria?: EligibilityCriteria[]): ErrorMap {
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
        if (!fieldValue(form.lastName).trim()) errors.lastName = 'Last name is required.';
        if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
        if (!fieldValue(form.ageAsOn).trim()) errors.ageAsOn = 'Age as on date is required.';
        if (!form.gender) errors.gender = 'Please select a gender.';
        if (!form.category) errors.category = 'Please select a category.';
        if (!fieldValue(form.caste).trim()) errors.caste = 'Caste is required.';
        if (!fieldValue(form.subCaste).trim()) errors.subCaste = 'Sub caste is required.';
        if (!fieldValue(form.religion).trim()) errors.religion = 'Religion is required.';
        if (!form.maharashtraDomiciled) errors.maharashtraDomiciled = 'Please select domicile status.';
        if (!form.nonCreamyLayer) errors.nonCreamyLayer = 'Please select non-creamy layer status.';
        if (!form.maritalStatus) errors.maritalStatus = 'Please select marital status.';
        if (form.maritalStatus === 'Married' && !fieldValue(form.husbandsName).trim()) {
            errors.husbandsName = 'Spouse name is required.';
        }
        if (!fieldValue(form.mothersName).trim()) errors.mothersName = "Mother's name is required.";
        if (!fieldValue(form.fathersName).trim()) errors.fathersName = "Father's name is required.";
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
        if (!fieldValue(form.addressLine1).trim()) errors.addressLine1 = 'Address line 1 is required.';
        if (!fieldValue(form.country).trim()) errors.country = 'Country is required.';
        if (!fieldValue(form.taluka).trim()) errors.taluka = 'Taluka is required.';
        if (!fieldValue(form.district).trim()) errors.district = 'District is required.';
        if (!fieldValue(form.city).trim()) errors.city = 'City is required.';
        if (!fieldValue(form.state).trim()) errors.state = 'State is required.';
        if (!/^\d{6}$/.test(fieldValue(form.pincode))) errors.pincode = 'Enter a valid 6-digit pincode.';
        if (!hasLanguageSelected(form.languageSkills)) errors.languageSkills = 'Select at least one language ability.';
    }

    if (step === 4) {
        if (!form.experienceLevel) errors.experienceLevel = 'Please select your experience level.';
        if (form.experienceLevel !== 'fresher' && !hasExperienceDetails(form.experienceEntries)) {
            errors.experienceEntries = 'Add at least one complete experience row.';
        }
        if (!fieldValue(form.keySkills).trim()) errors.keySkills = 'Key skills are required.';
    }

    if (step === 5) {
        if (!/^\d{12}$/.test(fieldValue(form.aadhaarNumber))) errors.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number.';
        if (!/^[A-Z]{5}\d{4}[A-Z]$/i.test(fieldValue(form.panNumber))) errors.panNumber = 'Enter a valid PAN number.';
        if (!fieldValue(form.resumeLink).trim()) {
            errors.resumeLink = 'Resume link is required.';
        } else if (!/^https?:\/\//.test(fieldValue(form.resumeLink))) {
            errors.resumeLink = 'Resume link should start with http:// or https://';
        }

        if (form.portfolioLink && !/^https?:\/\//.test(fieldValue(form.portfolioLink))) {
            errors.portfolioLink = 'Portfolio link should start with http:// or https://';
        }

        if (!fieldValue(form.preferredLocation).trim()) errors.preferredLocation = 'Preferred location is required.';
        if (!fieldValue(form.noticePeriod).trim()) errors.noticePeriod = 'Notice period is required.';
        if (!form.relocate) errors.relocate = 'Please choose a relocation preference.';
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{value}</p>
        </div>
    );
}

export function HallTicketPreview({ form, fullName }: { form: FormState; fullName: string }) {
    const examDate = '18 May 2026';
    const examTime = '10:30 AM to 12:30 PM';
    const reportingTime = '09:30 AM';
    const venue = form.preferredLocation
        ? `District Cooperative Training Centre, ${form.preferredLocation}`
        : 'District Cooperative Training Centre, Kolhapur';

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

                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                        <TicketDetail label="Exam venue" value={venue} />
                        <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
                            Carry a printed hall ticket, original photo ID, and one passport-size photograph. Entry closes 15 minutes before exam time.
                        </p>
                    </div>
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
