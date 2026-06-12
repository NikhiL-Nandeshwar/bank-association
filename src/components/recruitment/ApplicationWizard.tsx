/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  APPLICATION_INPUT_CLASS_NAME, APPLICATION_STEPS, LANGUAGE_ABILITIES, LANGUAGE_NAMES,
  type EducationEntry, type LanguageAbility, type LanguageName
} from '@/constants/application-wizard.constants';
import { getCategories, getCastesByCategoryReligion, getCountries, getDistricts, getReligions, getStates, getSubCastes, getTalukas } from '@/actions/api/master.actions';
import { getEligibilityCriteria } from '@/actions/api/vacancy.actions';
import { useEffect, useMemo, useState } from 'react';
import type { EligibilityCriteria } from '@/types/api.types';
import { ApplicationWizardProps, ExperienceEntry, FormState, MasterOption, SaveStep1and2Payload } from '@/types/applicationSteps';
import { calculateAgeAsOn, buildSaveStep3Payload, buildSaveStepExperiencePayload, ChoiceButtons, ErrorMap, FormField, generateTransactionNumber, getMandatoryEducationLevels, getSelectedMasterId, HallTicketPreview, initialState, LookupField, normalizeFormState, ReviewRow, sortEligibilityCriteria, SummaryCard, toCategoryOptions, toMasterOptions, toReligionOptions, validateStep, YesNoButtons, hasExperienceDetails } from './helper/applicationStepsHelper';
import { getResumeData, saveStep1and2, saveStep3, saveStepExperience, startOrResumeApplication, uploadDocument } from '@/actions/api/application.actions';
import { createSaveStep3Schema, createSaveStepExperienceSchema } from '@/schemas/application.schema';
import { useAuth } from '@/lib/useAuth';
import { CheckCircle2, FileText, Trash2, Upload } from 'lucide-react';
import { getAuthToken } from '@/lib/auth-storage';
import { toast } from 'sonner';


function normalizeEligibilityCriteriaResponse(data: unknown): EligibilityCriteria[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    const nested = data as {
      items?: unknown;
      eligibilityCriteria?: unknown;
      declarations?: unknown;
    };

    if (Array.isArray(nested.items)) {
      return nested.items as EligibilityCriteria[];
    }

    if (Array.isArray(nested.eligibilityCriteria)) {
      return nested.eligibilityCriteria as EligibilityCriteria[];
    }

    if (Array.isArray(nested.declarations)) {
      return nested.declarations.map((item) => {
        const declaration = item as Partial<EligibilityCriteria> & {
          criteriaId?: number;
          requiredDocumentType?: string;
          requiredDocument?: boolean;
        };

        return {
          criteriaType: declaration.criteriaType ?? '',
          criteriaValue: declaration.criteriaValue ?? '',
          groupTag: declaration.groupTag ?? '',
          isMandatory: Boolean(declaration.isMandatory),
          declarationEng: declaration.declarationEng ?? '',
          declarationMrt: declaration.declarationMrt ?? '',
          sortOrder: Number(declaration.sortOrder ?? 0),
        };
      });
    }
  }

  return [];
}

