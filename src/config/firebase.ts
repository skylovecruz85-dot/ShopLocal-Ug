import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0,
);

const firebaseApp = isFirebaseConfigured
  ? getApps().find((app) => app.name === '[DEFAULT]') ?? initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

if (firebaseAuth) {
  firebaseAuth.languageCode = 'en';
}

export const firebaseAuthErrorMessage = (error: unknown) => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled in Firebase Authentication yet. Enable the Phone provider in the Firebase console.';
    case 'auth/unauthorized-domain':
    case 'auth/app-not-authorized':
      return 'This preview domain is not authorized for Firebase phone sign-in. Add the deployed domain under Firebase Authentication settings.';
    case 'auth/invalid-phone-number':
    case 'auth/missing-phone-number':
      return 'Enter a valid Ugandan mobile number, such as +256 772 000 000.';
    case 'auth/captcha-check-failed':
    case 'auth/invalid-app-credential':
      return 'Firebase could not verify this browser. Check the authorized domain and try again.';
    case 'auth/too-many-requests':
      return 'Firebase temporarily limited requests for this number or device. Try again later.';
    case 'auth/quota-exceeded':
      return 'The Firebase SMS quota has been reached. Try again later or use a Firebase test phone number.';
    case 'auth/invalid-verification-code':
      return 'That code is not correct. Check the SMS and try again.';
    case 'auth/code-expired':
    case 'auth/session-expired':
      return 'That code has expired. Request a new one.';
    case 'auth/network-request-failed':
      return 'A network error interrupted sign-in. Check your connection and try again.';
    default:
      return 'Firebase could not complete sign-in. Check the phone number and Firebase Authentication setup, then try again.';
  }
};
