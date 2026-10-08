import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  Crown, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  ShoppingBag,
  Sparkles, 
  Camera, 
  Upload, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Bell,
  Check,
  Quote
} from 'lucide-react';
import { User, Review, Listing, CompletedSale, Testimonial } from '../types';
import { formatUGX } from '../utils/helpers';
import { isOwnerUser } from '../config/paymentConfig';
import { INITIAL_TESTIMONIALS } from '../data/mockData';

interface UserProfileModalProps {
  user: User;
  reviews: Review[];
  listings: Listing[];
  onClose: () => void;
  onOpenListing: (listing: Listing) => void;
  onAddReview: (sellerId: string, rating: number, comment: string) => void;
  currentUser: User;
  onOpenReport?: (user: User) => void;
  onOpenChatWithUser?: (seller: User) => void;
  onUpdateAvatar?: (newAvatar: string) => void;
  onSignOut?: () => void;
  onToggleDarkMode?: () => void;
  onOpenNotifications?: () => void;
  onOpenMessages?: () => void;
  darkMode?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  reviews,
  listings,
  onClose,
  onOpenListing,
  onAddReview,
  currentUser,
  onOpenReport,
  onOpenChatWithUser,
  onUpdateAvatar,
  onSignOut,
  onToggleDarkMode,
  onOpenNotifications,
  onOpenMessages,
  darkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'sales' | 'reviews' | 'testimonials' | 'settings'>('listings');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const newUrl = event.target.result;
        setCurrentAvatar(newUrl);
        if (onUpdateAvatar) {
          onUpdateAvatar(newUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const sellerReviews = reviews.filter(r => r.sellerId === user.id);
  const sellerListings = listings.filter(l => l.sellerId === user.id && !l.isSold);
  const completedSales: CompletedSale[] = user.completedSales || [];
  const testimonials: Testimonial[] = INITIAL_TESTIMONIALS[user.id] || [];

  const hasMinReviews = sellerReviews.length >= 10;
  const averageRating = sellerReviews.length > 0 
    ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length 
    : user.rating;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    setTimeout(() => {
      onAddReview(user.id, newRating, newComment.trim());
      setNewComment('');
      setIsSubmittingReview(false);
    }, 400);
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

  // Make Prime Sanitary Centre account invisible to other users unless the owner
  const isOwnerViewing = isOwnerUser(currentUser);
  const isPrimeCentreUser = isOwnerUser(user);
  const displayName = isPrimeCentreUser 
    ? (isOwnerViewing ? (user.businessName || "Prime Sanitary Centre") : user.name)
    : (user.businessName || user.name);

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F5F5] flex flex-col overflow-y-auto md:bg-slate-900/40 md:backdrop-blur-xs md:flex md:items-center md:justify-center md:p-3 sm:md:p-4">
      <div 
        className="w-full h-full flex flex-col bg-[#F5F5F5] overflow-hidden md:max-w-3xl md:h-[90vh] md:rounded-2xl md:shadow-2xl md:border md:border-[#EEEEEE] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: Pure White with Black Back Arrow */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 sm:py-3.5 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 -ml-1 text-[#222222] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-[#222222] stroke-[2.5]" />
            </button>
            <h2 className="font-display font-black text-base sm:text-lg text-[#222222]">
              User Profile
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-4">
          {/* User Profile Card: Centered 80px circle Avatar, verified badge, masked email */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#EEEEEE] flex flex-col items-center text-center">
            {/* Centered 80px circle Avatar with green border */}
            <div className="relative group mb-3">
              <img
                src={currentAvatar}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#00B53F] shadow-xs"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              {currentUser.id === user.id && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition-opacity cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Change</span>
                </button>
              )}
            </div>

            {/* Name + Verified yellow badge */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <h3 className="font-display font-bold text-[18px] text-[#222222]">
                {displayName}
              </h3>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 bg-[#FFB703] text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  <ShieldCheck className="w-3 h-3 fill-slate-950" /> Verified
                </span>
              )}
            </div>

