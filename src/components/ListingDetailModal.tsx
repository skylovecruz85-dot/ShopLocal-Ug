import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft,
  MapPin, 
  ShieldCheck, 
  Crown, 
  MessageSquare, 
  Phone, 
  Share2, 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Flag
} from 'lucide-react';
import { Listing, User } from '../types';
import { formatUGX, formatTimeAgo } from '../utils/helpers';

interface ListingDetailModalProps {
  listing: Listing;
  onClose: () => void;
  onOpenChat: (listing: Listing) => void;
  onOpenMomoCheckout: (listing: Listing) => void;
  onOpenUserProfile: (user: User) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenSafetyTips?: () => void;
  onOpenReport?: (listing: Listing) => void;
  darkMode?: boolean;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onOpenChat,
  onOpenMomoCheckout,
  onOpenUserProfile,
  isFavorite,
  onToggleFavorite,
  onOpenSafetyTips,
  onOpenReport,
  darkMode,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden relative border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top sticky bar */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b sticky top-0 z-20 backdrop-blur-xs ${
          darkMode ? 'border-slate-800 bg-slate-900/95 text-slate-300' : 'border-slate-100 bg-white/95 text-slate-500'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">{listing.category.replace('-', ' ')}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <span className="truncate max-w-[200px]">{listing.subcategory}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium"
              title="Share ad"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={(e) => onToggleFavorite(listing.id, e)}
              className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Photos Gallery */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={listing.images[activeImageIndex] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {/* Transparent Watermark inside the photo */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-xs text-white/95 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/20 pointer-events-none select-none shadow-sm flex items-center gap-1.5 z-10">
                  <span className="text-white/80">posted on ShopLocal by</span>
                  <strong className="font-bold text-white">{listing.seller.name}</strong>
                </div>

                {listing.isBoosted && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md z-10">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Featured Item
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-1 rounded-md z-10">
                  Condition: <strong className="text-emerald-300">{listing.condition}</strong>
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-emerald-600 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Item Description */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-display font-bold text-base text-slate-900 mb-2">Description & Details</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {listing.description}
                </p>

                {/* Tags */}
                {listing.tags && listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {listing.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ugandan Buyer Safety tips */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>ShopLocal Ug Safety Tips</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                  <li>Meet in well-lit public places (e.g., Acacia Mall, Garden City, Posta Uganda).</li>
                  <li>Inspect and test items thoroughly before releasing funds.</li>
                  <li>Checkout in this demo is simulated. Inspect items and agree on safe payment terms independently.</li>
                  <li>Do not send advance transport fare to unknown callers.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Pricing & Seller Contact Card */}
            <div className="lg:col-span-5 space-y-4">
              {/* Seller / User Details (At the top of the right column when ad is tapped in) */}
              <div className={`p-4 rounded-2xl border space-y-3.5 ${
                darkMode ? 'bg-slate-800/90 border-slate-700 text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-900'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={listing.seller.avatar}
                        alt={listing.seller.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#3db83a]/30 shadow-xs"
                      />
                      {listing.seller.isVerified && (
                        <div 
                          className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 ring-2 ring-white dark:ring-slate-800 shadow-xs"
                          title="Sample badge from demo data"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {listing.seller.name}
                        </span>
                        {listing.seller.isProMember && (
                          <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" /> PRO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {listing.seller.district} {listing.seller.subCounty ? `• ${listing.seller.subCounty}` : ''} • Joined {new Date(listing.seller.joinedDate).getFullYear()}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center text-amber-500 text-xs font-bold">
                          ★ {listing.seller.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-xs">({listing.seller.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenUserProfile(listing.seller)}
                    className="px-3 py-1.5 rounded-lg bg-[#3db83a]/10 hover:bg-[#3db83a] text-[#3db83a] hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    View Profile
                  </button>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3db83a]" />
                    <span>{listing.seller.isVerified ? 'Sample badge' : 'Identity not checked in demo'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#3db83a]" />
                    <span>Replies in {listing.seller.responseTime}</span>
                  </div>
                </div>
              </div>

              {/* Header Price Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-200">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-800">
                    {formatUGX(listing.price)}
                  </span>
                  {listing.isNegotiable && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300">
                      Negotiable Price
                    </span>
                  )}
                </div>

                <h1 className="font-display font-bold text-lg text-slate-900 mt-2 leading-tight">
                  {listing.title}
                </h1>

                {(listing.brand || listing.type) && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {listing.brand && (
                      <span className="text-xs bg-white text-slate-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                        Brand: <span className="text-[#3db83a]">{listing.brand}</span>
                      </span>
                    )}
                    {listing.type && (
                      <span className="text-xs bg-white text-slate-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                        Type: <span className="text-[#3db83a]">{listing.type}</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 text-slate-600 text-xs mt-3">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{listing.district} • {listing.locationDetails}</span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-2 pt-2 border-t border-emerald-200/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Posted {formatTimeAgo(listing.createdAt)}
                  </span>
                  <span>•</span>
                  <span>{listing.views} views</span>
                  <span>•</span>
                  <span>{listing.inquiriesCount} inquiries</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Demo chat & negotiate */}
                <button
                  onClick={() => onOpenChat(listing)}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Try demo chat & offer</span>
                </button>

                <div className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  Seller phone and WhatsApp links are disabled in this preview. Use the in-app demo chat instead.
                </div>

                {/* Safety & Report row */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <button
                    onClick={onOpenSafetyTips}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>ShopLocal Ug Safety Rules</span>
                  </button>
                  <button
                    onClick={() => onOpenReport && onOpenReport(listing)}
                    className="text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report Ad</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM STICKY BAR FOR PREVIEW/AD VIEW:
            When viewing ad, bottom fixed bar white:
            Left: Price "UGX 85,000" green bold 18px + "Negotiable" grey 11px under it
            Right: 2 buttons: "Chat" green outline, "Call" green solid
        */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 sm:px-6 flex items-center justify-between shrink-0 sticky bottom-0 z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col">
            <span className="text-[18px] font-extrabold text-[#00B53F] leading-tight">
              {formatUGX(listing.price)}
            </span>
            {listing.isNegotiable && (
              <span className="text-[11px] text-[#757575] font-medium leading-none mt-0.5">
                Negotiable
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onOpenChat(listing)}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-[#00B53F] text-[#00B53F] hover:bg-emerald-50 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#00B53F]" />
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenUserProfile(listing.seller)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#00B53F] hover:bg-[#009e37] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>View profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
