
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  APPLICATION_INPUT_CLASS_NAME,
  APPLICATION_STEPS,
  LANGUAGE_ABILITIES,
  LANGUAGE_NAMES,
  type EducationEntry, type LanguageAbility, type LanguageName
}
  from '@/constants/application-wizard.constants';
import { getEligibilityCriteria } from '@/actions/api/vacancy.actions';
import { useEffect, useMemo, useState } from 'react';
import type { EligibilityCriteria } from '@/types/api.types';
import { ApplicationWizardProps, ExperienceEntry, FormState, SaveStep1and2Payload } from '@/types/applicationSteps';
import { calculateAgeAsOn, buildSaveStep3Payload, buildSaveStepExperiencePayload, ErrorMap, FormField, getMandatoryEducationLevels, getSelectedMasterId, initialState, LookupField, MAX_CLASS_NAME_LENGTH, MAX_EDUCATION_LEVEL_LENGTH, MAX_EDUCATION_TEXT_LENGTH, MAX_PERCENTAGE_OR_CGPA_LENGTH, normalizeFormState, PaymentReceiptPreview, printPaymentReceipt, ReviewRow, sanitizeLimitedText, sanitizePercentageOrCgpa, sortEligibilityCriteria, SummaryCard, validateStep, YesNoButtons, hasExperienceDetails } from './helper/applicationStepsHelper';
import { getPaymentReceipt, getResumeData, initiateApplicationPayment, saveStep1and2, saveStep3, saveStepExperience, startOrResumeApplication, uploadDocument } from '@/actions/api/application.actions';
import { createSaveStep3Schema, createSaveStepExperienceSchema } from '@/schemas/application.schema';
import { useAuth } from '@/lib/useAuth';
import { toast } from 'sonner';
import { normalizeEligibilityCriteriaResponse } from '@/utils/helper/eligibilityCriteriaHelper';
import { extractApplicationId, splitAuthName } from '@/utils/applicationFormHelper';
import { DOCUMENT_TYPE_MAPPING } from '@/constants/document.constants';
import { useApplicationMasters } from '@/hooks/useApplicationMasters';
import { useStates } from '@/hooks/useStates';
import { useDistricts } from '@/hooks/useDistricts';
import { useTalukas } from '@/hooks/useTalukas';
import { useCastes } from '@/hooks/useCastes';
import { useSubCastes } from '@/hooks/useSubCastes';
import { DocumentUploadCard } from '../common/DocumentUploadCard';
import { mapDocuments, mapEducationEntries, mapExperienceEntries, mapStep1ToFormState, resolveResumeWizardStep } from '@/utils/helper/applicationResumeMapper';
import { extractMerchantOrderIdFromRecord, readReceiptMerchantOrderId, saveReceiptMerchantOrderId } from '@/utils/paymentReceipt';
import type { PaymentReceipt } from '@/types/api.types';

/**
 * ApplicationWizard component manages the multi-step application form for bank recruitment. 
 * It handles form state, validation, API interactions for saving and resuming applications, 
 * and document uploads. The component also displays a progress sidebar and a summary upon submission.
 * @param param0 
 * @returns 
 */
