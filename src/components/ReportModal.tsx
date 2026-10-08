import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportModalProps {
  listingTitle?: string;
  sellerName?: string;
  onClose: () => void;
  onSubmitReport: (reason: string, details: string) => void;
  darkMode?: boolean;
}

const REPORT_REASONS = [
  'Fraud / Asking for advance payment before meeting',
  'Fake / Counterfeit item',
  'Item is already sold / unavailable',
  'Incorrect price or misleading description',
  'Suspicious contact / phone line not reachable',
  'Offensive, spam, or inappropriate content',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  listingTitle,
  sellerName,
  onClose,
  onSubmitReport,
  darkMode,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(selectedReason, details);
    setSubmitted(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg">
                Report Listing or Seller
              </h3>
              <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Help protect the Ugandan marketplace community
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

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-base">Report Submitted</h4>
            <p className={`text-xs max-w-xs mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Thank you! Our trust and safety team will investigate this ad within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {(listingTitle || sellerName) && (
              <div className={`p-3 rounded-xl border text-xs ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                {listingTitle && (
                  <p className="font-bold truncate">Listing: {listingTitle}</p>
                )}
                {sellerName && (
                  <p className="text-slate-500 text-[11px] truncate">Seller: {sellerName}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Reason for Reporting:
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label 
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                      selectedReason === reason
                        ? darkMode ? 'border-red-500 bg-red-950/40 text-red-200 font-bold' : 'border-red-500 bg-red-50 text-red-900 font-bold'
                        : darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="reportReason" 
                      value={reason} 
                      checked={selectedReason === reason} 
                      onChange={() => setSelectedReason(reason)}
                      className="accent-red-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Additional Details (Optional):
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred, what was requested, or why this item is counterfeit..."
                className={`w-full p-3 rounded-xl border text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4" />
              <span>Submit Report to Safety Team</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
