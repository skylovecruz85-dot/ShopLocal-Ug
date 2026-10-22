import { betterAuth } from 'better-auth';
import { pool } from './_db.ts';

const origins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://shoplocal-ug.vercel.app',
  ...(process.env.APP_URL ? [process.env.APP_URL] : []),
  ...(process.env.APP_URL ? [process.env.APP_URL.replace('ais-dev-', 'ais-pre-')] : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
].filter(Boolean);

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'shoplocal-uganda-secret-key-2026',
  trustedOrigins: origins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none' as const,
      secure: true,
    },
  },
});
