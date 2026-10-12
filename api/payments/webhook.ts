import type { IncomingMessage, ServerResponse } from 'node:http';
import { db, boostOrders } from '../db.ts';
import { eq } from 'drizzle-orm';

export default async function paymentWebhook(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
  try {
    const input = (req as IncomingMessage & { body?: Record<string, unknown> }).body ?? {};
    const reference = typeof input.reference === 'string' ? input.reference.trim() : '';
    const status = input.status === 'approved' || input.status === 'failed' ? input.status : 'pending';
    if (!reference) { res.statusCode = 400; res.end(JSON.stringify({ error: 'reference is required' })); return; }
    const [order] = await db.update(boostOrders).set({ status, updatedAt: new Date() }).where(eq(boostOrders.paymentReference, reference)).returning({ id: boostOrders.id, status: boostOrders.status });
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = order ? 200 : 404;
    res.end(JSON.stringify(order ? { data: order } : { error: 'Payment order not found' }));
  } catch (error) {
    console.error('[payment-webhook]', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Payment reconciliation failed' }));
  }
}
