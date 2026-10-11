import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { auth } from './auth';
import { boostOrders, conversations, db, favorites, listings, messages, moderationReports, notifications, orders, profiles } from './db';

type RequestWithBody = IncomingMessage & { body?: unknown };
const json = (res: ServerResponse, status: number, body: unknown) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
const body = (req: RequestWithBody) => (req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {});
const required = (value: unknown, field: string) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`Invalid ${field}`); return value.trim(); };
const getUser = async (req: IncomingMessage) => auth.api.getSession({ headers: new Headers({ cookie: req.headers.cookie ?? '' }) });
const isAdmin = (userId: string) => userId === process.env.BOOST_ADMIN_FIREBASE_UID || userId === process.env.SHOPLOCAL_ADMIN_USER_ID;

export default async function handler(req: RequestWithBody, res: ServerResponse) {
  try {
    const session = await getUser(req);
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/api/marketplace/listings') {
      const query = url.searchParams.get('q')?.trim();
      const page = Math.max(Number(url.searchParams.get('page') ?? 1), 1);
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 24), 1), 50);
      const filters = [eq(listings.status, 'active'), query ? or(ilike(listings.title, `%${query}%`), ilike(listings.description, `%${query}%`), ilike(listings.category, `%${query}%`)) : undefined].filter(Boolean) as never[];
      const rows = await db.select().from(listings).where(and(...filters)).orderBy(desc(listings.createdAt)).limit(limit).offset((page - 1) * limit);
      return json(res, 200, { data: rows, page, limit });
    }
    if (!session?.user) return json(res, 401, { error: 'Authentication required.' });
    if (url.pathname === '/api/marketplace/admin/reports' && req.method === 'GET') {
      if (!isAdmin(session.user.id)) return json(res, 403, { error: 'Admin access required.' });
      const rows = await db.select().from(moderationReports).orderBy(desc(moderationReports.createdAt)).limit(200);
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/admin/boost-orders' && req.method === 'GET') {
      if (!isAdmin(session.user.id)) return json(res, 403, { error: 'Admin access required.' });
      const rows = await db.select().from(boostOrders).orderBy(desc(boostOrders.createdAt)).limit(200);
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/admin/reports/review' && req.method === 'POST') {
      if (!isAdmin(session.user.id)) return json(res, 403, { error: 'Admin access required.' });
      const input = body(req); const reportId = required(input.id, 'id'); const status = required(input.status, 'status');
      const [report] = await db.update(moderationReports).set({ status: status.slice(0, 32), reviewedBy: session.user.id, reviewedAt: new Date() }).where(eq(moderationReports.id, reportId)).returning();
      return json(res, 200, { data: report });
    }
    if (url.pathname === '/api/marketplace/admin/boost-orders/review' && req.method === 'POST') {
      if (!isAdmin(session.user.id)) return json(res, 403, { error: 'Admin access required.' });
      const input = body(req); const orderId = required(input.id, 'id'); const status = required(input.status, 'status');
      const [order] = await db.update(boostOrders).set({ status: status.slice(0, 32), reviewedBy: session.user.id, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(boostOrders.id, orderId)).returning();
      return json(res, 200, { data: order });
    }
    if (req.method === 'GET' && url.pathname === '/api/marketplace/profile') {
      const [profile] = await db.select().from(profiles).where(eq(profiles.userId, session.user.id)).limit(1);
      return json(res, 200, { data: profile ?? null });
    }
    if (req.method === 'PUT' && url.pathname === '/api/marketplace/profile') {
      const input = body(req);
      const username = required(input.username, 'username').replace(/\s/g, '').toLowerCase();
      const [profile] = await db.insert(profiles).values({ id: randomUUID(), userId: session.user.id, username, phone: typeof input.phone === 'string' ? input.phone.trim() : null, district: typeof input.district === 'string' ? input.district.trim() : null, bio: typeof input.bio === 'string' ? input.bio.trim() : null, avatar: typeof input.avatar === 'string' ? input.avatar : null }).onConflictDoUpdate({ target: profiles.userId, set: { username, phone: typeof input.phone === 'string' ? input.phone.trim() : null, district: typeof input.district === 'string' ? input.district.trim() : null, bio: typeof input.bio === 'string' ? input.bio.trim() : null, avatar: typeof input.avatar === 'string' ? input.avatar : null, updatedAt: new Date() } }).returning();
      return json(res, 200, { data: profile });
    }
    if (url.pathname === '/api/marketplace/conversations' && req.method === 'GET') {
      const rows = await db.select().from(conversations).where(or(eq(conversations.userAId, session.user.id), eq(conversations.userBId, session.user.id))).orderBy(desc(conversations.lastMessageAt));
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/messages' && req.method === 'GET') {
      const conversationId = required(url.searchParams.get('conversationId'), 'conversationId');
      const [conversation] = await db.select().from(conversations).where(and(eq(conversations.id, conversationId), or(eq(conversations.userAId, session.user.id), eq(conversations.userBId, session.user.id)))).limit(1);
      if (!conversation) return json(res, 404, { error: 'Conversation not found.' });
      const rows = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/messages' && req.method === 'POST') {
      const input = body(req);
      const conversationId = required(input.conversationId, 'conversationId');
      const messageBody = required(input.body, 'body');
      const [conversation] = await db.select().from(conversations).where(and(eq(conversations.id, conversationId), or(eq(conversations.userAId, session.user.id), eq(conversations.userBId, session.user.id)))).limit(1);
      if (!conversation) return json(res, 404, { error: 'Conversation not found.' });
      const [message] = await db.insert(messages).values({ id: randomUUID(), conversationId, senderId: session.user.id, body: messageBody.slice(0, 4000) }).returning();
      await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, conversationId));
      return json(res, 201, { data: message });
    }
    if (url.pathname === '/api/marketplace/favorites' && req.method === 'GET') {
      const rows = await db.select().from(favorites).where(eq(favorites.userId, session.user.id));
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/favorites' && req.method === 'POST') {
      const input = body(req);
      const listingId = required(input.listingId, 'listingId');
      const [favorite] = await db.insert(favorites).values({ userId: session.user.id, listingId }).returning();
      return json(res, 201, { data: favorite });
    }
    if (url.pathname === '/api/marketplace/favorites' && req.method === 'DELETE') {
      const listingId = required(url.searchParams.get('listingId'), 'listingId');
      await db.delete(favorites).where(and(eq(favorites.userId, session.user.id), eq(favorites.listingId, listingId)));
      return json(res, 204, null);
    }
    if (url.pathname === '/api/marketplace/notifications' && req.method === 'GET') {
      const rows = await db.select().from(notifications).where(eq(notifications.userId, session.user.id)).orderBy(desc(notifications.createdAt)).limit(100);
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/notifications/read' && req.method === 'POST') {
      const input = body(req);
      const notificationId = required(input.id, 'id');
      await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.user.id)));
      return json(res, 204, null);
    }
    if (url.pathname === '/api/marketplace/orders' && req.method === 'GET') {
      const rows = await db.select().from(orders).where(or(eq(orders.buyerId, session.user.id), eq(orders.sellerId, session.user.id))).orderBy(desc(orders.createdAt));
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/orders' && req.method === 'POST') {
      const input = body(req);
      const listingId = required(input.listingId, 'listingId');
      const quantity = Number(input.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) return json(res, 400, { error: 'Quantity must be a whole number from 1 to 100.' });
      const [listing] = await db.select().from(listings).where(and(eq(listings.id, listingId), eq(listings.status, 'active'))).limit(1);
      if (!listing) return json(res, 404, { error: 'Listing not found.' });
      if (listing.userId === session.user.id) return json(res, 400, { error: 'You cannot order your own listing.' });
      const [order] = await db.insert(orders).values({ id: randomUUID(), buyerId: session.user.id, sellerId: listing.userId, listingId, quantity, amount: listing.price * quantity }).returning();
      await db.insert(notifications).values({ id: randomUUID(), userId: listing.userId, type: 'order', title: 'New order received', body: `A buyer placed an order for ${listing.title}.`, data: { orderId: order.id, listingId } });
      return json(res, 201, { data: order });
    }
    if (url.pathname === '/api/marketplace/boost-orders' && req.method === 'GET') {
      const rows = await db.select().from(boostOrders).where(eq(boostOrders.userId, session.user.id)).orderBy(desc(boostOrders.createdAt));
      return json(res, 200, { data: rows });
    }
    if (url.pathname === '/api/marketplace/boost-orders' && req.method === 'POST') {
      const input = body(req);
      const plan = required(input.plan, 'plan');
      const amount = Number(input.amount);
      if (!Number.isInteger(amount) || amount <= 0) return json(res, 400, { error: 'Amount must be a positive whole number.' });
      const [order] = await db.insert(boostOrders).values({ id: randomUUID(), userId: session.user.id, listingId: typeof input.listingId === 'string' ? input.listingId : null, plan: plan.slice(0, 80), amount, paymentReference: typeof input.paymentReference === 'string' ? input.paymentReference.trim().slice(0, 160) : null, proofUrl: typeof input.proofUrl === 'string' ? input.proofUrl.trim().slice(0, 1000) : null }).returning();
      return json(res, 201, { data: order });
    }
    if (url.pathname === '/api/marketplace/reports' && req.method === 'POST') {
      const input = body(req);
      const listingId = required(input.listingId, 'listingId');
      const reason = required(input.reason, 'reason');
      const [report] = await db.insert(moderationReports).values({ id: randomUUID(), reporterId: session.user.id, listingId, reason: reason.slice(0, 120), details: typeof input.details === 'string' ? input.details.trim().slice(0, 2000) : null }).returning();
      return json(res, 201, { data: report });
    }
    if ((req.method === 'PUT' || req.method === 'DELETE') && url.pathname.startsWith('/api/marketplace/listings/')) {
      const listingId = required(url.pathname.split('/').pop(), 'listingId');
      const [owned] = await db.select().from(listings).where(and(eq(listings.id, listingId), eq(listings.userId, session.user.id))).limit(1);
      if (!owned) return json(res, 404, { error: 'Listing not found.' });
      if (req.method === 'DELETE') {
        await db.update(listings).set({ status: 'deleted', updatedAt: new Date() }).where(eq(listings.id, listingId));
        return json(res, 200, { data: { id: listingId } });
      }
      const input = body(req);
      const updates = {
        title: typeof input.title === 'string' ? input.title.trim().slice(0, 160) : owned.title,
        description: typeof input.description === 'string' ? input.description.trim().slice(0, 4000) : owned.description,
        category: typeof input.category === 'string' ? input.category.trim() : owned.category,
        district: typeof input.district === 'string' ? input.district.trim() : owned.district,
        price: Number.isInteger(Number(input.price)) && Number(input.price) > 0 ? Number(input.price) : owned.price,
        images: Array.isArray(input.images) ? input.images.filter((item): item is string => typeof item === 'string').slice(0, 8) : owned.images,
        updatedAt: new Date(),
      };
      const [updated] = await db.update(listings).set(updates).where(eq(listings.id, listingId)).returning();
      return json(res, 200, { data: updated });
    }
    if (req.method === 'POST' && url.pathname === '/api/marketplace/listings') {
      const input = body(req);
      const title = required(input.title, 'title'); const description = required(input.description, 'description'); const category = required(input.category, 'category'); const district = required(input.district, 'district');
      const price = Number(input.price); if (!Number.isInteger(price) || price <= 0) return json(res, 400, { error: 'Price must be a positive whole number.' });
      const [listing] = await db.insert(listings).values({ id: randomUUID(), userId: session.user.id, title, description, category, district, price, images: Array.isArray(input.images) ? input.images.filter((item): item is string => typeof item === 'string').slice(0, 8) : [] }).returning();
      return json(res, 201, { data: listing });
    }
    return json(res, 404, { error: 'Not found.' });
  } catch (error) {
    console.error('[marketplace-api]', error);
    const message = error instanceof Error ? error.message : 'Request failed.';
    const status = /invalid|required|price|username/i.test(message) ? 400 : 500;
    return json(res, status, { error: status === 400 ? message : 'Request failed.' });
  }
}
