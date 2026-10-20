import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';

type PaymentRequest = {
  amount?: number;
  currency?: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  purpose?: string;
  listingId?: string;
};

const json = (res: ServerResponse, status: number, value: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(value));
};

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const baseUrl = () => process.env.PESAPAL_ENVIRONMENT === 'sandbox'
  ? 'https://cybqa.pesapal.com/pesapalv3'
  : 'https://pay.pesapal.com/v3';

async function pesapalToken() {
  const response = await fetch(`${baseUrl()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });
  const payload = await response.json() as { token?: string; message?: string };
  if (!response.ok || !payload.token) throw new Error(payload.message || 'Pesapal authentication failed');
  return payload.token;
}

async function registerIpn(token: string) {
  const ipnUrl = process.env.PESAPAL_IPN_URL;
  if (!ipnUrl) throw new Error('PESAPAL_IPN_URL is not configured');
  const response = await fetch(`${baseUrl()}/api/URLRegistration/RegisterIPN`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' }),
  });
  const payload = await response.json() as { ipn_id?: string; message?: string };
  if (!response.ok || !payload.ipn_id) throw new Error(payload.message || 'Pesapal IPN registration failed');
  return payload.ipn_id;
}

export default async function pesapal(req: IncomingMessage & { body?: PaymentRequest }, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const input = req.body ?? {};
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) return json(res, 400, { error: 'A positive amount is required' });
    const phone = text(input.phoneNumber).replace(/\D/g, '');
    if (!/^2567\d{8}$/.test(phone)) return json(res, 400, { error: 'A valid Ugandan phone number is required' });
    const token = await pesapalToken();
    const ipnId = await registerIpn(token);
    const merchantReference = `SHOPLOCAL-${randomUUID()}`;
    const callbackUrl = process.env.PESAPAL_CALLBACK_URL;
    if (!callbackUrl) return json(res, 503, { error: 'PESAPAL_CALLBACK_URL is not configured' });
    const response = await fetch(`${baseUrl()}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id: merchantReference,
        currency: text(input.currency) || 'UGX',
        amount,
        description: text(input.description) || 'ShopLocal UG payment',
        callback_url: callbackUrl,
        notification_id: ipnId,
        billing_address: {
          email_address: text(input.email) || 'payments@shoplocal-ug.vercel.app',
          phone_number: phone,
          first_name: text(input.firstName) || 'ShopLocal',
          last_name: text(input.lastName) || 'Customer',
          country_code: 'UG',
        },
        account_number: merchantReference,
      }),
    });
    const payload = await response.json() as { order_tracking_id?: string; redirect_url?: string; error?: string; message?: string };
    if (!response.ok || !payload.redirect_url || !payload.order_tracking_id) return json(res, 502, { error: payload.error || payload.message || 'Pesapal checkout could not be created' });
    return json(res, 200, { data: { merchantReference, orderTrackingId: payload.order_tracking_id, redirectUrl: payload.redirect_url, purpose: input.purpose, listingId: input.listingId } });
  } catch (error) {
    console.error('[pesapal:initiate]', error);
    return json(res, 502, { error: error instanceof Error ? error.message : 'Pesapal checkout failed' });
  }
}

export async function pesapalIpn(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 200 }));
}
                                                 
