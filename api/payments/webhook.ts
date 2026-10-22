import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db, boostOrders } from '../_db.ts';
import { eq } from 'drizzle-orm';

type PaymentProvider = 'MTN_MOMO' | 'AIRTEL_MONEY';
type PaymentStatus = 'pending' | 'approved' | 'failed';
type PaymentBody = Record<string, unknown>;

const json = (res: ServerResponse, status: number, value: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(value));
};

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const providerSecret = (provider: PaymentProvider) => provider === 'MTN_MOMO' ? process.env.MTN_MOMO_WEBHOOK_SECRET : process.env.AIRTEL_MONEY_WEBHOOK_SECRET;

const isValidSignature = (body: string, signature: string, secret: string) => {
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const received = signature.replace(/^sha256=/i, '').trim();
  if (expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};

const normalizeStatus = (value: unknown): PaymentStatus => {
  const status = text(value).toLowerCase();
  if (['approved', 'successful', 'success', 'completed', 'paid'].includes(status)) return 'approved';
  if (['failed', 'failure', 'rejected', 'cancelled', 'canceled', 'expired'].includes(status)) return 'failed';
  return 'pending';
};

const readBody = async (req: IncomingMessage) => {
  const request = req as IncomingMessage & { body?: PaymentBody };
  if (request.body) return JSON.stringify(request.body);
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
};

export default async function paymentWebhook(req: IncomingMessage & { body?: PaymentBody }, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const rawBody = await readBody(req);
    const input = (req.body ?? JSON.parse(rawBody || '{}')) as PaymentBody;
    const provider = text(input.provider || input.network).toUpperCase() as PaymentProvider;
    if (provider !== 'MTN_MOMO' && provider !== 'AIRTEL_MONEY') return json(res, 400, { error: 'Unsupported payment provider' });

    const secret = providerSecret(provider);
    const signature = text(req.headers['x-webhook-signature'] || req.headers['x-signature'] || input.signature);
    if (secret) {
      if (!signature || !isValidSignature(rawBody, signature, secret)) return json(res, 401, { error: 'Invalid webhook signature' });
    } else if (process.env.NODE_ENV !== 'development') {
      return json(res, 503, { error: 'Payment webhook is not configured' });
    } else {
      console.info('[payment-webhook:dev] signature verification skipped; configure provider secret before production');
    }

    const reference = text(input.reference || input.externalId || input.transactionId || input.financialTransactionId);
    if (!reference) return json(res, 400, { error: 'Payment reference is required' });

    const status = normalizeStatus(input.status || input.result || input.responseCode);
    const [order] = await db.update(boostOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(boostOrders.paymentReference, reference))
      .returning({ id: boostOrders.id, status: boostOrders.status, paymentReference: boostOrders.paymentReference });

    if (!order) return json(res, 404, { error: 'Payment order not found' });
    console.info('[payment-webhook] reconciled', { provider, reference, status });
    return json(res, 200, { data: order });
  } catch (error) {
    console.error('[payment-webhook]', error);
    return json(res, 400, { error: 'Invalid payment webhook payload' });
  }
}
