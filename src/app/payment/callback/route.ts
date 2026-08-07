import { NextResponse } from 'next/server';

import { API_BASE_URL } from '@/constants/api.constants';

async function forwardCallback(msg: string) {
  const backendUrl = `${API_BASE_URL}/Payment/Callback`;

  const body = new URLSearchParams();
  body.set('msg', msg);

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
  const contentType = request.headers.get('content-type') || '';
  const requestUrl = new URL(request.url);

  let transactionResponse: string | null = null;

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const fieldValue = formData.get('transaction_response') ?? formData.get('msg');
    transactionResponse = typeof fieldValue === 'string' ? fieldValue : null;
  } else {
    const text = await request.text();
    const params = new URLSearchParams(text);
    transactionResponse = params.get('transaction_response') ?? params.get('msg');
  }

  if (transactionResponse) {
    try {
      await forwardCallback(transactionResponse);
    } catch (error) {
      console.error('BillDesk callback forwarding failed', error);
    }
  } else {
    console.warn('BillDesk callback POST received without transaction_response or msg');
  }

  requestUrl.search = new URLSearchParams({ module: 'APPLICATION' }).toString();
  return NextResponse.redirect(requestUrl.toString(), 303);
}
