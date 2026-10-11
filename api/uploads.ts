import type { IncomingMessage, ServerResponse } from 'node:http';
import { put } from '@vercel/blob';

export default async function uploads(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const contentType = String(req.headers['content-type'] ?? 'image/jpeg');
    if (!contentType.startsWith('image/')) { res.statusCode = 415; res.end(JSON.stringify({ error: 'Only image uploads are supported.' })); return; }
    if (Buffer.concat(chunks).byteLength > 8 * 1024 * 1024) { res.statusCode = 413; res.end(JSON.stringify({ error: 'Image must be 8MB or smaller.' })); return; }
    const blob = await put(`listings/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`, Buffer.concat(chunks), { access: 'public', contentType });
    res.setHeader('Content-Type', 'application/json'); res.statusCode = 201; res.end(JSON.stringify({ url: blob.url }));
  } catch (error) { console.error('[upload]', error); res.statusCode = 500; res.end(JSON.stringify({ error: 'Upload failed.' })); }
}
