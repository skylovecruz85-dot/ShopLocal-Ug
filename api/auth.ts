import { betterAuth } from 'better-auth';
import { pool } from './db.ts';

const origins = process.env.NODE_ENV === 'development'
  ? ['http://localhost:3000', ...['V0_RUNTIME_URL', 'V0_DEV_APP_URL', 'V0_BUILD_URL', 'V0_SANDBOX_URL'].map((key) => process.env[key]).filter((value): value is string => Boolean(value))]
  : ['https://shoplocal-ug.vercel.app', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '', process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ''].filter(Boolean);

const logDevCode = (kind: 'verification' | 'password-reset', email: string, url: string) => {
  if (process.env.NODE_ENV === 'development') console.info(`[better-auth:${kind}] ${email} -> ${url}`);
};

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? 'https://shoplocal-ug.vercel.app',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: origins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => logDevCode('password-reset', user.email, url),
  },
  sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => logDevCode('verification', user.email, url),
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
});