function extractApplicationId(data: unknown): number {
  if (typeof data === 'number' && Number.isFinite(data)) {
    return data;
  }

  if (typeof data === 'string') {
    const parsed = Number(data);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const application = record.application as Record<string, unknown> | undefined;
    const candidates = [
      record.applicationId,
      record.id,
      record.applicationID,
      application?.applicationId,
      application?.id,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
      }

      if (typeof candidate === 'string') {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    if ('data' in record) {
      return extractApplicationId(record.data);
    }
  }

  return 0;
}

function splitAuthName(userName?: string | null) {
  const trimmed = userName?.trim() ?? '';

  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

export default function ApplicationWizard({ initialRecruitment }: ApplicationWizardProps) {
  const { user, status } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setForm] = useState<FormState>(() => initialState(initialRecruitment));
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHallTicket, setShowHallTicket] = useState(false);
  const [eligibilityCriteria, setEligibilityCriteria] = useState<EligibilityCriteria[]>(
    initialRecruitment.eligibilityCriteria ?? [],
  );
  const [isEligibilityLoading, setIsEligibilityLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<MasterOption[]>([]);
  const [casteOptions, setCasteOptions] = useState<MasterOption[]>([]);
  const [subCasteOptions, setSubCasteOptions] = useState<MasterOption[]>([]);
  const [religionOptions, setReligionOptions] = useState<MasterOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<MasterOption[]>([]);
  const [stateOptions, setStateOptions] = useState<MasterOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<MasterOption[]>([]);
  const [talukaOptions, setTalukaOptions] = useState<MasterOption[]>([]);
  const [isMasterLoading, setIsMasterLoading] = useState(false);
  const [isCasteLoading, setIsCasteLoading] = useState(false);
  const [isSubCasteLoading, setIsSubCasteLoading] = useState(false);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [isDistrictLoading, setIsDistrictLoading] = useState(false);
  const [isTalukaLoading, setIsTalukaLoading] = useState(false);
  const [isStartingOrResuming, setIsStartingOrResuming] = useState(false);
  const [isSavingStep1and2, setIsSavingStep1and2] = useState(false);
  const [isSavingStep3, setIsSavingStep3] = useState(false);
  const [isSavingStepExperience, setIsSavingStepExperience] = useState(false);
  const [startOrResumeError, setStartOrResumeError] = useState<string | null>(null);
  const [saveStep1and2Error, setSaveStep1and2Error] = useState<string | null>(null);
  const [saveStep3Error, setSaveStep3Error] = useState<string | null>(null);
  const [saveStepExperienceError, setSaveStepExperienceError] = useState<string | null>(null);
  const [applicationRecordId, setApplicationRecordId] = useState<number>(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    photo?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
    signature?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
    aadhaar?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
    sscMarksheet?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
    hscMarksheet?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
    degree?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
    mscitCertificate?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
    cccCertificate?: {
      documentId: number;
      documentName: string;
      fileUrl: string;
    };
  }>({});

  useEffect(() => {
    setForm(initialState(initialRecruitment));
    setCurrentStep(0);
    setErrors({});
    setSubmitted(false);
    setShowHallTicket(false);
    setEligibilityCriteria(initialRecruitment.eligibilityCriteria ?? []);
    setIsStartingOrResuming(false);
    setStartOrResumeError(null);
    setSaveStep3Error(null);
    setSaveStepExperienceError(null);
    setApplicationRecordId(0);
  }, [initialRecruitment]); // re-init when recruitment changes

  useEffect(() => {
    if (status !== 'authenticated' || !user) {
      return;
    }

    const fallbackName = splitAuthName(user.userName);
    const firstName = user.firstName?.trim() || fallbackName.firstName;
    const lastName = user.lastName?.trim() || fallbackName.lastName;

    setForm((prev) => {
      let next = prev;

      if (!prev.firstName.trim() && firstName) {
        next = { ...next, firstName };
      }

      if (!prev.lastName.trim() && lastName) {
        next = { ...next, lastName };
      }

      if (!prev.email.trim() && user.email) {
        next = { ...next, email: user.email };
      }

      return next;
    });
  }, [status, user]);

  useEffect(() => {
    let isActive = true;

    async function loadEligibilityCriteria() {
      if (!initialRecruitment.vacancyId) {
        setEligibilityCriteria(initialRecruitment.eligibilityCriteria ?? []);
        return;
      }

      setIsEligibilityLoading(true);

      try {
        const response = await getEligibilityCriteria(initialRecruitment.vacancyId);
        if (!isActive) return;
        setEligibilityCriteria(normalizeEligibilityCriteriaResponse(response.data));
      } catch {
        if (!isActive) return;
        setEligibilityCriteria(initialRecruitment.eligibilityCriteria ?? []);
      } finally {
        if (isActive) setIsEligibilityLoading(false);
      }
    }

    void loadEligibilityCriteria();

    return () => {
      isActive = false;
    };
  }, [initialRecruitment.vacancyId, initialRecruitment.eligibilityCriteria]);

  useEffect(() => {
    let isActive = true;

    async function loadMasters() {
      setIsMasterLoading(true);

      try {
        const [categoriesResponse, religionsResponse, countriesResponse] = await Promise.all([
          getCategories().catch(() => null),
          getReligions().catch(() => null),
          getCountries().catch(() => null),
        ]);

        if (!isActive) return;

        setCategoryOptions(toCategoryOptions(categoriesResponse?.data));
        setReligionOptions(toReligionOptions(religionsResponse?.data));
        setCountryOptions(toMasterOptions(countriesResponse?.data));
      } finally {
        if (isActive) setIsMasterLoading(false);
      }
    }

    void loadMasters();

    return () => {
      isActive = false;
    };
  }, []);


  const form = useMemo(
    () => normalizeFormState(initialRecruitment, formState),
    [formState, initialRecruitment],
  );

  const mandatoryEducationLevels = useMemo(
    () => getMandatoryEducationLevels(eligibilityCriteria),
    [eligibilityCriteria],
  );


  const mandatoryDocuments = useMemo<string[]>(() => {
    return eligibilityCriteria
      .filter(
        (item) =>
          item.criteriaType === 'EDUCATION' &&
          item.isMandatory,
      )
      .map((item) => {
        switch (item.criteriaValue) {
          case 'SSC_10TH':
            return 'SSC_MARKSHEET';

          case 'HSC_12TH':
            return 'HSC_MARKSHEET';

          case 'GRADUATION':
            return 'DEGREE';

          case 'MSCIT':
            return 'MSCIT_CERTIFICATE';

          case 'CCC':
            return 'CCC_CERTIFICATE';

          default:
            return '';
        }
      })
      .filter(Boolean);
  }, [eligibilityCriteria]);

  const isMandatoryDocument = (documentType: string) =>
    mandatoryDocuments.includes(documentType);

  const saveStep3Schema = useMemo(
    () => createSaveStep3Schema(mandatoryEducationLevels),
    [mandatoryEducationLevels],
  );

  const saveStepExperienceSchema = useMemo(
    () => createSaveStepExperienceSchema(),
    [],
  );

  useEffect(() => {
    let isActive = true;
    const categoryId = getSelectedMasterId(form.category);
    const religionId = getSelectedMasterId(form.religion);

    async function loadCastes() {
      if (!categoryId || !religionId) {
        setCasteOptions([]);
        setSubCasteOptions([]);
        setIsCasteLoading(false);
        setIsSubCasteLoading(false);
        return;
      }

      setIsCasteLoading(true);

      try {
        const response = await getCastesByCategoryReligion({ categoryId, religionId }).catch(() => null);
        if (!isActive) return;
        setCasteOptions(toMasterOptions(response?.data));
      } finally {
        if (isActive) setIsCasteLoading(false);
      }
    }

    void loadCastes();

    return () => {
      isActive = false;
    };
  }, [form.category, form.religion]);

  useEffect(() => {
    let isActive = true;
    const casteId = getSelectedMasterId(form.caste);

    async function loadSubCastes() {
      if (!casteId) {
        setSubCasteOptions([]);
        setIsSubCasteLoading(false);
        return;
      }

      setIsSubCasteLoading(true);

      try {
        const response = await getSubCastes({ casteId }).catch(() => null);
        if (!isActive) return;
        setSubCasteOptions(toMasterOptions(response?.data));
      } finally {
        if (isActive) setIsSubCasteLoading(false);
      }
    }

    void loadSubCastes();

    return () => {
      isActive = false;
    };
  }, [form.caste]);

  useEffect(() => {
    let isActive = true;
    const countryId = getSelectedMasterId(form.country);

    async function loadStates() {
      if (!countryId) {
        setStateOptions([]);
        setDistrictOptions([]);
        setTalukaOptions([]);
        setIsStateLoading(false);
        setIsDistrictLoading(false);
        setIsTalukaLoading(false);
        return;
      }

      setIsStateLoading(true);

      try {
        const response = await getStates({ countryId }).catch(() => null);
        if (!isActive) return;
        setStateOptions(toMasterOptions(response?.data));
      } finally {
        if (isActive) {
          setIsStateLoading(false);
        }
      }
    }

    void loadStates();

    return () => {
      isActive = false;
    };
  }, [form.country]);

  useEffect(() => {
    let isActive = true;
    const stateId = getSelectedMasterId(form.state);

    async function loadDistricts() {
      if (!stateId) {
        setDistrictOptions([]);

        setTalukaOptions([]);
        setIsDistrictLoading(false);
        setIsTalukaLoading(false);
        return;
      }

      setIsDistrictLoading(true);

      try {
        const response = await getDistricts({ stateId }).catch(() => null);
        if (!isActive) return;
        setDistrictOptions(toMasterOptions(response?.data));

      } finally {
        if (isActive) setIsDistrictLoading(false);
      }
    }

    void loadDistricts();

    return () => {
      isActive = false;
    };
  }, [form.state]);

  useEffect(() => {
    let isActive = true;
    const districtId = getSelectedMasterId(form.district);
    const stateId = getSelectedMasterId(form.state);

    async function loadTalukas() {
      if (!districtId) {
        setTalukaOptions([]);
        setIsTalukaLoading(false);
        return;
      }

      setIsTalukaLoading(true);

      try {
        const response = await getTalukas({ districtId, stateId }).catch(() => null);
        if (!isActive) return;
        setTalukaOptions(toMasterOptions(response?.data));
      } finally {
        if (isActive) setIsTalukaLoading(false);
      }
    }

    void loadTalukas();

    return () => {
      isActive = false;
    };
  }, [form.district, form.state]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      acceptedEligibilityCriteria: {},
    }));
  }, [eligibilityCriteria]);


  const progress = useMemo(
    () => `${Math.round(((currentStep + 1) / APPLICATION_STEPS.length) * 100)}%`,
    [currentStep],
  );

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCategoryChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      category: value,
      caste: '',
      subCaste: '',
    }));
    setErrors((prev) => ({ ...prev, category: undefined, caste: undefined, subCaste: undefined }));
  };

  const handleReligionChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      religion: value,
      caste: '',
      subCaste: '',
    }));
    setErrors((prev) => ({ ...prev, religion: undefined, caste: undefined, subCaste: undefined }));
  };

  const handleCasteChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      caste: value,
      subCaste: '',
    }));
    setErrors((prev) => ({ ...prev, caste: undefined, subCaste: undefined }));
  };

  const handleCountryChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      country: value,
      state: '',
      district: '',
      taluka: '',
    }));
    setErrors((prev) => ({ ...prev, country: undefined, state: undefined, district: undefined, taluka: undefined }));
  };

  const handleStateChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      state: value,
      district: '',
      taluka: '',
    }));
    setErrors((prev) => ({ ...prev, state: undefined, district: undefined, taluka: undefined }));
  };

  const handleDistrictChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      district: value,
      taluka: '',
    }));
    setErrors((prev) => ({ ...prev, district: undefined, taluka: undefined }));
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
      experienceEntries: [...prev.experienceEntries, { organization: '', designation: '', location: '', fromDate: '', toDate: '', isCurrentJob: false }],
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

  const toggleEligibilityCriteria = (criteriaIndex: number) => {
    setForm((prev) => ({
      ...prev,
      acceptedEligibilityCriteria: {
        ...prev.acceptedEligibilityCriteria,
        [criteriaIndex]: !prev.acceptedEligibilityCriteria[criteriaIndex],
      },
    }));
    setErrors((prev) => ({ ...prev, acceptedEligibilityCriteria: undefined }));
  };

  function buildStep1and2Payload(f: FormState): SaveStep1and2Payload {
    return {
      vacancyId: initialRecruitment.vacancyId ?? 0,
      aadhaarNumber: f.aadhaarNumber || '123456789123',
      fullName: `${f.firstName} ${f.lastName}`.trim(),
      fullNameMarathi: f.fullNameMarathi || '',
      dateOfBirth: f.dateOfBirth
        ? new Date(f.dateOfBirth).toISOString()
        : '',
      gender: f.gender,
      categoryId: Number(f.category) || 0,
      religionId: Number(f.religion) || 0,
      casteId: Number(f.caste) || 0,
      subCasteId: Number(f.subCaste) || 0,
      nationalityId: f.nationalityIndian === 'Yes' ? 1 : 0,
      isMahaDomiciled: f.maharashtraDomiciled === 'Yes',
      isNonCreamyLayer: f.nonCreamyLayer === 'Yes',
      maritalStatus: f.maritalStatus,
      fathersName: f.fathersName || '',                          // add a field if you collect it
      mothersName: f.mothersName || '',
      husbandsName: f.husbandsName || '',
      addressLine1: f.addressLine1,
      addressLine2: f.addressLine2,
      addressLine3: f.addressLine3,
      countryId: Number(f.country) || 0,
      stateId: Number(f.state) || 0,
      districtId: Number(f.district) || 0,
      talukaId: Number(f.taluka) || 0,
      pinCode: f.pincode,
      mobileNumber: f.phone,
      alternateNumber: f.alternatePhone,
      languages: LANGUAGE_NAMES
        .filter((lang) => Object.values(f.languageSkills[lang]).some(Boolean))
        .map((lang) => ({
          languageName: lang,
          canRead: f.languageSkills[lang].read,
          canWrite: f.languageSkills[lang].write,
          canSpeak: f.languageSkills[lang].speak,
        })),
    };
  }

  type ExistingDocument = {
    documentId: number;
    documentName: string;
    fileUrl: string;
  };

  async function getAuthenticatedFileUrl(
    fileUrl: string,
  ): Promise<string> {
    const token = getAuthToken();

    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load file');
    }

    const blob = await response.blob();

    return URL.createObjectURL(blob);
  }



  function DocumentUploadCard({
    label,
    file,
    existingDocument,
    onChange,
    required = false,
  }: {
    label: string;
    file: File | null;
    existingDocument?: ExistingDocument;
    onChange: (file: File | null) => void;
    required?: boolean;
  }) {

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const [selectedFilePreview, setSelectedFilePreview] =
      useState<string | null>(null);

    useEffect(() => {
      if (!file || !file.type.startsWith('image/')) {
        setSelectedFilePreview(null);
        return;
      }

      const url = URL.createObjectURL(file);

      setSelectedFilePreview(url);

      return () => URL.revokeObjectURL(url);
    }, [file]);

    const imagePreview =
      selectedFilePreview || previewUrl;

    const isWidePreview =
      label === 'Signature'

    useEffect(() => {
      if (!existingDocument?.fileUrl) {
        return;
      }

      let mounted = true;

      getAuthenticatedFileUrl(existingDocument.fileUrl)
        .then((url) => {
          if (mounted) {
            setPreviewUrl(url);
          }
        })
        .catch(console.error);

      return () => {
        mounted = false;
      };
    }, [existingDocument?.fileUrl]);

    const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const selectedFile = e.target.files?.[0];

      if (!selectedFile) return;

      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('File size must not exceed 2 MB');
        return;
      }

      onChange(selectedFile);
    };

    // Replace handleViewDocument:
    const handleViewDocument = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!existingDocument?.fileUrl) return;

      try {
        const url = await getAuthenticatedFileUrl(existingDocument.fileUrl);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Revoke after a short delay to let the tab open
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      } catch {
        alert('Unable to open document.');
      }
    };

    return (
      <div
        className={`
        rounded-2xl border-2 border-dashed p-5 transition-all
       ${file || existingDocument
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-slate-300 hover:border-primary hover:bg-slate-50'
          }
      `}
      >
        <label className="flex cursor-pointer flex-col items-center text-center">
          <input
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,.avif,.pdf"
            onChange={handleFileChange}
          />

          {file ? (
            <>
              <div
                className={`mb-3 flex items-center justify-center overflow-hidden rounded-lg border bg-white ${isWidePreview
                  ? 'h-20 w-full'
                  : 'h-24 w-24'
                  }`}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={label}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FileText className="h-10 w-10 text-slate-500" />
                )}
              </div>

              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Ready to Upload
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(null);
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>

              <p className="font-medium text-slate-800">
                {label}
                {required && (
                  <span className="ml-1 text-rose-500">*</span>
                )}
              </p>

              <p
                className="mt-2 max-w-full truncate text-xs text-slate-600"
                title={file.name}
              >
                {file.name}
              </p>

              <span className="mt-2 text-xs text-slate-500">
                Selected file will be uploaded on next step
              </span>
            </>
          ) : existingDocument ? (
            <>
              <div
                className={`mb-3 flex items-center justify-center overflow-hidden rounded-lg border bg-white ${isWidePreview
                  ? 'h-20 w-full'
                  : 'h-24 w-24'
                  }`}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={label}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FileText className="h-10 w-10 text-slate-500" />
                )}
              </div>

              <div className="mb-2 flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Already Uploaded
                </span>
              </div>

              <p className="font-medium text-slate-800">
                {label}
                {required && (
                  <span className="ml-1 text-rose-500">*</span>
                )}
              </p>

              <p
                className="mt-2 max-w-full truncate text-xs text-slate-600"
                title={existingDocument.documentName}
              >
                {existingDocument.documentName}
              </p>

              <button
                type="button"
                onClick={handleViewDocument}
                className="mt-2 text-xs font-medium text-blue-600 underline"
              >
                View Document
              </button>

              <span className="mt-2 text-xs text-slate-500">
                Click to replace document
              </span>
            </>
          ) : (
            <>
              <Upload className="mb-3 h-10 w-10 text-slate-400" />

              <p className="font-medium text-slate-800">
                {label}
                {required && (
                  <span className="ml-1 text-rose-500">*</span>
                )}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Click to upload document
              </p>

              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG, PDF (Max 2 MB)
              </p>
            </>
          )}
        </label>
      </div>
    );
  }

  const updateDocument = (
    field: keyof FormState['documents'],
    file: File | null,
  ) => {
    setForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const DOCUMENT_TYPE_MAPPING = {
    photo: 'Photo',
    signature: 'Signature',
    aadhaar: 'Aadhaar',
    sscMarksheet: 'SSC_MARKSHEET',
    hscMarksheet: 'HSC_MARKSHEET',
    degree: 'DEGREE',
    mscitCertificate: 'MSCIT_CERTIFICATE',
    cccCertificate: 'CCC_CERTIFICATE',
  } as const;

  async function uploadAllDocuments() {
    const uploads = Object.entries(
      DOCUMENT_TYPE_MAPPING,
    )
      .map(([field, documentType]) => {
        const file =
          form.documents[
          field as keyof typeof form.documents
          ];

        if (!file) {
          return null;
        }

        return uploadDocument(
          applicationRecordId,
          documentType,
          file,
        );
      })
      .filter(Boolean);

    await Promise.all(uploads);
  }

  const goNext = async () => {
    console.log('currentStep', currentStep)
    if (currentStep === 0 && isEligibilityLoading) {
      setErrors({ acceptedEligibilityCriteria: 'Please wait for the eligibility criteria to load.' });
      return;
    }

    const nextErrors = validateStep(
      currentStep,
      form,
      eligibilityCriteria,
      uploadedDocuments,
      mandatoryDocuments,
    );

    console.log('VALIDATION ERRORS', nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      const firstError = Object.values(nextErrors).find(Boolean);

      if (firstError) {
        toast.error(firstError);
      }

      const firstField = Object.keys(nextErrors)[0];

      document
        .querySelector(
          `[name="${firstField}"]`,
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

      return;
    }



    // ── Fire SaveStep1 after step 2 (index 2) is validated ──
    if (currentStep === 0) {
      if (!initialRecruitment.vacancyId) {
        setStartOrResumeError('Vacancy ID is missing for this recruitment.');
        return;
      }

      setIsStartingOrResuming(true);
      setStartOrResumeError(null);

      try {
        const response = await startOrResumeApplication(initialRecruitment.vacancyId);
        const applicationId = extractApplicationId(response.data);
        const resumeResponse = await getResumeData(applicationId);

        const currentStepFromApi = (
          resumeResponse as {
            data?: {
              currentStep?: number;
            };
          }
        ).data?.currentStep;

        if (currentStepFromApi) {
          setCurrentStep(Math.max(0, currentStepFromApi - 1));
        }

        const responseData = resumeResponse as {
          data?: {
            step1?: any;
            step2?: any[];
            step3?: any[];
            step4?: any[]
          };
        };

        console.log('RESUME DATA', responseData.data);

        const step1 = responseData.data?.step1;
        const educationStep = responseData.data?.step2;
        const experienceStep = responseData.data?.step3;
        const documentStep = responseData.data?.step4;
        console.log('DOCUMENT STEP', documentStep);

        if (documentStep?.length) {
          const mappedDocuments: typeof uploadedDocuments = {};

          documentStep.forEach((doc) => {
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

          console.log('MAPPED DOCUMENTS', mappedDocuments);

          setUploadedDocuments(mappedDocuments);
        }

        if (step1) {
          const [firstName = '', ...rest] = step1.fullName.split(' ');

          setForm((prev) => {
            const languageSkills = { ...prev.languageSkills };

            const dateOfBirth =
              step1.dateOfBirth?.split('T')[0] ?? '';

            (step1.languages ?? []).forEach(
              (language: {
                languageName: string;
                canRead: boolean;
                canWrite: boolean;
                canSpeak: boolean;
              }) => {
                const languageName = language.languageName?.toLowerCase();

                if (
                  languageName === 'marathi' ||
                  languageName === 'hindi' ||
                  languageName === 'english'
                ) {
                  languageSkills[languageName] = {
                    read: language.canRead,
                    write: language.canWrite,
                    speak: language.canSpeak,
                  };
                }
              },
            );

            const educationEntries = prev.educationEntries.map((entry) => {
              const apiEducation = (educationStep ?? []).find(
                (item: {
                  educationLevel: string;
                  specialization?: string;
                  organizationName?: string;
                  percentageOrCGPA?: number;
                  className?: string;
                  passedMonthYear?: string;
                  passedDate?: string | null;
                }) => item.educationLevel === entry.level,
              );

              console.log('apiEducation', apiEducation)

              if (!apiEducation) {
                return entry;
              }

              return {
                ...entry,
                institute: apiEducation.organizationName ?? '',
                educationLevel: apiEducation.educationLevel ?? '',
                specialization: apiEducation.specialization ?? '',
                score:
                  apiEducation.percentageOrCGPA &&
                    apiEducation.percentageOrCGPA > 0
                    ? String(apiEducation.percentageOrCGPA)
                    : '',
                className: apiEducation.className ?? '',
                passedMonthYear: apiEducation.passedMonthYear
                  ? (() => {
                    const [month, year] =
                      apiEducation.passedMonthYear.split('/');

                    return `${year}-${month}`;
                  })()
                  : '', passedDate: apiEducation.passedDate
                    ? apiEducation.passedDate.split('T')[0]
                    : '',
              };
            });

            const experienceEntries =
              experienceStep?.length
                ? experienceStep.map((item) => ({
                  organization: item.organizationName ?? '',
                  designation: item.designation ?? '',
                  location: item.location ?? '',
                  fromDate: item.fromDate
                    ? item.fromDate.split('T')[0]
                    : '',
                  toDate: item.toDate
                    ? item.toDate.split('T')[0]
                    : '',
                  isCurrentJob: item.isCurrentJob ?? false,
                }))
                : prev.experienceEntries;

            return {
              ...prev,

              // Step 1
              firstName,
              lastName: rest.join(' '),
              dateOfBirth,
              ageAsOn: calculateAgeAsOn(dateOfBirth),
              gender: step1.gender ?? '',
              aadhaarNumber: step1.aadhaarNumber ?? '',
              category: String(step1.categoryId ?? ''),
              religion: String(step1.religionId ?? ''),
              caste: String(step1.casteId ?? ''),
              subCaste: String(step1.subCasteId ?? ''),
              maharashtraDomiciled: step1.isMahaDomiciled ? 'Yes' : 'No',
              nonCreamyLayer: step1.isNonCreamyLayer ? 'Yes' : 'No',
              nationalityIndian: step1.nationalityId === 1 ? 'Yes' : 'No',
              maritalStatus: step1.maritalStatus ?? '',
              fathersName: step1.fathersName ?? '',
              mothersName: step1.mothersName ?? '',
              husbandsName: step1.husbandsName ?? '',

              // Step 2
              phone: step1.mobileNumber ?? '',
              alternatePhone: step1.alternateNumber ?? '',
              addressLine1: step1.addressLine1 ?? '',
              addressLine2: step1.addressLine2 ?? '',
              addressLine3: step1.addressLine3 ?? '',
              pincode: step1.pinCode ?? '',
              country: String(step1.countryId ?? ''),
              state: String(step1.stateId ?? ''),
              district: String(step1.districtId ?? ''),
              taluka: String(step1.talukaId ?? ''),
              email: user?.email ?? '',

              // Languages
              languageSkills,

              // Education
              educationEntries,

              // Experiences
              experienceEntries
            };
          });
        }

        setApplicationRecordId(applicationId);
      } catch {
        setStartOrResumeError('Could not start or resume your application. Please try again.');
        return;
      } finally {
        setIsStartingOrResuming(false);
      }
    }

    if (currentStep === 2) {
      setIsSavingStep1and2(true);
      setSaveStep1and2Error(null);
      try {
        await saveStep1and2(buildStep1and2Payload(form));
      } catch {
        setSaveStep1and2Error('Could not save your details. Please try again.');
        setIsSavingStep1and2(false);
        return;                     // block navigation on failure
      } finally {
        setIsSavingStep1and2(false);
      }
    }

    if (currentStep === 3) {
      setIsSavingStep3(true);
      setSaveStep3Error(null);

      const payload = buildSaveStep3Payload(form, applicationRecordId);
      const parsedPayload = saveStep3Schema.safeParse(payload);

      if (!parsedPayload.success) {
        setErrors({
          educationEntries: parsedPayload.error.issues[0]?.message ?? 'Please complete the required education details.',
        });
        setIsSavingStep3(false);
        return;
      }

      try {
        await saveStep3(parsedPayload.data);
      } catch {
        setSaveStep3Error('Could not save your education details. Please try again.');
        setIsSavingStep3(false);
        return;
      } finally {
        setIsSavingStep3(false);
      }
    }

    if (currentStep === 4) {
      setIsSavingStepExperience(true);
      setSaveStepExperienceError(null);

      const payload = buildSaveStepExperiencePayload(form, applicationRecordId);
      const parsedPayload = saveStepExperienceSchema.safeParse(payload);

      if (!parsedPayload.success) {
        setErrors({
          experienceEntries: parsedPayload.error.issues[0]?.message ?? 'Please complete the required experience details.',
        });
        setIsSavingStepExperience(false);
        return;
      }

      try {
        await saveStepExperience(parsedPayload.data);
      } catch {
        setSaveStepExperienceError('Could not save your experience details. Please try again.');
        setIsSavingStepExperience(false);
        return;
      } finally {
        setIsSavingStepExperience(false);
      }
    }

    if (currentStep === 5) {
      debugger
      console.log('========== DOCUMENT UPLOAD START ==========');
      console.log('APPLICATION ID', applicationRecordId);
      console.log('FORM DOCUMENTS', form.documents);
      console.log('UPLOADED DOCUMENTS', uploadedDocuments);

      try {
        const uploads = Object.entries(
          DOCUMENT_TYPE_MAPPING,
        )
          .map(([field, documentType]) => {
            const file =
              form.documents[
              field as keyof typeof form.documents
              ];

            console.log('FIELD', field);
            console.log('DOCUMENT TYPE', documentType);
            console.log('FILE', file);

            if (!file) {
              console.log(
                `SKIPPED ${documentType} - no new file selected`,
              );
              return null;
            }

            console.log(
              `QUEUED ${documentType}`,
              file.name,
            );

            return uploadDocument(
              applicationRecordId,
              documentType,
              file,
            );
          })
          .filter(
            (
              item,
            ): item is ReturnType<typeof uploadDocument> =>
              item !== null,
          );

        console.log('UPLOAD REQUESTS COUNT', uploads.length);

        if (uploads.length === 0) {
          console.warn(
            'NO FILES TO UPLOAD - ALL DOCUMENTS ARE NULL',
          );
        }

        const result = await Promise.all(uploads);

        console.log('UPLOAD SUCCESS');
        console.log('UPLOAD RESULT', result);
      } catch (error) {
        console.error(
          'DOCUMENT UPLOAD FAILED',
          error,
        );

        setErrors((prev) => ({
          ...prev,
          documents: 'Failed to upload documents.',
        }));

        return;
      }

      console.log('========== DOCUMENT UPLOAD END ==========');
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
                  className={`rounded-3xl border px-4 py-4 transition ${isActive
                    ? 'border-amber-300 bg-amber-300/10'
                    : isDone
                      ? 'border-emerald-400/20 bg-emerald-400/10'
                      : 'border-white/10 bg-white/5'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${isActive
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
              <>
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



                {isEligibilityLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm font-semibold text-slate-900">Loading eligibility criteria...</p>
                    <p className="mt-1 text-xs text-slate-600">We are fetching the vacancy-specific criteria for this recruitment.</p>
                  </div>
                ) : eligibilityCriteria.length > 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-900">Eligibility Criteria</h3>
                      <p className="mt-1 text-xs text-slate-600">Please confirm that you meet all the following mandatory criteria to proceed with the application.</p>
                    </div>
                    {errors.acceptedEligibilityCriteria && (
                      <p className="mb-4 text-sm font-semibold text-red-600">{errors.acceptedEligibilityCriteria}</p>
                    )}
                    <div className="space-y-3">
                      {sortEligibilityCriteria(eligibilityCriteria)
                        .map((criteria, index) => (
                          <label key={index} className="flex items-start gap-3 rounded-lg border border-white bg-white p-3 transition hover:border-amber-300">
                            <input
                              type="checkbox"
                              checked={form.acceptedEligibilityCriteria[index] || false}
                              onChange={() => toggleEligibilityCriteria(index)}
                              className="mt-1 h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{criteria.declarationEng}</p>
                              <p className="mt-1 text-xs text-slate-600">{criteria.declarationMrt}</p>
                              {criteria.isMandatory && <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Mandatory</span>}
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-sm font-semibold text-slate-900">Eligibility Criteria</h3>
                    <p className="mt-1 text-xs text-slate-600">
                      No vacancy-specific eligibility criteria were returned for this recruitment.
                    </p>
                  </div>
                )}
                {startOrResumeError ? <p className="text-sm font-semibold text-rose-600">{startOrResumeError}</p> : null}
              </>
            )}

            {currentStep === 1 && (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="First name" error={errors.firstName}>
                  <input value={form.firstName} placeholder='Enter your first name' onChange={(event) => updateField('firstName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Last name" error={errors.lastName}>
                  <input value={form.lastName} placeholder='Enter your last name' onChange={(event) => updateField('lastName', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
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
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </FormField>
                <FormField label="Aadhar No" error={errors.aadhaarNumber}>
                  <input value={form.aadhaarNumber} placeholder='Enter your aadhar number' onChange={(event) => updateField('aadhaarNumber', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <LookupField
                  label="Category"
                  error={errors.category}
                  value={form.category}
                  onChange={handleCategoryChange}
                  options={categoryOptions}
                  isLoading={isMasterLoading}
                  placeholder="Select category"
                />
                <LookupField
                  label="Religion"
                  error={errors.religion}
                  value={form.religion}
                  onChange={handleReligionChange}
                  options={religionOptions}
                  isLoading={isMasterLoading}
                  placeholder="Select religion"
                />
                <LookupField
                  label="Caste"
                  error={errors.caste}
                  value={form.caste}
                  onChange={handleCasteChange}
                  options={casteOptions}
                  isLoading={isMasterLoading || isCasteLoading}
                  placeholder="Select caste"
                />
                <LookupField
                  label="Sub caste"
                  error={errors.subCaste}
                  value={form.subCaste}
                  onChange={(value) => updateField('subCaste', value)}
                  options={subCasteOptions}
                  isLoading={isSubCasteLoading}
                  placeholder="Select sub caste"
                />

                <FormField label="Maharashtra domiciled?" error={errors.maharashtraDomiciled}>
                  <YesNoButtons value={form.maharashtraDomiciled} onChange={(value) => updateField('maharashtraDomiciled', value)} />
                </FormField>
                <FormField label="Non-creamy layer?" error={errors.nonCreamyLayer}>
                  <YesNoButtons value={form.nonCreamyLayer} onChange={(value) => updateField('nonCreamyLayer', value)} />
                </FormField>
                <FormField label="Nationality / Citizenship Indian?" error={errors.nationalityIndian}>
                  <YesNoButtons value={form.nationalityIndian} onChange={(value) => updateField('nationalityIndian', value)} />
                </FormField>
                <FormField label="Marital status" error={errors.maritalStatus}>
                  <select
                    value={form.maritalStatus}
                    onChange={(event) => updateField('maritalStatus', event.target.value)}
                    className={APPLICATION_INPUT_CLASS_NAME}
                  >
                    <option value="">Select marital status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>

                {form.maritalStatus === 'Married' && (
                  <FormField label="Spouse name" error={errors.husbandsName}>
                    <input
                      value={form.husbandsName}
                      placeholder="Enter your spouse name"
                      onChange={(event) => updateField('husbandsName', event.target.value)}
                      className={APPLICATION_INPUT_CLASS_NAME}
                    />
                  </FormField>
                )}

                <FormField label="Mother's name" error={errors.mothersName}>
                  <input
                    value={form.mothersName}
                    placeholder="Enter your mother name"
                    onChange={(event) => updateField('mothersName', event.target.value)}
                    className={APPLICATION_INPUT_CLASS_NAME}
                  />
                </FormField>
                <FormField label="Father's name" error={errors.fathersName}>
                  <input
                    value={form.fathersName}
                    placeholder="Enter your father name"
                    onChange={(event) => updateField('fathersName', event.target.value)}
                    className={APPLICATION_INPUT_CLASS_NAME}
                  />
                </FormField>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Email address" error={errors.email}>
                    <input type="email" disabled value={user?.email} onChange={(event) => updateField('email', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} />
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
                  <LookupField
                    label="Country"
                    error={errors.country}
                    value={form.country}
                    onChange={handleCountryChange}
                    options={countryOptions}
                    isLoading={isMasterLoading}
                    placeholder="Select country"
                  />
                  <LookupField
                    label="State"
                    error={errors.state}
                    value={form.state}
                    onChange={handleStateChange}
                    options={stateOptions}
                    isLoading={isStateLoading}
                    placeholder="Select state"
                  />
                  <LookupField
                    label="District"
                    error={errors.district}
                    value={form.district}
                    onChange={handleDistrictChange}
                    options={districtOptions}
                    isLoading={isDistrictLoading}
                    placeholder="Select district"
                  />
                  <LookupField
                    label="Taluka"
                    error={errors.taluka}
                    value={form.taluka}
                    onChange={(value) => updateField('taluka', value)}
                    options={talukaOptions}
                    isLoading={isTalukaLoading}
                    placeholder="Select taluka"
                  />
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
                  {saveStep1and2Error ? <p className="mt-2 text-sm text-rose-600">{saveStep1and2Error}</p> : null}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Mandatory education levels</p>
                  <p className="mt-1">
                    {mandatoryEducationLevels.length > 0
                      ? mandatoryEducationLevels.join(', ')
                      : 'No education level is marked mandatory for this recruitment.'}
                  </p>
                </div>

                {form.educationEntries.map((entry, index) => {
                  const isMandatory = mandatoryEducationLevels.includes(entry.level);

                  return (
                    <div
                      key={entry.level}
                      className={`rounded-[1.5rem] border p-5 ${isMandatory ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{entry.level}</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {isMandatory
                              ? 'This education must be completed before you continue.'
                              : 'Optional. Fill it only if it applies to you.'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${isMandatory ? 'bg-amber-200/80 text-amber-900' : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                          {isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            Institute / organization{isMandatory ? ' *' : ''}
                          </span>
                          <input
                            value={entry.institute}
                            onChange={(event) => updateEducation(index, 'institute', event.target.value)}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">Education Level{isMandatory ? ' *' : ''}</span>
                          <input
                            value={entry.educationLevel}
                            onChange={(event) => updateEducation(index, 'educationLevel', event.target.value)}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            Specialization{isMandatory ? ' *' : ''}
                          </span>
                          <input
                            value={entry.specialization}
                            onChange={(event) => updateEducation(index, 'specialization', event.target.value)}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            Percentage / CGPA{isMandatory ? ' *' : ''}
                          </span>
                          <input
                            value={entry.score}
                            onChange={(event) => updateEducation(index, 'score', event.target.value)}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">Class / grade{isMandatory ? ' *' : ''}</span>
                          <input
                            value={entry.className}
                            onChange={(event) => updateEducation(index, 'className', event.target.value)}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <FormField label={`Passed month & year${isMandatory ? ' *' : ''}`}>
                          <input
                            type="month"
                            value={entry.passedMonthYear}
                            onChange={(event) =>
                              updateEducation(index, 'passedMonthYear', event.target.value)
                            }
                            className={APPLICATION_INPUT_CLASS_NAME}
                          />
                        </FormField>
                        {/* <label className="block">
                          <span className="text-sm font-semibold text-slate-800">Passed date{isMandatory ? ' *' : ''}</span>
                          <input
                            type="date"
                            value={entry.passedDate ? entry.passedDate.slice(0, 10) : ''}
                            onChange={(event) => updateEducation(index, 'passedDate', event.target.value)}
                            className={APPLICATION_INPUT_CLASS_NAME}
                          />
                        </label> */}
                      </div>
                    </div>
                  );
                })}
                {errors.educationEntries ? <p className="text-sm text-rose-600">{errors.educationEntries}</p> : null}
                {saveStep3Error ? <p className="text-sm text-rose-600">{saveStep3Error}</p> : null}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Experience details (Optional)
                  </p>

                  <button
                    type="button"
                    onClick={addExperienceRow}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Add row
                  </button>
                </div>

                {form.experienceEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="grid gap-4 rounded-[1.5rem] border border-slate-200 p-5 md:grid-cols-2"
                  >
                    <FormField label="Organization Name">
                      <input
                        value={entry.organization}
                        onChange={(event) =>
                          updateExperience(index, 'organization', event.target.value)
                        }
                        className={APPLICATION_INPUT_CLASS_NAME}
                        placeholder="Enter organization name"
                      />
                    </FormField>

                    <FormField label="Designation">
                      <input
                        value={entry.designation}
                        onChange={(event) =>
                          updateExperience(index, 'designation', event.target.value)
                        }
                        className={APPLICATION_INPUT_CLASS_NAME}
                        placeholder="Enter designation"
                      />
                    </FormField>

                    <FormField label="Location">
                      <input
                        value={entry.location}
                        onChange={(event) =>
                          updateExperience(index, 'location', event.target.value)
                        }
                        className={APPLICATION_INPUT_CLASS_NAME}
                        placeholder="Enter location"
                      />
                    </FormField>

                    <FormField label="From Date">
                      <input
                        type="date"
                        value={entry.fromDate}
                        onChange={(event) =>
                          updateExperience(index, 'fromDate', event.target.value)
                        }
                        className={APPLICATION_INPUT_CLASS_NAME}
                      />
                    </FormField>

                    <FormField label="To Date">
                      <input
                        type="date"
                        value={entry.toDate}
                        onChange={(event) =>
                          updateExperience(index, 'toDate', event.target.value)
                        }
                        disabled={entry.isCurrentJob}
                        className={`${APPLICATION_INPUT_CLASS_NAME} disabled:cursor-not-allowed disabled:bg-slate-100`}
                      />
                    </FormField>

                    <FormField label="Current Job">
                      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800">
                        <input
                          type="checkbox"
                          checked={entry.isCurrentJob}
                          onChange={(event) => {
                            const isCurrentJob = event.target.checked;

                            setForm((prev) => ({
                              ...prev,
                              experienceEntries: prev.experienceEntries.map(
                                (row, entryIndex) =>
                                  entryIndex === index
                                    ? {
                                      ...row,
                                      isCurrentJob,
                                      toDate: isCurrentJob ? '' : row.toDate,
                                    }
                                    : row,
                              ),
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              experienceEntries: undefined,
                            }));
                          }}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        Current job
                      </label>
                    </FormField>
                  </div>
                ))}

                {errors.experienceEntries ? (
                  <p className="text-sm text-rose-600">
                    {errors.experienceEntries}
                  </p>
                ) : null}

                {saveStepExperienceError ? (
                  <p className="text-sm text-rose-600">
                    {saveStepExperienceError}
                  </p>
                ) : null}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-8">

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    Mandatory Documents
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <DocumentUploadCard
                      label="Photo"
                      required
                      existingDocument={uploadedDocuments.photo}
                      file={form.documents.photo}
                      onChange={(file) => updateDocument('photo', file)}
                    />

                    <DocumentUploadCard
                      label="Signature"
                      required
                      existingDocument={uploadedDocuments.signature}
                      file={form.documents.signature}
                      onChange={(file) => updateDocument('signature', file)}
                    />

                    <DocumentUploadCard
                      label="Aadhaar"
                      required
                      existingDocument={uploadedDocuments.aadhaar}
                      file={form.documents.aadhaar}
                      onChange={(file) => updateDocument('aadhaar', file)}
                    />
                  </div>
                </div>

                <div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-sm text-amber-800">
                    Upload all documents marked with * as they are required based on eligibility criteria.
                  </div>
                  <h3 className="my-4 text-lg font-semibold text-slate-900">
                    Educational Documents
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <DocumentUploadCard
                      label="SSC Marksheet"
                      required={isMandatoryDocument('SSC_MARKSHEET')}
                      file={form.documents.sscMarksheet}
                      existingDocument={uploadedDocuments.sscMarksheet}
                      onChange={(file) => updateDocument('sscMarksheet', file)}
                    />

                    <DocumentUploadCard
                      label="HSC Marksheet"
                      file={form.documents.hscMarksheet}
                      required={isMandatoryDocument('HSC_MARKSHEET')}
                      existingDocument={uploadedDocuments.hscMarksheet}
                      onChange={(file) => updateDocument('hscMarksheet', file)}
                    />

                    <DocumentUploadCard
                      label="Graduation Marksheet"
                      file={form.documents.degree}
                      required={isMandatoryDocument('DEGREE')}
                      existingDocument={uploadedDocuments.degree}
                      onChange={(file) => updateDocument('degree', file)}
                    />

                    <DocumentUploadCard
                      label="MSCIT Certificate"
                      file={form.documents.mscitCertificate}
                      existingDocument={uploadedDocuments.mscitCertificate}
                      required={isMandatoryDocument('MSCIT_CERTIFICATE')}
                      onChange={(file) => updateDocument('mscitCertificate', file)}
                    />

                    <DocumentUploadCard
                      label="CCC Certificate"
                      file={form.documents.cccCertificate}
                      existingDocument={uploadedDocuments.cccCertificate}
                      required={isMandatoryDocument('CCC_CERTIFICATE')}
                      onChange={(file) => updateDocument('cccCertificate', file)}
                    />
                  </div>
                </div>

              </div>
            )}

            {currentStep === 6 && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                  <ReviewRow label="Application" value={`${form.applicationId} | ${form.bankName} | ${form.postName}`} />
                  <ReviewRow label="Recruitment" value={`${form.recruitmentCode} - ${form.recruitmentName}`} />
                  <ReviewRow label="Applicant" value={fullName} />
                  <ReviewRow label="Birth details" value={`${form.dateOfBirth} | ${form.ageAsOn} | ${form.gender} | ${form.category} | ${form.caste}`} />
                  <ReviewRow label="Family details" value={`Spouse: ${form.husbandsName} | Mother: ${form.mothersName} | ${form.maritalStatus}`} />
                  <ReviewRow label="Contact" value={`${form.email} | ${form.phone} | Alt: ${form.alternatePhone || 'NA'}`} />
                  <ReviewRow label="Address" value={`${form.addressLine1}, ${form.addressLine2}, ${form.addressLine3}, ${form.taluka}, ${form.district}, ${form.state}, ${form.country} - ${form.pincode}`} />
                  <ReviewRow
                    label="Education"
                    value={form.educationEntries
                      .filter((entry) =>
                        [entry.institute, entry.educationLevel, entry.specialization, entry.score, entry.className, entry.passedMonthYear]
                          .some((value) => value?.trim()),
                      )
                      .map((entry) => `${entry.level}: ${entry.institute || entry.educationLevel || 'NA'} | ${entry.score || 'NA'}`)
                      .join(' | ') || 'NA'}
                  />
                  <ReviewRow
                    label="Experience"
                    value={
                      hasExperienceDetails(form.experienceEntries)
                        ? form.experienceEntries
                          .map(
                            (entry) =>
                              `${entry.designation} at ${entry.organization}`,
                          )
                          .join(' | ')
                        : 'Fresher'
                    }
                  />
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
              <button
                type="button"
                onClick={goNext}
                disabled={isStartingOrResuming || isSavingStep1and2 || isSavingStep3 || isSavingStepExperience}
                className="inline-flex items-center justify-center rounded-full bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStartingOrResuming
                  ? 'Starting...'
                  : isSavingStep1and2
                    ? 'Saving...'
                    : isSavingStep3 || isSavingStepExperience
                      ? 'Saving...'
                      : currentStep === 6
                        ? 'Continue to payment'
                        : 'Continue to next step'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}


