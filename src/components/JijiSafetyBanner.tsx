import React from 'react';
import { ShieldCheck, ChevronRight } from 'lucide-react';

interface JijiSafetyBannerProps {
  onOpenSafetyTips: () => void;
  darkMode?: boolean;
}

export const JijiSafetyBanner: React.FC<JijiSafetyBannerProps> = ({
  onOpenSafetyTips,
  darkMode,
}) => {
  return (
    <div className={`rounded-xl border p-3 sm:p-3.5 transition-colors ${
      darkMode 
        ? 'bg-slate-900/90 border-slate-800' 
        : 'bg-[#f4fbf5] border-[#c2ecc4]'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00B53F]/15 text-[#00B53F] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00B53F]">
                Safety First on ShopLocal Ug
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              1. Meet seller in a public place · 2. Inspect item before buying · 3. Never pay in advance
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSafetyTips}
          className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-bold text-[#00B53F] hover:text-[#008A30] transition-colors cursor-pointer shrink-0"
        >
          <span>Safety Guidelines</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
