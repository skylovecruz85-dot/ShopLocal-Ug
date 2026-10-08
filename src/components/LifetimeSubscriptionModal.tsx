import React from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Bell, 
  TrendingUp, 
  MessageSquare,
  ArrowRight,
  Infinity
} from 'lucide-react';
import { formatUGX } from '../utils/helpers';

interface LifetimeSubscriptionModalProps {
  onClose: () => void;
  onProceedToPayment: (amount: number) => void;
  isAlreadyPro: boolean;
}

const PRO_PRICE_UGX = 65000;

export const LifetimeSubscriptionModal: React.FC<LifetimeSubscriptionModalProps> = ({
  onClose,
  onProceedToPayment,
  isAlreadyPro,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden relative border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Uganda Gold & Emerald tones */}
        <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
              <span>One-Time Lifetime Membership</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              ShopLocal Ug <span className="text-amber-400">PRO Seller</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md">
              Pay once and sell forever. No monthly renewals, no hidden listing fees, and maximum visibility for Ugandan business owners.
            </p>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-amber-400">
                {formatUGX(PRO_PRICE_UGX)}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                / Lifetime Access
              </span>
            </div>
          </div>
        </div>

        {/* Benefits Comparison */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Everything Included in Lifetime PRO:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500 text-slate-950 shrink-0">
                  <Infinity className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Unlimited Active Listings</h5>
                  <p className="text-[11px] text-slate-600">Bypass the 18 free listing limit forever.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-600 text-white shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">3x Boosted Search Rank</h5>
                  <p className="text-[11px] text-slate-600">Appear at the top of category searches.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-blue-600 text-white shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Push & SMS Alerts</h5>
                  <p className="text-[11px] text-slate-600">Instant alerts when buyers make offers.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-purple-600 text-white shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Golden PRO Merchant Badge</h5>
                  <p className="text-[11px] text-slate-600">Boost buyer trust and conversion rates.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment CTA */}
          <div className="pt-2 border-t border-slate-100">
            {isAlreadyPro ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-center font-bold text-xs">
                You already own a Lifetime PRO Membership! 🎉
              </div>
            ) : (
              <button
                onClick={() => onProceedToPayment(PRO_PRICE_UGX)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Upgrade with MTN MoMo / Airtel Money</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <p className="text-center text-[11px] text-slate-400 mt-2">
              Instant activation via MTN Mobile Money or Airtel Money USSD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