export default function ApplicationWizard({ initialRecruitment, existingApplication }: ApplicationWizardProps) {
  const { user, status } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setForm] = useState<FormState>(() => initialState(initialRecruitment));
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [merchantOrderId, setMerchantOrderId] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState<EligibilityCriteria[]>(
    initialRecruitment.eligibilityCriteria ?? [],
  );
  const {
    categoryOptions,
    religionOptions,
    countryOptions,
    isLoading: isMasterLoading,
  } = useApplicationMasters();

  const [isEligibilityLoading, setIsEligibilityLoading] = useState(false);
  const [isStartingOrResuming, setIsStartingOrResuming] = useState(false);
  const [isSavingStep1and2, setIsSavingStep1and2] = useState(false);
  const [isSavingStep3, setIsSavingStep3] = useState(false);
  const [isSavingStepExperience, setIsSavingStepExperience] = useState(false);
  const [startOrResumeError, setStartOrResumeError] = useState<string | null>(null);
  const [saveStep1and2Error, setSaveStep1and2Error] = useState<string | null>(null);
  const [saveStep3Error, setSaveStep3Error] = useState<string | null>(null);
  const [saveStepExperienceError, setSaveStepExperienceError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [sdkModuleLoaded, setSdkModuleLoaded] = useState(false);
  const [sdkNoModuleLoaded, setSdkNoModuleLoaded] = useState(false);
  const [sdkModuleFailed, setSdkModuleFailed] = useState(false);
  const [sdkNoModuleFailed, setSdkNoModuleFailed] = useState(false);
  const [applicationRecordId, setApplicationRecordId] = useState<number>(0);
  const [isRefreshingApplication, setIsRefreshingApplication] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const isReadOnly = existingApplication?.mode === 'view';

  const sdkLoaded = sdkModuleLoaded || sdkNoModuleLoaded;
  const sdkLoadFailed = !sdkLoaded && sdkModuleFailed && sdkNoModuleFailed;
  const sdkEnabled = sdkLoaded && !sdkLoadFailed;

  const BILLDESK_REFRESH_KEY = 'billdesk_application_refresh_needed';

  const readPaymentRefreshMarker = () => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.sessionStorage.getItem(BILLDESK_REFRESH_KEY) === '1';
  };

  const clearPaymentRefreshMarker = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.removeItem(BILLDESK_REFRESH_KEY);
  };

  const hydrateResumeResponse = (resumeResponse: { data?: any }, applicationId?: number) => {
    const responseData = resumeResponse as { data?: any };
    const step1 = responseData.data?.step1;
    const educationStep =
      responseData.data?.step2 ??
      responseData.data?.educations ??
      responseData.data?.education;
    const experienceStep =
      responseData.data?.step3 ??
      responseData.data?.experiences ??
      responseData.data?.experience;
    const documentStep =
      responseData.data?.step4 ??
      responseData.data?.documents;

    if (documentStep?.length) {
      setUploadedDocuments(
        mapDocuments(documentStep)
      );
    }

    const paymentStatusFromApi = responseData.data && (
      responseData.data.paymentStatus ||
      responseData.data.payment?.status ||
      responseData.data.paymentStatus
    );

    const paymentAmountFromApi = responseData.data && (
      responseData.data.paidAmount ||
      responseData.data.paymentAmount ||
      responseData.data.amount ||
      responseData.data.payment?.paidAmount ||
      responseData.data.payment?.amount
    );

    const transactionRefFromApi = responseData.data && (
      responseData.data.transactionNumber ||
      responseData.data.paymentReference ||
      responseData.data.payment?.reference ||
      responseData.data.orderNumber
    );

    const paidAtFromApi = responseData.data && (
      responseData.data.paidAt ||
      responseData.data.payment?.paidAt ||
      responseData.data.paymentDate
    );

    const paymentMethodFromApi = responseData.data && (
      responseData.data.paymentMethod ||
      responseData.data.payment?.method
    );

    const receiptNumberFromApi = responseData.data && (
      responseData.data.receiptNumber ||
      responseData.data.payment?.receiptNumber ||
      responseData.data.paymentReceiptNumber
    );

    const applicationNumberFromApi = responseData.data && (
      responseData.data.applicationNumber ||
      responseData.data.application?.applicationNumber
    );

    const isSubmittedFromApi = responseData.data && (
      responseData.data.isSubmitted ||
      responseData.data.application?.isSubmitted ||
      responseData.data.submitted ||
      responseData.data.application?.submitted
    );

    const isPaymentCompleteFromApi = responseData.data && (
      responseData.data.isPaymentComplete ||
      responseData.data.payment?.isPaymentComplete ||
      responseData.data.payment?.isComplete ||
      responseData.data.isPaid
    );

    setForm((prev) => {
      const mapped = step1
        ? mapStep1ToFormState(
            prev,
            step1,
            educationStep ?? [],
            experienceStep ?? [],
            user?.email
          )
        : {
            ...prev,
            educationEntries: mapEducationEntries(prev.educationEntries, educationStep ?? []),
            experienceEntries: mapExperienceEntries(prev.experienceEntries, experienceStep ?? []),
          };

      return {
        ...mapped,
        paymentStatus: paymentStatusFromApi ?? mapped.paymentStatus,
        paymentAmount: paymentAmountFromApi ?? mapped.paymentAmount,
        transactionNumber: transactionRefFromApi ?? mapped.transactionNumber,
        paymentDate: paidAtFromApi ?? mapped.paymentDate,
        paymentMethod: paymentMethodFromApi ?? mapped.paymentMethod,
      };
    });
    setReceiptNumber(receiptNumberFromApi ?? '');
    setApplicationNumber(applicationNumberFromApi ? String(applicationNumberFromApi) : '');

    const resolvedApplicationId = applicationId || applicationRecordId;
    const merchantOrderFromApi = extractMerchantOrderIdFromRecord(responseData.data);
    const storedMerchantOrderId = resolvedApplicationId ? readReceiptMerchantOrderId(resolvedApplicationId) : null;
    const resolvedMerchantOrderId = merchantOrderFromApi || storedMerchantOrderId || '';

    if (resolvedMerchantOrderId) {
      setMerchantOrderId(resolvedMerchantOrderId);

      if (resolvedApplicationId) {
        saveReceiptMerchantOrderId(resolvedApplicationId, resolvedMerchantOrderId);
      }
    }

    if (isSubmittedFromApi) {
      setSubmitted(true);
    }
  };

  const resumeApplication = async (vacancyId: number) => {
    const response = await startOrResumeApplication(vacancyId);
    const applicationId = extractApplicationId(response.data);
    setApplicationRecordId(applicationId);

    const resumeResponse = await getResumeData(applicationId);
    const responseData = resumeResponse as { data?: any };
    const resumeData = responseData.data as any;

    const currentStepFromApi = resumeData?.currentStep;
    const isPaymentCompleteFromApi = resumeData && (
      resumeData.isPaymentComplete ||
      resumeData.payment?.isPaymentComplete ||
      resumeData.payment?.isComplete ||
      resumeData.isPaid
    );
    const isSubmittedFromApi = resumeData && (
      resumeData.isSubmitted ||
      resumeData.application?.isSubmitted ||
      resumeData.submitted ||
      resumeData.application?.submitted
    );

    if (isSubmittedFromApi || isPaymentCompleteFromApi) {
      setCurrentStep(APPLICATION_STEPS.length - 1);
    } else {
      setCurrentStep(resolveResumeWizardStep(resumeData));
    }

    hydrateResumeResponse(resumeResponse, applicationId);
  };

  const loadExistingApplication = async (applicationId: number, readOnly: boolean) => {
    setApplicationRecordId(applicationId);
    const resumeResponse = await getResumeData(applicationId);
    const resumeData = (resumeResponse as { data?: any }).data;

    hydrateResumeResponse(resumeResponse, applicationId);

    if (readOnly) {
      setSubmitted(true);
      setCurrentStep(APPLICATION_STEPS.length - 1);
    } else {
      setCurrentStep(resolveResumeWizardStep(resumeData));
    }
  };

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

  const form = useMemo(
    () => normalizeFormState(initialRecruitment, formState),
    [formState, initialRecruitment],
  );

  useEffect(() => {
    if (isReadOnly || currentStep !== 7) {
      return;
    }

    if (!document.getElementById('billdesk-sdk-module')) {
      const moduleScript = document.createElement('script');
      moduleScript.id = 'billdesk-sdk-module';
      moduleScript.type = 'module';
      moduleScript.src = 'https://pay.billdesk.com/websdk/shared/billdesksdk.esm.js';
      moduleScript.async = true;
      moduleScript.onload = () => {
        console.log('BillDesk ESM SDK loaded successfully', {
          id: moduleScript.id,
          src: moduleScript.src,
          type: moduleScript.type,
        });
        setSdkModuleLoaded(true);
      };
      moduleScript.onerror = (event) => {
        console.error('BillDesk ESM SDK failed to load', {
          id: moduleScript.id,
          src: moduleScript.src,
          type: moduleScript.type,
          event,
        });
        setSdkModuleFailed(true);
      };
      document.head.appendChild(moduleScript);
    }
  }, [currentStep, isReadOnly]);

  const uploadedDocs = [
    uploadedDocuments.photo || form.documents.photo
      ? 'Photo'
      : null,

    uploadedDocuments.signature || form.documents.signature
      ? 'Signature'
      : null,

    uploadedDocuments.aadhaar || form.documents.aadhaar
      ? 'Aadhaar'
      : null,

    uploadedDocuments.sscMarksheet || form.documents.sscMarksheet
      ? 'SSC Marksheet'
      : null,

    uploadedDocuments.hscMarksheet || form.documents.hscMarksheet
      ? 'HSC Marksheet'
      : null,

    uploadedDocuments.degree || form.documents.degree
      ? 'Graduation Marksheet'
      : null,

    uploadedDocuments.mscitCertificate || form.documents.mscitCertificate
      ? 'MSCIT Certificate'
      : null,

    uploadedDocuments.cccCertificate || form.documents.cccCertificate
      ? 'CCC Certificate'
      : null,
  ].filter(Boolean);

  const selectedIds = useMemo(
    () => ({
      countryId: getSelectedMasterId(form.country),
      stateId: getSelectedMasterId(form.state),
      districtId: getSelectedMasterId(form.district),
      categoryId: getSelectedMasterId(form.category),
      religionId: getSelectedMasterId(form.religion),
      casteId: getSelectedMasterId(form.caste),
    }),
    [
      form.country,
      form.state,
      form.district,
      form.category,
      form.religion,
      form.caste,
    ],
  );

  const {
    stateOptions,
    isLoading: isStateLoading,
  } = useStates(selectedIds.countryId);

  const {
    districtOptions,
    isLoading: isDistrictLoading,
  } = useDistricts(selectedIds.stateId);

  const {
    talukaOptions,
    isLoading: isTalukaLoading,
  } = useTalukas(selectedIds.districtId, selectedIds.stateId);

  const {
    casteOptions,
    isLoading: isCasteLoading,
  } = useCastes(selectedIds.categoryId, selectedIds.religionId);

  const {
    subCasteOptions,
    isLoading: isSubCasteLoading,
  } = useSubCastes(selectedIds.casteId);

  useEffect(() => {
    setForm(initialState(initialRecruitment));
    setCurrentStep(0);
    setErrors({});
    setSubmitted(false);
    setShowReceipt(false);
    setPaymentReceipt(null);
    setMerchantOrderId('');
    setEligibilityCriteria(initialRecruitment.eligibilityCriteria ?? []);
    setIsStartingOrResuming(false);
    setStartOrResumeError(null);
    setSaveStep3Error(null);
    setSaveStepExperienceError(null);
    setPaymentError(null);
    setIsProcessingPayment(false);
    setApplicationRecordId(0);
    setApplicationNumber('');
    setReceiptNumber('');
    setIsLoadingReceipt(false);
  }, [initialRecruitment]); // re-init when recruitment changes

  useEffect(() => {
    if (!existingApplication || status !== 'authenticated') {
      return;
    }

    let isActive = true;
    setIsStartingOrResuming(true);
    setStartOrResumeError(null);

    void loadExistingApplication(existingApplication.applicationId, existingApplication.mode === 'view')
      .catch(() => {
        if (isActive) {
          setStartOrResumeError('Could not load your existing application. Please try again.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsStartingOrResuming(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [existingApplication, status]);

  useEffect(() => {
    const vacancyId = initialRecruitment.vacancyId;

    if (status !== 'authenticated' || !user || vacancyId === undefined) {
      return;
    }

    if (!readPaymentRefreshMarker()) {
      return;
    }

    let isActive = true;
    setIsRefreshingApplication(true);

    void (async () => {
      try {
        await resumeApplication(vacancyId);
      } catch (error) {
        console.error('Unable to refresh application after payment', error);
      } finally {
        if (isActive) {
          setIsRefreshingApplication(false);
          clearPaymentRefreshMarker();
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [status, user, initialRecruitment.vacancyId]);

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

  const getCategoryName = (id: string) =>
    categoryOptions.find(
      (x) => x.value === id
    )?.label ?? id;

  const getReligionName = (id: string) =>
    religionOptions.find(
      (x) => x.value === id
    )?.label ?? id;

  const getCasteName = (id: string) =>
    casteOptions.find(
      (x) => x.value === id
    )?.label ?? id;

  const getSubCasteName = (id: string) =>
    subCasteOptions.find(
      (x) => x.value === id
    )?.label ?? id;

  const getCountryName = (id: string) => countryOptions.find((x) => x.value === id)?.label ?? '';
  const getStateName = (id: string) => stateOptions.find((x) => x.value === id)?.label ?? '';
  const getDistrictName = (id: string) => districtOptions.find((x) => x.value === id)?.label ?? '';
  const getTalukaName = (id: string) => talukaOptions.find((x) => x.value === id)?.label ?? '';

  const reviewAddress = [
    form.addressLine1,
    form.addressLine2,
    form.addressLine3,
    getTalukaName(form.taluka),
    getDistrictName(form.district),
    getStateName(form.state),
    getCountryName(form.country),
    form.pincode,
  ].filter((value) => value?.trim()).join(', ');

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
  const autoFilledEmail = user?.email?.trim() || form.email;

  const sanitizePersonName = (value: string) => value.replace(/[^A-Za-z\s]/g, '').slice(0, 40);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateAadhaarNumber = (value: string) => {
    const aadhaarNumber = value.replace(/\D/g, '').slice(0, 12);
    setForm((prev) => ({ ...prev, aadhaarNumber }));
    setErrors((prev) => ({
      ...prev,
      aadhaarNumber: prev.aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)
        ? 'Enter a valid 12-digit Aadhaar number.'
        : undefined,
    }));
  };

  const updatePhoneNumber = (field: 'phone' | 'alternatePhone', value: string) => {
    const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
    const isValid = field === 'alternatePhone'
      ? !phoneNumber || /^\d{10}$/.test(phoneNumber)
      : /^\d{10}$/.test(phoneNumber);

    setForm((prev) => ({ ...prev, [field]: phoneNumber }));
    setErrors((prev) => ({
      ...prev,
      [field]: prev[field] && !isValid
        ? field === 'phone'
          ? 'Enter a valid 10-digit phone number.'
          : 'Enter a valid 10-digit alternate number.'
        : undefined,
    }));
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
      aadhaarNumber: f.aadhaarNumber || '',
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

  const goNext = async () => {
    console.log('currentStep', currentStep)
    if (currentStep === 0 && isEligibilityLoading) {
      setErrors({ acceptedEligibilityCriteria: 'Please wait for the eligibility criteria to load.' });
      return;
    }

    const nextErrors = validateStep(
      currentStep,
      { ...form, email: autoFilledEmail },
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
    if (currentStep === 0 && applicationRecordId === 0) {
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
        const resumeData = (resumeResponse as { data?: any }).data;
        const resumeStep = resolveResumeWizardStep(resumeData);

        hydrateResumeResponse(resumeResponse, applicationId);
        setApplicationRecordId(applicationId);

        if (resumeStep > 0) {
          setCurrentStep(resumeStep);
          return;
        }
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

  const handleViewOrDownloadReceipt = async () => {
    const storedMerchantOrderId =
      merchantOrderId ||
      (applicationRecordId ? readReceiptMerchantOrderId(applicationRecordId) : null) ||
      '';

    if (!storedMerchantOrderId) {
      toast.error('Receipt is not available yet. Please try again after payment is confirmed.');
      return;
    }

    if (paymentReceipt) {
      setShowReceipt(true);
      return;
    }

    setIsLoadingReceipt(true);

    try {
      const response = await getPaymentReceipt(storedMerchantOrderId);
      setMerchantOrderId(storedMerchantOrderId);
      setPaymentReceipt(response.data);
      setShowReceipt(true);

      if (response.data?.receiptNumber) {
        setReceiptNumber(response.data.receiptNumber);
      }
    } catch (error) {
      console.error('Failed to load payment receipt', error);
      toast.error(error instanceof Error ? error.message : 'Could not load the payment receipt.');
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const extractPaymentReference = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const record = data as Record<string, unknown>;
    const candidates = [
      record.transactionNumber,
      record.transactionNo,
      record.transactionId,
      record.transactionID,
      record.paymentReference,
      record.paymentRef,
      record.referenceNumber,
      record.referenceNo,
      record.orderId,
      record.orderID,
      record.orderNumber,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }

      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return String(candidate);
      }
    }

    if ('data' in record && typeof record.data === 'object') {
      return extractPaymentReference(record.data);
    }

    return '';
  };

  const extractNestedStringValue = (data: unknown, keys: string[]) => {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const record = data as Record<string, unknown>;

    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string') {
        return value;
      }
    }

    if ('data' in record && typeof record.data === 'object') {
      return extractNestedStringValue(record.data, keys);
    }

    return undefined;
  };

  const extractBillDeskOrderId = (data: unknown) => {
    return extractNestedStringValue(data, [
      'bdOrderId',
      'bdorderid',
    ]);
  };

  const extractBillDeskAuthToken = (data: unknown) => {
    return extractNestedStringValue(data, [
      'authToken',
      'auth_token',
    ]);
  };

  const extractBillDeskMerchantOrderId = (data: unknown) => {
    return extractNestedStringValue(data, [
      'merchantOrderId',
      'merchantorderid',
      'merchant_order_id',
      'gatewayOrderId',
      'gatewayorderid',
      'gateway_order_id',
      'orderId',
      'orderID',
      'orderNumber',
    ]);
  };

  const extractBillDeskPaymentId = (data: unknown) => {
    return extractNestedStringValue(data, [
      'paymentId',
      'paymentID',
      'payment_id',
    ]);
  };

  const extractPaymentAmount = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const record = data as Record<string, unknown>;
    const candidates = [
      record.amount,
      record.totalAmount,
      record.paymentAmount,
      record.amountPayable,
      record.payableAmount,
      record.transactionAmount,
      record.orderAmount,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }

      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return String(candidate);
      }
    }

    if ('data' in record && typeof record.data === 'object') {
      return extractPaymentAmount(record.data);
    }

    return '';
  };

  const handleBillDeskResponse = (txn: unknown) => {
    console.log('BillDesk callback', txn);
    setForm((prev) => ({
      ...prev,
      paymentStatus: 'Verifying payment',
    }));
  };

  const handleInitiatePayment = async () => {
    if (!applicationRecordId) {
      setPaymentError('Application record is not ready. Please restart the wizard and ensure the application is created first.');
      return;
    }

    if (sdkLoadFailed) {
      setPaymentError('BillDesk payment SDK failed to load. Please refresh the page and try again.');
      return;
    }

    if (!sdkLoaded) {
      setPaymentError('Waiting for the BillDesk payment SDK to load. Please try again in a moment.');
      return;
    }

    if (typeof window.loadBillDeskSdk !== 'function') {
      setPaymentError('BillDesk payment SDK is loaded but not available. Please refresh and try again.');
      return;
    }

    setPaymentError(null);
    setPaymentInitiated(false);
    setIsProcessingPayment(true);

    try {
      const response = await initiateApplicationPayment(applicationRecordId);
      console.log('BillDesk Response:', response);
      const responseData = response?.data as Record<string, unknown> | undefined;
      const bdOrderId = responseData && extractBillDeskOrderId(responseData);
      const merchantOrderId = responseData && extractBillDeskMerchantOrderId(responseData);
      const paymentId = responseData && extractBillDeskPaymentId(responseData);
      const authToken = responseData && extractBillDeskAuthToken(responseData);
      const paymentAmount = extractPaymentAmount(responseData);
      const transactionNumber =
        extractPaymentReference(response.data) || `BILL${Date.now().toString().slice(-8)}`;

      if (!bdOrderId) {
        setPaymentError(
          'The payment gateway did not return the required BillDesk order id. Please try again.'
        );
        setForm((prev) => ({
          ...prev,
          paymentAmount: paymentAmount || prev.paymentAmount,
        }));
        return;
      }

      if (!authToken) {
        setPaymentError(
          'The BillDesk order was created, but authToken is missing from the backend response. The raw authToken must be passed unchanged.'
        );
        setForm((prev) => ({
          ...prev,
          paymentAmount: paymentAmount || prev.paymentAmount,
          transactionNumber,
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        paymentStatus: 'Payment order created',
        transactionNumber,
        paymentAmount: paymentAmount || prev.paymentAmount,
        paymentDate: new Date().toLocaleDateString('en-IN'),
      }));

      const flowConfig = {
        merchantId: 'KOPBASSOV2',
        bdOrderId,
        authToken,
        returnUrl: 'https://www.kopbankasso-recruit-book.com/payment/billdesk-return?module=APPLICATION',
        childWindow: false,
        retryCount: 3,
      } as const;

      if (typeof window !== 'undefined' && merchantOrderId) {
        setMerchantOrderId(merchantOrderId);
        saveReceiptMerchantOrderId(applicationRecordId, merchantOrderId);
        window.sessionStorage.setItem(
          'billdesk_application_merchant_order_id',
          merchantOrderId,
        );

        if (paymentId) {
          window.sessionStorage.setItem(
            'billdesk_application_payment_id',
            paymentId,
          );
        }

        window.sessionStorage.setItem(
          'billdesk_application_bd_order_id',
          bdOrderId,
        );

        window.sessionStorage.setItem(
          'billdesk_application_application_id',
          String(applicationRecordId),
        );
      }

      const config = {
        flowConfig,
        flowType: 'payments' as const,
        responseHandler: handleBillDeskResponse,
      };

      console.log('BillDesk runtime diagnostics before loadBillDeskSdk', {
        loadBillDeskSdk: typeof (window as any).loadBillDeskSdk,
        BillDesk: typeof (window as any).BillDesk,
        sdkModuleLoaded,
        sdkNoModuleLoaded,
        hasModuleScript: !!document.getElementById('billdesk-sdk-module'),
        hasNoModuleScript: !!document.getElementById('billdesk-sdk-nomodule'),
      });

      window.loadBillDeskSdk(config);
      console.log('BillDesk loadBillDeskSdk call completed');
      setPaymentInitiated(true);
      setForm((prev) => ({
        ...prev,
        paymentStatus: 'Awaiting payment',
      }));
    } catch (error) {
      console.error('Failed to initiate payment', error);
      setPaymentError('Could not initiate BillDesk payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const step = APPLICATION_STEPS[currentStep];
  const isPaymentComplete = isReadOnly || submitted || (form.paymentStatus && /success/i.test(String(form.paymentStatus)));
  const progressSteps = submitted
    ? [...APPLICATION_STEPS, { id: '09', title: 'Submitted', description: 'Your application has been received.' }]
    : APPLICATION_STEPS;

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
                <span>{submitted ? '100%' : progress}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-300 transition-all duration-300"
                style={{ width: submitted ? '100%' : progress }}
              />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {progressSteps.map((item, index) => {
              const isActive = !submitted && index === currentStep;
              const isDone = submitted || index < currentStep;

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

        {submitted ? (
          <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] md:p-8">
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Application submitted</p>
              <h2 className="mt-2 text-2xl font-semibold">Application received</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Your application has been submitted successfully. Your payment has been received and your application is now under review. You can revisit this page anytime to view your submitted application.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ReviewRow label="Application number" value={applicationNumber || form.applicationId || String(applicationRecordId) || 'N/A'} />
              <ReviewRow label="Bank name" value={form.bankName || 'N/A'} />
              <ReviewRow label="Post name" value={form.postName || 'N/A'} />
              <ReviewRow label="Payment status" value="Paid" />
              <ReviewRow label="Amount paid" value={form.paymentAmount ? `Rs. ${form.paymentAmount}` : 'N/A'} />
              <ReviewRow label="Payment date" value={form.paymentDate || 'N/A'} />
              <ReviewRow label="Payment method" value={form.paymentMethod || 'N/A'} />
              <ReviewRow label="Transaction number" value={form.transactionNumber || 'N/A'} />
              {receiptNumber ? <ReviewRow label="Receipt number" value={receiptNumber} /> : null}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleViewOrDownloadReceipt}
                disabled={isLoadingReceipt}
                className="inline-flex items-center justify-center rounded-full bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingReceipt ? 'Loading receipt...' : 'View / Download Receipt'}
              </button>
            </div>

            {showReceipt && paymentReceipt ? (
              <PaymentReceiptPreview
                receipt={paymentReceipt}
                onDownload={() => printPaymentReceipt(paymentReceipt)}
              />
            ) : null}
          </div>
        ) : null}

        {!submitted ? (
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
                  <input value={form.firstName} maxLength={40} placeholder='Enter your first name' onChange={(event) => updateField('firstName', sanitizePersonName(event.target.value))} className={APPLICATION_INPUT_CLASS_NAME} />
                </FormField>
                <FormField label="Last name" error={errors.lastName}>
                  <input value={form.lastName} maxLength={40} placeholder='Enter your last name' onChange={(event) => updateField('lastName', sanitizePersonName(event.target.value))} className={APPLICATION_INPUT_CLASS_NAME} />
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
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    value={form.aadhaarNumber}
                    placeholder="Enter your 12-digit Aadhaar number"
                    onChange={(event) => updateAadhaarNumber(event.target.value)}
                    className={APPLICATION_INPUT_CLASS_NAME}
                  />
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
                    maxLength={40}
                    placeholder="Enter your mother name"
                    onChange={(event) => updateField('mothersName', sanitizePersonName(event.target.value))}
                    className={APPLICATION_INPUT_CLASS_NAME}
                  />
                </FormField>
                <FormField label="Father's name" error={errors.fathersName}>
                  <input
                    value={form.fathersName}
                    maxLength={40}
                    placeholder="Enter your father name"
                    onChange={(event) => updateField('fathersName', sanitizePersonName(event.target.value))}
                    className={APPLICATION_INPUT_CLASS_NAME}
                  />
                </FormField>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Email address" error={errors.email}>
                    <input
                      type="email"
                      value={autoFilledEmail}
                      readOnly
                      className={`${APPLICATION_INPUT_CLASS_NAME} cursor-not-allowed bg-slate-100 text-slate-500`}
                    />
                  </FormField>
                  <FormField label="Mobile number" error={errors.phone}>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={form.phone} onChange={(event) => updatePhoneNumber('phone', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="10-digit number" />
                  </FormField>
                  <FormField label="Alternate phone" error={errors.alternatePhone}>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={form.alternatePhone} onChange={(event) => updatePhoneNumber('alternatePhone', event.target.value)} className={APPLICATION_INPUT_CLASS_NAME} placeholder="Optional" />
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
                            maxLength={MAX_EDUCATION_TEXT_LENGTH}
                            onChange={(event) => updateEducation(index, 'institute', sanitizeLimitedText(event.target.value, MAX_EDUCATION_TEXT_LENGTH))}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">Education Level{isMandatory ? ' *' : ''}</span>
                          <input
                            value={entry.educationLevel}
                            maxLength={MAX_EDUCATION_LEVEL_LENGTH}
                            onChange={(event) => updateEducation(index, 'educationLevel', sanitizeLimitedText(event.target.value, MAX_EDUCATION_LEVEL_LENGTH))}
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
                            maxLength={MAX_EDUCATION_TEXT_LENGTH}
                            onChange={(event) => updateEducation(index, 'specialization', sanitizeLimitedText(event.target.value, MAX_EDUCATION_TEXT_LENGTH))}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">
                            Percentage / CGPA{isMandatory ? ' *' : ''}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.]?[0-9]*"
                            maxLength={MAX_PERCENTAGE_OR_CGPA_LENGTH}
                            value={entry.score}
                            onChange={(event) => updateEducation(index, 'score', sanitizePercentageOrCgpa(event.target.value))}
                            className={APPLICATION_INPUT_CLASS_NAME}
                            placeholder={isMandatory ? 'Required' : 'Optional'}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-800">Class / grade{isMandatory ? ' *' : ''}</span>
                          <input
                            value={entry.className}
                            maxLength={MAX_CLASS_NAME_LENGTH}
                            onChange={(event) => updateEducation(index, 'className', sanitizeLimitedText(event.target.value, MAX_CLASS_NAME_LENGTH))}
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

              <div className="max-h-[90vh] overflow-y-auto pr-2 space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">

                    {/* Recruitment */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Recruitment Details
                      </h3>

                      <ReviewRow
                        label="Application"
                        value={`${form.applicationId} | ${form.bankName} | ${form.postName}`}
                      />

                      <ReviewRow
                        label="Recruitment"
                        value={`${form.recruitmentCode} - ${form.recruitmentName}`}
                      />
                    </div>

                    {/* Personal Information */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Personal Information
                      </h3>

                      <ReviewRow label="Full Name" value={fullName || 'N/A'} />

                      <ReviewRow
                        label="Date Of Birth"
                        value={`${form.dateOfBirth || 'N/A'} | Age: ${form.ageAsOn || 'N/A'}`}
                      />

                      <ReviewRow
                        label="Gender"
                        value={form.gender || 'N/A'}
                      />

                      <ReviewRow
                        label="Aadhaar Number"
                        value={form.aadhaarNumber || 'N/A'}
                      />

                      <ReviewRow
                        label="Marital Status"
                        value={form.maritalStatus || 'N/A'}
                      />

                      <ReviewRow
                        label="Spouse Name"
                        value={form.husbandsName || 'N/A'}
                      />

                      <ReviewRow
                        label="Father's Name"
                        value={form.fathersName || 'N/A'}
                      />

                      <ReviewRow
                        label="Mother's Name"
                        value={form.mothersName || 'N/A'}
                      />
                    </div>

                    {/* Category & Reservation */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Category & Reservation Details
                      </h3>

                      <ReviewRow
                        label="Category"
                        value={getCategoryName(form.category) || 'N/A'}
                      />

                      <ReviewRow
                        label="Religion"
                        value={getReligionName(form.religion) || 'N/A'}
                      />

                      <ReviewRow
                        label="Caste"
                        value={getCasteName(form.caste) || 'N/A'}
                      />

                      <ReviewRow
                        label="Sub Caste"
                        value={getSubCasteName(form.subCaste) || 'N/A'}
                      />

                      <ReviewRow
                        label="Maharashtra Domicile"
                        value={form.maharashtraDomiciled || 'N/A'}
                      />

                      <ReviewRow
                        label="Non Creamy Layer"
                        value={form.nonCreamyLayer || 'N/A'}
                      />

                      <ReviewRow
                        label="Indian National"
                        value={form.nationalityIndian || 'N/A'}
                      />
                    </div>

                    {/* Contact */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Contact Information
                      </h3>

                      <ReviewRow
                        label="Email"
                        value={autoFilledEmail || 'N/A'}
                      />

                      <ReviewRow
                        label="Mobile"
                        value={form.phone || 'N/A'}
                      />

                      <ReviewRow
                        label="Alternate Mobile"
                        value={form.alternatePhone || 'N/A'}
                      />

                      <ReviewRow
                        label="Address"
                        value={reviewAddress || 'N/A'}
                      />
                    </div>

                    {/* Languages */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Languages Known
                      </h3>

                      <ReviewRow
                        label="Languages"
                        value={
                          LANGUAGE_NAMES
                            .filter((language) =>
                              Object.values(
                                form.languageSkills[language]
                              ).some(Boolean)
                            )
                            .map((language) => {
                              const abilities = [];

                              if (form.languageSkills[language].read) {
                                abilities.push('Read');
                              }

                              if (form.languageSkills[language].write) {
                                abilities.push('Write');
                              }

                              if (form.languageSkills[language].speak) {
                                abilities.push('Speak');
                              }

                              return `${language}: ${abilities.join(', ')}`;
                            })
                            .join(' | ') || 'N/A'
                        }
                      />
                    </div>

                    {/* Education */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Education Details
                      </h3>

                      {form.educationEntries
                        .filter(
                          (entry) =>
                            entry.institute?.trim() ||
                            entry.score?.trim() ||
                            entry.passedMonthYear?.trim()
                        )
                        .map((entry) => (
                          <div
                            key={entry.level}
                            className="rounded-xl border border-slate-300 bg-white p-4"
                          >
                            <h4 className="font-semibold text-slate-900">
                              {entry.level}
                            </h4>

                            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                              {entry.institute && (
                                <p>
                                  <span className="font-medium">
                                    Institute:
                                  </span>{' '}
                                  {entry.institute}
                                </p>
                              )}

                              {entry.specialization && (
                                <p>
                                  <span className="font-medium">
                                    Specialization:
                                  </span>{' '}
                                  {entry.specialization}
                                </p>
                              )}

                              {entry.score && (
                                <p>
                                  <span className="font-medium">
                                    Score:
                                  </span>{' '}
                                  {entry.score}
                                </p>
                              )}

                              {entry.className && (
                                <p>
                                  <span className="font-medium">
                                    Class:
                                  </span>{' '}
                                  {entry.className}
                                </p>
                              )}

                              {entry.passedMonthYear && (
                                <p>
                                  <span className="font-medium">
                                    Passed:
                                  </span>{' '}
                                  {entry.passedMonthYear}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Experience */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Experience Details
                      </h3>

                      {hasExperienceDetails(form.experienceEntries) ? (
                        form.experienceEntries.map((entry, index) => (
                          <ReviewRow
                            key={index}
                            label={`Experience ${index + 1}`}
                            value={`${entry.designation || 'N/A'} | ${entry.organization || 'N/A'} | ${entry.location || 'N/A'} | ${entry.fromDate || 'N/A'} - ${entry.isCurrentJob ? 'Current' : entry.toDate || 'N/A'}`}
                          />
                        ))
                      ) : (
                        <ReviewRow
                          label="Experience"
                          value="Fresher"
                        />
                      )}
                    </div>

                    {/* Documents */}
                    <div className="rounded-[1.75rem] border border-slate-100 bg-slate-100 p-6">
                      <h3 className="mb-4 text-lg font-semibold text-purple-500">
                        Uploaded Documents
                      </h3>

                      <ReviewRow
                        label="Uploaded Documents"
                        value={uploadedDocs.join(', ') || 'None'}
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] bg-slate-800 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                      Final declaration
                    </p>

                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      I confirm that all personal details, educational information,
                      experience details and uploaded documents are correct and match
                      my original records. I understand that any discrepancy may lead
                      to rejection of my application.
                    </p>

                    <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.declarationAccepted}
                        onChange={(event) =>
                          updateField(
                            'declarationAccepted',
                            event.target.checked
                          )
                        }
                        className="mt-1 h-4 w-4 rounded border-white/20"
                      />

                      <span>
                        I have reviewed all details and wish to continue to payment.
                      </span>
                    </label>

                    {errors.declarationAccepted ? (
                      <p className="mt-3 text-sm text-rose-300">
                        {errors.declarationAccepted}
                      </p>
                    ) : null}
                  </div>
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
                    <ReviewRow label="Amount payable" value={form.paymentAmount ? `Rs. ${form.paymentAmount}` : 'Pending'} />
                    <ReviewRow label="Payment status" value={form.paymentStatus || 'Pending'} />
                    {form.paymentMethod ? <ReviewRow label="Payment method" value={form.paymentMethod} /> : null}
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-slate-800 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Payment</p>
                  <p className="mt-3 text-4xl font-semibold">{form.paymentAmount ? `Rs. ${form.paymentAmount}` : 'Pending'}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    This step starts the payment process for your application record. The backend returns BillDesk Web SDK order details that the payment widget will use to complete payment.
                  </p>
                  {!isPaymentComplete && paymentError ? <p className="mt-3 text-sm font-semibold text-rose-300">{paymentError}</p> : null}
                  {!isPaymentComplete && !sdkLoaded && !sdkLoadFailed ? (
                    <p className="mt-3 text-sm text-slate-300">Loading the BillDesk payment SDK. Please wait before you try again.</p>
                  ) : null}
                  {isPaymentComplete ? (
                    <div className="space-y-4">
                      <div className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white text-center">
                        ✓ Payment Completed Successfully
                      </div>
                      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-900/10 p-4 text-sm text-slate-100">
                        <p><span className="font-semibold">Reference:</span> {form.transactionNumber || 'N/A'}</p>
                        {form.paymentMethod ? <p><span className="font-semibold">Method:</span> {form.paymentMethod}</p> : null}
                        {form.paymentDate ? <p><span className="font-semibold">Paid on:</span> {form.paymentDate}</p> : null}
                      </div>
                      <button
                        type="button"
                        onClick={handleViewOrDownloadReceipt}
                        disabled={isLoadingReceipt}
                        className="w-full rounded-full bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoadingReceipt ? 'Loading receipt...' : 'View / Download Receipt'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleInitiatePayment}
                      disabled={isProcessingPayment || !sdkEnabled}
                      className="mt-6 w-full rounded-full bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessingPayment ? 'Initiating payment...' : 'Pay Now'}
                    </button>
                  )}
                  {!isPaymentComplete && paymentInitiated ? (
                    <p className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-50 px-4 py-3 text-sm text-slate-700">
                      BillDesk payment has been initiated. Complete the payment using the BillDesk NEO widget or checkout flow, then return to this page.
                    </p>
                  ) : null}
                </div>
              </div>
            )}
            {currentStep === 7 && showReceipt && paymentReceipt ? (
              <PaymentReceiptPreview
                receipt={paymentReceipt}
                onDownload={() => printPaymentReceipt(paymentReceipt)}
              />
            ) : null}
          </div>

          {!isReadOnly ? (
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
          ) : null}
        </div>
        ) : null}
      </div>
    </section>
  );
}


