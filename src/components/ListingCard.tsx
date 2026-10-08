import React from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Heart, 
  MessageSquare, 
  Gem,
  Clock
} from 'lucide-react';
import { Listing } from '../types';
import { formatUGX, formatTimeAgo } from '../utils/helpers';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenChat: (listing: Listing, e: React.MouseEvent) => void;
  darkMode?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onSelectListing,
  onOpenChat,
  darkMode,
}) => {
  return (
    <div 
      onClick={() => onSelectListing(listing)}
      className="group rounded-xl border border-slate-200/90 bg-white hover:border-[#00B53F] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col relative overflow-hidden shadow-xs"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* TOP Badge if boosted and not pending payment */}
        {listing.isBoosted && listing.paymentStatus !== 'PENDING_PAYMENT' && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 bg-[#ffb703] text-slate-950 font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
              <Gem className="w-3 h-3 fill-slate-950" /> TOP
            </span>
          </div>
        )}

        {/* Pending verification badge */}
        {listing.paymentStatus === 'PENDING_PAYMENT' && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 bg-amber-500 text-black font-extrabold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
              Verifying Payment
            </span>
          </div>
        )}

        {/* Favorite bookmark button */}
        <button
          onClick={(e) => onToggleFavorite(listing.id, e)}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer z-10 ${
            isFavorite 
              ? 'bg-white text-red-500 shadow-sm' 
              : 'bg-black/35 hover:bg-white text-white hover:text-red-500'
          }`}
          title={isFavorite ? "Remove from saved" : "Save listing"}
          aria-label={isFavorite ? "Remove from saved" : "Save listing"}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Photos count tag */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10">
            1/{listing.images.length}
          </div>
        )}

        {/* Transparent Watermark inside the ad photo */}
        <div className="absolute bottom-7 left-1.5 z-10 max-w-[92%] pointer-events-none select-none">
          <div className="bg-black/50 backdrop-blur-xs text-white/95 text-[9px] font-medium px-2 py-0.5 rounded-md border border-white/20 truncate shadow-xs">
            <span className="text-white/80">posted on ShopLocal by </span>
            <strong className="font-bold text-white">{listing.seller.name}</strong>
          </div>
        </div>

        {/* Item condition tag */}
        <div className="absolute bottom-1.5 left-1.5 z-10">
          <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
            {listing.condition}
          </span>
        </div>
      </div>

      {/* Card Content - Authentic Jiji Anatomy */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Bold Price in UGX */}
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <span className="font-display font-extrabold text-sm sm:text-base text-[#00B53F] tracking-tight">
              {formatUGX(listing.price, listing.isNegotiable)}
            </span>
          </div>

          {/* Listing Title */}
          <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 text-[#222222] group-hover:text-[#00B53F] transition-colors">
            {listing.title}
          </h3>

          {/* Subcategory & Brand/Type */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 truncate">
            <span className="truncate">{listing.subcategory}</span>
            {(listing.brand || listing.type) && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-600 truncate">
                  {listing.brand || listing.type}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Location & Time Stamp */}
        <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 truncate max-w-[130px] sm:max-w-[150px]">
              <MapPin className="w-3 h-3 text-[#00B53F] shrink-0" />
              <span className="truncate">{listing.district}</span>
            </span>
            <span className="flex items-center gap-0.5 shrink-0 text-[10px] text-slate-400">
              <Clock className="w-2.5 h-2.5" />
              <span>{formatTimeAgo(listing.createdAt)}</span>
            </span>
          </div>

          {/* Verified Badge & Quick Chat */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#00B53F]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00B53F] shrink-0" />
              <span>Verified</span>
            </div>

            <button
              onClick={(e) => onOpenChat(listing, e)}
              className="px-2 py-0.5 rounded-md bg-[#00B53F]/10 hover:bg-[#00B53F] text-[#00B53F] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              title="Chat with seller"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
