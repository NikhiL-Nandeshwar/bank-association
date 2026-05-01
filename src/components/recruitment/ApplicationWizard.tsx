'use client';

import {
  APPLICATION_INPUT_CLASS_NAME,
  APPLICATION_STEPS,
  EDUCATION_TEMPLATE,
  EMPTY_LANGUAGE_SKILLS,
  LANGUAGE_ABILITIES,
  LANGUAGE_NAMES,
  SUMMARY_TONE_CLASS_NAMES,
  type EducationEntry,
  type LanguageAbility,
  type LanguageName,
  type LanguageSkills,
  type SummaryTone,
} from '@/constants/application-wizard.constants';
import { useMemo, useState } from 'react';

type ApplicationWizardProps = {
  initialRecruitment: {
    code: string;
    name: string;
    postName?: string;
  };
};

type ExperienceEntry = {
  organization: string;
  designation: string;
  location: string;
  totalService: string;
};

type FormState = {
  recruitmentCode: string;
  recruitmentName: string;
  applicationId: string;
  bankName: string;
  postName: string;
  employmentType: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ageAsOn: string;
  gender: string;
  category: string;
  caste: string;
  religion: string;
  maharashtraDomiciled: string;
  nonCreamyLayer: string;
  maritalStatus: string;
  spouseName: string;
  motherName: string;
  nationalityIndian: string;
  email: string;
  phone: string;
  alternatePhone: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  taluka: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  languageSkills: LanguageSkills;
  educationEntries: EducationEntry[];
  experienceLevel: string;
  experienceEntries: ExperienceEntry[];
  keySkills: string;
  aadhaarNumber: string;
  panNumber: string;
  resumeLink: string;
  portfolioLink: string;
  preferredLocation: string;
  noticePeriod: string;
  relocate: string;
  declarationAccepted: boolean;
  paymentMethod: string;
  paymentStatus: string;
  transactionNumber: string;
  paymentDate: string;
};

function generateApplicationId(recruitment: ApplicationWizardProps['initialRecruitment']) {
  const code = recruitment.code.replace(/[^a-z0-9]/gi, '').toUpperCase() || 'REC';
  return `APP-${code}-2026`;
}

const initialState = (recruitment: ApplicationWizardProps['initialRecruitment']): FormState => ({
  recruitmentCode: recruitment.code,
  recruitmentName: recruitment.name,
  applicationId: generateApplicationId(recruitment),
  bankName: 'The Malegaon Merchants Co-op. Bank Ltd.',
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
  spouseName: '',
  motherName: '',
  nationalityIndian: 'Yes',
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
  pincode: '',
  languageSkills: structuredClone(EMPTY_LANGUAGE_SKILLS),
  educationEntries: structuredClone(EDUCATION_TEMPLATE),
  experienceLevel: '',
  experienceEntries: [{ organization: '', designation: '', location: '', totalService: '' }],
  keySkills: '',
  aadhaarNumber: '',
  panNumber: '',
  resumeLink: '',
  portfolioLink: '',
  preferredLocation: '',
  noticePeriod: '',
  relocate: '',
  declarationAccepted: false,
  paymentMethod: 'UPI',
  paymentStatus: '',
  transactionNumber: '',
  paymentDate: '',
});

type ErrorMap = Partial<Record<keyof FormState, string>>;

function fieldValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function hasLanguageSelected(skills: LanguageSkills) {
  return Object.values(skills ?? {}).some((language) => Object.values(language).some(Boolean));
}

function hasCompletedEducation(entries: EducationEntry[]) {
  return (entries ?? []).some(
    (entry) =>
      fieldValue(entry.completed) === 'Yes' &&
      fieldValue(entry.institute).trim() &&
      fieldValue(entry.board).trim() &&
      fieldValue(entry.score).trim() &&
      fieldValue(entry.passedMonthYear).trim(),
  );
}

function hasExperienceDetails(entries: ExperienceEntry[]) {
  return (entries ?? []).some(
    (entry) =>
      fieldValue(entry.organization).trim() &&
      fieldValue(entry.designation).trim() &&
      fieldValue(entry.location).trim() &&
      fieldValue(entry.totalService).trim(),
  );
}

