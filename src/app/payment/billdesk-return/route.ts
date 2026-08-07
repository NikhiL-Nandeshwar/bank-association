import { NextResponse } from 'next/server';

import { API_BASE_URL } from '@/constants/api.constants';

async function forwardBillDeskTransactionResponse(transactionResponse: string) {
  const backendUrl = `${API_BASE_URL}/Payment/Callback`;
  const body = new URLSearchParams();
  body.set('msg', transactionResponse);

  return fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  let transactionResponse: string | null = null;

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const fieldValue = formData.get('transaction_response');
    transactionResponse = typeof fieldValue === 'string' ? fieldValue : null;
  }

  if (transactionResponse) {
    try {
      await forwardBillDeskTransactionResponse(transactionResponse);
    } catch (error) {
      console.error('BillDesk return forwarding failed', error);
    }
  } else {
    console.warn('BillDesk return POST received without transaction_response');
  }

  const redirectUrl = new URL('/payment/callback?module=APPLICATION', request.url);
  return NextResponse.redirect(redirectUrl.toString(), 303);
}
