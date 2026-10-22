import type { IncomingMessage, ServerResponse } from 'node:http';
import { auth } from '../auth.ts';

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }

  let fullUrl = req.url ?? '/';
  if (!fullUrl.startsWith('/api/auth')) {
    fullUrl = `/api/auth${fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`}`;
  }

  const host = req.headers.host ?? 'localhost:3000';
  const proto = (req.headers['x-forwarded-proto'] as string) ?? (host.includes('localhost') ? 'http' : 'https');
  const url = new URL(fullUrl, `${proto}://${host}`);

  let bodyData: BodyInit | undefined = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body && typeof req.body === 'object') {
      bodyData = JSON.stringify(req.body);
      if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    } else {
      bodyData = req as unknown as BodyInit;
    }
  }

  try {
    const request = new Request(url, {
      method: req.method,
      headers,
      body: bodyData,
      duplex: 'half',
    } as RequestInit);

    const response = await auth.handler(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('[auth-handler-error]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Authentication failed.' }));
  }
}
