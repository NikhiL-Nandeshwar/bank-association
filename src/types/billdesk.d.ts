export {};

declare global {
  interface Window {
    loadBillDeskSdk?: (config: {
      flowConfig: {
        merchantId: string;
        bdOrderId: string;
        authToken: string;
        returnUrl: string;
        childWindow: boolean;
        retryCount: number;
      };
      flowType: 'payments';
      responseHandler: (txn: unknown) => void;
    }) => void;
  }
}
