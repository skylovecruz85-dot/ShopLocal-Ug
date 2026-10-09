import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Camera, CheckCircle2, Eye, EyeOff, Loader2, Mail, MapPin, Smartphone, Upload, User as UserIcon, X } from 'lucide-react';
import { browserLocalPersistence, RecaptchaVerifier, setPersistence, signInWithEmailAndPassword, signInWithPhoneNumber, createUserWithEmailAndPassword, type ConfirmationResult, type User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth, firebaseConfigured, firebaseProfileStorageKey } from '../config/firebase';
import { User, UgandaDistrict } from '../types';
import { UGANDA_DISTRICTS } from '../data/mockData';

interface SignUpModalProps {
  onClose: () => void;
  onSignUpComplete: (newUser: User) => void;
  darkMode?: boolean;
}

type SignInStep = 'phone' | 'code' | 'email' | 'profile';
type AuthMethod = 'email' | 'phone';

const formatUgandanPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const nationalNumber = digits.startsWith('256')
    ? digits.slice(3)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  return /^7\d{8}$/.test(nationalNumber) ? `+256${nationalNumber}` : null;
};

const readLocalProfile = (uid: string): User | null => {
  try {
    const saved = localStorage.getItem(firebaseProfileStorageKey(uid));
    if (!saved) return null;
    const profile = JSON.parse(saved) as User;
    return profile.id === uid ? profile : null;
  } catch {
    return null;
  }
};

const getFirebaseErrorMessage = (error: unknown) => {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'That phone number is not valid. Enter a Ugandan mobile number such as +256 772 000 000.';
    case 'auth/too-many-requests':
      return 'Firebase has temporarily limited verification attempts. Please wait before trying again.';
    case 'auth/quota-exceeded':
    case 'auth/billing-not-enabled':
      return 'Firebase is not currently allowing SMS delivery for this project. Check its Authentication and billing limits.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication. Add the current app domain under Authentication settings.';
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled for this Firebase project. Enable the Phone provider in Firebase Authentication.';
    case 'auth/captcha-check-failed':
    case 'auth/missing-app-credential':
    case 'auth/invalid-app-credential':
      return 'Firebase could not verify this browser. Check the authorized domain and reCAPTCHA settings, then try again.';
    case 'auth/network-request-failed':
      return 'A network error interrupted Firebase sign-in. Check your connection and try again.';
    case 'auth/invalid-verification-code':
      return 'That code is not correct. Check the SMS and enter the six-digit code again.';
    case 'auth/code-expired':
    case 'auth/session-expired':
      return 'That verification code has expired. Send a new code to continue.';
    default:
      return 'Firebase could not complete phone sign-in. Check the project setup and try again.';
  }
};

