'use client';

import { useMemo, useState } from 'react';

type ApplicationWizardProps = {
  initialRecruitment: {
    code: string;
    name: string;
  };
};

type FormState = {
  recruitmentCode: string;
  recruitmentName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  qualification: string;
  specialization: string;
  institute: string;
  graduationYear: string;
  score: string;
  experienceLevel: string;
  currentEmployer: string;
  currentRole: string;
  experienceYears: string;
  keySkills: string;
  aadhaarNumber: string;
  panNumber: string;
  resumeLink: string;
  portfolioLink: string;
  preferredLocation: string;
  noticePeriod: string;
  expectedSalary: string;
  relocate: string;
  declarationAccepted: boolean;
};

const steps = [
  { id: '01', title: 'Role', description: 'Confirm the recruitment you are applying for.' },
  { id: '02', title: 'Profile', description: 'Tell us who you are.' },
  { id: '03', title: 'Contact', description: 'Add your communication details.' },
  { id: '04', title: 'Education', description: 'Share academic background.' },
  { id: '05', title: 'Experience', description: 'Highlight your work readiness.' },
  { id: '06', title: 'Documents', description: 'Provide IDs and supporting links.' },
  { id: '07', title: 'Review', description: 'Verify everything before submission.' },
] as const;

const inputClassName =
  'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100';

const initialState = (recruitment: ApplicationWizardProps['initialRecruitment']): FormState => ({
  recruitmentCode: recruitment.code,
  recruitmentName: recruitment.name,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  category: '',
  email: '',
  phone: '',
  alternatePhone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  qualification: '',
  specialization: '',
  institute: '',
  graduationYear: '',
  score: '',
  experienceLevel: '',
  currentEmployer: '',
  currentRole: '',
  experienceYears: '',
  keySkills: '',
  aadhaarNumber: '',
  panNumber: '',
  resumeLink: '',
  portfolioLink: '',
  preferredLocation: '',
  noticePeriod: '',
  expectedSalary: '',
  relocate: '',
  declarationAccepted: false,
});

type ErrorMap = Partial<Record<keyof FormState, string>>;

