import React from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Eye, 
  AlertTriangle, 
  Lock, 
  DollarSign, 
  PhoneCall, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface SafetyTipsModalProps {
  onClose: () => void;
  onOpenReport?: () => void;
  darkMode?: boolean;
}

export const SafetyTipsModal: React.FC<SafetyTipsModalProps> = ({
  onClose,
  onOpenReport,
  darkMode,
}) => {
  const safetyRules = [
    {
      icon: MapPin,
      title: 'Always Meet in Busy Public Places',
      desc: 'Arrange meetings in crowded public spots during daylight hours — shopping malls (Acacia Mall, Garden City, Metroplex Naalya, Oasis Mall) or near police posts. Avoid quiet or unfamiliar locations.',
    },
    {
      icon: Eye,
      title: 'Inspect & Test Before Paying',
      desc: 'Check the condition, IMEI number (for phones), engine condition (for boda bodas/cars), and authenticity of items in person before handing over cash or sending mobile money.',
    },
    {
      icon: AlertTriangle,
      title: 'Never Send Advance Transport Fares',
      desc: 'Do not transfer deposit fees, delivery fees, or "commitment money" to a seller before receiving the product. Honest sellers are willing to meet or use trusted courier services.',
    },
    {
      icon: Lock,
      title: 'Keep Your MoMo PIN 100% Confidential',
      desc: 'This ShopLocal demo never asks for a MoMo PIN or SMS verification code. No telecom payment request is sent from this preview.',
    },
    {
      icon: DollarSign,
      title: 'Beware of Unrealistic Bargains',
      desc: 'If a brand-new iPhone 15 or Bajaj Boxer boda boda is listed at half its market price, treat it with caution. It is likely a scam or stolen property.',
    },
    {
      icon: PhoneCall,
      title: 'Keep Chat & Proof of Communication',
      desc: 'Use ShopLocal Ug in-app chat for negotiations so you have records of agreed prices, descriptions, and promises.',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className={`rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden relative border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between sticky top-0 z-10 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Back</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg">
                ShopLocal Ug Safety Rules
              </h3>
              <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Simple rules for safe buying and selling across Uganda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <strong className="block font-bold mb-0.5">Golden Rule:</strong>
              Never pay upfront before inspecting an item. This demo does not process payment; in a live trade, agree on safe payment and delivery terms directly with the seller.
            </div>
          </div>

          <div className="space-y-3">
            {safetyRules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-colors flex items-start gap-3.5 ${
                    darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm mb-0.5">
                      {rule.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {rule.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Report Link */}
          {onOpenReport && (
            <div className={`p-4 rounded-2xl border text-center space-y-2 ${
              darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-xs font-semibold">
                Reports in this demo stay in your browser; no moderation team is notified.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenReport();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Report Suspicious Listing or Seller
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
        }`}>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            I Understand & Got It
          </button>
        </div>
      </div>
    </div>
  );
};
