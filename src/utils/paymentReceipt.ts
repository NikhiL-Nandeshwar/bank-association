const RECEIPT_MERCHANT_ORDER_PREFIX = 'billdesk_receipt_merchant_order_id_';

export function getReceiptMerchantOrderStorageKey(applicationId: number | string) {
  return `${RECEIPT_MERCHANT_ORDER_PREFIX}${applicationId}`;
}

export function saveReceiptMerchantOrderId(applicationId: number | string, merchantOrderId: string) {
  if (typeof window === 'undefined' || !applicationId || !merchantOrderId) {
    return;
  }

  window.localStorage.setItem(getReceiptMerchantOrderStorageKey(applicationId), merchantOrderId);
}

export function readReceiptMerchantOrderId(applicationId: number | string) {
  if (typeof window === 'undefined' || !applicationId) {
    return null;
  }

  return window.localStorage.getItem(getReceiptMerchantOrderStorageKey(applicationId));
}

export function extractMerchantOrderIdFromRecord(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const record = data as Record<string, unknown>;
  const nestedSources = [record, record.payment, record.application, record.data];

  const keys = [
    'merchantOrderId',
    'merchantorderid',
    'merchant_order_id',
    'gatewayOrderId',
    'orderNumber',
  ];

  for (const source of nestedSources) {
    if (!source || typeof source !== 'object') {
      continue;
    }

    const nested = source as Record<string, unknown>;

    for (const key of keys) {
      const value = nested[key];

      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }

  return '';
}
