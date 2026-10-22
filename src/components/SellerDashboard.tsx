import React, { useState, useRef } from 'react';
import { 
  X, 
  ArrowLeft,
  Package, 
  TrendingUp, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Crown, 
  Smartphone, 
  User as UserIcon, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  Camera, 
  Upload, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Check,
  MessageSquare,
  Phone,
  Heart,
  Share2,
  HelpCircle,
  Flame
} from 'lucide-react';
import { Listing, User, UserPurchase } from '../types';
import { formatUGX } from '../utils/helpers';
import { isOwnerUser } from '../config/paymentConfig';

interface SellerDashboardProps {
  currentUser: User;
  listings: Listing[];
  onClose: () => void;
  onOpenPostAd: () => void;
  onOpenProModal: () => void;
  onOpenMessages: () => void;
  onOpenNotifications?: () => void;
  onOpenPayoutSettings: () => void;
  onOpenAdminBoostOrders?: () => void;
  pendingBoostOrdersCount?: number;
  onToggleSold: (listingId: string) => void;
  onRenewListing: (listingId: string) => void;
  onBoostListing: (listingId: string) => void;
  onDeleteListing: (listingId: string) => void;
  onUpdateAvatar?: (newAvatar: string) => void;
  onSignOut?: () => void;
  onToggleDarkMode?: () => void;
  darkMode?: boolean;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  listings,
  onClose,
  onOpenPostAd,
  onOpenProModal,
  onOpenMessages,
  onOpenNotifications,
  onOpenPayoutSettings,
  onOpenAdminBoostOrders,
  pendingBoostOrdersCount = 0,
  onToggleSold,
  onRenewListing,
  onBoostListing,
  onDeleteListing,
  onUpdateAvatar,
  onSignOut,
  onToggleDarkMode,
  darkMode = false,
}) => {
  // Main 3 navigation tabs: Ads | Profile | Settings (Purchases moved to bottom of Profile like Jiji)
  const [mainTab, setMainTab] = useState<'ads' | 'profile' | 'settings'>('ads');
  const [inventorySubTab, setInventorySubTab] = useState<'active' | 'sold'>('active');
  const [purchases] = useState<UserPurchase[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const myListings = listings.filter(l => l.sellerId === currentUser.id);
  const activeItems = myListings.filter(l => !l.isSold);
  const soldItems = myListings.filter(l => l.isSold);

  const totalViews = myListings.reduce((acc, curr) => acc + curr.views, 0);
  const totalInquiries = myListings.reduce((acc, curr) => acc + curr.inquiriesCount, 0);
  const totalInventoryValue = activeItems.reduce((acc, curr) => acc + curr.price, 0);
  const totalGrossSold = soldItems.reduce((acc, curr) => acc + curr.price, 0);

  const freeListingsTotal = currentUser.freeListingsTotal || 18;
  const freePercent = Math.min(100, (currentUser.freeListingsUsed / freeListingsTotal) * 100);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const newUrl = event.target.result;
        if (onUpdateAvatar) {
          onUpdateAvatar(newUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Mask email: skylov***@gmail.com for privacy
  const maskEmail = (email: string) => {
    if (!email) return 'skylov***@gmail.com';
    const parts = email.split('@');
    if (parts.length === 2) {
      const prefix = parts[0].slice(0, 6);
      return `${prefix}***@${parts[1]}`;
    }
    return 'skylov***@gmail.com';
  };

  // Business profile name - only visible to the owner
  const isOwner = isOwnerUser(currentUser);
  const profileName = isOwner 
    ? (currentUser.businessName || "Account Local Shop")
    : (currentUser.businessName || currentUser.name);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col overflow-y-auto md:backdrop-blur-xs md:flex md:items-center md:justify-center md:p-3 sm:md:p-4 transition-colors ${
        darkMode ? 'bg-slate-950/80 text-white' : 'bg-[#F5F5F5] md:bg-slate-900/40 text-[#222222]'
      }`}
      onClick={() => {
        // Backdrop click on desktop closes modal
      }}
    >
      <div 
        className={`w-full h-full flex flex-col overflow-hidden md:max-w-4xl md:h-[90vh] md:rounded-2xl md:shadow-2xl md:border relative transition-colors ${
          darkMode ? 'bg-slate-900 md:border-slate-800 text-white' : 'bg-[#F5F5F5] md:bg-white md:border-[#EEEEEE] text-[#222222]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className={`border-b px-4 py-3 sm:py-3.5 flex items-center justify-between shrink-0 shadow-2xs transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-1 -ml-1 rounded-lg transition-colors cursor-pointer ${
                darkMode ? 'text-white hover:bg-slate-800' : 'text-[#222222] hover:bg-slate-100'
              }`}
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className={`w-5 h-5 stroke-[2.5] ${darkMode ? 'text-white' : 'text-[#222222]'}`} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-display font-black text-base sm:text-lg leading-tight ${
                  darkMode ? 'text-white' : 'text-[#222222]'
                }`}>
                  Seller Studio &amp; Inventory
                </h2>
                {currentUser.isProMember && (
                  <span className="bg-[#FFB703] text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-slate-950" /> PRO
                  </span>
                )}
              </div>
              <p className={`text-[11px] hidden sm:block ${
                darkMode ? 'text-slate-300' : 'text-slate-500'
              }`}>
                Manage your ads, merchant profile, purchases, and settings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Main 3 Navigation Tabs: Ads | Profile | Settings */}
        <div className={`border-b px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar shrink-0 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          {/* Tab 1: Ads */}
          <button
            onClick={() => setMainTab('ads')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              mainTab === 'ads'
                ? 'bg-[#00B53F] text-white shadow-xs'
                : darkMode
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Ads ({myListings.length})</span>
          </button>

          {/* Tab 2: Profile */}
          <button
            onClick={() => setMainTab('profile')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              mainTab === 'profile'
                ? 'bg-[#00B53F] text-white shadow-xs'
                : darkMode
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          {/* Tab 3: Settings */}
          <button
            onClick={() => setMainTab('settings')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              mainTab === 'settings'
                ? 'bg-[#00B53F] text-white shadow-xs'
                : darkMode
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Scrollable Body (Light Mode: #F5F5F5 background, white cards) */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-4">

          {/* ================= SECTION 1: INVENTORY & ADS ================= */}
          {mainTab === 'ads' && (
            <div className="space-y-4">
              {/* 3. FIX FREE LISTINGS CARD:
                  - Card white, left green border 4px
                  - Title "SHOPLOCAL UG FREE LISTINGS" black small
                  - "0 / 18 Used" green bold right
                  - Progress bar: grey track, green fill
                  - Buttons stacked vertically on mobile: Post New Ad (green top), Get Lifetime PRO (gold outline)
              */}
              <div className="bg-white rounded-xl shadow-xs border border-y-[#EEEEEE] border-r-[#EEEEEE] border-l-4 border-l-[#00B53F] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#222222]">
                    SHOPLOCAL UG FREE LISTINGS
                  </span>
                  <span className="text-xs font-bold text-[#00B53F]">
                    {currentUser.isProMember ? 'Unlimited' : `${currentUser.freeListingsUsed} / ${freeListingsTotal} Used`}
                  </span>
                </div>

                {!currentUser.isProMember && (
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                    <div 
                      className="bg-[#00B53F] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${freePercent}%` }}
                    ></div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  {currentUser.isProMember 
                    ? 'Account PRO is enabled in this browser; no payment was processed.'
                    : `You have ${Math.max(0, freeListingsTotal - currentUser.freeListingsUsed)} free listings remaining in your seller allowance.`}
                </p>

                {/* Buttons stacked vertically on mobile, full width */}
                <div className="flex flex-col gap-2 mt-3.5 w-full">
                  <button
                    onClick={onOpenPostAd}
                    className="w-full py-2.5 rounded-xl bg-[#00B53F] hover:bg-[#009e37] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>Post New Ad</span>
                  </button>

                  {!currentUser.isProMember && (
                    <button
                      onClick={onOpenProModal}
                      className="w-full py-2 rounded-xl border border-amber-500 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Get Lifetime PRO</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 4. FIX STATS GRID:
                  - 2 columns, gap 12px
                  - Each card white, round 12px
                  - Title grey 11px, number black 20px bold, +18% green 10px
                  - Remove dark backgrounds
              */}
              <div className="grid grid-cols-2 gap-3">
                {/* Stat 1 */}
                <div className="bg-white rounded-[12px] p-3.5 shadow-xs border border-[#EEEEEE]">
                  <span className="text-[11px] text-[#757575] font-medium block">
                    Total Ad Views
                  </span>
                  <p className="text-[20px] font-extrabold text-[#222222] mt-0.5">
                    {totalViews}
                  </p>
                  <span className="text-[10px] text-[#00B53F] font-bold mt-0.5 inline-block">
                    +18% this week
                  </span>
                </div>

                {/* Stat 2 */}
                <div className="bg-white rounded-[12px] p-3.5 shadow-xs border border-[#EEEEEE]">
                  <span className="text-[11px] text-[#757575] font-medium block">
                    Buyer Inquiries
                  </span>
                  <p className="text-[20px] font-extrabold text-[#00B53F] mt-0.5">
                    {totalInquiries}
                  </p>
                  <button 
                    onClick={onOpenMessages} 
                    className="text-[10px] text-[#00B53F] hover:underline font-bold mt-0.5 inline-block cursor-pointer"
                  >
                    Open Chats →
                  </button>
                </div>

                {/* Stat 3 */}
                <div className="bg-white rounded-[12px] p-3.5 shadow-xs border border-[#EEEEEE]">
                  <span className="text-[11px] text-[#757575] font-medium block">
                    Active Stock Value
                  </span>
                  <p className="text-[15px] sm:text-[18px] font-extrabold text-[#222222] mt-0.5 truncate">
                    {formatUGX(totalInventoryValue)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 inline-block">
                    {activeItems.length} active ads
                  </span>
                </div>

                {/* Stat 4 */}
                <div className="bg-white rounded-[12px] p-3.5 shadow-xs border border-[#EEEEEE]">
                  <span className="text-[11px] text-[#757575] font-medium block">
                    Sold Revenue
                  </span>
                  <p className="text-[15px] sm:text-[18px] font-extrabold text-[#00B53F] mt-0.5 truncate">
                    {formatUGX(totalGrossSold)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 inline-block">
                    {soldItems.length} items sold
                  </span>
                </div>
              </div>

              {/* Inventory Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInventorySubTab('active')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        inventorySubTab === 'active'
                          ? 'bg-[#00B53F] text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Active ({activeItems.length})
                    </button>
                    <button
                      onClick={() => setInventorySubTab('sold')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        inventorySubTab === 'sold'
                          ? 'bg-[#00B53F] text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Sold ({soldItems.length})
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Latest updates
                  </span>
                </div>

                {/* Listings List */}
                <div className="space-y-2.5">
                  {(inventorySubTab === 'active' ? activeItems : soldItems).length === 0 ? (
                    <div className={`p-8 text-center text-xs rounded-xl border ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-[#EEEEEE] text-slate-500'
                    }`}>
                      No {inventorySubTab} ads found. Tap "Post New Ad" to list an item for free!
                    </div>
                  ) : (
                    (inventorySubTab === 'active' ? activeItems : soldItems).map((listing) => {
                      const listedAt = Date.parse(listing.renewedAt || listing.createdAt || listing.updatedAt);
                      const renewalDueAt = listedAt + 30 * 24 * 60 * 60 * 1000;
                      const renewalDue = Number.isFinite(listedAt) && Date.now() >= renewalDueAt;
                      const daysUntilRenewal = Number.isFinite(listedAt)
                        ? Math.max(0, Math.ceil((renewalDueAt - Date.now()) / (24 * 60 * 60 * 1000)))
                        : null;
                      return (
                      <div
                        key={listing.id}
                        className={`p-3 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#EEEEEE]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <h4 className={`font-bold text-[13px] truncate leading-tight ${
                              darkMode ? 'text-white' : 'text-[#222222]'
                            }`}>
                              {listing.title}
                            </h4>
                            <p className="text-xs font-extrabold text-[#00B53F] mt-0.5">
                              {formatUGX(listing.price, listing.isNegotiable)}
                            </p>
                            {!listing.isSold && (
                              <p className={`mt-1 text-[10px] font-semibold ${renewalDue ? 'text-amber-400' : (darkMode ? 'text-slate-300' : 'text-slate-400')}`}>
                                {renewalDue
                                  ? 'Renewal due'
                                  : daysUntilRenewal === null
                                    ? 'Renewal date unavailable'
                                    : `Renews in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}`}
                              </p>
                            )}
                            <div className={`flex items-center gap-2 mt-0.5 text-[10px] flex-wrap ${
                              darkMode ? 'text-slate-300' : 'text-slate-400'
                            }`}>
                              <span>{listing.district}</span>
                              <span>•</span>
                              <span>{listing.views} views</span>
                              <span>•</span>
                              <span>{listing.inquiriesCount} inquiries</span>
                            </div>
                          </div>
                        </div>

                        <div className={`flex items-center gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 ${
                          darkMode ? 'border-slate-800' : 'border-slate-100'
                        }`}>
                          <button
                            onClick={() => onToggleSold(listing.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              darkMode ? 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {listing.isSold ? 'Relist' : 'Mark Sold'}
                          </button>

                          {renewalDue && !listing.isSold && (
                            <button
                              type="button"
                              onClick={() => onRenewListing(listing.id)}
                              aria-label={`Renew ${listing.title}`}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                darkMode ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                              }`}
                            >
                              Renew
                            </button>
                          )}

                          {!listing.isSold && (
                            <button
                              onClick={() => onBoostListing(listing.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#ff7e00] hover:bg-[#e67200] text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Boost</span>
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteListing(listing.id)}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                              darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-950/40' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                            title="Delete ad"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 2: USER'S PROFILE ================= */}
          {mainTab === 'profile' && (
            <div className="space-y-4">
              {/* 5. FIX USER PROFILE CARD:
                  - Header: White
                  - Logo centered 80px circle with green border
                  - Account Local Shop profile title and sample badge
                  - Contact: phone + email in one line grey 12px, center
                  - "Upload Photo" button white with green border, not grey
                  - Account Credentials: label grey left, value black right bold
                  - Mask email: skylov***@gmail.com for privacy
              */}
              <div className={`rounded-2xl p-6 shadow-xs border flex flex-col items-center text-center transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#EEEEEE] text-slate-900'
              }`}>
                {/* Centered 80px circle Avatar with green border */}
                <div className="relative group mb-3">
                  <img
                    src={currentUser.avatar}
                    alt={profileName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#00B53F] shadow-xs"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition-opacity cursor-pointer"
                    title="Change photo"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Account Local Shop profile title and sample badge */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h3 className={`font-display font-bold text-[18px] ${
                    darkMode ? 'text-white' : 'text-[#222222]'
                  }`}>
                    {profileName}
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#FFB703] text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    <ShieldCheck className="w-3 h-3 fill-slate-950" /> Verified
                  </span>
                </div>

                {/* Contact: phone + email in one line, pure white in dark mode */}
                <p className={`text-[12px] flex items-center justify-center gap-2 flex-wrap mt-1 ${
                  darkMode ? 'text-white font-medium' : 'text-[#757575]'
                }`}>
                  <span>{currentUser.phone}</span>
                  <span>•</span>
                  <span>{maskEmail(currentUser.email)}</span>
                </p>

                {/* Location & membership */}
                <div className={`flex items-center justify-center gap-2 text-[11px] mt-1 ${
                  darkMode ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#00B53F]" />
                    <span className={darkMode ? 'text-white font-medium' : ''}>{currentUser.district}</span>
                  </span>
                  <span>•</span>
                  <span>Member since {new Date(currentUser.joinedDate).getFullYear()}</span>
                </div>

                {/* "Upload Photo" button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-3 px-4 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    darkMode
                      ? 'bg-slate-800 border-[#00B53F] text-white hover:bg-slate-700'
                      : 'bg-white border-[#00B53F] text-[#00B53F] hover:bg-emerald-50'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#00B53F]" />
                  <span>Upload Photo</span>
                </button>

                {/* Account Credentials Card: Pure white words in dark mode */}
                <div 
                  data-credentials="true" 
                  className={`w-full rounded-xl p-4 border space-y-2.5 mt-5 text-left transition-colors credentials-card ${
                    darkMode ? 'bg-slate-800/95 border-slate-700 text-white' : 'bg-[#F9F9F9] border-[#EEEEEE]'
                  }`}
                >
                  <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    darkMode ? 'text-white' : 'text-slate-400'
                  }`}>
                    Account Credentials
                  </h4>

                  <div className={`flex justify-between items-center py-1.5 border-b text-xs ${
                    darkMode ? 'border-slate-700' : 'border-[#EEEEEE]'
                  }`}>
                    <span className={darkMode ? 'text-white font-medium' : 'text-[#757575] font-medium'}>Business / Display Name</span>
                    <span className={darkMode ? 'text-white font-bold' : 'text-[#222222] font-bold'}>{profileName}</span>
                  </div>

                  <div className={`flex justify-between items-center py-1.5 border-b text-xs ${
                    darkMode ? 'border-slate-700' : 'border-[#EEEEEE]'
                  }`}>
                    <span className={darkMode ? 'text-white font-medium' : 'text-[#757575] font-medium'}>Phone Number</span>
                    <span className={`font-mono font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>{currentUser.phone}</span>
                  </div>

                  <div className={`flex justify-between items-center py-1.5 border-b text-xs ${
                    darkMode ? 'border-slate-700' : 'border-[#EEEEEE]'
                  }`}>
                    <span className={darkMode ? 'text-white font-medium' : 'text-[#757575] font-medium'}>Email Address</span>
                    <span className={darkMode ? 'text-white font-bold' : 'text-[#222222] font-bold'}>{maskEmail(currentUser.email)}</span>
                  </div>

                  <div className={`flex justify-between items-center py-1.5 border-b text-xs ${
                    darkMode ? 'border-slate-700' : 'border-[#EEEEEE]'
                  }`}>
                    <span className={darkMode ? 'text-white font-medium' : 'text-[#757575] font-medium'}>Trading District</span>
                    <span className={darkMode ? 'text-white font-bold' : 'text-[#222222] font-bold'}>{currentUser.district}</span>
                  </div>

                  <div className={`flex justify-between items-center py-1.5 border-b text-xs ${
                    darkMode ? 'border-slate-700' : 'border-[#EEEEEE]'
                  }`}>
                    <span className={darkMode ? 'text-white font-medium' : 'text-[#757575] font-medium'}>Identity checks</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-500'}`}>Verified Member</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 text-xs">
                    <span className={darkMode ? 'text-white font-medium' : 'text-[#757575] font-medium'}>Account Status</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-500'}`}>Active profile</span>
                  </div>
                </div>

                {/* Jiji 12-Card Quick Service Grid */}
                <div className="w-full mt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${
                      darkMode ? 'text-white' : 'text-slate-500'
                    }`}>
                      Merchant Services & Tools
                    </h4>
                    <span className={`text-[10px] font-semibold ${
                      darkMode ? 'text-slate-300' : 'text-slate-400'
                    }`}>{onOpenAdminBoostOrders ? '12 Services' : '11 Services'}</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 text-center">
                    {/* 1. My Ads */}
                    <button
                      type="button"
                      onClick={() => setMainTab('ads')}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-[#00B53F]' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-[#00B53F]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00B53F] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Package className="w-4 h-4 text-[#00B53F]" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>My Ads</span>
                      <span className={`text-[9px] ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>{myListings.length} listed</span>
                    </button>

                    {/* 2. Performance */}
                    <button
                      type="button"
                      onClick={() => setMainTab('ads')}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-[#00B53F]' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-[#00B53F]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00B53F] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <TrendingUp className="w-4 h-4 text-[#00B53F]" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Analytics</span>
                      <span className="text-[9px] text-[#00B53F] font-bold">+{totalViews} views</span>
                    </button>

                    {/* 3. Messages */}
                    <button
                      type="button"
                      onClick={onOpenMessages}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-[#00B53F]' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-[#00B53F]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Messages</span>
                      <span className={`text-[9px] ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>{totalInquiries} chats</span>
                    </button>

                    {/* 4. Notifications */}
                    <button
                      type="button"
                      onClick={onOpenNotifications}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-[#00B53F]' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-[#00B53F]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Bell className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Alerts</span>
                      <span className="text-[9px] text-amber-600 font-bold">Active</span>
                    </button>

                    {/* 5. Verified ID */}
                    <div className={`rounded-[12px] p-2.5 sm:p-3 border flex flex-col items-center justify-center gap-1 select-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#EEEEEE] shadow-2xs'
                    }`}>
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00B53F] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-[#00B53F]" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Identity check</span>
                      <span className={`text-[9px] font-bold ${darkMode ? 'text-emerald-400' : 'text-slate-500'}`}>Account only</span>
                    </div>

                    {/* 6. PRO Badge */}
                    <button
                      type="button"
                      onClick={onOpenProModal}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-amber-400' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-amber-400'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>PRO Status</span>
                      <span className="text-[9px] text-amber-500 font-bold">
                        {currentUser.isProMember ? 'Lifetime' : 'Upgrade'}
                      </span>
                    </button>

                    {/* 7. MoMo Direct Payouts */}
                    <button
                      type="button"
                      onClick={onOpenPayoutSettings}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-[#00B53F]' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-[#00B53F]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Payouts</span>
                      <span className={`text-[9px] ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>MoMo / Airtel</span>
                    </button>

                    {/* 8. Saved Items */}
                    <div className={`rounded-[12px] p-2.5 sm:p-3 border flex flex-col items-center justify-center gap-1 select-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#EEEEEE] shadow-2xs'
                    }`}>
                      <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Saved</span>
                      <span className={`text-[9px] ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>Favorites</span>
                    </div>

                    {/* 9. Free Listings */}
                    <button
                      type="button"
                      onClick={onOpenPostAd}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-[#00B53F]' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-[#00B53F]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00B53F] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <PlusCircle className="w-4 h-4 text-[#00B53F]" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Post Ad</span>
                      <span className="text-[9px] text-[#00B53F] font-bold">18 Free</span>
                    </button>

                    {/* 10. Safety Center */}
                    <div className={`rounded-[12px] p-2.5 sm:p-3 border flex flex-col items-center justify-center gap-1 select-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#EEEEEE] shadow-2xs'
                    }`}>
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-slate-700" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Safety</span>
                      <span className={`text-[9px] ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>Uganda Rules</span>
                    </div>

                    {onOpenAdminBoostOrders && (
                      <button
                        type="button"
                        onClick={onOpenAdminBoostOrders}
                        className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group relative ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-[#00E676]' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-[#00E676]'
                        }`}
                      >
                        {pendingBoostOrdersCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00E676] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Flame className="w-4 h-4 text-[#00B53F]" />
                        </div>
                        <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Admin Center</span>
                        <span className="text-[9px] text-[#00B53F] font-bold">
                          {pendingBoostOrdersCount > 0 ? `${pendingBoostOrdersCount} Pending` : 'Payment reviews'}
                        </span>
                      </button>
                    )}

                    {/* 12. Settings */}
                    <button
                      type="button"
                      onClick={() => setMainTab('settings')}
                      className={`rounded-[12px] p-2.5 sm:p-3 border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-slate-500' : 'bg-white border-[#EEEEEE] shadow-2xs hover:border-slate-400'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Settings className="w-4 h-4 text-slate-700" />
                      </div>
                      <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-[#222222]'}`}>Settings</span>
                      <span className={`text-[9px] ${darkMode ? 'text-slate-300' : 'text-slate-400'}`}>Configure</span>
                    </button>
                  </div>
                </div>

                {/* 3. AT BOTTOM OF PROFILE SCREEN: My Purchases (3) */}
                <div className={`w-full mt-6 pt-5 border-t text-left ${
                  darkMode ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-2">
                    <h3 className={`font-display font-bold text-[16px] ${
                      darkMode ? 'text-white' : 'text-[#222222]'
                    }`}>
                      My Purchases ({purchases.length})
                    </h3>
                    <span className="text-xs font-bold text-[#00B53F] hover:underline cursor-pointer flex items-center gap-0.5">
                      See All &gt;
                    </span>
                  </div>

                  {/* List your 3 purchase cards vertically */}
                  <div className="space-y-3">
                    {purchases.map((pur) => (
                      <div
                        key={pur.id}
                        className={`rounded-[12px] p-3 sm:p-3.5 shadow-xs border flex gap-3 sm:gap-4 transition-all ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#EEEEEE]'
                        }`}
                      >
                        {/* Left: product image 70px */}
                        <img
                          src={pur.image}
                          alt={pur.title}
                          className="w-[70px] h-[70px] rounded-lg object-cover shrink-0 border border-slate-200"
                        />

                        {/* Right */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          {/* Top: Title */}
                          <h4 className={`font-bold text-[13px] truncate leading-tight ${
                            darkMode ? 'text-white' : 'text-[#222222]'
                          }`}>
                            {pur.title}
                          </h4>

                          {/* Middle: Ref */}
                          <p className={`text-[10px] font-mono mt-0.5 ${
                            darkMode ? 'text-slate-300' : 'text-[#757575]'
                          }`}>
                            Ref: {pur.referenceNumber}
                          </p>

                          {/* Bottom: Price and status badge */}
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-[14px] font-extrabold text-[#00B53F] leading-tight">
                              {formatUGX(pur.price)}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] border border-emerald-500/30 shrink-0 uppercase">
                              {pur.status}
                            </span>
                          </div>

                          {/* Very bottom: Seller name + "Call seller" */}
                          <div className={`flex items-center justify-between pt-1.5 mt-1 border-t text-[11px] ${
                            darkMode ? 'border-slate-700 text-slate-300' : 'border-[#EEEEEE] text-[#757575]'
                          }`}>
                            <span className="truncate">
                              Seller: <strong className={darkMode ? 'text-white font-semibold' : 'text-slate-800 font-semibold'}>{pur.sellerName}</strong>
                            </span>
                            <a
                              href={`tel:${pur.sellerPhone.replace(/\s+/g, '')}`}
                              className="flex items-center gap-1 text-[#00B53F] hover:text-[#009e37] font-bold shrink-0 cursor-pointer text-[11px]"
                              title="Call seller"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#00B53F]" />
                              <span>Call seller</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION 4: SETTINGS ================= */}
          {mainTab === 'settings' && (
            <div className="space-y-3 max-w-xl mx-auto">
              <div className="text-center pb-1">
                <h3 className={`font-display font-black text-base ${
                  darkMode ? 'text-white' : 'text-[#222222]'
                }`}>
                  Account & Studio Settings
                </h3>
                <p className={`text-[11px] ${
                  darkMode ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  Manage app appearance, alerts, payout lines, and session
                </p>
              </div>

              {/* 1. Theme Setting */}
              <div className={`rounded-xl p-3.5 shadow-xs border flex items-center justify-between gap-3 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#EEEEEE]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-slate-800 text-amber-400' : 'bg-[#F0F2F5] text-amber-500'
                  }`}>
                    <Sun className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h5 className={`font-bold text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#222222]'
                    }`}>
                      Theme & Appearance
                    </h5>
                    <p className={`text-[11px] ${
                      darkMode ? 'text-slate-300' : 'text-[#757575]'
                    }`}>
                      {darkMode ? 'High-contrast dark theme active' : 'High-visibility light theme active'}
                    </p>
                  </div>
                </div>

                {onToggleDarkMode && (
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    aria-pressed={darkMode}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      darkMode
                        ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-750'
                        : 'bg-emerald-50 text-[#00B53F] border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                        <span>Switch to light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                        <span>Switch to dark</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 2. Notifications Setting */}
              <div className={`rounded-xl p-3.5 shadow-xs border flex items-center justify-between gap-3 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#EEEEEE]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-slate-800 text-[#00E676]' : 'bg-[#F0F2F5] text-[#00B53F]'
                  }`}>
                    <Bell className="w-5 h-5 text-[#00B53F]" />
                  </div>
                  <div>
                    <h5 className={`font-bold text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#222222]'
                    }`}>
                      Notifications & Alerts
                    </h5>
                    <p className={`text-[11px] ${
                      darkMode ? 'text-slate-300' : 'text-[#757575]'
                    }`}>
                      Push alerts and inquiry notifications
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-750'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Configure / Open
                </button>
              </div>

              {/* 3. Messages & Chats Setting */}
              <div className={`rounded-xl p-3.5 shadow-xs border flex items-center justify-between gap-3 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#EEEEEE]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-slate-800 text-blue-400' : 'bg-[#F0F2F5] text-blue-500'
                  }`}>
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h5 className={`font-bold text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#222222]'
                    }`}>
                      Messages & Negotiations
                    </h5>
                    <p className={`text-[11px] ${
                      darkMode ? 'text-slate-300' : 'text-[#757575]'
                    }`}>
                      Direct chats with buyer inquiries
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenMessages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-750'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Configure / Open
                </button>
              </div>

              {/* 4. MTN & Airtel Payout Lines */}
              <div className={`rounded-xl p-3.5 shadow-xs border flex items-center justify-between gap-3 transition-colors ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#EEEEEE]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-slate-800 text-amber-500' : 'bg-[#F0F2F5] text-amber-600'
                  }`}>
                    <Smartphone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h5 className={`font-bold text-[14px] ${
                      darkMode ? 'text-white' : 'text-[#222222]'
                    }`}>
                      MTN & Airtel Payout Lines
                    </h5>
                    <p className={`text-[11px] ${
                      darkMode ? 'text-slate-300' : 'text-[#757575]'
                    }`}>
                      Instant mobile money receiving numbers
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenPayoutSettings}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-750'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Configure / Open
                </button>
              </div>

              {/* 5. Admin Boost Orders (Verification) */}
              {onOpenAdminBoostOrders && (
                <div className={`rounded-xl p-3.5 shadow-xs border flex items-center justify-between gap-3 transition-colors ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#EEEEEE]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      darkMode ? 'bg-slate-800 text-[#00E676]' : 'bg-emerald-50 text-[#00E676]'
                    }`}>
                      <Flame className="w-5 h-5 text-[#00B53F]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className={`font-bold text-[14px] ${
                          darkMode ? 'text-white' : 'text-[#222222]'
                        }`}>
                          Private Admin Center
                        </h5>
                        {pendingBoostOrdersCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            {pendingBoostOrdersCount} Pending
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${
                        darkMode ? 'text-slate-300' : 'text-[#757575]'
                      }`}>
                        Review payment submissions and private SMS proofs
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenAdminBoostOrders}
                    className="px-3 py-1.5 rounded-lg bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Open Orders
                  </button>
                </div>
              )}

              {/* 6. Sign Out Card */}
              {onSignOut && (
                <div className={`rounded-xl p-3.5 border flex items-center justify-between gap-3 mt-4 transition-colors ${
                  darkMode ? 'bg-red-950/40 border-red-900/60 text-white' : 'bg-[#FFF0F0] border-[#FFD6D6]'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h5 className={`font-bold text-[14px] ${
                        darkMode ? 'text-red-300' : 'text-red-700'
                      }`}>
                        Account Session
                      </h5>
                      <p className={`text-[11px] ${
                        darkMode ? 'text-red-200/80' : 'text-red-500'
                      }`}>
                        Sign out of ShopLocal Ug on this device
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
