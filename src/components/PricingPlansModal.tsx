import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Crown, 
  Sparkles, 
  Check, 
  Zap, 
  Infinity, 
  ArrowRight,
  TrendingUp,
  Flame,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { formatUGX } from '../utils/helpers';
import { MARKETPLACE_PRICING_PLANS, PricingPlan } from '../data/mockData';

interface PricingPlansModalProps {
  onClose: () => void;
  onSelectPlan: (plan: PricingPlan) => void;
  selectedBoostListingTitle?: string;
  selectedBoostListingId?: string;
  onOpenManualBoost?: (config: {
    amount: 9500 | 21500 | 28550;
    planName: '7 days' | '30 days' | 'Boost Premium';
    adTitle: string;
    listingId?: string;
  }) => void;
  darkMode?: boolean;
}

export const PricingPlansModal: React.FC<PricingPlansModalProps> = ({
  onClose,
  onSelectPlan,
  selectedBoostListingTitle,
  selectedBoostListingId,
  onOpenManualBoost,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'boost'>(
    selectedBoostListingTitle ? 'boost' : 'packages'
  );
  const [selectedPromo, setSelectedPromo] = useState<'TOP' | 'BOOST_PREMIUM'>('TOP');
  const [topDuration, setTopDuration] = useState<7 | 30>(7);

  const boostPlan = MARKETPLACE_PRICING_PLANS.find(p => p.id === 'boost_weekly')!;
  const listingPacks = MARKETPLACE_PRICING_PLANS.filter(p => p.type !== 'boost');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className={`rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative border transition-colors ${
          activeTab === 'boost'
            ? 'bg-[#121212] border-zinc-800 text-white'
            : darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - EXACT like Jiji when in boost promo screen */}
        {activeTab === 'boost' ? (
          <div className="px-5 py-4 border-b border-[#2A2A2A] bg-[#121212] flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -ml-1 text-white hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-[16px] font-bold text-white leading-tight">
                Post new ad
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPromo('TOP');
                setTopDuration(7);
              }}
              className="flex items-center gap-1 text-[13px] font-bold text-[#FF3B30] hover:text-[#ff5247] cursor-pointer"
              title="Clear selection"
            >
              <span>Clear</span>
              <Trash2 className="w-4 h-4 text-[#FF3B30]" />
            </button>
          </div>
        ) : (
          /* Header for Standard Packages */
          <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white'
          }`}>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-display font-black text-lg flex items-center gap-1.5">
                  <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>ShopLocal Ug Ad Packs & Boosts</span>
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Try seller packages and boosts in this browser-only demo.
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
        )}

        {/* Navigation Switch Tabs if accessed generically */}
        {!selectedBoostListingTitle && (
          <div className={`px-5 pt-3 pb-2 border-b flex gap-2 ${
            activeTab === 'boost' ? 'border-[#2A2A2A] bg-[#121212]' : 'border-slate-100 dark:border-slate-800'
          }`}>
            <button
              onClick={() => setActiveTab('boost')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'boost'
                  ? 'bg-[#00C853] text-white shadow-xs'
                  : 'bg-[#2A2A2A] text-zinc-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-white fill-white" />
              <span>Ad Boosts</span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              All Merchant Packages
            </button>
          </div>
        )}

        {/* TAB 1: Ad Packages (Weekly 22 ads 18k, Monthly 40 ads 30k, Unlimited 65k) */}
        {activeTab === 'packages' && (
          <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="text-center max-w-md mx-auto mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                When Free Ads Are Done — Keep Selling
              </span>
              <h4 className="font-display font-black text-xl mt-0.5">
                Choose Your Seller Ad Allowance
              </h4>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sample pricing only; selecting a plan updates this preview in your browser.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {listingPacks.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all relative ${
                    plan.highlight
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md'
                      : plan.type === 'unlimited'
                      ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 shadow-md'
                      : darkMode
                      ? 'border-slate-800 bg-slate-800/60'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h5 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                      {plan.name}
                    </h5>

                    <div className="mt-2 mb-3">
                      <span className="font-display font-black text-2xl text-emerald-700 dark:text-emerald-400">
                        {formatUGX(plan.priceUGX)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {plan.duration === 'Lifetime' ? 'One Lifetime Payment' : `Billed ${plan.duration}`}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-center font-bold text-xs mb-3 text-slate-800 dark:text-slate-200">
                      {plan.adsCount === 'unlimited' ? '∞ Unlimited Active Ads' : `${plan.adsCount} Active Classifieds`}
                    </div>

                    <ul className="space-y-1.5 text-xs">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className={`text-[11px] leading-tight ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`mt-4 w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      plan.type === 'unlimited'
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <span>Choose Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Jiji Ad Promotion (TOP promo & Boost Premium) */}
        {activeTab === 'boost' && (
          <div className="p-4 sm:p-5 space-y-3.5 bg-[#121212] text-white animate-in fade-in max-h-[82vh] overflow-y-auto">
            <div className="pb-0.5">
              <p className="text-[12px] text-[#9E9E9E]">
                Choose a boost, pay directly by mobile money, then submit your SMS proof for private admin review.
              </p>
              {selectedBoostListingTitle && (
                <p className="text-[11px] text-[#00C853] font-medium mt-1 truncate">
                  Ad: {selectedBoostListingTitle}
                </p>
              )}
            </div>

            {/* TOP PROMO CARD */}
            <div
              onClick={() => setSelectedPromo('TOP')}
              className={`rounded-[12px] p-4 cursor-pointer transition-all select-none ${
                selectedPromo === 'TOP'
                  ? 'border-[1.5px] border-[#00C853] bg-[#1E2A1E]'
                  : 'border border-[#2A2A2A] bg-[#1E1E1E] hover:border-zinc-700'
              }`}
            >
              <div>
                <h5 className="text-[14px] font-bold text-white leading-tight">
TOP placement
                </h5>
                <p className="text-[11px] text-[#B0B0B0] mt-1 leading-snug">
                  Preview a top-of-search placement; performance is not measured in this demo.
                </p>
              </div>

              {/* Pills row */}
              <div className="flex items-center justify-between mt-3.5 pt-0.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPromo('TOP');
                      setTopDuration(7);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPromo === 'TOP' && topDuration === 7
                        ? 'bg-[#00C853] text-white shadow-xs'
                        : 'bg-[#2A2A2A] text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    {selectedPromo === 'TOP' && topDuration === 7 && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    )}
                    <span>7 days</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPromo('TOP');
                      setTopDuration(30);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedPromo === 'TOP' && topDuration === 30
                        ? 'bg-[#00C853] text-white shadow-xs'
                        : 'bg-[#2A2A2A] text-[#9E9E9E] hover:text-white'
                    }`}
                  >
                    {selectedPromo === 'TOP' && topDuration === 30 && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    )}
                    <span>30 days</span>
                  </button>
                </div>

                <div className="text-[14px] font-bold text-white tracking-tight">
                  {topDuration === 7 ? 'USh 9,500' : 'USh 21,500'}
                </div>
              </div>
            </div>

            {/* BOOST PREMIUM PROMO CARD */}
            <div
              onClick={() => setSelectedPromo('BOOST_PREMIUM')}
              className={`rounded-[12px] p-4 cursor-pointer transition-all select-none ${
                selectedPromo === 'BOOST_PREMIUM'
                  ? 'border-[1.5px] border-[#00C853] bg-[#1E2A1E]'
                  : 'border border-[#2A2A2A] bg-[#1E1E1E] hover:border-zinc-700'
              }`}
            >
              <div>
                <h5 className="text-[14px] font-bold text-white leading-tight">
                  Boost Premium
                </h5>
                <p className="text-[11px] text-[#B0B0B0] mt-1 leading-snug">
                  Preview a featured placement; no traffic or conversion metrics are tracked in this demo.
                </p>
              </div>

              <div className="flex items-center justify-between mt-3.5 pt-0.5">
                <span className="text-[12px] text-[#9E9E9E] font-medium">
                  1 month (28 days)
                </span>
                <span className="text-[14px] font-bold text-white tracking-tight">
                  USh 28,550
                </span>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const price = (selectedPromo === 'TOP' ? (topDuration === 7 ? 9500 : 21500) : 28550) as 9500 | 21500 | 28550;
                  const planTitle: '7 days' | '30 days' | 'Boost Premium' = 
                    selectedPromo === 'TOP' ? (topDuration === 7 ? '7 days' : '30 days') : 'Boost Premium';

                  if (onOpenManualBoost) {
                    onOpenManualBoost({
                      amount: price,
                      planName: planTitle,
                      adTitle: selectedBoostListingTitle || 'My Ad Posting',
                      listingId: selectedBoostListingId,
                    });
                  } else {
                    onSelectPlan({
                      id: selectedPromo === 'TOP' ? `top_${topDuration}d` : 'boost_premium_28d',
                      name: selectedPromo === 'TOP' ? `TOP Promo (${topDuration} Days)` : 'Boost Premium (28 Days)',
                      type: 'boost',
                      adsCount: selectedPromo === 'TOP' ? 1 : 40,
                      duration: selectedPromo === 'TOP' ? (topDuration === 7 ? 'Weekly' : 'Monthly') : 'Monthly',
                      priceUGX: price,
                      features: [
selectedPromo === 'TOP' ? 'Top-of-search placement preview' : 'Featured placement preview',
      'Simulated checkout only; no funds or escrow',
      'Sample badge styling; identity is not checked'
                      ],
                      badge: selectedPromo === 'TOP' ? 'TOP' : 'PREMIUM'
                    });
                  }
                }}
                className="w-full h-[50px] rounded-[8px] bg-[#00E676] hover:bg-[#00C853] text-black font-bold text-[14px] flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                Preview boost &amp; post ad (USh {selectedPromo === 'TOP' ? (topDuration === 7 ? '9,500' : '21,500') : '28,550'})
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-[50px] mt-[12px] rounded-[8px] bg-transparent border border-[#00E676] hover:bg-[#00E676]/10 text-[#00E676] font-semibold text-[14px] flex items-center justify-center transition-all cursor-pointer"
              >
                Save ad &amp; Post later
              </button>
            </div>

            {/* FOOTER */}
            <p className="text-[9px] text-[#757575] text-center leading-relaxed mt-3 px-1">
              By clicking on Post ad, you accept the{' '}
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Terms of Use: Ad listings must comply with Ugandan laws and ShopLocal guidelines.');
                }}
                className="text-[#00E676] underline hover:text-[#00C853] cursor-pointer"
              >
                Terms of Use
              </a>
              , confirm that you will abide by the Safety Tips, and declare that this posting does not include any Prohibited Items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