function validateStep(step: number, form: FormState): ErrorMap {
  const errors: ErrorMap = {};

  if (step === 0) {
    if (!fieldValue(form.recruitmentCode).trim()) errors.recruitmentCode = 'Recruitment code is required.';
    if (!fieldValue(form.recruitmentName).trim()) errors.recruitmentName = 'Recruitment name is required.';
    if (!fieldValue(form.applicationId).trim()) errors.applicationId = 'Application ID is required.';
    if (!fieldValue(form.bankName).trim()) errors.bankName = 'Bank name is required.';
    if (!fieldValue(form.postName).trim()) errors.postName = 'Post name is required.';
  }

  if (step === 1) {
    if (!fieldValue(form.firstName).trim()) errors.firstName = 'First name is required.';
    if (!fieldValue(form.lastName).trim()) errors.lastName = 'Last name is required.';
    if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
    if (!fieldValue(form.ageAsOn).trim()) errors.ageAsOn = 'Age as on date is required.';
    if (!form.gender) errors.gender = 'Please select a gender.';
    if (!form.category) errors.category = 'Please select a category.';
    if (!fieldValue(form.caste).trim()) errors.caste = 'Caste is required.';
    if (!fieldValue(form.religion).trim()) errors.religion = 'Religion is required.';
    if (!form.maharashtraDomiciled) errors.maharashtraDomiciled = 'Please select domicile status.';
    if (!form.nonCreamyLayer) errors.nonCreamyLayer = 'Please select non-creamy layer status.';
    if (!form.maritalStatus) errors.maritalStatus = 'Please select marital status.';
    if (!fieldValue(form.spouseName).trim()) errors.spouseName = 'Spouse name is required.';
    if (!fieldValue(form.motherName).trim()) errors.motherName = "Mother's name is required.";
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
    if (!fieldValue(form.taluka).trim()) errors.taluka = 'Taluka is required.';
    if (!fieldValue(form.district).trim()) errors.district = 'District is required.';
    if (!fieldValue(form.city).trim()) errors.city = 'City is required.';
    if (!fieldValue(form.state).trim()) errors.state = 'State is required.';
    if (!/^\d{6}$/.test(fieldValue(form.pincode))) errors.pincode = 'Enter a valid 6-digit pincode.';
    if (!hasLanguageSelected(form.languageSkills)) errors.languageSkills = 'Select at least one language ability.';
  }

  if (step === 3 && !hasCompletedEducation(form.educationEntries)) {
    errors.educationEntries = 'Add at least one completed education row with institute, board, score, and passing month/year.';
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

function generateTransactionNumber() {
  return `DEMO${Date.now().toString().slice(-10)}`;
}

function calculateAgeAsOn(dateOfBirth: string) {
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

function normalizeFormState(
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
    })),
    experienceEntries: experienceEntries.map((entry) => ({
      organization: fieldValue(entry.organization),
      designation: fieldValue(entry.designation),
      location: fieldValue(entry.location),
      totalService: fieldValue(entry.totalService),
    })),
  };
}