export const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSignUpComplete, darkMode = false }) => {
  const initialFirebaseUser = firebaseAuth?.currentUser ?? null;
  const [step, setStep] = useState<SignInStep>(initialFirebaseUser?.phoneNumber ? 'profile' : 'phone');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [isCreateAccount, setIsCreateAccount] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(initialFirebaseUser?.phoneNumber ?? '');
  const [phoneForVerification, setPhoneForVerification] = useState(initialFirebaseUser?.phoneNumber ?? '');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState<UgandaDistrict>('Kampala');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verifiedFirebaseUser, setVerifiedFirebaseUser] = useState<FirebaseUser | null>(initialFirebaseUser);
  const [formError, setFormError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    recaptchaVerifierRef.current?.clear();
  }, []);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Choose an image file for your profile photo.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setFormError('Profile photos must be 1 MB or smaller in this demo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (typeof loadEvent.target?.result === 'string') {
        setAvatar(loadEvent.target.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (!email.trim() || password.length < 6) {
      setFormError('Enter an email and a password with at least 6 characters.');
      return;
    }
    if (!firebaseAuth) {
      setFormError('Firebase sign-in is not configured.');
      return;
    }

    setIsBusy(true);
    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
      const credential = isCreateAccount
        ? await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password)
        : await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const savedProfile = readLocalProfile(credential.user.uid);
      if (savedProfile) {
        onSignUpComplete({ ...savedProfile, id: credential.user.uid, email: credential.user.email ?? email.trim() });
        return;
      }
      setVerifiedFirebaseUser(credential.user);
      setStep('profile');
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      setFormError(code === 'auth/email-already-in-use' ? 'That email already has an account. Switch to Sign in.' : code === 'auth/invalid-credential' ? 'The email or password is incorrect.' : getFirebaseErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const e164Phone = formatUgandanPhoneNumber(phone);
    if (!e164Phone) {
      setFormError('Enter a valid Ugandan mobile number, such as +256 772 000 000.');
      return;
    }
    if (!firebaseConfigured || !firebaseAuth) {
      setFormError('Firebase sign-in is not configured. Check the Firebase web app settings in the project environment.');
      return;
    }

    setIsBusy(true);
    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
      const verifier = recaptchaVerifierRef.current ?? new RecaptchaVerifier(firebaseAuth, 'shoplocal-send-verification-code', { size: 'invisible' });
      recaptchaVerifierRef.current = verifier;
      const result = await signInWithPhoneNumber(firebaseAuth, e164Phone, verifier);
      setConfirmationResult(result);
      setPhoneForVerification(e164Phone);
      setStep('code');
      setVerificationCode('');
    } catch (error) {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
      setFormError(getFirebaseErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const code = verificationCode.replace(/\D/g, '');
    if (!/^\d{6}$/.test(code)) {
      setFormError('Enter the six-digit verification code from Firebase.');
      return;
    }
    if (!confirmationResult) {
      setFormError('Request a new verification code to continue.');
      setStep('phone');
      return;
    }

    setIsBusy(true);
    try {
      const credential = await confirmationResult.confirm(code);
      const firebaseUser = credential.user;
      const verifiedPhone = firebaseUser.phoneNumber ?? phoneForVerification;
      const savedProfile = readLocalProfile(firebaseUser.uid);

      if (savedProfile) {
        const restoredProfile: User = {
          ...savedProfile,
          id: firebaseUser.uid,
          phone: verifiedPhone,
          email: firebaseUser.email ?? savedProfile.email,
      isPhoneVerified: Boolean(firebaseUser.phoneNumber),
          isVerified: false,
          verificationStatus: 'UNVERIFIED',
          ninNumber: undefined,
          badges: Array.from(new Set([
            ...(savedProfile.badges ?? []).filter((badge) => !/nin|identity verified|phone verified/i.test(badge)),
            'Phone verified',
          ])),
        };
        onSignUpComplete(restoredProfile);
        return;
      }

      setVerifiedFirebaseUser(firebaseUser);
      setPhoneForVerification(verifiedPhone);
      setStep('profile');
    } catch (error) {
      setFormError(getFirebaseErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCompleteProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (fullName.trim().length < 2 || username.trim().length < 3) {
      setFormError('Enter your name and a username with at least 3 characters.');
      return;
    }

    const firebaseUser = verifiedFirebaseUser ?? firebaseAuth?.currentUser ?? null;
    if (!firebaseUser) {
      setFormError('Sign in with email or phone before completing your profile.');
      return;
    }
    const profilePhone = firebaseUser.phoneNumber ?? formatUgandanPhoneNumber(phone);
    if (!profilePhone) {
      setFormError('Enter a valid Ugandan phone number to finish your profile.');
      return;
    }

    const newUser: User = {
      id: firebaseUser.uid,
      name: fullName.trim(),
      username: username.trim().replace(/\s+/g, '').toLowerCase(),
      phone: profilePhone,
      email: email.trim(),
      avatar,
      district,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      isPhoneVerified: true,
      isProMember: false,
      freeListingsUsed: 0,
      freeListingsTotal: 18,
      hasBiometrics: false,
      joinedDate: new Date().toISOString(),
      responseTime: 'New to ShopLocal',
      badges: firebaseUser.phoneNumber ? ['Phone verified'] : [],
      activePlan: 'FREE_18',
      completedSales: [],
    };

    onSignUpComplete(newUser);
  };

  const handleChangeNumber = () => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
    setConfirmationResult(null);
    setVerificationCode('');
    setFormError('');
    setStep('phone');
  };

  const inputClass = `w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`;
  const stepTitle = step === 'phone' || step === 'email' ? 'Sign in or create an account' : step === 'code' ? 'Check your messages' : 'Complete your profile';
  const stepDescription = step === 'phone'
    ? 'Use your Ugandan mobile number to continue securely.'
    : step === 'email'
      ? 'Use your email and password. Your session stays signed in on this device.'
    : step === 'code'
      ? `Enter the six-digit code sent to ${phoneForVerification}.`
      : 'Your phone is verified. Add the details buyers will see.';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm">
      <section
        aria-labelledby="firebase-signin-title"
        aria-modal="true"
        className={`my-auto w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className={`flex items-center justify-between border-b p-5 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <h2 className="font-display text-lg font-black" id="firebase-signin-title">{stepTitle}</h2>
            <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stepDescription}</p>
          </div>
          <button aria-label="Close sign in" className={`rounded-xl p-2 ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`} onClick={onClose} type="button">
            <X className="size-5" />
          </button>
        </header>

        <form
          className="max-h-[78vh] space-y-4 overflow-y-auto p-5"
          onSubmit={step === 'phone' ? (authMethod === 'email' ? handleEmailAuth : handleSendCode) : step === 'email' ? handleEmailAuth : step === 'code' ? handleVerifyCode : handleCompleteProfile}
        >
          {!firebaseConfigured && (
            <p className={`rounded-xl border p-3 text-xs ${darkMode ? 'border-amber-900 bg-amber-950/40 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-950'}`} role="status">
              Firebase web configuration is missing. Add the Firebase web app settings to the project environment before signing in.
            </p>
          )}

          {step === 'phone' && (
            <>
              <div className={`grid grid-cols-2 rounded-xl p-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {(['email', 'phone'] as AuthMethod[]).map((method) => (
                  <button key={method} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${authMethod === method ? 'bg-emerald-600 text-white' : darkMode ? 'text-slate-300' : 'text-slate-600'}`} onClick={() => setAuthMethod(method)} type="button">
                    {method === 'email' ? 'Email & password' : 'Phone SMS'}
                  </button>
                ))}
              </div>
              {authMethod === 'email' ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-bold" htmlFor="firebase-email-auth">Email address</label>
                    <input autoComplete="email" className={inputClass.replace('pl-10', 'px-4')} id="firebase-email-auth" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required type="email" value={email} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold" htmlFor="firebase-password">Password</label>
                    <div className="relative">
                      <input autoComplete={isCreateAccount ? 'new-password' : 'current-password'} className={`${inputClass.replace('pl-10', 'px-4')} pr-11`} id="firebase-password" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required type={showPassword ? 'text' : 'password'} value={password} />
                      <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600" onClick={() => setShowPassword((value) => !value)} type="button">
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  {isCreateAccount && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold" htmlFor="firebase-username-auth">Username</label>
                        <input autoComplete="username" className={inputClass.replace('pl-10', 'px-4')} id="firebase-username-auth" maxLength={30} minLength={3} onChange={(event) => setUsername(event.target.value.replace(/\s/g, ''))} placeholder="sarah_ug" required value={username} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold" htmlFor="firebase-phone-auth">Phone number</label>
                        <input autoComplete="tel" className={inputClass.replace('pl-10', 'px-4')} id="firebase-phone-auth" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="+256 772 000 000" required type="tel" value={phone} />
                      </div>
                    </div>
                  )}
                  <button className="text-left text-xs font-bold text-emerald-600" onClick={() => setIsCreateAccount((value) => !value)} type="button">{isCreateAccount ? 'Already have an account? Sign in' : 'Need an account? Create one'}</button>
                </>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-bold" htmlFor="firebase-phone">Ugandan mobile number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input autoComplete="tel" className={inputClass} id="firebase-phone" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="+256 772 000 000" required type="tel" value={phone} />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'email' && (
            <div className="space-y-3">
              <label className="mb-1 block text-xs font-bold" htmlFor="firebase-email-step">Email address</label>
              <input autoComplete="email" className={inputClass.replace('pl-10', 'px-4')} id="firebase-email-step" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
              <label className="mb-1 block text-xs font-bold" htmlFor="firebase-password-step">Password</label>
              <div className="relative">
                <input autoComplete="current-password" className={`${inputClass.replace('pl-10', 'px-4')} pr-11`} id="firebase-password-step" minLength={6} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? 'text' : 'password'} value={password} />
                <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600" onClick={() => setShowPassword((value) => !value)} type="button">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          )}


          {step === 'code' && (
            <>
              <div className={`rounded-xl border px-3 py-2.5 text-xs ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                Code sent to <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{phoneForVerification}</strong>. Check your SMS messages.
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold" htmlFor="firebase-verification-code">Six-digit verification code</label>
                <input
                  autoComplete="one-time-code"
                  autoFocus
                  className={`w-full rounded-xl border px-4 py-3 text-center text-xl font-black tracking-[0.35em] outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
                  id="firebase-verification-code"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  required
                  value={verificationCode}
                />
              </div>
              <button className={`inline-flex items-center gap-1.5 text-xs font-bold ${darkMode ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-800'}`} onClick={handleChangeNumber} type="button">
                <ArrowLeft className="size-3.5" /> Change phone number
              </button>
            </>
          )}

          {step === 'profile' && (
            <>
              <div className="flex flex-col items-center">
                <button aria-label="Choose profile photo" className="group relative rounded-full" onClick={() => fileInputRef.current?.click()} type="button">
                  <img alt="Profile preview" className="size-20 rounded-full object-cover ring-4 ring-emerald-500/20" src={avatar} />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="size-5" />
                  </span>
                </button>
                <input accept="image/*" className="hidden" onChange={handleAvatarUpload} ref={fileInputRef} type="file" />
                <button className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400" onClick={() => fileInputRef.current?.click()} type="button">
                  <Upload className="size-3.5" /> Upload profile photo
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold" htmlFor="firebase-full-name">Full or business name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input autoComplete="name" className={inputClass} id="firebase-full-name" maxLength={80} minLength={2} onChange={(event) => setFullName(event.target.value)} placeholder="e.g. Sarah Nalubega" required value={fullName} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold" htmlFor="firebase-username">Username</label>
                <input autoComplete="username" className={inputClass.replace('pl-10', 'px-4')} id="firebase-username" maxLength={30} minLength={3} onChange={(event) => setUsername(event.target.value.replace(/\s/g, ''))} placeholder="e.g. sarah_ug" required value={username} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold" htmlFor="firebase-email">Email address <span className={`font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>(optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input autoComplete="email" className={inputClass} id="firebase-email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" type="email" value={email} />
                </div>
              </div>

              {!verifiedFirebaseUser?.phoneNumber && !firebaseAuth?.currentUser?.phoneNumber && (
                <div>
                  <label className="mb-1 block text-xs font-bold" htmlFor="firebase-profile-phone">Phone number</label>
                  <input autoComplete="tel" className={inputClass.replace('pl-10', 'px-4')} id="firebase-profile-phone" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="+256 772 000 000" required type="tel" value={phone} />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold" htmlFor="firebase-district">Trading district</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-emerald-600" />
                  <select className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900'}`} id="firebase-district" onChange={(event) => setDistrict(event.target.value as UgandaDistrict)} value={district}>
                    {UGANDA_DISTRICTS.filter((value) => value !== 'All Uganda').map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
              </div>

              <div className={`rounded-xl border px-3 py-2.5 text-xs ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                Your username, email, password, and verified phone are linked to your Firebase account. Your session persists on this device until you sign out.
              </div>
            </>
          )}

          {formError && <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold leading-5 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-50" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{formError}</p>}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy || (step === 'phone' && !firebaseConfigured)}
            id={step === 'phone' ? 'shoplocal-send-verification-code' : undefined}
            type="submit"
          >
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : step === 'phone' ? <Smartphone className="size-4" /> : <CheckCircle2 className="size-4" />}
            {isBusy ? step === 'phone' ? 'Sending code…' : step === 'code' ? 'Verifying code…' : 'Finishing profile…' : step === 'phone' ? 'Send verification code' : step === 'code' ? 'Verify and sign in' : 'Complete profile'}
          </button>
        </form>
      </section>
    </div>
  );
};
