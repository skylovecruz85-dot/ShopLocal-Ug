import React from 'react';
import { Clock, Eye, Trash2, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { Listing } from '../types';
import { formatUGX } from '../utils/helpers';

interface RecentlyViewedProps {
  items: Listing[];
  onOpenListing: (listing: Listing) => void;
  onClear: () => void;
  darkMode?: boolean;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  items,
  onOpenListing,
  onClear,
  darkMode,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <section className={`rounded-2xl p-4 sm:p-5 border transition-colors my-6 ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
    }`}>
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00B53F]/15 text-[#00B53F] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Recently Viewed</span>
              <span className="text-[10px] font-semibold bg-[#00B53F]/15 text-[#00B53F] px-2 py-0.5 rounded-full">
                Last {items.length} items
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Items you recently tapped on ShopLocal Ug
            </p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="text-[11px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer font-medium"
          title="Clear recently viewed history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear History</span>
        </button>
      </div>

      {/* Horizontal Scrollable Carousel of 5 Items */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenListing(item)}
            className={`min-w-[190px] sm:min-w-[210px] max-w-[220px] rounded-xl border overflow-hidden shrink-0 group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
              darkMode ? 'bg-slate-800/80 border-slate-700 hover:border-[#00B53F]' : 'bg-white border-slate-200 hover:border-[#00B53F] shadow-xs'
            }`}
          >
            {/* Image Preview Container */}
            <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Transparent Watermark inside the photo */}
              <div className="absolute top-1.5 left-1.5 z-10 max-w-[90%] pointer-events-none select-none">
                <div className="bg-black/50 backdrop-blur-xs text-white/95 text-[8px] font-medium px-1.5 py-0.5 rounded border border-white/20 truncate shadow-2xs">
                  <span className="text-white/80">posted on ShopLocal by </span>
                  <strong className="font-bold text-white">{item.seller.name}</strong>
                </div>
              </div>

              {/* Condition Tag */}
              <div className="absolute bottom-1.5 left-1.5 z-10">
                <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                  {item.condition}
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-2.5 space-y-1">
              <div className="font-display font-extrabold text-sm text-[#00B53F]">
                {formatUGX(item.price, item.isNegotiable)}
              </div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-[#00B53F] transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <span className="truncate max-w-[110px]">{item.district}</span>
                <span className="text-[#00B53F] font-bold flex items-center">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