export default function ApplicationWizard({ initialRecruitment }: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setForm] = useState<FormState>(() => initialState(initialRecruitment));
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHallTicket, setShowHallTicket] = useState(false);

  const form = useMemo(
    () => normalizeFormState(initialRecruitment, formState),
    [formState, initialRecruitment],
  );

  const progress = useMemo(
    () => `${Math.round(((currentStep + 1) / APPLICATION_STEPS.length) * 100)}%`,
    [currentStep],
  );

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateDateOfBirth = (dateOfBirth: string) => {
    setForm((prev) => ({
      ...prev,
      dateOfBirth,
      ageAsOn: calculateAgeAsOn(dateOfBirth),
    }));
    setErrors((prev) => ({ ...prev, dateOfBirth: undefined, ageAsOn: undefined }));
  };

  const updateEducation = <K extends keyof EducationEntry>(index: number, field: K, value: EducationEntry[K]) => {
    setForm((prev) => ({
      ...prev,
      educationEntries: prev.educationEntries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
    setErrors((prev) => ({ ...prev, educationEntries: undefined }));
  };

  const updateExperience = <K extends keyof ExperienceEntry>(index: number, field: K, value: ExperienceEntry[K]) => {
    setForm((prev) => ({
      ...prev,
      experienceEntries: prev.experienceEntries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    }));
    setErrors((prev) => ({ ...prev, experienceEntries: undefined }));
  };

  const addExperienceRow = () => {
    setForm((prev) => ({
      ...prev,
      experienceEntries: [...prev.experienceEntries, { organization: '', designation: '', location: '', totalService: '' }],
    }));
  };

  const toggleLanguage = (language: LanguageName, ability: LanguageAbility) => {
    setForm((prev) => ({
      ...prev,
      languageSkills: {
        ...prev.languageSkills,
        [language]: {
          ...prev.languageSkills[language],
          [ability]: !prev.languageSkills[language][ability],
        },
      },
    }));
    setErrors((prev) => ({ ...prev, languageSkills: undefined }));
  };

  const goNext = () => {
    const nextErrors = validateStep(currentStep, form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, APPLICATION_STEPS.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleDemoPayment = () => {
    const transactionNumber = generateTransactionNumber();

    setForm((prev) => ({
      ...prev,
      paymentStatus: 'Payment successful',
      transactionNumber,
      paymentDate: new Date().toLocaleDateString('en-IN'),
    }));
    setSubmitted(true);
  };

  const step = APPLICATION_STEPS[currentStep];

  if (submitted) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
            <div className="bg-slate-800 px-8 py-10 text-white">
              <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                Application received
              </span>
              <h1 className="mt-4 text-3xl font-semibold">Your application and demo payment are complete.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                We captured your details for {form.recruitmentCode}. The recruitment desk can now review your profile and payment reference.
              </p>
            </div>
            <div className="grid gap-6 px-8 py-8 md:grid-cols-3">
              <SummaryCard label="Applied post" value={form.postName || form.recruitmentCode} detail={form.bankName} tone="slate" />
              <SummaryCard label="Primary contact" value={fullName || 'Applicant'} detail={`${form.email} | ${form.phone}`} tone="amber" />
              <SummaryCard label="Payment" value={form.paymentStatus || 'Payment successful'} detail={form.transactionNumber} tone="emerald" />
            </div>
            <div className="border-t border-slate-100 px-8 pb-8">
              <button
                type="button"
                onClick={() => setShowHallTicket((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {showHallTicket ? 'Hide hall ticket' : 'View hall ticket'}
              </button>
            </div>
          </div>

          {showHallTicket ? <HallTicketPreview form={form} fullName={fullName || 'Applicant'} /> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[radial-gradient(circle_at_top,_rgba(252,214,46,0.18),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] py-10 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-slate-200 bg-slate-800 p-6 text-white shadow-[0_25px_70px_rgba(15,23,42,0.2)]">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            Recruitment portal
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">Bank recruitment application</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            A guided flow for profile details, education, experience, documents, review, and payment.
          </p>

          <div className="mt-8 rounded-3xl bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
              <span>Progress</span>
              <span>{progress}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-300 transition-all duration-300"
                style={{ width: progress }}
              />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {APPLICATION_STEPS.map((item, index) => {
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border px-4 py-4 transition ${
                    isActive
                      ? 'border-amber-300 bg-amber-300/10'
                      : isDone
                        ? 'border-emerald-400/20 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                        isActive
                          ? 'bg-amber-300 text-slate-900'
                          : isDone
                            ? 'bg-emerald-400 text-slate-900'
                            : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {isDone ? 'OK' : item.id}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-6 text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] md:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Step {currentStep + 1} of {APPLICATION_STEPS.length}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected recruitment</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{form.recruitmentCode}</p>
              <p className="mt-1 max-w-sm text-sm text-slate-600">{form.recruitmentName}</p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {currentStep === 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Application ID" error={errors.applicationId}>
                  <input
                    value={form.applicationId}
                    disabled
                    className={`${APPLICATION_INPUT_CLASS_NAME} cursor-not-allowed bg-slate-100 text-slate-500`}
                    placeholder="Generated automatically"
                  />
                </FormField>
                <FormField label="Recruitment code" error={errors.recruitmentCode}>
                  <input value={form.recruitmentCode} onChange={(event) => updateField('recruitmentCode', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="KM-016" />
                </FormField>
                <FormField label="Bank name" error={errors.bankName}>
                  <input value={form.bankName} onChange={(event) => updateField('bankName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Post name" error={errors.postName}>
                  <input value={form.postName} onChange={(event) => updateField('postName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Clerk / Officer / Assistant" />
                </FormField>
                <FormField label="Employment type">
                  <select value={form.employmentType} onChange={(event) => updateField('employmentType', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME}>
                    <option value="full-time">Full-time</option>
                    <option value="contract">Contract</option>
                    <option value="trainee">Trainee</option>
                  </select>
                </FormField>
                <FormField label="Recruitment title" error={errors.recruitmentName}>
                  <textarea value={form.recruitmentName} onChange={(event) => updateField('recruitmentName', event.target.value)} className={`${APPLICATION_INPUT_CLASS_NAME} min-h-32`} placeholder="Name of the recruitment" />
                </FormField>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="First name" error={errors.firstName}>
                  <input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Last name" error={errors.lastName}>
                  <input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Date of birth" error={errors.dateOfBirth}>
                  <input type="date" value={form.dateOfBirth} onChange={(event) => updateDateOfBirth(event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Age as on today" error={errors.ageAsOn}>
                  <input
                    value={form.ageAsOn}
                    disabled
                    className={`${APPLICATION_INPUT_CLASS_NAME} cursor-not-allowed bg-slate-100 text-slate-500`}
                    placeholder="Calculated after date of birth"
                  />
                </FormField>
                <FormField label="Gender" error={errors.gender}>
                  <select value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>
                <FormField label="Category" error={errors.category}>
                  <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME}>
                    <option value="">Select category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </FormField>
                <FormField label="Caste" error={errors.caste}>
                  <input value={form.caste} onChange={(event) => updateField('caste', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Religion" error={errors.religion}>
                  <input value={form.religion} onChange={(event) => updateField('religion', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Maharashtra domiciled?" error={errors.maharashtraDomiciled}>
                  <YesNoButtons value={form.maharashtraDomiciled} onChange={(value) => updateField('maharashtraDomiciled', value)} />
                </FormField>
                <FormField label="Non-creamy layer?" error={errors.nonCreamyLayer}>
                  <YesNoButtons value={form.nonCreamyLayer} onChange={(value) => updateField('nonCreamyLayer', value)} />
                </FormField>
                <FormField label="Marital status" error={errors.maritalStatus}>
                  <select value={form.maritalStatus} onChange={(event) => updateField('maritalStatus', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME}>
                    <option value="">Select marital status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>
                <FormField label="Nationality / Citizenship Indian?" error={errors.nationalityIndian}>
                  <YesNoButtons value={form.nationalityIndian} onChange={(value) => updateField('nationalityIndian', value)} />
                </FormField>
                <FormField label="Spouse name" error={errors.spouseName}>
                  <input value={form.spouseName} onChange={(event) => updateField('spouseName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Mother's name" error={errors.motherName}>
                  <input value={form.motherName} onChange={(event) => updateField('motherName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Email address" error={errors.email}>
                    <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="Mobile number" error={errors.phone}>
                    <input value={form.phone} onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} className={APPLICATION_INPUT_CLASS_NAME} placeholder="10-digit number" />
                  </FormField>
                  <FormField label="Alternate phone" error={errors.alternatePhone}>
                    <input value={form.alternatePhone} onChange={(event) => updateField('alternatePhone', event.target.value.replace(/\D/g, '').slice(0, 10))} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Optional" />
                  </FormField>
                  <FormField label="Pincode" error={errors.pincode}>
                    <input value={form.pincode} onChange={(event) => updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="Address line 1" error={errors.addressLine1}>
                    <input value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="Address line 2">
                    <input value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="Address line 3">
                    <input value={form.addressLine3} onChange={(event) => updateField('addressLine3', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="Taluka" error={errors.taluka}>
                    <input value={form.taluka} onChange={(event) => updateField('taluka', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="District" error={errors.district}>
                    <input value={form.district} onChange={(event) => updateField('district', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="City" error={errors.city}>
                    <input value={form.city} onChange={(event) => updateField('city', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                  <FormField label="State" error={errors.state}>
                    <input value={form.state} onChange={(event) => updateField('state', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                  </FormField>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">Language known</p>
                  <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <div className="grid grid-cols-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <span>Language</span>
                      <span>Read</span>
                      <span>Write</span>
                      <span>Speak</span>
                    </div>
                    {LANGUAGE_NAMES.map((language) => (
                      <div key={language} className="grid grid-cols-4 items-center border-t border-slate-100 px-4 py-3 text-sm text-slate-700">
                        <span className="font-semibold capitalize">{language}</span>
                        {LANGUAGE_ABILITIES.map((ability) => (
                          <label key={ability} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={form.languageSkills[language][ability]}
                              onChange={() => toggleLanguage(language, ability)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                  {errors.languageSkills ? <p className="mt-2 text-sm text-rose-600">{errors.languageSkills}</p> : null}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                {form.educationEntries.map((entry, index) => (
                  <div key={entry.level} className="rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <h3 className="text-base font-semibold text-slate-900">{entry.level}</h3>
                      <select value={entry.completed} onChange={(event) => updateEducation(index, 'completed', event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-900">
                        <option value="">Completed?</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <input value={entry.institute} onChange={(event) => updateEducation(index, 'institute', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="School / University / Institute" />
                      <input value={entry.board} onChange={(event) => updateEducation(index, 'board', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Board / University" />
                      <input value={entry.specialization} onChange={(event) => updateEducation(index, 'specialization', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Specialization" />
                      <input value={entry.score} onChange={(event) => updateEducation(index, 'score', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Percentage / CGPA" />
                      <input value={entry.className} onChange={(event) => updateEducation(index, 'className', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Class / Grade" />
                      <input value={entry.passedMonthYear} onChange={(event) => updateEducation(index, 'passedMonthYear', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Passed month & year" />
                    </div>
                  </div>
                ))}
                {errors.educationEntries ? <p className="text-sm text-rose-600">{errors.educationEntries}</p> : null}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Experience level" error={errors.experienceLevel}>
                    <select value={form.experienceLevel} onChange={(event) => updateField('experienceLevel', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME}>
                      <option value="">Select experience level</option>
                      <option value="fresher">Fresher</option>
                      <option value="junior">0-2 years</option>
                      <option value="mid">3-5 years</option>
                      <option value="senior">6+ years</option>
                    </select>
                  </FormField>
                  <FormField label="Key banking or operational skills" error={errors.keySkills}>
                    <textarea value={form.keySkills} onChange={(event) => updateField('keySkills', event.target.value)} className={`${APPLICATION_INPUT_CLASS_NAME} min-h-32`} placeholder="Core banking, audit support, branch operations, MIS, customer handling..." />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-800">Experience details</p>
                    <button type="button" onClick={addExperienceRow} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                      Add row
                    </button>
                  </div>
                  {form.experienceEntries.map((entry, index) => (
                    <div key={index} className="grid gap-4 rounded-[1.5rem] border border-slate-200 p-5 md:grid-cols-2">
                      <input value={entry.organization} onChange={(event) => updateExperience(index, 'organization', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Organization name" />
                      <input value={entry.designation} onChange={(event) => updateExperience(index, 'designation', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Designation" />
                      <input value={entry.location} onChange={(event) => updateExperience(index, 'location', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Location" />
                      <input value={entry.totalService} onChange={(event) => updateExperience(index, 'totalService', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Total service" />
                    </div>
                  ))}
                  {errors.experienceEntries ? <p className="text-sm text-rose-600">{errors.experienceEntries}</p> : null}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Aadhaar number" error={errors.aadhaarNumber}>
                  <input value={form.aadhaarNumber} onChange={(event) => updateField('aadhaarNumber', event.target.value.replace(/\D/g, '').slice(0, 12))} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="PAN number" error={errors.panNumber}>
                  <input value={form.panNumber} onChange={(event) => updateField('panNumber', event.target.value.toUpperCase().slice(0, 10))} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Resume link" error={errors.resumeLink}>
                  <input value={form.resumeLink} onChange={(event) => updateField('resumeLink', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="https://..." />
                </FormField>
                <FormField label="Portfolio / LinkedIn link" error={errors.portfolioLink}>
                  <input value={form.portfolioLink} onChange={(event) => updateField('portfolioLink', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Optional" />
                </FormField>
                <FormField label="Preferred location" error={errors.preferredLocation}>
                  <input value={form.preferredLocation} onChange={(event) => updateField('preferredLocation', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Notice period" error={errors.noticePeriod}>
                  <input value={form.noticePeriod} onChange={(event) => updateField('noticePeriod', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Immediate / 30 days / 60 days" />
                </FormField>
                <FormField label="Willing to relocate?" error={errors.relocate}>
                  <ChoiceButtons choices={['Yes', 'No', 'Open to discussion']} value={form.relocate} onChange={(value) => updateField('relocate', value)} />
                </FormField>
              </div>
            )}

            {currentStep === 6 && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                  <ReviewRow label="Application" value={`${form.applicationId} | ${form.bankName} | ${form.postName}`} />
                  <ReviewRow label="Recruitment" value={`${form.recruitmentCode} - ${form.recruitmentName}`} />
                  <ReviewRow label="Applicant" value={fullName} />
                  <ReviewRow label="Birth details" value={`${form.dateOfBirth} | ${form.ageAsOn} | ${form.gender} | ${form.category} | ${form.caste}`} />
                  <ReviewRow label="Family details" value={`Spouse: ${form.spouseName} | Mother: ${form.motherName} | ${form.maritalStatus}`} />
                  <ReviewRow label="Contact" value={`${form.email} | ${form.phone} | Alt: ${form.alternatePhone || 'NA'}`} />
                  <ReviewRow label="Address" value={`${form.addressLine1}, ${form.addressLine2}, ${form.addressLine3}, ${form.taluka}, ${form.district}, ${form.city}, ${form.state} - ${form.pincode}`} />
                  <ReviewRow label="Education" value={form.educationEntries.filter((entry) => entry.completed === 'Yes').map((entry) => `${entry.level}: ${entry.score} (${entry.passedMonthYear})`).join(' | ') || 'NA'} />
                  <ReviewRow label="Experience" value={form.experienceLevel === 'fresher' ? 'Fresher' : form.experienceEntries.map((entry) => `${entry.designation} at ${entry.organization} (${entry.totalService})`).join(' | ')} />
                  <ReviewRow label="Documents" value={`Aadhaar ending ${form.aadhaarNumber.slice(-4)} | PAN ${form.panNumber}`} />
                  <ReviewRow label="Preferences" value={`${form.preferredLocation} | ${form.noticePeriod} | Relocate: ${form.relocate}`} />
                </div>

                <div className="rounded-[1.75rem] bg-slate-800 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Final declaration</p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    I confirm that the information submitted here is accurate and matches my official records. I understand that the recruitment team may verify these details before shortlisting.
                  </p>
                  <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-200">
                    <input type="checkbox" checked={form.declarationAccepted} onChange={(event) => updateField('declarationAccepted', event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20" />
                    <span>I accept the declaration and want to continue to payment.</span>
                  </label>
                  {errors.declarationAccepted ? <p className="mt-3 text-sm text-rose-300">{errors.declarationAccepted}</p> : null}
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment receipt preview</p>
                  <div className="mt-6 space-y-4">
                    <ReviewRow label="Process name" value={form.recruitmentName} />
                    <ReviewRow label="Post name" value={form.postName} />
                    <ReviewRow label="Application charges" value="650" />
                    <ReviewRow label="GST 18%" value="117" />
                    <ReviewRow label="Amount payable" value="767" />
                    <ReviewRow label="Payment status" value={form.paymentStatus || 'Pending'} />
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-slate-800 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Demo payment</p>
                  <p className="mt-3 text-4xl font-semibold">Rs. 767</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    This is a front-end demo. Clicking pay will generate a mock transaction number and complete the application.
                  </p>
                  <label className="mt-6 block">
                    <span className="text-sm font-semibold text-slate-100">Payment method</span>
                    <select value={form.paymentMethod} onChange={(event) => updateField('paymentMethod', event.target.value)} className={`${APPLICATION_INPUT_CLASS_NAME} border-white/10 bg-white/10 text-white focus:border-amber-200 focus:ring-amber-300/20`}>
                      <option className="text-slate-900" value="UPI">UPI</option>
                      <option className="text-slate-900" value="Debit card">Debit card</option>
                      <option className="text-slate-900" value="Net banking">Net banking</option>
                    </select>
                  </label>
                  <button type="button" onClick={handleDemoPayment} className="mt-6 w-full rounded-full bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400">
                    Pay demo amount
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={goBack} disabled={currentStep === 0} className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40">
              Previous step
            </button>

            {currentStep < APPLICATION_STEPS.length - 1 ? (
              <button type="button" onClick={goNext} className="inline-flex items-center justify-center rounded-full bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400">
                {currentStep === 6 ? 'Continue to payment' : 'Continue to next step'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function FormField({
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

function ChoiceButtons({
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
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            value === choice ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}

function YesNoButtons({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoiceButtons choices={['Yes', 'No']} value={value} onChange={onChange} />;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}

function HallTicketPreview({ form, fullName }: { form: FormState; fullName: string }) {
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

function TicketDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function SummaryCard({
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
