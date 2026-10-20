import type { IncomingMessage, ServerResponse } from 'node:http';
import { auth } from '../auth.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(key, value);
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const request = new Request(url, { method: req.method, headers, body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req as unknown as BodyInit, duplex: 'half' } as RequestInit);
  const response = await auth.handler(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
