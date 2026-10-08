import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  CreditCard,
  Send,
  Zap,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';
import { PAYMENT_CONFIG } from '../config/paymentConfig';

interface PayoutSettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onSave: (updatedPayouts: {
    mtnMomoNumber: string;
    mtnMomoName: string;
    airtelMoneyNumber: string;
    airtelMoneyName: string;
    momoPayMerchantCode: string;
    directPayoutsEnabled: boolean;
  }) => void;
  onSimulateTestPayoutAlert: (network: 'MTN' | 'AIRTEL', number: string, amount: number) => void;
  darkMode?: boolean;
}

export const PayoutSettingsModal: React.FC<PayoutSettingsModalProps> = ({
  currentUser,
  onClose,
  onSave,
  onSimulateTestPayoutAlert,
  darkMode,
}) => {
  const [mtnNumber, setMtnNumber] = useState(currentUser.mtnMomoNumber || PAYMENT_CONFIG.mtnMomo);
  const [mtnName, setMtnName] = useState(currentUser.mtnMomoName || PAYMENT_CONFIG.mtnName);
  const [airtelNumber, setAirtelNumber] = useState(currentUser.airtelMoneyNumber || PAYMENT_CONFIG.airtelMoney);
  const [airtelName, setAirtelName] = useState(currentUser.airtelMoneyName || PAYMENT_CONFIG.airtelName);
  const [merchantCode, setMerchantCode] = useState(currentUser.momoPayMerchantCode || PAYMENT_CONFIG.tillNumber);
  const [directPayoutsEnabled, setDirectPayoutsEnabled] = useState(currentUser.directPayoutsEnabled ?? true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      mtnMomoNumber: mtnNumber.trim(),
      mtnMomoName: mtnName.trim(),
      airtelMoneyNumber: airtelNumber.trim(),
      airtelMoneyName: airtelName.trim(),
      momoPayMerchantCode: merchantCode.trim(),
      directPayoutsEnabled,
    });

    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className={`rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Back Arrow */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between sticky top-0 z-10 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>Direct MTN & Airtel Payout Lines</span>
              </h3>
              <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Set the telecom lines where your buyer payments arrive
              </p>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[78vh]">
          {/* Explanation Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
            darkMode ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Payouts Directly to Your Mobile Device</span>
            </div>
            <p className="opacity-90">
              When a buyer taps <strong>"Pay with MTN MoMo / Airtel"</strong> on your items, funds are routed directly to these registered mobile money lines.
            </p>
          </div>

          {/* Section 1: MTN MoMo Receiving Line */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-amber-200/80 bg-amber-50/40'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FFCC00] text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                MTN
              </div>
              <div>
                <h4 className="font-bold text-xs">MTN Mobile Money Receiving Line</h4>
                <p className="text-[10px] text-slate-400">077, 078, 076 lines supported</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-75">
                  MTN Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={mtnNumber}
                  onChange={(e) => setMtnNumber(e.target.value)}
                  placeholder="0772 849 201"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-75">
                  Registered MTN MoMo Name *
                </label>
                <input
                  type="text"
                  required
                  value={mtnName}
                  onChange={(e) => setMtnName(e.target.value)}
                  placeholder="e.g. Brian Kigozi"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Quick Test Alert Button */}
            <button
              type="button"
              onClick={() => onSimulateTestPayoutAlert('MTN', mtnNumber, 150000)}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Test UGX 150,000 Credit Alert to My MTN Line</span>
            </button>
          </div>

          {/* Section 2: Airtel Money Receiving Line */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-red-200/80 bg-red-50/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#E50000] text-white flex items-center justify-center font-black text-xs shadow-xs">
                AIR
              </div>
              <div>
                <h4 className="font-bold text-xs">Airtel Money Receiving Line</h4>
                <p className="text-[10px] text-slate-400">070, 075, 074 lines supported</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-75">
                  Airtel Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={airtelNumber}
                  onChange={(e) => setAirtelNumber(e.target.value)}
                  placeholder="0701 445 921"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-75">
                  Registered Airtel Money Name *
                </label>
                <input
                  type="text"
                  required
                  value={airtelName}
                  onChange={(e) => setAirtelName(e.target.value)}
                  placeholder="e.g. Brian Kigozi"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Quick Test Alert Button */}
            <button
              type="button"
              onClick={() => onSimulateTestPayoutAlert('AIRTEL', airtelNumber, 280000)}
              className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Test UGX 280,000 Credit Alert to My Airtel Line</span>
            </button>
          </div>

          {/* Section 3: Optional MoMoPay Merchant Till */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-75">
              MoMoPay Merchant / Airtel Till Code (Optional)
            </label>
            <input
              type="text"
              value={merchantCode}
              onChange={(e) => setMerchantCode(e.target.value)}
              placeholder="e.g. 882910"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If you operate a business merchant code, enter it here for 0% cashout fees.
            </p>
          </div>

          {/* Direct Line Active Toggle */}
          <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className="text-xs font-bold block">Receive Purchases Directly to My Lines</span>
              <span className="text-[11px] text-slate-400">Buyers deposit straight to your phone with instant SMS notification</span>
            </div>
            <input
              type="checkbox"
              checked={directPayoutsEnabled}
              onChange={(e) => setDirectPayoutsEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Payout Lines Saved! ✓' : 'Save My Direct Payout Lines'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected by MTN Uganda MoMo Open API & Airtel Money Uganda Developer API</span>
          </div>
        </form>
      </div>
    </div>
  );
};
