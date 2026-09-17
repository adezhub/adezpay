import { Buffer } from 'node:buffer';

function darajaBaseUrl() {
  return process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (/^07\d{8}$/.test(digits) || /^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^\+[17]\d{8}$/.test(value.replace(/\s/g, ''))) return `254${digits}`;
  return null;
}

function timestamp() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}${get('month')}${get('day')}${get('hour')}${get('minute')}${get('second')}`;
}

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await fetch(
    `${darajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: 'no-store',
    }
  );

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.errorMessage || 'Unable to authenticate with M-Pesa.');
  }
  return data.access_token as string;
}

export async function initiateMpesaStkPush(input: {
  amount: number;
  phone: string;
  accountReference: string;
  transactionDescription: string;
}) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const time = timestamp();

  if (!shortcode || !passkey || !callbackUrl) {
    throw new Error('M-Pesa shortcode, passkey, and public callback URL must be configured.');
  }

  const password = Buffer.from(`${shortcode}${passkey}${time}`).toString('base64');
  const token = await getAccessToken();
  const response = await fetch(`${darajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: time,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
      Amount: Math.max(1, Math.round(input.amount)),
      PartyA: input.phone,
      PartyB: shortcode,
      PhoneNumber: input.phone,
      CallBackURL: callbackUrl,
      AccountReference: input.accountReference.slice(0, 12),
      TransactionDesc: input.transactionDescription.slice(0, 20),
    }),
  });

  const data = await response.json();
  if (!response.ok || data.ResponseCode !== '0') {
    throw new Error(data.errorMessage || data.ResponseDescription || 'M-Pesa rejected the STK Push.');
  }
  return data as {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    CustomerMessage?: string;
  };
}
