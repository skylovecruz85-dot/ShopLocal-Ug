import React, { useState } from 'react';
import { ArrowLeft, Trash2, Check } from 'lucide-react';

export interface PromoSelection {
  type: 'TOP' | 'BOOST_PREMIUM';
  durationDays: 7 | 28 | 30;
  priceUGX: 9500 | 21500 | 28550;
  planName: '7 days' | '30 days' | 'Boost Premium';
}

interface PostAdPromoModalProps {
  onBack: () => void;
  onClear: () => void;
  onBuyPromoAndPost: (promo: PromoSelection) => void;
  onSaveAndPostLater: () => void;
  adTitle?: string;
}

export const PostAdPromoModal: React.FC<PostAdPromoModalProps> = ({
  onBack,
  onClear,
  onBuyPromoAndPost,
  onSaveAndPostLater,
  adTitle,
}) => {
  const [selectedPromo, setSelectedPromo] = useState<'TOP' | 'BOOST_PREMIUM'>('TOP');
  const [topDuration, setTopDuration] = useState<7 | 30>(7);

  const currentPrice = selectedPromo === 'TOP' ? (topDuration === 7 ? 9500 : 21500) : 28550;
  const currentPlanName: '7 days' | '30 days' | 'Boost Premium' = 
    selectedPromo === 'TOP' ? (topDuration === 7 ? '7 days' : '30 days') : 'Boost Premium';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-zinc-800 bg-[#121212] text-white flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-5 py-4 border-b border-[#2A2A2A] bg-[#121212] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
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
            onClick={onClear}
            className="flex items-center gap-1 text-[13px] font-bold text-[#FF3B30] hover:text-[#ff5247] cursor-pointer"
            title="Clear"
          >
            <span>Clear</span>
            <Trash2 className="w-4 h-4 text-[#FF3B30]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Subtitle */}
          <div>
            <p className="text-[12px] text-[#9E9E9E]">
              Choose a promotion type for your ad to post it
            </p>
            {adTitle && (
              <p className="text-[11px] text-[#00C853] font-medium mt-1 truncate">
                Ad: {adTitle}
              </p>
            )}
          </div>

          {/* TOP Promo Card - Active state */}
          <div
            onClick={() => setSelectedPromo('TOP')}
            className={`rounded-[12px] p-4 cursor-pointer transition-all select-none ${
              selectedPromo === 'TOP'
                ? 'border-[1.5px] border-[#00C853] bg-[#1E2A1E]'
                : 'border border-[#2A2A2A] bg-[#1E1E1E] hover:border-zinc-700'
            }`}
          >
            <div>
              <h3 className="text-[14px] font-bold text-white leading-tight">
                TOP promo
              </h3>
              <p className="text-[11px] text-[#B0B0B0] mt-1 leading-snug">
                Best choice if you need one fast sale. Your ad will be at the top of search results and get 13X more traffic
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
              <h3 className="text-[14px] font-bold text-white leading-tight">
                Boost Premium promo
              </h3>
              <p className="text-[11px] text-[#B0B0B0] mt-1 leading-snug">
                Best choice if you want to post more ads. Allows up to 40 ads in Repair & Construction and gives 5X more traffic for all of them
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
                onBuyPromoAndPost({
                  type: selectedPromo,
                  durationDays: selectedPromo === 'TOP' ? topDuration : 28,
                  priceUGX: currentPrice as 9500 | 21500 | 28550,
                  planName: currentPlanName,
                });
              }}
              className="w-full h-[50px] rounded-[8px] bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-[14px] flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              Buy promo &amp; Post ad (USh {currentPrice.toLocaleString()})
            </button>

            <button
              type="button"
              onClick={onSaveAndPostLater}
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
      </div>
    </div>
  );
};
