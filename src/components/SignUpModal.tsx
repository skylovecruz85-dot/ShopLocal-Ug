import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Smartphone, 
  Mail, 
  User as UserIcon, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, UgandaDistrict } from '../types';
import { UGANDA_DISTRICTS } from '../data/mockData';

interface SignUpModalProps {
  onClose: () => void;
  onSignUpComplete: (newUser: User) => void;
  darkMode?: boolean;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  onClose,
  onSignUpComplete,
  darkMode,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+256 7');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState<UgandaDistrict>('Kampala');
  const [pin, setPin] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive verification digits directly from entered email
  const extractDigitsFromEmail = (emailStr: string): string => {
    const clean = emailStr.trim();
    if (!clean) return '';
    // If the email has explicit numbers (e.g. cruz85@gmail.com -> 85, user2024 -> 2024)
    const explicitDigits = clean.replace(/\D/g, '');
    if (explicitDigits.length >= 4) {
      return explicitDigits.slice(0, 4);
    }
    if (explicitDigits.length > 0) {
      // Pad to 4 digits using deterministic hash from email
      let hash = 0;
      for (let i = 0; i < clean.length; i++) {
        hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
      }
      const pad = String(hash % 10000).padStart(4, '0');
      return (explicitDigits + pad).slice(0, 4);
    }
    // No explicit digits in email text, derive 4-digit code from email string
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
    }
    return String((hash % 9000) + 1000);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const derivedDigits = extractDigitsFromEmail(val);
    if (derivedDigits) {
      setPin(derivedDigits);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setAvatar(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || phone.length < 10) {
      alert('Please enter your full name and a valid Ugandan phone number.');
      return;
    }

    const finalDigits = pin || extractDigitsFromEmail(email) || '2025';

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '')}@shoplocal.ug`,
      avatar,
      district,
      rating: 5.0,
      reviewCount: 0,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      isPhoneVerified: true,
      isProMember: false,
      freeListingsUsed: 0,
      freeListingsTotal: 18, // 18 free listings for everyone
      hasBiometrics: false,
      joinedDate: new Date().toISOString(),
      responseTime: '< 15 mins',
      badges: ['New Verified Merchant', '18 Free Listings Active'],
      activePlan: 'FREE_18',
      completedSales: [],
    };

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
    });

    // Complete signup immediately without sign-in details screens, let account appear in profile
    onSignUpComplete(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white'
        }`}>
          <div>
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              Join ShopLocal UG
            </h3>
            <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Get 18 Free Listings — Instant Account Setup
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
          <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
            darkMode ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Includes <strong>18 FREE Listings</strong> for everyone (individuals & big businesses)!</span>
          </div>

          {/* Profile Picture Upload Access */}
          <div className="flex flex-col items-center justify-center pb-1">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={avatar}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#3db83a]/30 shadow-md group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] font-bold text-white">Upload</span>
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-[#3db83a] hover:bg-[#34a331] text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-800 cursor-pointer"
                title="Upload Profile Picture"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-[#3db83a] hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Upload Profile Picture</span>
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
              Full Name / Business Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Nalubega / Kampala Agro Traders"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
              Uganda Phone Number (MTN / Airtel) *
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 7..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                Email Address *
              </label>
              {email && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Digits auto-extracted to PIN
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="e.g. name85@gmail.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Primary Trading District */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
              Primary Trading District *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as UgandaDistrict)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {UGANDA_DISTRICTS.filter(d => d !== 'All Uganda').map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4-digit Account PIN (Digits from email) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                Security PIN (Digits from Email) *
              </label>
              {pin && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  From Email: {pin}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Digits from your email"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {pin ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Digits auto-filled from "{email || 'entered email'}": <strong>{pin}</strong>
                </span>
              ) : (
                <span>Type your email above to automatically fill your security digits.</span>
              )}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#3db83a] hover:bg-[#34a331] active:scale-[0.99] text-white font-extrabold text-sm shadow-md shadow-[#3db83a]/25 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Complete Sign Up & Open Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
