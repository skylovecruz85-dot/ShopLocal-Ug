import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import process from 'node:process';
import { Readable } from 'node:stream';
import { del, get, put } from '@vercel/blob';
import { attachDatabasePool } from '@vercel/functions';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Pool } from 'pg';

const MAX_BODY_BYTES = 3 * 1024 * 1024;
const MAX_PROOF_BYTES = 2 * 1024 * 1024;
const FIREBASE_JWKS_URL = new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
const ORDER_COLUMNS = `
  id, listing_id, ad_title, user_phone, plan, duration_days, amount,
  network, payer_number, transaction_id, screenshot_path, status,
  created_at, reviewed_at
`;
const PLANS = {
  '7 days': { durationDays: 7, amount: 9500 },
  '30 days': { durationDays: 30, amount: 21500 },
  'Boost Premium': { durationDays: 28, amount: 28550 },
} as const;

type RuntimeEnv = Record<string, string | undefined>;
type ApiRequest = IncomingMessage & { body?: unknown };
type FirebaseIdentity = { uid: string; phoneNumber: string };
type BoostOrderRow = {
  id: string;
  listing_id: string;
  ad_title: string;
  user_phone: string;
  plan: '7 days' | '30 days' | 'Boost Premium';
  duration_days: number;
  amount: number;
  network: 'MTN' | 'Airtel';
  payer_number: string;
  transaction_id: string;
  screenshot_path: string | null;
  status: 'Pending' | 'Approved' | 'Declined';
  created_at: Date | string;
  reviewed_at: Date | string | null;
};
type ScreenshotData = {
  bytes: Buffer;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: 'jpg' | 'png' | 'webp';
};

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function sendJson(response: ServerResponse, statusCode: number, data: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(data));
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiError(400, 'Invalid request body.');
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string') throw new ApiError(400, `Enter a valid ${field}.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new ApiError(400, `Enter a valid ${field}.`);
  return normalized;
}

function toIso(value: Date | string | null) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toClientOrder(row: BoostOrderRow) {
  return {
    id: row.id,
    listingId: row.listing_id,
    adTitle: row.ad_title,
    userPhone: row.user_phone,
    plan: row.plan,
    durationDays: Number(row.duration_days),
    amount: Number(row.amount),
    network: row.network,
    payerNumber: row.payer_number,
    txnId: row.transaction_id,
    hasScreenshot: Boolean(row.screenshot_path),
    time: toIso(row.created_at),
    reviewedAt: toIso(row.reviewed_at),
    status: row.status,
  };
}

async function readJsonBody(request: ApiRequest): Promise<Record<string, unknown>> {
  const parsedBody = request.body;
  if (parsedBody !== undefined && parsedBody !== null) {
    if (typeof parsedBody === 'string') {
      try {
        return asRecord(JSON.parse(parsedBody));
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, 'Request body must be valid JSON.');
      }
    }
    if (Buffer.isBuffer(parsedBody) || parsedBody instanceof Uint8Array) {
      try {
        return asRecord(JSON.parse(Buffer.from(parsedBody).toString('utf8')));
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, 'Request body must be valid JSON.');
      }
    }
    return asRecord(parsedBody);
  }

  const contentType = request.headers['content-type']?.toLowerCase() ?? '';
  if (!contentType.startsWith('application/json')) throw new ApiError(415, 'Send payment details as JSON.');

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;
    if (totalBytes > MAX_BODY_BYTES) throw new ApiError(413, 'Payment proof must be 2 MB or smaller.');
    chunks.push(buffer);
  }

  try {
    return asRecord(JSON.parse(Buffer.concat(chunks).toString('utf8')));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'Request body must be valid JSON.');
  }
}

function verifyImageSignature(bytes: Buffer, contentType: ScreenshotData['contentType']) {
  if (contentType === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png') {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
}

function decodeScreenshot(value: unknown): ScreenshotData {
  if (typeof value !== 'string' || value.length > Math.ceil(MAX_PROOF_BYTES * 1.4) + 128) {
    throw new ApiError(400, 'Upload a JPG, PNG, or WEBP payment screenshot under 2 MB.');
  }
  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/i);
  if (!match) throw new ApiError(400, 'Upload a JPG, PNG, or WEBP payment screenshot.');

  const contentType = match[1].toLowerCase() as ScreenshotData['contentType'];
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.byteLength > MAX_PROOF_BYTES || bytes.toString('base64').replace(/=+$/, '') !== match[2].replace(/=+$/, '')) {
    throw new ApiError(400, 'Payment screenshot must be 2 MB or smaller.');
  }
  if (!verifyImageSignature(bytes, contentType)) throw new ApiError(400, 'The uploaded file is not a valid image.');

  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : 'webp';
  return { bytes, contentType, extension };
}

