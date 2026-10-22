import React, { useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, Eye, EyeOff, Loader2, Mail, MapPin, Upload, User as UserIcon, X } from 'lucide-react';

import { User, UgandaDistrict } from '../types';
import { UGANDA_DISTRICTS } from '../data/catalog';

interface SignUpModalProps {
  onClose: () => void;
  onSignUpComplete: (newUser: User) => void;
  darkMode?: boolean;
}

type SignInStep = 'email' | 'profile';

const getAuthErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Authentication could not be completed. Please try again.';

export const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSignUpComplete, darkMode = false }) => {
  const [step, setStep] = useState<SignInStep>('email');
  const [isCreateAccount, setIsCreateAccount] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState<UgandaDistrict>('Kampala');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [authUserId, setAuthUserId] = useState('');
  const [formError, setFormError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Choose an image file for your profile photo.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setFormError('Profile photos must be 1 MB or smaller in this account.');
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
    setIsBusy(true);
    try {
      const response = await fetch(`/api/auth/${isCreateAccount ? 'sign-up/email' : 'sign-in/email'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCreateAccount ? { email: email.trim(), password, name: fullName.trim() || email.split('@')[0] } : { email: email.trim(), password }),
      });
      const payload = await response.json().catch(() => ({})) as { user?: { id: string; name?: string; email?: string }; message?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? payload.error ?? 'Invalid email or password.');
      }
      setAuthUserId(payload.user?.id ?? '');

      if (!isCreateAccount && payload.user) {
        const profileRes = await fetch('/api/marketplace/profile', { credentials: 'include' });
        const profilePayload = await profileRes.json().catch(() => null) as { data?: User } | null;
        if (profilePayload?.data) {
          onSignUpComplete(profilePayload.data);
        } else {
          onSignUpComplete({
            id: payload.user.id,
            name: payload.user.name || email.split('@')[0],
            username: (payload.user.name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase(),
            phone: '',
            email: payload.user.email || email.trim(),
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            district: 'Kampala',
            rating: 5,
            reviewCount: 0,
            isVerified: false,
            verificationStatus: 'UNVERIFIED',
            isPhoneVerified: false,
            isProMember: false,
            freeListingsUsed: 0,
            freeListingsTotal: 18,
            hasBiometrics: false,
            joinedDate: new Date().toISOString(),
            responseTime: 'Fast response',
            badges: [],
            activePlan: 'FREE_18',
            completedSales: [],
          });
        }
        onClose();
        return;
      }

      setStep('profile');
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCompleteProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (fullName.trim().length < 2 || username.trim().length < 3) {
      setFormError('Enter your name and a username with at least 3 characters.');
      return;
    }

    if (!authUserId) {
      setFormError('Sign in with email and password before completing your profile.');
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch('/api/marketplace/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), phone: phone.trim() || null, district, avatar, bio: fullName.trim() }) });
      const payload = await response.json().catch(() => ({})) as { data?: Record<string, unknown>; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Profile could not be saved.');
      onSignUpComplete({ id: authUserId, name: fullName.trim(), username: username.trim().replace(/\s+/g, '').toLowerCase(), phone: phone.trim(), email: email.trim(), avatar, district, rating: 0, reviewCount: 0, isVerified: false, verificationStatus: 'UNVERIFIED', isPhoneVerified: false, isProMember: false, freeListingsUsed: 0, freeListingsTotal: 18, hasBiometrics: false, joinedDate: new Date().toISOString(), responseTime: 'New to ShopLocal', badges: [], activePlan: 'FREE_18', completedSales: [] });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const inputClass = `w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`;
  const stepTitle = step === 'email' ? 'Sign in or create an account' : 'Complete your profile';
  const stepDescription = step === 'email'
    ? 'Use your email and password to continue.'
    : 'Add the details buyers will see.';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm">
      <section
        aria-labelledby="account-signin-title"
        aria-modal="true"
        className={`my-auto w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className={`flex items-center justify-between border-b p-5 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <h2 className="font-display text-lg font-black" id="account-signin-title">{stepTitle}</h2>
            <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stepDescription}</p>
          </div>
          <button aria-label="Close sign in" className={`rounded-xl p-2 ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`} onClick={onClose} type="button">
            <X className="size-5" />
          </button>
        </header>

        <form
          className="max-h-[78vh] space-y-4 overflow-y-auto p-5"
          onSubmit={step === 'email' ? handleEmailAuth : handleCompleteProfile}
        >
          {step === 'email' && (
            <>
              <div>
                <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-email-auth">Email address</label>
                <input autoComplete="email" className={inputClass.replace('pl-10', 'px-4')} id="account-email-auth" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required type="email" value={email} />
              </div>
              <div>
                <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-password">Password</label>
                <div className="relative">
                  <input autoComplete={isCreateAccount ? 'new-password' : 'current-password'} className={`${inputClass.replace('pl-10', 'px-4')} pr-11`} id="account-password" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required type={showPassword ? 'text' : 'password'} value={password} />
                  <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600" onClick={() => setShowPassword((value) => !value)} type="button">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {isCreateAccount && (
                <div>
                  <div>
                    <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-username-auth">Username</label>
                    <input autoComplete="username" className={inputClass.replace('pl-10', 'px-4')} id="account-username-auth" maxLength={30} minLength={3} onChange={(event) => setUsername(event.target.value.replace(/\s/g, ''))} placeholder="sarah_ug" required value={username} />
                  </div>

                </div>
              )}
              <button className={`text-left text-xs font-bold ${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`} onClick={() => setIsCreateAccount((value) => !value)} type="button">{isCreateAccount ? 'Already have an account? Sign in' : 'Need an account? Create one'}</button>
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
                <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-full-name">Full or business name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input autoComplete="name" className={inputClass} id="account-full-name" maxLength={80} minLength={2} onChange={(event) => setFullName(event.target.value)} placeholder="e.g. Sarah Nalubega" required value={fullName} />
                </div>
              </div>

              <div>
                <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-username">Username</label>
                <input autoComplete="username" className={inputClass.replace('pl-10', 'px-4')} id="account-username" maxLength={30} minLength={3} onChange={(event) => setUsername(event.target.value.replace(/\s/g, ''))} placeholder="e.g. sarah_ug" required value={username} />
              </div>

              <div>
                <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-email">Email address <span className={`font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>(optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input autoComplete="email" className={inputClass} id="account-email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" type="email" value={email} />
                </div>
              </div>

              {(
                <div>
                  <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-profile-phone">Phone number</label>
                  <input autoComplete="tel" className={inputClass.replace('pl-10', 'px-4')} id="account-profile-phone" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="+256 772 000 000" required type="tel" value={phone} />
                </div>
              )}

              <div>
                <label className={`mb-1 block text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} htmlFor="account-district">Trading district</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-emerald-600" />
                  <select className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900'}`} id="account-district" onChange={(event) => setDistrict(event.target.value as UgandaDistrict)} value={district}>
                    {UGANDA_DISTRICTS.filter((value) => value !== 'All Uganda').map((value) => <option key={value} value={value} className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{value}</option>)}
                  </select>
                </div>
              </div>

              <div className={`rounded-xl border px-3 py-2.5 text-xs ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                Your account is securely managed with email and password. Your session persists until you sign out.
              </div>
            </>
          )}

          {formError && <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold leading-5 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-50" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{formError}</p>}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            id={false ? 'shoplocal-send-verification-code' : undefined}
            type="submit"
          >
          {isBusy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          {isBusy ? (step === 'email' ? 'Signing in…' : 'Finishing profile…') : step === 'email' ? (isCreateAccount ? 'Create account' : 'Sign in') : 'Complete profile'}
          </button>
        </form>
      </section>
    </div>
  );
};
