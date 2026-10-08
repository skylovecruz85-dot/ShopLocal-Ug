import React, { useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, Info, Mail, MapPin, Smartphone, Upload, User as UserIcon, X } from 'lucide-react';
import { User, UgandaDistrict } from '../types';
import { UGANDA_DISTRICTS } from '../data/mockData';

interface SignUpModalProps {
  onClose: () => void;
  onSignUpComplete: (newUser: User) => void;
  darkMode?: boolean;
}

const isValidUgandanMobile = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const nationalNumber = digits.startsWith('256')
    ? digits.slice(3)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  return /^7\d{8}$/.test(nationalNumber);
};

export const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSignUpComplete, darkMode = false }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState<UgandaDistrict>('Kampala');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [formError, setFormError] = useState('');
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

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setFormError('Enter a name with at least 2 characters.');
      return;
    }
    if (!isValidUgandanMobile(phone)) {
      setFormError('Enter a valid Ugandan mobile number, such as +256 772 000 000.');
      return;
    }

    const newUser: User = {
      id: `usr_demo_${Date.now()}`,
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatar,
      district,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      isPhoneVerified: false,
      isProMember: false,
      freeListingsUsed: 0,
      freeListingsTotal: 18,
      hasBiometrics: false,
      joinedDate: new Date().toISOString(),
      responseTime: 'Demo replies are simulated',
      badges: ['Demo profile'],
      activePlan: 'FREE_18',
      completedSales: [],
    };

    onSignUpComplete(newUser);
  };

  const inputClass = `w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm">
      <section
        aria-labelledby="demo-signup-title"
        aria-modal="true"
        className={`my-auto w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className={`flex items-center justify-between border-b p-5 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <h2 className="font-display text-lg font-black" id="demo-signup-title">Create a demo profile</h2>
            <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Explore ShopLocal UG with a local sample account.</p>
          </div>
          <button aria-label="Close signup" className={`rounded-xl p-2 ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`} onClick={onClose} type="button">
            <X className="size-5" />
          </button>
        </header>

        <form className="max-h-[78vh] space-y-4 overflow-y-auto p-5" onSubmit={handleFormSubmit}>
          <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${darkMode ? 'border-amber-900 bg-amber-950/40 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-950'}`} role="note">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p><strong>Demo only.</strong> Your profile is saved in this browser. No password, email/SMS delivery, phone check, or identity verification is performed.</p>
          </div>

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
            <label className="mb-1 block text-xs font-bold" htmlFor="demo-full-name">Full or business name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input autoComplete="name" className={inputClass} id="demo-full-name" maxLength={80} minLength={2} onChange={(event) => setFullName(event.target.value)} placeholder="e.g. Sarah Nalubega" required value={fullName} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold" htmlFor="demo-phone">Ugandan mobile number</label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input autoComplete="tel" className={inputClass} id="demo-phone" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="+256 772 000 000" required type="tel" value={phone} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold" htmlFor="demo-email">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input autoComplete="email" className={inputClass} id="demo-email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required type="email" value={email} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold" htmlFor="demo-district">Trading district</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-emerald-600" />
              <select className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900'}`} id="demo-district" onChange={(event) => setDistrict(event.target.value as UgandaDistrict)} value={district}>
                {UGANDA_DISTRICTS.filter((value) => value !== 'All Uganda').map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          </div>

          <div className={`rounded-xl border px-3 py-2.5 text-xs ${darkMode ? 'border-emerald-900 bg-emerald-950/35 text-emerald-200' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
            The sample profile includes an allowance of 18 demo listings. Changes stay in this browser.
          </div>

          {formError && <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300" role="alert"><AlertCircle className="mt-0.5 size-4 shrink-0" />{formError}</p>}

          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-700" type="submit">
            <CheckCircle2 className="size-4" /> Create demo profile
          </button>
        </form>
      </section>
    </div>
  );
};