function validateStep(step: number, form: FormState): ErrorMap {
  const errors: ErrorMap = {};

  if (step === 0) {
    if (!form.recruitmentCode.trim()) errors.recruitmentCode = 'Recruitment code is required.';
    if (!form.recruitmentName.trim()) errors.recruitmentName = 'Recruitment name is required.';
  }

  if (step === 1) {
    if (!form.firstName.trim()) errors.firstName = 'First name is required.';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
    if (!form.gender) errors.gender = 'Please select a gender.';
    if (!form.category) errors.category = 'Please select a category.';
  }

  if (step === 2) {
    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!/^\d{10}$/.test(form.phone)) errors.phone = 'Enter a valid 10-digit phone number.';
    if (!form.address.trim()) errors.address = 'Address is required.';
    if (!form.city.trim()) errors.city = 'City is required.';
    if (!form.state.trim()) errors.state = 'State is required.';
    if (!/^\d{6}$/.test(form.pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';
  }

  if (step === 3) {
    if (!form.qualification.trim()) errors.qualification = 'Qualification is required.';
    if (!form.specialization.trim()) errors.specialization = 'Specialization is required.';
    if (!form.institute.trim()) errors.institute = 'Institute name is required.';
    if (!/^\d{4}$/.test(form.graduationYear)) errors.graduationYear = 'Enter a valid year.';
    if (!form.score.trim()) errors.score = 'Score or CGPA is required.';
  }

  if (step === 4) {
    if (!form.experienceLevel) errors.experienceLevel = 'Please select your experience level.';
    if (!form.currentRole.trim()) errors.currentRole = 'Current or last role is required.';
    if (!form.experienceYears.trim()) errors.experienceYears = 'Experience duration is required.';
    if (!form.keySkills.trim()) errors.keySkills = 'Key skills are required.';
  }

  if (step === 5) {
    if (!/^\d{12}$/.test(form.aadhaarNumber)) errors.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number.';
    if (!/^[A-Z]{5}\d{4}[A-Z]$/i.test(form.panNumber)) errors.panNumber = 'Enter a valid PAN number.';
    if (!form.resumeLink.trim()) {
      errors.resumeLink = 'Resume link is required.';
    } else if (!/^https?:\/\//.test(form.resumeLink)) {
      errors.resumeLink = 'Resume link should start with http:// or https://';
    }

    if (form.portfolioLink && !/^https?:\/\//.test(form.portfolioLink)) {
      errors.portfolioLink = 'Portfolio link should start with http:// or https://';
    }

    if (!form.preferredLocation.trim()) errors.preferredLocation = 'Preferred location is required.';
    if (!form.noticePeriod.trim()) errors.noticePeriod = 'Notice period is required.';
    if (!form.expectedSalary.trim()) errors.expectedSalary = 'Expected salary is required.';
    if (!form.relocate) errors.relocate = 'Please choose a relocation preference.';
  }

  if (step === 6 && !form.declarationAccepted) {
    errors.declarationAccepted = 'You need to accept the declaration before submitting.';
  }

  return errors;
}

export default function ApplicationWizard({ initialRecruitment }: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialState(initialRecruitment));
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitted, setSubmitted] = useState(false);

  const progress = useMemo(
    () => `${Math.round(((currentStep + 1) / steps.length) * 100)}%`,
    [currentStep],
  );

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const goNext = () => {
    const nextErrors = validateStep(currentStep, form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    const finalErrors = validateStep(6, form);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setSubmitted(true);
  };

  const step = steps[currentStep];

  if (submitted) {
    return (
      <section className="bg-[radial-gradient(circle_at_top,_rgba(252,214,46,0.2),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
            <div className="bg-slate-800 px-8 py-10 text-white">
              <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                Application received
              </span>
              <h1 className="mt-4 text-3xl font-semibold">Your 7-step application has been submitted.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                We have captured your details for {form.recruitmentCode}. The recruitment desk can now review your profile and contact you on the email or phone number you provided.
              </p>
            </div>
            <div className="grid gap-6 px-8 py-8 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Applied role</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{form.recruitmentCode}</p>
                <p className="mt-1 text-sm text-slate-600">{form.recruitmentName}</p>
              </div>
              <div className="rounded-3xl bg-amber-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Primary contact</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {form.firstName} {form.lastName}
                </p>
                <p className="mt-1 text-sm text-slate-600">{form.email}</p>
                <p className="mt-1 text-sm text-slate-600">{form.phone}</p>
              </div>
            </div>
          </div>
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
          <h1 className="mt-4 text-3xl font-semibold leading-tight">7-step bank recruitment application</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            A clean guided flow that helps applicants complete the form with less friction and better clarity.
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
            {steps.map((item, index) => {
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
                      {isDone ? '?' : item.id}
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
                Step {currentStep + 1} of {steps.length}
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
                <FormField label="Recruitment code" error={errors.recruitmentCode}>
                  <input
                    value={form.recruitmentCode}
                    onChange={(event) => updateField('recruitmentCode', event.target.value)}
                    className={inputClassName}
                    placeholder="KM-016"
                  />
                </FormField>
                <FormField label="Employment type">
                  <select className={inputClassName} defaultValue="full-time">
                    <option value="full-time">Full-time</option>
                    <option value="contract">Contract</option>
                    <option value="trainee">Trainee</option>
                  </select>
                </FormField>
                <FormField label="Recruitment title" error={errors.recruitmentName}>
                  <textarea
                    value={form.recruitmentName}
                    onChange={(event) => updateField('recruitmentName', event.target.value)}
                    className={`${inputClassName} min-h-32`}
                    placeholder="Name of the recruitment"
                  />
                </FormField>
                <div className="rounded-[1.75rem] bg-slate-800 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Before you continue</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                    <li>Use the same name and IDs that appear on your official documents.</li>
                    <li>Keep resume and portfolio links ready so the flow stays fast.</li>
                    <li>You can review every detail before final submission.</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="First name" error={errors.firstName}>
                  <input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Last name" error={errors.lastName}>
                  <input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Date of birth" error={errors.dateOfBirth}>
                  <input type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Gender" error={errors.gender}>
                  <select value={form.gender} onChange={(event) => updateField('gender', event.target.value)} className={inputClassName}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </FormField>
                <FormField label="Category" error={errors.category}>
                  <select value={form.category} onChange={(event) => updateField('category', event.target.value)} className={inputClassName}>
                    <option value="">Select category</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="ews">EWS</option>
                  </select>
                </FormField>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Email address" error={errors.email}>
                  <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Mobile number" error={errors.phone}>
                  <input
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={inputClassName}
                    placeholder="10-digit number"
                  />
                </FormField>
                <FormField label="Alternate phone">
                  <input
                    value={form.alternatePhone}
                    onChange={(event) => updateField('alternatePhone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={inputClassName}
                    placeholder="Optional"
                  />
                </FormField>
                <FormField label="Pincode" error={errors.pincode}>
                  <input value={form.pincode} onChange={(event) => updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} className={inputClassName} />
                </FormField>
                <FormField label="Current address" error={errors.address}>
                  <textarea value={form.address} onChange={(event) => updateField('address', event.target.value)} className={`${inputClassName} min-h-32`} />
                </FormField>
                <div className="grid gap-6">
                  <FormField label="City" error={errors.city}>
                    <input value={form.city} onChange={(event) => updateField('city', event.target.value)} className={inputClassName} />
                  </FormField>
                  <FormField label="State" error={errors.state}>
                    <input value={form.state} onChange={(event) => updateField('state', event.target.value)} className={inputClassName} />
                  </FormField>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Highest qualification" error={errors.qualification}>
                  <input value={form.qualification} onChange={(event) => updateField('qualification', event.target.value)} className={inputClassName} placeholder="B.Com, MBA, CA, etc." />
                </FormField>
                <FormField label="Specialization" error={errors.specialization}>
                  <input value={form.specialization} onChange={(event) => updateField('specialization', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Institute / university" error={errors.institute}>
                  <input value={form.institute} onChange={(event) => updateField('institute', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Graduation year" error={errors.graduationYear}>
                  <input value={form.graduationYear} onChange={(event) => updateField('graduationYear', event.target.value.replace(/\D/g, '').slice(0, 4))} className={inputClassName} placeholder="2024" />
                </FormField>
                <FormField label="Score / CGPA" error={errors.score}>
                  <input value={form.score} onChange={(event) => updateField('score', event.target.value)} className={inputClassName} placeholder="78% or 8.4 CGPA" />
                </FormField>
              </div>
            )}

            {currentStep === 4 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Experience level" error={errors.experienceLevel}>
                  <select value={form.experienceLevel} onChange={(event) => updateField('experienceLevel', event.target.value)} className={inputClassName}>
                    <option value="">Select experience level</option>
                    <option value="fresher">Fresher</option>
                    <option value="junior">0-2 years</option>
                    <option value="mid">3-5 years</option>
                    <option value="senior">6+ years</option>
                  </select>
                </FormField>
                <FormField label="Current employer">
                  <input value={form.currentEmployer} onChange={(event) => updateField('currentEmployer', event.target.value)} className={inputClassName} placeholder="Optional for freshers" />
                </FormField>
                <FormField label="Current / last role" error={errors.currentRole}>
                  <input value={form.currentRole} onChange={(event) => updateField('currentRole', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Total experience" error={errors.experienceYears}>
                  <input value={form.experienceYears} onChange={(event) => updateField('experienceYears', event.target.value)} className={inputClassName} placeholder="Example: 2 years 4 months" />
                </FormField>
                <FormField label="Key banking or operational skills" error={errors.keySkills}>
                  <textarea
                    value={form.keySkills}
                    onChange={(event) => updateField('keySkills', event.target.value)}
                    className={`${inputClassName} min-h-32 md:col-span-2`}
                    placeholder="Core banking, audit support, branch operations, MIS, customer handling..."
                  />
                </FormField>
              </div>
            )}

            {currentStep === 5 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Aadhaar number" error={errors.aadhaarNumber}>
                  <input value={form.aadhaarNumber} onChange={(event) => updateField('aadhaarNumber', event.target.value.replace(/\D/g, '').slice(0, 12))} className={inputClassName} />
                </FormField>
                <FormField label="PAN number" error={errors.panNumber}>
                  <input value={form.panNumber} onChange={(event) => updateField('panNumber', event.target.value.toUpperCase().slice(0, 10))} className={inputClassName} />
                </FormField>
                <FormField label="Resume link" error={errors.resumeLink}>
                  <input value={form.resumeLink} onChange={(event) => updateField('resumeLink', event.target.value)} className={inputClassName} placeholder="https://..." />
                </FormField>
                <FormField label="Portfolio / LinkedIn link" error={errors.portfolioLink}>
                  <input value={form.portfolioLink} onChange={(event) => updateField('portfolioLink', event.target.value)} className={inputClassName} placeholder="Optional" />
                </FormField>
                <FormField label="Preferred location" error={errors.preferredLocation}>
                  <input value={form.preferredLocation} onChange={(event) => updateField('preferredLocation', event.target.value)} className={inputClassName} />
                </FormField>
                <FormField label="Notice period" error={errors.noticePeriod}>
                  <input value={form.noticePeriod} onChange={(event) => updateField('noticePeriod', event.target.value)} className={inputClassName} placeholder="Immediate / 30 days / 60 days" />
                </FormField>
                <FormField label="Expected salary" error={errors.expectedSalary}>
                  <input value={form.expectedSalary} onChange={(event) => updateField('expectedSalary', event.target.value)} className={inputClassName} placeholder="CTC expectation" />
                </FormField>
                <FormField label="Willing to relocate?" error={errors.relocate}>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {['Yes', 'No', 'Open to discussion'].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => updateField('relocate', choice)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          form.relocate === choice
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
            )}

            {currentStep === 6 && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                  <ReviewRow label="Recruitment" value={`${form.recruitmentCode} - ${form.recruitmentName}`} />
                  <ReviewRow label="Applicant" value={`${form.firstName} ${form.lastName}`} />
                  <ReviewRow label="Birth details" value={`${form.dateOfBirth} | ${form.gender} | ${form.category}`} />
                  <ReviewRow label="Contact" value={`${form.email} | ${form.phone}`} />
                  <ReviewRow label="Address" value={`${form.address}, ${form.city}, ${form.state} - ${form.pincode}`} />
                  <ReviewRow label="Education" value={`${form.qualification}, ${form.specialization} - ${form.institute} (${form.graduationYear})`} />
                  <ReviewRow label="Experience" value={`${form.currentRole} | ${form.experienceYears} | ${form.keySkills}`} />
                  <ReviewRow label="Documents" value={`Aadhaar ending ${form.aadhaarNumber.slice(-4)} | PAN ${form.panNumber}`} />
                  <ReviewRow label="Preferences" value={`${form.preferredLocation} | ${form.noticePeriod} | ${form.expectedSalary} | Relocate: ${form.relocate}`} />
                </div>

                <div className="rounded-[1.75rem] bg-slate-800 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Final declaration</p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    I confirm that the information submitted here is accurate and matches my official records. I understand that the recruitment team may verify these details before shortlisting.
                  </p>
                  <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-200">
                    <input
                      type="checkbox"
                      checked={form.declarationAccepted}
                      onChange={(event) => updateField('declarationAccepted', event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20"
                    />
                    <span>I accept the declaration and want to submit this application.</span>
                  </label>
                  {errors.declarationAccepted ? <p className="mt-3 text-sm text-rose-300">{errors.declarationAccepted}</p> : null}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous step
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center justify-center rounded-full bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Submit application
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center rounded-full bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400"
              >
                Continue to next step
              </button>
            )}
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}

