import React, { useState } from 'react';
import { 
  X, 
  Fingerprint, 
  ScanFace, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';
import { registerBiometricPasskey, authenticateWithBiometrics } from '../utils/biometrics';

interface BiometricAuthModalProps {
  currentUser: User;
  onClose: () => void;
  onEnrollSuccess: (credentialId: string) => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  currentUser,
  onClose,
  onEnrollSuccess,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleRegisterBiometrics = async () => {
    setIsScanning(true);
    setStatusMessage('Place your finger on sensor or look at your camera...');

    try {
      const result = await registerBiometricPasskey(
        currentUser.id,
        currentUser.phone,
        currentUser.name
      );

      if (result.success && result.credentialId) {
        setIsScanning(false);
        setSuccess(true);
        setStatusMessage('Biometric Passkey successfully enrolled on this device!');

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });

        onEnrollSuccess(result.credentialId);
      }
    } catch (err: unknown) {
      setIsScanning(false);
      setStatusMessage('Encountered an issue. Please try again.');
    }
  };

  const handleTestAuthentication = async () => {
    setIsScanning(true);
    setStatusMessage('Scanning biometric passkey...');

    const res = await authenticateWithBiometrics(currentUser.biometricCredentialId);
    setIsScanning(false);
    if (res.success) {
      setSuccess(true);
      setStatusMessage('Biometric Verified! Instant passwordless login active.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-emerald-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>FIDO2 WebAuthn Security</span>
          </div>

          <h3 className="font-display font-black text-xl text-white">
            One Lifetime Biometric Sign-Up
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Enroll your device fingerprint or Face ID once. Never memorize passwords or wait for delayed SMS codes again.
          </p>
        </div>

        {/* Scan Body */}
        <div className="p-6 text-center space-y-6">
          {/* Biometric Icon Graphic with Pulse */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {isScanning && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            )}
            
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              success
                ? 'bg-emerald-100 text-emerald-600 scale-105'
                : isScanning
                ? 'bg-emerald-50 text-emerald-700 animate-pulse'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
            }`}>
              {success ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : (
                <Fingerprint className="w-12 h-12 stroke-[1.8]" />
              )}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-slate-900">
              {currentUser.hasBiometrics || success
                ? 'Biometrics Enrolled & Active'
                : 'Enroll Fingerprint or Face ID'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {statusMessage || (
                currentUser.hasBiometrics
                  ? 'Your biometric passkey is bound to your Ugandan registered phone number.'
                  : 'Tap below to register your biometric credential using your device secure enclave.'
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            {!currentUser.hasBiometrics && !success ? (
              <button
                onClick={handleRegisterBiometrics}
                disabled={isScanning}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{isScanning ? 'Scanning Sensor...' : 'Register Device Biometrics'}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleTestAuthentication}
                  disabled={isScanning}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ScanFace className="w-4 h-4 text-emerald-700" />
                  <span>Test Biometric Instant Login</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted locally in device Hardware Secure Enclave</span>
          </div>
        </div>
      </div>
    </div>
  );
};
