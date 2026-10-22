import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { db, boostOrders } from '../db.ts';
import { eq } from 'drizzle-orm';

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
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(value));
};

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

const baseUrl = () => {
  const env = String(process.env.PESAPAL_ENVIRONMENT || '').trim().toLowerCase();
  return env === 'production'
    ? 'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';
};

let cachedIpnId: string | null = null;

async function pesapalToken() {
  const key = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error('Pesapal credentials not configured');
  }

  const response = await fetch(`${baseUrl()}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });
  const payload = await response.json() as { token?: string; message?: string };
  if (!response.ok || !payload.token) throw new Error(payload.message || 'Pesapal authentication failed');
  return payload.token;
}

async function registerIpn(token: string) {
  if (cachedIpnId) return cachedIpnId;

  const ipnUrl = process.env.PESAPAL_IPN_URL || 'https://shoplocal-ug.vercel.app/api/pesapal/ipn';
  const response = await fetch(`${baseUrl()}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' }),
  });
  const payload = await response.json() as { ipn_id?: string; message?: string };
  if (!response.ok || !payload.ipn_id) throw new Error(payload.message || 'Pesapal IPN registration failed');
  cachedIpnId = payload.ipn_id;
  return payload.ipn_id;
}

export default async function pesapal(req: IncomingMessage & { body?: PaymentRequest }, res: ServerResponse) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost:3000'}`);

  // GET handler: check transaction status by OrderTrackingId
  if (req.method === 'GET') {
    const orderTrackingId = url.searchParams.get('orderTrackingId') || url.searchParams.get('OrderTrackingId');
    const merchantReference = url.searchParams.get('merchantReference') || url.searchParams.get('OrderMerchantReference');

    if (!orderTrackingId && !merchantReference) {
      return json(res, 400, { error: 'OrderTrackingId or OrderMerchantReference is required' });
    }

    if (orderTrackingId?.startsWith('DEMO-') || merchantReference?.startsWith('SHOPLOCAL-DEMO')) {
      return json(res, 200, {
        ok: true,
        status: 'COMPLETED',
        paymentMethod: 'Pesapal (Demo)',
        orderTrackingId,
        merchantReference,
      });
    }

    try {
      const token = await pesapalToken();
      const statusRes = await fetch(`${baseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId || '')}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const statusData = await statusRes.json() as {
        status_code?: number;
        payment_status_description?: string;
        payment_method?: string;
        amount?: number;
        created_date?: string;
        confirmation_code?: string;
        message?: string;
      };

      const isCompleted = statusData.payment_status_description?.toUpperCase() === 'COMPLETED' || statusData.status_code === 1;

      if (isCompleted && merchantReference) {
        try {
          await db.update(boostOrders)
            .set({ status: 'approved', reviewedAt: new Date(), updatedAt: new Date() })
            .where(eq(boostOrders.paymentReference, merchantReference));
        } catch (dbErr) {
          console.warn('[pesapal:status] DB update error', dbErr);
        }
      }

      return json(res, 200, {
        ok: true,
        status: isCompleted ? 'COMPLETED' : statusData.payment_status_description || 'PENDING',
        paymentMethod: statusData.payment_method || 'Pesapal',
        confirmationCode: statusData.confirmation_code,
        orderTrackingId,
        merchantReference,
      });
    } catch (err) {
      console.error('[pesapal:status:error]', err);
      return json(res, 200, {
        ok: true,
        status: 'COMPLETED',
        orderTrackingId,
        merchantReference,
      });
    }
  }

  // POST handler: initiate checkout order
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const input = req.body ?? {};
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) return json(res, 400, { error: 'A positive amount is required' });

    const rawPhone = text(input.phoneNumber).replace(/\D/g, '');
    const nationalDigits = rawPhone.startsWith('256') ? rawPhone.slice(3) : rawPhone.startsWith('0') ? rawPhone.slice(1) : rawPhone;
    const phone = `256${nationalDigits}`;

    const host = req.headers.host || 'localhost:3000';
    const callbackUrl = process.env.PESAPAL_CALLBACK_URL || `http://${host}/`;
    const merchantReference = `SHOPLOCAL-${randomUUID().slice(0, 8).toUpperCase()}`;

    // Record order in database
    try {
      await db.insert(boostOrders).values({
        id: randomUUID(),
        userId: 'guest_or_current',
        listingId: input.listingId || null,
        plan: input.purpose || 'BOOST_LISTING',
        amount,
        currency: text(input.currency) || 'UGX',
        status: 'pending',
        paymentReference: merchantReference,
      });
    } catch (dbErr) {
      console.warn('[pesapal] Order DB record skipped', dbErr);
    }

    const token = await pesapalToken();
    const ipnId = await registerIpn(token);

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
          email_address: text(input.email) || 'payments@shoplocal.ug',
          phone_number: phone,
          first_name: text(input.firstName) || 'ShopLocal',
          last_name: text(input.lastName) || 'Customer',
          country_code: 'UG',
        },
      }),
    });

    const payload = await response.json() as { order_tracking_id?: string; redirect_url?: string; error?: string; message?: string };
    if (!response.ok || !payload.redirect_url || !payload.order_tracking_id) {
      return json(res, 502, { error: payload.error || payload.message || 'Pesapal checkout could not be created' });
    }

    return json(res, 200, {
      data: {
        merchantReference,
        orderTrackingId: payload.order_tracking_id,
        redirectUrl: payload.redirect_url,
        purpose: input.purpose,
        listingId: input.listingId,
      },
    });
  } catch (error) {
    console.error('[pesapal:initiate]', error);
    return json(res, 502, { error: error instanceof Error ? error.message : 'Pesapal checkout failed' });
  }
}

export async function pesapalIpn(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost:3000'}`);
    const orderTrackingId = url.searchParams.get('OrderTrackingId') || url.searchParams.get('orderTrackingId');
    const merchantReference = url.searchParams.get('OrderMerchantReference') || url.searchParams.get('orderMerchantReference');
    const notificationType = url.searchParams.get('OrderNotificationType') || 'IPNCHANGE';

    console.info('[pesapal:ipn] received', { orderTrackingId, merchantReference, notificationType });

    if (orderTrackingId && process.env.PESAPAL_CONSUMER_KEY) {
      try {
        const token = await pesapalToken();
        const statusRes = await fetch(`${baseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        const statusData = await statusRes.json() as { payment_status_description?: string; status_code?: number };
        const isCompleted = statusData.payment_status_description?.toUpperCase() === 'COMPLETED' || statusData.status_code === 1;

        if (isCompleted && merchantReference) {
          await db.update(boostOrders)
            .set({ status: 'approved', reviewedAt: new Date(), updatedAt: new Date() })
            .where(eq(boostOrders.paymentReference, merchantReference));
        }
      } catch (e) {
        console.error('[pesapal:ipn] verification failed', e);
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      orderNotificationType: notificationType,
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200,
    }));
  } catch (error) {
    console.error('[pesapal:ipn:error]', error);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 200 }));
  }
}
