import { createAuthClient } from 'better-auth/react';

export const betterAuthClient = createAuthClient({ baseURL: typeof window === 'undefined' ? undefined : window.location.origin });
export const { signIn, signUp, signOut, useSession } = betterAuthClient;
