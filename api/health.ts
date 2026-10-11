import type { IncomingMessage, ServerResponse } from 'node:http';
import { sql } from 'drizzle-orm';
import { db } from './db';

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    await db.execute(sql`select 1`);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, service: 'shoplocal-ug', timestamp: new Date().toISOString() }));
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, service: 'shoplocal-ug' }));
  }
}