            {/* Contact: phone + email in one line grey 12px, center */}
            <p className="text-[12px] text-[#757575] flex items-center justify-center gap-2 flex-wrap mt-1">
              <span>{user.phone}</span>
              <span>•</span>
              <span>{maskEmail(user.email)}</span>
            </p>

            {/* Location & membership */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00B53F]" />
                {user.district} {user.subCounty ? `(${user.subCounty})` : ''}
              </span>
              <span>•</span>
              <span>Member since {new Date(user.joinedDate).getFullYear()}</span>
            </div>

            {/* "Upload Photo" button white with green border */}
            {currentUser.id === user.id && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-1.5 rounded-xl bg-white border border-[#00B53F] text-[#00B53F] hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#00B53F]" />
                <span>Upload Photo</span>
              </button>
            )}

            {/* Account Credentials Card: label grey left, value black right bold */}
            <div className="w-full bg-[#F9F9F9] rounded-xl p-4 border border-[#EEEEEE] space-y-2.5 mt-5 text-left">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Account Credentials
              </h4>

              <div className="flex justify-between items-center py-1 border-b border-[#EEEEEE] text-xs">
                <span className="text-[#757575] font-medium">Business / Display Name</span>
                <span className="text-[#222222] font-bold">{displayName}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#EEEEEE] text-xs">
                <span className="text-[#757575] font-medium">Phone Number</span>
                <span className="text-[#222222] font-bold font-mono">{user.phone}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#EEEEEE] text-xs">
                <span className="text-[#757575] font-medium">Email Address</span>
                <span className="text-[#222222] font-bold">{maskEmail(user.email)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#EEEEEE] text-xs">
                <span className="text-[#757575] font-medium">Trading District</span>
                <span className="text-[#222222] font-bold">{user.district}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#EEEEEE] text-xs">
                <span className="text-[#757575] font-medium">National ID (NIN)</span>
                <span className="text-[#00B53F] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CM98024104K8LA (Verified)
                </span>
              </div>

              <div className="flex justify-between items-center py-1 text-xs">
                <span className="text-[#757575] font-medium">Account Status</span>
                <span className="text-[#00B53F] font-bold">Verified Business Merchant</span>
              </div>
            </div>
          </div>

          {/* Rating Summary Bar */}
          <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#EEEEEE] flex flex-wrap items-center justify-between gap-3 text-xs">
            {hasMinReviews ? (
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl text-amber-500">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-500">
                  ({sellerReviews.length} verified buyer reviews)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  New Merchant
                </span>
                <span className="text-slate-600">
                  <strong>{sellerReviews.length}</strong> / <strong>10 Reviews</strong> required for public score
                </span>
              </div>
            )}

            <span className="font-bold text-[#00B53F] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {completedSales.length} Completed Sales
            </span>
          </div>

          {/* Scrollable Navigation Pill Tabs */}
          <div className="bg-white rounded-xl p-2 border border-[#EEEEEE] flex gap-2 overflow-x-auto no-scrollbar shadow-xs">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'listings'
                  ? 'bg-[#00B53F] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Active Ads ({sellerListings.length})
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'sales'
                  ? 'bg-[#00B53F] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Sales History ({completedSales.length})
            </button>

            <button
              onClick={() => setActiveTab('testimonials')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'testimonials'
                  ? 'bg-[#00B53F] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Testimonials ({testimonials.length})
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'reviews'
                  ? 'bg-[#00B53F] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Customer Reviews ({sellerReviews.length})
            </button>

            {currentUser.id === user.id && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  activeTab === 'settings'
                    ? 'bg-[#00B53F] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            )}
          </div>

          {/* Tab 1: Active Listings */}
          {activeTab === 'listings' && (
            <div className="space-y-3">
              {sellerListings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-[#EEEEEE] text-slate-400 text-xs">
                  No active classifieds right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sellerListings.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { onClose(); onOpenListing(item); }}
                      className="p-3 rounded-xl border border-[#EEEEEE] bg-white hover:border-[#00B53F] shadow-xs transition-all flex items-center gap-3 cursor-pointer"
                    >
                      <img
                        src={item.images[0]}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs truncate text-[#222222]">{item.title}</h4>
                        <p className="font-extrabold text-xs text-[#00B53F] mt-0.5">
                          {formatUGX(item.price, item.isNegotiable)}
                        </p>
                        <span className="text-[10px] text-slate-400">{item.condition} • {item.district}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Sales History */}
          {activeTab === 'sales' && (
            <div className="space-y-2.5">
              {completedSales.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#EEEEEE] text-xs text-slate-400">
                  No completed sales logged yet.
                </div>
              ) : (
                completedSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3.5 rounded-xl border border-[#EEEEEE] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#00B53F]" />
                        <h4 className="font-bold text-xs text-[#222222]">{sale.title}</h4>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Buyer: <strong className="text-slate-700">{sale.buyerName}</strong> • {sale.location}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-xs text-[#00B53F] block">
                        {formatUGX(sale.price)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sale.referenceNumber}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Testimonials */}
          {activeTab === 'testimonials' && (
            <div className="space-y-3">
              {testimonials.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white border border-[#EEEEEE] text-xs text-slate-400">
                  No formal testimonials uploaded yet.
                </div>
              ) : (
                testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-[#EEEEEE] bg-white shadow-xs relative space-y-2.5"
                  >
                    <Quote className="w-6 h-6 text-[#00B53F]/15 absolute top-3 right-3" />
                    <p className="text-xs italic text-[#222222]">
                      "{t.content}"
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#EEEEEE]">
                      <div className="flex items-center gap-2">
                        <img
                          src={t.authorAvatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-xs block text-[#222222]">{t.authorName}</span>
                          <span className="text-[10px] text-slate-400">{t.authorTitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {sellerReviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6 bg-white rounded-xl border border-[#EEEEEE]">
                  No customer reviews yet.
                </p>
              ) : (
                sellerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-[#EEEEEE] bg-white shadow-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.reviewerAvatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-xs text-[#222222]">{rev.reviewerName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[9px] bg-emerald-50 text-[#00B53F] font-bold px-1.5 py-0.2 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#222222]">{rev.comment}</p>
                  </div>
                ))
              )}

              {/* Review Form for Other Sellers */}
              {currentUser.id !== user.id && (
                <form 
                  onSubmit={handleSubmitReview}
                  className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5 mt-3"
                >
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                    Rate & Review {displayName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span>Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe your purchase and trading experience..."
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs focus:outline-none resize-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="py-1.5 px-3 rounded-lg bg-[#00B53F] hover:bg-[#009e37] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Post Public Review'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 5: Settings */}
          {activeTab === 'settings' && currentUser.id === user.id && (
            <div className="space-y-3 max-w-xl mx-auto">
              {/* Theme Settings */}
              <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#EEEEEE] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0F2F5] text-amber-500 flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[14px] text-[#222222]">
                      Theme & Appearance
                    </h5>
                    <p className="text-[11px] text-[#757575]">
                      High-visibility light theme
                    </p>
                  </div>
                </div>

                {onToggleDarkMode && (
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-emerald-50 text-[#00B53F] border border-emerald-200 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-[#00B53F]" />
                    <span>Light Mode Active</span>
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#EEEEEE] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0F2F5] text-[#00B53F] flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-[#00B53F]" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[14px] text-[#222222]">
                      Notifications & Alerts
                    </h5>
                    <p className="text-[11px] text-[#757575]">
                      Push alerts and inquiry notifications
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Configure / Open
                </button>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#EEEEEE] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F0F2F5] text-blue-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[14px] text-[#222222]">
                      Messages & Negotiations
                    </h5>
                    <p className="text-[11px] text-[#757575]">
                      Direct chats with buyer inquiries
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenMessages}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Configure / Open
                </button>
              </div>

              {/* Sign Out */}
              {onSignOut && (
                <div className="bg-[#FFF0F0] rounded-xl p-3.5 border border-[#FFD6D6] flex items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-[14px] text-red-700">
                        Account Session
                      </h5>
                      <p className="text-[11px] text-red-500">
                        Sign out of ShopLocal Ug on this device
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
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
