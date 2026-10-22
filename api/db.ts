import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false), image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
export const session = pgTable('session', { id: text('id').primaryKey(), expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(), token: text('token').notNull().unique(), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(), ipAddress: text('ipAddress'), userAgent: text('userAgent'), userId: text('userId').notNull() });
export const account = pgTable('account', { id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(), userId: text('userId').notNull(), accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }), refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }), scope: text('scope'), password: text('password'), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow() });
export const verification = pgTable('verification', { id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow() });
export const profiles = pgTable('profiles', { id: text('id').primaryKey(), userId: text('userId').notNull().unique(), username: text('username').notNull().unique(), phone: text('phone'), district: text('district'), bio: text('bio'), avatar: text('avatar'), isVerified: boolean('isVerified').notNull().default(false), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow() });
export const listings = pgTable('listings', { id: text('id').primaryKey(), userId: text('userId').notNull(), title: text('title').notNull(), description: text('description').notNull(), category: text('category').notNull(), price: integer('price').notNull(), currency: text('currency').notNull().default('UGX'), district: text('district').notNull(), images: jsonb('images').$type<string[]>().notNull().default([]), status: text('status').notNull().default('active'), isSold: boolean('isSold').notNull().default(false), expiresAt: timestamp('expiresAt', { withTimezone: true }), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow() }, (table) => ({ searchIndex: index('listings_search_idx').on(table.category, table.district, table.status) }));
export const favorites = pgTable('favorites', { userId: text('userId').notNull(), listingId: text('listingId').notNull(), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow() });
export const conversations = pgTable('conversations', { id: text('id').primaryKey(), userAId: text('userAId').notNull(), userBId: text('userBId').notNull(), listingId: text('listingId'), lastMessageAt: timestamp('lastMessageAt', { withTimezone: true }), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow() });
export const messages = pgTable('messages', { id: text('id').primaryKey(), conversationId: text('conversationId').notNull(), senderId: text('senderId').notNull(), body: text('body').notNull(), readAt: timestamp('readAt', { withTimezone: true }), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow() });
export const moderationReports = pgTable('moderation_reports', { id: text('id').primaryKey(), reporterId: text('reporterId').notNull(), listingId: text('listingId').notNull(), reason: text('reason').notNull(), details: text('details'), status: text('status').notNull().default('open'), reviewedBy: text('reviewedBy'), reviewedAt: timestamp('reviewedAt', { withTimezone: true }), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow() });
export const boostOrders = pgTable('boost_orders', { id: text('id').primaryKey(), userId: text('userId').notNull(), listingId: text('listingId'), plan: text('plan').notNull(), amount: integer('amount').notNull(), currency: text('currency').notNull().default('UGX'), status: text('status').notNull().default('pending'), paymentReference: text('paymentReference'), proofUrl: text('proofUrl'), reviewedBy: text('reviewedBy'), reviewedAt: timestamp('reviewedAt', { withTimezone: true }), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow() });
export const notifications = pgTable('notifications', { id: text('id').primaryKey(), userId: text('userId').notNull(), type: text('type').notNull(), title: text('title').notNull(), body: text('body').notNull(), readAt: timestamp('readAt', { withTimezone: true }), data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow() });
export const orders = pgTable('orders', { id: text('id').primaryKey(), buyerId: text('buyerId').notNull(), sellerId: text('sellerId').notNull(), listingId: text('listingId').notNull(), quantity: integer('quantity').notNull().default(1), amount: integer('amount').notNull(), currency: text('currency').notNull().default('UGX'), status: text('status').notNull().default('pending'), createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow() });
export const reviews = pgTable('reviews', { id: text('id').primaryKey(), reviewerId: text('reviewer_id').notNull(), sellerId: text('seller_id').notNull(), listingId: text('listing_id').notNull(), rating: integer('rating').notNull(), body: text('body'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow() });

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({}),
};

const createChainableMock = () => {
  const chain: any = () => chain;
  const promise = Promise.resolve([]);
  chain.then = promise.then.bind(promise);
  chain.catch = promise.catch.bind(promise);
  chain.finally = promise.finally.bind(promise);
  return new Proxy(chain, {
    get: (_t, prop) => {
      if (prop === 'then') return promise.then.bind(promise);
      if (prop === 'catch') return promise.catch.bind(promise);
      if (prop === 'finally') return promise.finally.bind(promise);
      return () => chain;
    },
    apply: () => chain,
  });
};

const mockDbProxy = new Proxy({}, {
  get: (_, prop) => {
    if (prop === 'query') return new Proxy({}, { get: () => noOp });
    return () => createChainableMock();
  },
});

let poolInstance: any;
let dbInstance: any;

if (process.env.DATABASE_URL) {
  try {
    poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle(poolInstance, { schema: { user, session, account, verification, profiles, listings, favorites, conversations, messages, moderationReports, boostOrders, notifications, orders, reviews } });
  } catch {
    console.warn('[AI Studio] Database not connected — using mock');
    poolInstance = {
      query: async () => ({ rows: [], rowCount: 0 }),
      connect: async () => ({ query: async () => ({ rows: [], rowCount: 0 }), release: () => {} }),
      on: () => {},
      end: async () => {},
    };
    dbInstance = mockDbProxy;
  }
} else {
  console.warn('[AI Studio] DATABASE_URL not set — using mock');
  poolInstance = {
    query: async () => ({ rows: [], rowCount: 0 }),
    connect: async () => ({ query: async () => ({ rows: [], rowCount: 0 }), release: () => {} }),
    on: () => {},
    end: async () => {},
  };
  dbInstance = mockDbProxy;
}

export const pool = poolInstance as Pool;
export const db = dbInstance as ReturnType<typeof drizzle>;
export type Database = typeof db;

