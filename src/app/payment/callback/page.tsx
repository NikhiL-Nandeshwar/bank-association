'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getApplicationPaymentStatus } from '@/actions/api/application.actions';
import { ROUTES } from '@/constants/routes.constants';

const SESSION_KEYS = {
  merchantOrderId: 'billdesk_application_merchant_order_id',
  paymentId: 'billdesk_application_payment_id',
  bdOrderId: 'billdesk_application_bd_order_id',
  applicationId: 'billdesk_application_application_id',
  refreshApplication: 'billdesk_application_refresh_needed',
};

const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 3000;

function clearBillDeskSessionStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(SESSION_KEYS.merchantOrderId);
  window.sessionStorage.removeItem(SESSION_KEYS.paymentId);
  window.sessionStorage.removeItem(SESSION_KEYS.bdOrderId);
  window.sessionStorage.removeItem(SESSION_KEYS.applicationId);
}

function readStoredMerchantOrderId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(SESSION_KEYS.merchantOrderId);
}

export default function PaymentCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'failed' | 'pending' | 'error' | 'unknown'>('idle');
  const [message, setMessage] = useState<string>('Verifying payment...');
  const [attempts, setAttempts] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null);
  const [receiptReference, setReceiptReference] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const queryParams = useMemo(() => {
    if (typeof window === 'undefined') {
      return new URLSearchParams();
    }

    return new URLSearchParams(window.location.search);
  }, []);

  const moduleParam = queryParams.get('module');
  const isApplicationModule = moduleParam === 'APPLICATION';
  const merchantOrderId = useMemo(() => readStoredMerchantOrderId(), []);

  const verifyPayment = async () => {
    if (!merchantOrderId || !isApplicationModule) {
      setStatus('unknown');
      setMessage(
        'Payment status cannot be identified at this time. Please return to your application and retry payment.'
      );
      return;
    }

    setStatus('verifying');
    setMessage('Verifying payment...');

    try {
      const response = await getApplicationPaymentStatus(merchantOrderId);
      const responseData = response?.data as Record<string, unknown> | undefined;
      const paymentStatus = responseData?.paymentStatus as string | undefined;
      const amount = responseData?.amount as string | undefined || responseData?.paymentAmount as string | undefined;
      const receipt = responseData?.paymentReference as string | undefined || responseData?.transactionNumber as string | undefined || responseData?.orderNumber as string | undefined;

      if (amount) {
        setPaymentAmount(amount);
      }

      if (receipt) {
        setReceiptReference(receipt);
      }

      if (!paymentStatus) {
        setStatus('error');
        setMessage('Unable to verify payment right now. Please try again.');
        return;
      }

      if (paymentStatus === 'SUCCESS') {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(SESSION_KEYS.refreshApplication, '1');
        }

        setStatus('success');
        setMessage('Payment Successful');
        clearBillDeskSessionStorage();
        return;
      }

      if (paymentStatus === 'FAILED') {
        setStatus('failed');
        setMessage('Payment Failed');
        return;
      }

      if (paymentStatus === 'PENDING') {
        if (attempts + 1 >= MAX_POLL_ATTEMPTS) {
          setStatus('pending');
          setMessage('Payment Pending');
          return;
        }

        setAttempts((prev) => prev + 1);
        setTimeout(() => {
          void verifyPayment();
        }, POLL_INTERVAL_MS);
        return;
      }

      setStatus('error');
      setMessage('Unable to verify payment right now. Please try again.');
    } catch (error) {
      console.error('Payment status verification failed', error);
      setStatus('error');
      setMessage('Unable to verify payment right now. Please try again.');
    }
  };

  useEffect(() => {
    void verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRetrying]);

  const handleRetry = () => {
    setAttempts(0);
    setIsRetrying((prev) => !prev);
  };

  const goToApplication = () => {
    router.push(ROUTES.apply);
  };

  const goToRecruitment = () => {
    router.push(ROUTES.recruitment);
  };

  const renderAction = () => {
    if (status === 'success') {
      return (
        <button
          type="button"
          className="rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          onClick={goToApplication}
        >
          Continue to Application
        </button>
      );
    }

    if (status === 'failed' || status === 'pending' || status === 'error' || status === 'unknown') {
      return (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={handleRetry}
          >
            Retry Verification
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            onClick={goToApplication}
          >
            Return to Application
          </button>
        </div>
      );
    }

    return null;
  };

  const renderStatus = () => {
    if (status === 'verifying' || status === 'idle') {
      return <p className="text-slate-600">Verifying payment...</p>;
    }

    if (status === 'success') {
      return (
        <div className="space-y-4">
          <p className="text-slate-900 text-xl font-semibold">Payment Successful</p>
          {paymentAmount ? <p>Amount: Rs. {paymentAmount}</p> : null}
          {receiptReference ? <p>Receipt: {receiptReference}</p> : null}
        </div>
      );
    }

    if (status === 'failed') {
      return <p className="text-slate-900 text-xl font-semibold">Payment Failed</p>;
    }

    if (status === 'pending') {
      return <p className="text-slate-900 text-xl font-semibold">Payment Pending</p>;
    }

    if (status === 'error') {
      return <p className="text-slate-900 text-xl font-semibold">Unable to verify payment right now</p>;
    }

    if (status === 'unknown') {
      return <p className="text-slate-900 text-xl font-semibold">Payment status cannot be determined</p>;
    }

    return null;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">BillDesk Payment</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{message}</h1>
          </div>
          {renderStatus()}
          <div>{renderAction()}</div>
          <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
            {status === 'success' ? (
              <>
                <p className="text-slate-900">
                  Your payment has been successfully verified and your application has been submitted successfully.
                </p>
                <p className="mt-2">
                  You can now view your submitted application at any time from the recruitment portal.
                </p>
              </>
            ) : (
              <>
                <p>
                  This page verifies your payment with the recruitment system. Please wait while we confirm the payment status.
                </p>
                {!merchantOrderId && (
                  <p className="mt-2 text-sm text-amber-700">
                    The payment could not be identified because the required gateway order id is missing.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
