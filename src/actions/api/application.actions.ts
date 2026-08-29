import { apiRequest } from '@/actions/api/client';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { CandidateApplicationSummary, PaymentReceipt } from '@/types/api.types';
import { SaveStep1and2Payload, SaveStep3Payload, SaveStepExperiencePayload } from '@/types/applicationSteps';

export async function startOrResumeApplication(vacancyId: number) {
  return apiRequest<unknown>(`${API_ENDPOINTS.application.startOrResume}?vacancyId=${vacancyId}`, {
    method: 'POST',
  });
}

export async function getMyApplications() {
  return apiRequest<CandidateApplicationSummary[]>(API_ENDPOINTS.application.myApplications, {
    method: 'GET',
  });
}

export async function getResumeData(applicationId: number) {
  return apiRequest<unknown>(
    `${API_ENDPOINTS.application.getResumeData}?applicationId=${applicationId}`,
    {
      method: 'GET',
    }
  );
}

export async function saveStep1and2(payload: SaveStep1and2Payload) {
  return apiRequest<unknown>(API_ENDPOINTS.application.step1and2, {
    method: 'POST',
    body: payload,
  });
}

export async function saveStep3(payload: SaveStep3Payload) {
  return apiRequest<unknown>(API_ENDPOINTS.application.step3, {
    method: 'POST',
    body: payload,
  });
}

export async function saveStepExperience(payload: SaveStepExperiencePayload) {
  return apiRequest<unknown>(API_ENDPOINTS.application.stepExperience, {
    method: 'POST',
    body: payload,
  });
}

export async function initiateApplicationPayment(applicationId: number, paymentMethod?: string) {
  const body: Record<string, unknown> = {
    applicationId,
  };

  if (paymentMethod) {
    body.paymentMethod = paymentMethod;
  }

  return apiRequest<unknown>(
    `${API_ENDPOINTS.payment.initiateApplication}?applicationId=${applicationId}`,
    {
      method: 'POST',
      body,
    }
  );
}

/** Starts a BillDesk order for an eBook. Coupon codes are optional and omitted when blank. */
export async function initiateBookPayment(bookId: number, couponCode?: string) {
  const query = new URLSearchParams({ bookId: String(bookId) });
  if (couponCode?.trim()) query.set('couponCode', couponCode.trim());

  return apiRequest<unknown>(`${API_ENDPOINTS.payment.initiateBook}?${query.toString()}`, {
    method: 'POST',
  });
}

export async function getApplicationPaymentStatus(merchantOrderId: string) {
  return apiRequest<unknown>(
    `${API_ENDPOINTS.payment.status}?merchantOrderId=${encodeURIComponent(merchantOrderId)}`,
    {
      method: 'GET',
    }
  );
}

export async function getPaymentReceipt(merchantOrderId: string) {
  return apiRequest<PaymentReceipt>(
    `${API_ENDPOINTS.payment.receipt}?merchantOrderId=${encodeURIComponent(merchantOrderId)}`,
    {
      method: 'GET',
    }
  );
}

export async function uploadDocument(
  applicationId: number,
  documentType: string,
  file: File,
) {
  const formData = new FormData();

  formData.append(
    'ApplicationId',
    String(applicationId),
  );

  formData.append(
    'DocumentType',
    documentType,
  );

  formData.append(
    'File',
    file,
  );

  return apiRequest(
    API_ENDPOINTS.application.uploadDocument,
    {
      method: 'POST',
      body: formData,
    },
  );
}