export function createBoostOrdersHandler(env: RuntimeEnv) {
  const projectId = env.VITE_FIREBASE_PROJECT_ID?.trim();
  const firebaseJwks = projectId ? createRemoteJWKSet(FIREBASE_JWKS_URL) : null;
  let pool: Pool | undefined;

  const getPool = () => {
    if (!env.DATABASE_URL) throw new ApiError(503, 'Boost payments are temporarily unavailable.');
    if (!pool) {
      pool = new Pool({
        connectionString: env.DATABASE_URL,
        max: 1,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
        keepAlive: true,
      });
      attachDatabasePool(pool);
    }
    return pool;
  };

  const authenticate = async (request: ApiRequest): Promise<FirebaseIdentity> => {
    if (!projectId || !firebaseJwks) throw new ApiError(503, 'Phone sign-in is not configured for this app.');
    const authorization = request.headers.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;
    const match = header?.match(/^Bearer\s+(.+)$/i);
    if (!match) throw new ApiError(401, 'Sign in with your verified phone number to continue.');

    try {
      const { payload } = await jwtVerify(match[1], firebaseJwks, {
        audience: projectId,
        issuer: `https://securetoken.google.com/${projectId}`,
      });
      const uid = typeof payload.sub === 'string' ? payload.sub : '';
      const phoneNumber = typeof payload.phone_number === 'string' ? payload.phone_number : '';
      if (!uid || uid.length > 128 || !/^\+?[1-9]\d{6,23}$/.test(phoneNumber)) {
        throw new ApiError(401, 'A verified phone number is required to submit a boost payment.');
      }
      return { uid, phoneNumber };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Your sign-in could not be verified. Sign in again and retry.');
    }
  };

  const isAdmin = (uid: string) => Boolean(env.BOOST_ADMIN_FIREBASE_UID?.trim() && env.BOOST_ADMIN_FIREBASE_UID.trim() === uid);

  const handleScreenshot = async (response: ServerResponse, proofId: string, uid: string) => {
    if (!isAdmin(uid)) throw new ApiError(403, 'Admin review is not available for this account.');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(proofId)) {
      throw new ApiError(404, 'Payment proof was not found.');
    }
    const result = await getPool().query('SELECT screenshot_path FROM public.boost_orders WHERE id = $1 LIMIT 1', [proofId]);
    const pathname = (result.rows[0] as { screenshot_path?: string | null } | undefined)?.screenshot_path;
    if (!pathname) throw new ApiError(404, 'Payment proof was not found.');
    if (!env.BLOB_READ_WRITE_TOKEN) throw new ApiError(503, 'Private payment proof storage is not configured.');

    const proof = await get(pathname, { access: 'private', token: env.BLOB_READ_WRITE_TOKEN, useCache: false });
    if (!proof || proof.statusCode !== 200) throw new ApiError(404, 'Payment proof was not found.');
    response.writeHead(200, {
      'Content-Type': proof.blob.contentType,
      'Content-Length': String(proof.blob.size),
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    Readable.fromWeb(proof.stream).pipe(response);
  };

  const handlePost = async (request: ApiRequest, response: ServerResponse, user: FirebaseIdentity) => {
    const body = await readJsonBody(request);
    const listingId = requiredString(body.listingId, 'listing', 128);
    const adTitle = requiredString(body.adTitle, 'ad title', 160);
    if (!/^[A-Za-z0-9_-]+$/.test(listingId)) throw new ApiError(400, 'Choose a valid ad.');

    const planName = requiredString(body.planName, 'boost plan', 32) as keyof typeof PLANS;
    const plan = PLANS[planName];
    if (!plan) throw new ApiError(400, 'Choose a valid boost plan.');
    const network = body.network;
    if (network !== 'MTN' && network !== 'Airtel') throw new ApiError(400, 'Choose MTN or Airtel.');

    const payerNumber = requiredString(body.payerNumber, 'payer phone number', 24).replace(/[\s()-]/g, '');
    if (!/^(?:07\d{8}|\+?2567\d{8})$/.test(payerNumber)) throw new ApiError(400, 'Enter a valid Uganda mobile money number.');
    const transactionId = requiredString(body.transactionId, 'transaction ID', 32);
    if (!/^[A-Za-z0-9-]{6,32}$/.test(transactionId)) throw new ApiError(400, 'Enter the transaction ID shown in the mobile money SMS.');

    const recipientNumber = network === 'MTN' ? env.VITE_SHOPLOCAL_MTN_NUMBER : env.VITE_SHOPLOCAL_AIRTEL_NUMBER;
    const recipientName = network === 'MTN' ? env.VITE_SHOPLOCAL_MTN_NAME : env.VITE_SHOPLOCAL_AIRTEL_NAME;
    const normalizedRecipient = recipientNumber?.replace(/[\s()-]/g, '') ?? '';
    if (!normalizedRecipient || !recipientName?.trim() || !/^(?:07\d{8}|\+?2567\d{8})$/.test(normalizedRecipient)) {
      throw new ApiError(503, `${network} payment instructions are not configured yet. Do not send money until the receiver details are shown.`);
    }
    if (!env.BLOB_READ_WRITE_TOKEN) throw new ApiError(503, 'Private payment proof storage is not configured.');

    const screenshot = decodeScreenshot(body.screenshotDataUrl);
    const uploaded = await put(`boost-payment-proofs/${user.uid}/${randomUUID()}.${screenshot.extension}`, screenshot.bytes, {
      access: 'private',
      token: env.BLOB_READ_WRITE_TOKEN,
      contentType: screenshot.contentType,
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    try {
      const result = await getPool().query(
        `INSERT INTO public.boost_orders (
          firebase_uid, listing_id, ad_title, user_phone, plan, duration_days, amount,
          network, payer_number, transaction_id, screenshot_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING ${ORDER_COLUMNS}`,
        [user.uid, listingId, adTitle, user.phoneNumber, planName, plan.durationDays, plan.amount, network, payerNumber, transactionId, uploaded.pathname],
      );
      sendJson(response, 201, { order: toClientOrder(result.rows[0] as BoostOrderRow) });
    } catch (error) {
      try {
        await del(uploaded.pathname, { token: env.BLOB_READ_WRITE_TOKEN });
      } catch {
        // A failed cleanup must not hide the database error.
      }
      const databaseError = error as { code?: string; constraint?: string };
      if (databaseError.code === '23505') {
        if (databaseError.constraint?.includes('transaction_id')) {
          throw new ApiError(409, 'That transaction ID has already been submitted. Check it and contact support if you need help.');
        }
        throw new ApiError(409, 'A payment for this ad is already awaiting review.');
      }
      throw error;
    }
  };

  const handleReview = async (request: ApiRequest, response: ServerResponse, user: FirebaseIdentity) => {
    if (!isAdmin(user.uid)) throw new ApiError(403, 'Admin review is not available for this account.');
    const body = await readJsonBody(request);
    const orderId = requiredString(body.orderId, 'order', 36);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) {
      throw new ApiError(400, 'Choose a valid order.');
    }
    if (body.action !== 'approve' && body.action !== 'decline') throw new ApiError(400, 'Choose approve or decline.');

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      const current = await client.query('SELECT status FROM public.boost_orders WHERE id = $1 FOR UPDATE', [orderId]);
      if (!current.rowCount) {
        await client.query('ROLLBACK');
        throw new ApiError(404, 'Boost order was not found.');
      }
      if (current.rows[0].status !== 'Pending') {
        await client.query('ROLLBACK');
        throw new ApiError(409, 'This order has already been reviewed.');
      }
      const status = body.action === 'approve' ? 'Approved' : 'Declined';
      const updated = await client.query(
        `UPDATE public.boost_orders
        SET status = $2, reviewed_at = now(), reviewed_by = $3
        WHERE id = $1
        RETURNING ${ORDER_COLUMNS}`,
        [orderId, status, user.uid],
      );
      await client.query('COMMIT');
      sendJson(response, 200, { order: toClientOrder(updated.rows[0] as BoostOrderRow) });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  };

  return async (request: ApiRequest, response: ServerResponse) => {
    try {
      const user = await authenticate(request);
      const url = new URL(request.url ?? '/', 'http://localhost');
      if (request.method === 'GET' && url.searchParams.has('proof')) {
        await handleScreenshot(response, url.searchParams.get('proof') ?? '', user.uid);
        return;
      }

      if (request.method === 'GET') {
        const canReview = isAdmin(user.uid);
        const result = canReview
          ? await getPool().query(`SELECT ${ORDER_COLUMNS} FROM public.boost_orders ORDER BY created_at DESC LIMIT 200`)
          : await getPool().query(`SELECT ${ORDER_COLUMNS} FROM public.boost_orders WHERE firebase_uid = $1 ORDER BY created_at DESC LIMIT 100`, [user.uid]);
        sendJson(response, 200, { orders: result.rows.map((row) => toClientOrder(row as BoostOrderRow)), canReview });
        return;
      }

      if (request.method === 'POST') {
        await handlePost(request, response, user);
        return;
      }

      if (request.method === 'PATCH') {
        await handleReview(request, response, user);
        return;
      }

      response.setHeader('Allow', 'GET, POST, PATCH');
      sendJson(response, 405, { error: 'Method not allowed.' });
    } catch (error) {
      if (response.headersSent) {
        response.destroy(error instanceof Error ? error : undefined);
        return;
      }
      const statusCode = error instanceof ApiError ? error.statusCode : 500;
      const message = error instanceof ApiError ? error.message : 'The payment request could not be completed. Please try again.';
      sendJson(response, statusCode, { error: message });
    }
  };
}

const routeHandler = createBoostOrdersHandler(process.env);

export default function boostOrdersRoute(request: ApiRequest, response: ServerResponse) {
  return routeHandler(request, response);
}

export type BoostOrdersApiHandler = ReturnType<typeof createBoostOrdersHandler>;
export { MAX_BODY_BYTES, MAX_PROOF_BYTES };
