import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  MapPin, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  ArrowUpDown, 
  Check, 
  Smartphone, 
  Lock, 
  TrendingUp, 
  ShoppingBag,
  ChevronDown,
  Flame,
  Zap,
  Gift,
  PlusCircle,
  Bell,
  Star,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { 
  Listing, 
  CategoryId, 
  UgandaDistrict, 
  ItemCondition, 
  User, 
  Review, 
  Conversation, 
  PaymentTransaction, 
  PaymentPurpose,
  AppNotification,
  BoostOrder
} from './types';

import { 
  INITIAL_LISTINGS, 
  INITIAL_SELLERS, 
  INITIAL_CURRENT_USER, 
  INITIAL_REVIEWS, 
  INITIAL_CONVERSATIONS, 
  UGANDA_DISTRICTS,
  CATEGORIES,
  MARKETPLACE_PRICING_PLANS,
  PricingPlan
} from './data/mockData';

import { playNotificationSound } from './utils/audio';

import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { CategoryBar } from './components/CategoryBar';
import { CategorySidebar } from './components/CategorySidebar';
import { CategoryCircleGrid } from './components/CategoryCircleGrid';
import { JijiSafetyBanner } from './components/JijiSafetyBanner';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { PromoSelection } from './components/PostAdPromoModal';
import { ChatModal } from './components/ChatModal';
import { MomoPaymentModal } from './components/MomoPaymentModal';
import { PricingPlansModal } from './components/PricingPlansModal';
import { AdminBoostOrdersModal } from './components/AdminBoostOrdersModal';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { SellerDashboard } from './components/SellerDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { SignUpModal } from './components/SignUpModal';
import { SafetyTipsModal } from './components/SafetyTipsModal';
import { ReportModal } from './components/ReportModal';
import { PayoutSettingsModal } from './components/PayoutSettingsModal';
import { NotificationToast } from './components/NotificationToast';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { RecentlyViewed } from './components/RecentlyViewed';

export default function App() {
  // Dark mode state - explicitly force light mode default on load
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('shoplocal_theme');
    if (saved === 'dark') {
      localStorage.setItem('shoplocal_theme', 'light');
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shoplocal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shoplocal_theme', 'light');
    }
  }, [darkMode]);

  // Persistence states with safe fallback to initial mock data if empty
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('shoplocal_listings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback to initial
      }
    }
    return INITIAL_LISTINGS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('shoplocal_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User;
        const hasLegacySeedDetails =
          parsed.id === INITIAL_CURRENT_USER.id &&
          (parsed.isVerified ||
            Boolean(parsed.ninNumber) ||
            Boolean(parsed.mtnMomoNumber) ||
            Boolean(parsed.airtelMoneyNumber));
        const merged = hasLegacySeedDetails
          ? { ...INITIAL_CURRENT_USER, freeListingsUsed: parsed.freeListingsUsed ?? INITIAL_CURRENT_USER.freeListingsUsed }
          : { ...INITIAL_CURRENT_USER, ...parsed };

        return {
          ...merged,
          isVerified: false,
          verificationStatus: 'UNVERIFIED',
          ninNumber: undefined,
          isPhoneVerified: false,
          mtnMomoNumber: '',
          mtnMomoName: '',
          airtelMoneyNumber: '',
          airtelMoneyName: '',
          momoPayMerchantCode: '',
          directPayoutsEnabled: false,
          badges: (merged.badges ?? []).filter((badge) => !/verified|nin/i.test(badge)),
        };
      } catch (e) {}
    }
    return INITIAL_CURRENT_USER;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('shoplocal_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('shoplocal_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('shoplocal_favorites');
    return saved ? JSON.parse(saved) : ['list_001', 'list_003'];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('shoplocal_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif_welcome',
        title: 'Welcome to the ShopLocal UG demo',
        body: 'Browse sample listings, try the account and chat flows, and preview simulated checkout. No live payments or identity checks run.',
        type: 'system',
        timestamp: new Date().toISOString(),
        read: false,
      }
    ];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('shoplocal_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Uganda');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<'all' | ItemCondition>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price-asc' | 'price-desc' | 'popular'>('latest');
  const [feedTab, setFeedTab] = useState<'trending' | 'recent' | 'verified' | 'deals'>('trending');

  // Modals & Navigation
  const [mobileTab, setMobileTab] = useState<'home' | 'saved' | 'post' | 'messages' | 'dashboard'>('home');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedBoostListing, setSelectedBoostListing] = useState<Listing | null>(null);
  const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSafetyTipsOpen, setIsSafetyTipsOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<{ isOpen: boolean; listingTitle?: string; sellerName?: string }>({ isOpen: false });
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isPayoutSettingsOpen, setIsPayoutSettingsOpen] = useState(false);
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Manual Boost Orders state (Admin verification & User payment)
  const [boostOrders, setBoostOrders] = useState<BoostOrder[]>(() => {
    const saved = localStorage.getItem('shoplocal_boost_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'boost_seed_01',
        adTitle: 'Toyota Harrier 2018 Pearl White (Mint Condition)',
        userPhone: '0772849201',
        plan: '7 days',
        amount: 9500,
        network: 'MTN',
        payerNumber: '0772849201',
        txnId: '1948201840',
        time: new Date(Date.now() - 3600000).toISOString(),
        status: 'Pending',
        listingId: 'list_001',
      }
    ];
  });

  const [isAdminBoostOrdersOpen, setIsAdminBoostOrdersOpen] = useState(false);

  // MoMo payment modal state
  const [momoModalConfig, setMomoModalConfig] = useState<{
    isOpen: boolean;
    amount: number;
    purpose: PaymentPurpose;
    itemTitle?: string;
    listingId?: string;
    sellerName?: string;
  }>({
    isOpen: false,
    amount: 10000,
    purpose: 'BOOST_LISTING',
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('shoplocal_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('shoplocal_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('shoplocal_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('shoplocal_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('shoplocal_boost_orders', JSON.stringify(boostOrders));
  }, [boostOrders]);

  useEffect(() => {
    localStorage.setItem('shoplocal_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('shoplocal_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Counts
  const unreadMessagesCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Filter listings
  const filteredListings = listings.filter((item) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      const matchLoc = item.locationDetails.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchLoc) return false;
    }

    // District filter
    if (selectedDistrict !== 'All Uganda' && item.district !== selectedDistrict) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Subcategory filter
    if (selectedSubcategory && item.subcategory !== selectedSubcategory) {
      return false;
    }

    // Sample badge filter (either toggle or feed tab)
    if ((verifiedOnly || feedTab === 'verified') && !item.seller.isVerified) {
      return false;
    }

    // Great Deals Tab filter (under 200k or negotiable)
    if (feedTab === 'deals' && item.price > 200000 && !item.isNegotiable) {
      return false;
    }

    // Saved / Bookmarks Tab filter
    if (showSavedOnly && !favorites.includes(item.id)) {
      return false;
    }

    // Condition
    if (conditionFilter !== 'all' && item.condition !== conditionFilter) {
      return false;
    }

    // Price range
    if (priceRange === 'under-50k' && item.price > 50000) return false;
    if (priceRange === '50k-500k' && (item.price < 50000 || item.price > 500000)) return false;
    if (priceRange === '500k-2m' && (item.price < 500000 || item.price > 2000000)) return false;
    if (priceRange === 'above-2m' && item.price < 2000000) return false;

    return true;
  });

  // Sort listings: boosted/featured items always surface first, then sorted by option
  const sortedListings = [...filteredListings].sort((a, b) => {
    // If Recent tab selected, sort strictly by time
    if (feedTab === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    // Otherwise boosted/featured surface first
    if (a.isBoosted && !b.isBoosted) return -1;
    if (!a.isBoosted && b.isBoosted) return 1;

    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popular' || feedTab === 'trending') return b.views - a.views;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Favorite toggle
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // Push notification dispatcher
  const triggerPushNotification = (newNotif: AppNotification) => {
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    playNotificationSound();

    // Trigger native browser notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotif.title, {
          body: newNotif.body,
              icon: '/icon.svg',
        });
      } catch (e) {
        // Fallback silently if unsupported in frame
      }
    }
  };

  // Request browser push permissions
  const handleRequestBrowserPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        triggerPushNotification({
          id: 'notif_perm_' + Date.now(),
          title: 'Push Notifications Enabled! 🔔',
          body: 'You will now receive instant alerts on your device for buyer inquiries and offers.',
          type: 'system',
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    } else {
      alert('In-app actionable notifications are actively enabled on your device!');
    }
  };

  // Open Chat from Listing
  const handleStartChatWithSeller = (listing: Listing, e?: React.MouseEvent) => {
    e?.stopPropagation();

    let existingConv = conversations.find(
      c => c.listingId === listing.id && (c.buyerId === currentUser.id || c.sellerId === currentUser.id)
    );

    if (!existingConv) {
      const newConv: Conversation = {
        id: 'conv_' + Date.now(),
        listingId: listing.id,
        listingTitle: listing.title,
        listingPrice: listing.price,
        listingImage: listing.images[0],
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        buyerAvatar: currentUser.avatar,
        sellerId: listing.seller.id,
        sellerName: listing.seller.name,
        sellerAvatar: listing.seller.avatar,
        lastMessage: 'Is this item still available?',
        lastTimestamp: new Date().toISOString(),
        unreadCount: 0,
        messages: [
          {
            id: 'msg_' + Date.now(),
            senderId: currentUser.id,
            senderName: currentUser.name,
            recipientId: listing.seller.id,
            text: `Hello ${listing.seller.name}, I am interested in "${listing.title}". Is it still available in ${listing.district}?`,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      setConversations([newConv, ...conversations]);
      existingConv = newConv;
    }

    setActiveChatConvId(existingConv.id);
    setIsChatOpen(true);
    if (selectedListing) setSelectedListing(null);
  };

  const handleSendMessage = (conversationId: string, text: string, isOffer = false, offerAmount?: number) => {
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === conversationId) {
        const newMsg = {
          id: 'msg_' + Date.now(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          recipientId: conv.buyerId === currentUser.id ? conv.sellerId : conv.buyerId,
          text,
          timestamp: new Date().toISOString(),
          isOffer,
          offerAmount,
          offerStatus: isOffer ? ('pending' as const) : undefined,
        };

        return {
          ...conv,
          lastMessage: text,
          lastTimestamp: new Date().toISOString(),
          messages: [...conv.messages, newMsg],
        };
      }
      return conv;
    });

    setConversations(updatedConversations);

    // Simulate real-time response from other party
    setTimeout(() => {
      const targetConv = conversations.find(c => c.id === conversationId);
      if (!targetConv) return;

      const otherPartyName = targetConv.buyerId === currentUser.id ? targetConv.sellerName : targetConv.buyerName;
      const otherPartyId = targetConv.buyerId === currentUser.id ? targetConv.sellerId : targetConv.buyerId;

      let replyText = 'Sample seller reply: Thanks for reaching out. This conversation is part of the demo and is not delivered to a real seller.';
      if (isOffer && offerAmount) {
        replyText = `Sample seller reply: Your offer of UGX ${offerAmount.toLocaleString()} is accepted for this preview. No agreement was made and no payment was processed.`;
      }

      const sellerReply = {
        id: 'msg_reply_' + Date.now(),
        senderId: otherPartyId,
        senderName: otherPartyName,
        recipientId: currentUser.id,
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          const updatedMsgs = c.messages.map(m => {
            if (m.isOffer && m.offerStatus === 'pending') {
              return { ...m, offerStatus: 'accepted' as const };
            }
            return m;
          });

          return {
            ...c,
            lastMessage: replyText,
            lastTimestamp: new Date().toISOString(),
            messages: [...updatedMsgs, sellerReply],
          };
        }
        return c;
      }));

      // Trigger actionable push alert
      triggerPushNotification({
        id: 'notif_reply_' + Date.now(),
        title: `Demo reply from ${otherPartyName}`,
        body: replyText,
        type: isOffer ? 'offer' : 'message',
        timestamp: new Date().toISOString(),
        read: false,
        conversationId,
        offerAmount: isOffer ? offerAmount : undefined,
        actions: isOffer ? [
          { label: 'View sample offer', actionKey: 'reply', style: 'primary' },
          { label: 'Preview checkout', actionKey: 'accept_offer', style: 'primary' },
        ] : [
          { label: 'Reply', actionKey: 'reply', style: 'primary' },
        ],
      });
    }, 1800);
  };

  // Action dispatcher from notification toast/modal
  const handleNotificationAction = (actionKey: string, notif: AppNotification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setActiveToast(null);

    if (actionKey === 'reply' && notif.conversationId) {
      setActiveChatConvId(notif.conversationId);
      setIsChatOpen(true);
      setIsNotificationCenterOpen(false);
    } else if (actionKey === 'accept_offer' && notif.conversationId) {
      const conv = conversations.find(c => c.id === notif.conversationId);
      if (conv) {
        setMomoModalConfig({
          isOpen: true,
          amount: notif.offerAmount || conv.listingPrice,
          purpose: 'ESCROW_PURCHASE',
          itemTitle: conv.listingTitle,
        });
      }
    } else if (actionKey === 'decline_offer') {
      triggerPushNotification({
        id: `notif_demo_offer_declined_${Date.now()}`,
        title: 'Demo offer dismissed',
        body: 'The sample offer was dismissed in this browser. No buyer was contacted.',
        type: 'offer',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  };

  // Simulation triggers for testing real-time push alerts
  const handleSimulateInquiry = () => {
    triggerPushNotification({
      id: 'sim_inq_' + Date.now(),
      title: 'Sample buyer inquiry',
      body: 'Is the sample sofa still available? This preview message does not contact a seller.',
      type: 'message',
      timestamp: new Date().toISOString(),
      read: false,
      conversationId: conversations[1]?.id || conversations[0]?.id,
      actions: [
        { label: 'Reply to Buyer', actionKey: 'reply', style: 'primary' },
      ],
    });
  };

  const handleSimulateOffer = () => {
    triggerPushNotification({
      id: 'sim_off_' + Date.now(),
  title: 'Sample counter-offer · UGX 1,200,000',
  body: 'A sample buyer offer is shown for preview only. No seller was contacted and no payment can be made.',
      type: 'offer',
      timestamp: new Date().toISOString(),
      read: false,
      conversationId: conversations[0]?.id,
      offerAmount: 1200000,
      actions: [
        { label: 'Accept Offer', actionKey: 'accept_offer', style: 'primary' },
        { label: 'Open Chat', actionKey: 'reply', style: 'secondary' },
        { label: 'Decline', actionKey: 'decline_offer', style: 'danger' },
      ],
    });
  };

  // Post Ad Submission (with Free 18 check & driving to promo purchases when selected)
  const handlePostAd = (
    newAdData: Partial<Listing>,
    promoOption?: PromoSelection
  ) => {
    // Check if free 18 ads are done and user is not pro/subscribed
    if (!currentUser.isProMember && currentUser.freeListingsUsed >= currentUser.freeListingsTotal) {
      setIsPostAdOpen(false);
      setIsPricingModalOpen(true);
      return;
    }

    const isBoosted = currentUser.isProMember;
    const newListing: Listing = {
      id: `list_demo_${Date.now()}`,
      sellerId: currentUser.id,
      seller: currentUser,
      title: newAdData.title?.trim() || '',
      description: newAdData.description?.trim() || '',
      price: Number(newAdData.price) || 0,
      isNegotiable: newAdData.isNegotiable ?? true,
      exchangePossible: newAdData.exchangePossible ?? false,
      category: newAdData.category || 'agriculture',
      subcategory: newAdData.subcategory || 'General',
      condition: newAdData.condition || 'Brand New',
      district: newAdData.district || 'Kampala',
      locationDetails: newAdData.locationDetails || 'Kampala Central',
      images: newAdData.images || [],
      views: 1,
      inquiriesCount: 0,
      isBoosted,
      isSold: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: newAdData.tags || [],
      brand: newAdData.brand,
      type: newAdData.type,
    };

    setListings(prev => [newListing, ...prev]);

    if (!currentUser.isProMember) {
      setCurrentUser(prev => ({
        ...prev,
        freeListingsUsed: prev.freeListingsUsed + 1,
      }));
    }

    setIsPostAdOpen(false);

    if (promoOption) {
      const promoLabel = promoOption.type === 'TOP'
        ? `${promoOption.durationDays}-day TOP placement`
        : 'Premium boost';
      setSelectedBoostListing(newListing);
      setMomoModalConfig({
        isOpen: true,
        amount: promoOption.priceUGX,
        purpose: 'BOOST_LISTING',
        itemTitle: `${newListing.title} · ${promoLabel}`,
        listingId: newListing.id,
      });
    } else {
      triggerPushNotification({
        id: `notif_post_${Date.now()}`,
        title: 'Demo listing published',
        body: `"${newListing.title}" is now visible in this browser's marketplace preview. No listing was sent to a server.`,
        type: 'boost',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  };

  const handlePaymentSuccess = (transaction: PaymentTransaction) => {
    if (!transaction.isDemo) return;

    if (transaction.purpose === 'BOOST_LISTING') {
      const targetId = transaction.listingId || selectedBoostListing?.id;
      if (targetId) {
        setListings(prev => prev.map(listing => listing.id === targetId ? { ...listing, isBoosted: true } : listing));
      }

      triggerPushNotification({
        id: `notif_demo_boost_${Date.now()}`,
        title: targetId ? 'Demo boost applied' : 'Demo checkout simulated',
        body: targetId
          ? `"${transaction.itemTitle || 'Your listing'}" is marked featured in this local preview. No funds moved.`
          : 'Choose one of your own listings to preview a boost. No payment was processed.',
        type: 'boost',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (transaction.purpose === 'PACKAGE_WEEKLY') {
      setCurrentUser(prev => ({
        ...prev,
        freeListingsTotal: prev.freeListingsTotal + 22,
        activePlan: 'WEEKLY_22',
      }));
      triggerPushNotification({
        id: `notif_demo_pack_${Date.now()}`,
        title: 'Demo seller pack applied',
        body: 'The preview allowance increased by 22 listings in this browser. No payment was processed.',
        type: 'payment',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (transaction.purpose === 'PACKAGE_MONTHLY') {
      setCurrentUser(prev => ({
        ...prev,
        freeListingsTotal: prev.freeListingsTotal + 40,
        activePlan: 'MONTHLY_40',
      }));
      triggerPushNotification({
        id: `notif_demo_pack_monthly_${Date.now()}`,
        title: 'Demo monthly pack applied',
        body: 'The preview allowance increased by 40 listings in this browser. No payment was processed.',
        type: 'payment',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (transaction.purpose === 'PACKAGE_UNLIMITED' || transaction.purpose === 'PRO_SUBSCRIPTION') {
      setCurrentUser(prev => ({
        ...prev,
        isProMember: true,
        proMemberSince: new Date().toISOString(),
        activePlan: 'UNLIMITED_65',
        badges: Array.from(new Set([...prev.badges, 'Demo PRO'])),
      }));
      setListings(prev => prev.map(listing => listing.sellerId === currentUser.id ? { ...listing, isBoosted: true } : listing));

      triggerPushNotification({
        id: `notif_demo_unlimited_${Date.now()}`,
        title: 'Demo seller plan applied',
        body: 'Preview seller features are enabled in this browser. No payment was processed.',
        type: 'payment',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (transaction.purpose === 'ESCROW_PURCHASE') {
      triggerPushNotification({
        id: `notif_demo_checkout_${Date.now()}`,
        title: 'Demo checkout simulated',
        body: `The preview checkout for "${transaction.itemTitle || 'this listing'}" completed locally. No seller was paid and no funds moved.`,
        type: 'payment',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    setIsPricingModalOpen(false);
  };

  // Direct Payout Lines Handlers
  const handleSavePayoutSettings = (updatedPayouts: {
    mtnMomoNumber: string;
    mtnMomoName: string;
    airtelMoneyNumber: string;
    airtelMoneyName: string;
    momoPayMerchantCode: string;
    directPayoutsEnabled: boolean;
  }) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedPayouts,
    }));
    triggerPushNotification({
      id: 'notif_payout_' + Date.now(),
      title: 'Demo payout preferences saved',
      body: 'These settings are stored in this browser only. No MTN or Airtel connection is active and no funds can be routed.',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  const handleSimulateTestPayoutAlert = (network: 'MTN' | 'AIRTEL', number: string, amount: number) => {
    const carrier = network === 'MTN' ? 'MTN' : 'Airtel';
    triggerPushNotification({
      id: `demo_payout_${Date.now()}`,
      title: `Simulated ${carrier} alert`,
      body: `Preview alert for UGX ${amount.toLocaleString()}. No transfer took place and no account balance changed.`,
      type: 'payment',
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // Boost listing trigger
  const handleTriggerBoost = (listing: Listing) => {
    setSelectedBoostListing(listing);
    setMomoModalConfig({
      isOpen: true,
      amount: 10000,
      purpose: 'BOOST_LISTING',
      itemTitle: `Weekly Boost: ${listing.title}`,
      listingId: listing.id,
    });
  };

  const handleSelectPricingPlan = (plan: PricingPlan) => {
    const packagePurposes: Record<string, PaymentPurpose> = {
      weekly_22: 'PACKAGE_WEEKLY',
      monthly_40: 'PACKAGE_MONTHLY',
      unlimited_65: 'PACKAGE_UNLIMITED',
    };
    const purpose = packagePurposes[plan.id] || 'BOOST_LISTING';

    if (purpose === 'BOOST_LISTING' && !selectedBoostListing) {
      setIsPricingModalOpen(false);
      setIsDashboardOpen(true);
      triggerPushNotification({
        id: `notif_choose_listing_${Date.now()}`,
        title: 'Choose one of your listings first',
        body: 'Open Seller Studio and select one of your own listings to preview a boost.',
        type: 'system',
        timestamp: new Date().toISOString(),
        read: false,
      });
      return;
    }

    setMomoModalConfig({
      isOpen: true,
      amount: plan.priceUGX,
      purpose,
      itemTitle: plan.name,
      listingId: selectedBoostListing?.id,
    });
    setIsPricingModalOpen(false);
  };

  const handleOpenManualBoost = (config: {
    amount: 9500 | 21500 | 28550;
    planName: '7 days' | '30 days' | 'Boost Premium';
    adTitle: string;
    listingId?: string;
  }) => {
    const listingId = config.listingId || selectedBoostListing?.id;
    if (!listingId) {
      setIsPricingModalOpen(false);
      setIsDashboardOpen(true);
      triggerPushNotification({
        id: `notif_choose_listing_${Date.now()}`,
        title: 'Choose one of your listings first',
        body: 'Open Seller Studio and select one of your own listings to preview a boost.',
        type: 'system',
        timestamp: new Date().toISOString(),
        read: false,
      });
      return;
    }

    setIsPricingModalOpen(false);
    setMomoModalConfig({
      isOpen: true,
      amount: config.amount,
      purpose: 'BOOST_LISTING',
      itemTitle: `${config.adTitle || selectedBoostListing?.title || 'Selected listing'} · ${config.planName} preview`,
      listingId,
    });
  };

  // Admin approves boost order
  const handleApproveBoostOrder = (orderId: string) => {
    const targetOrder = boostOrders.find(o => o.id === orderId);
    if (!targetOrder) return;

    setBoostOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Approved' } : o));

    // Activate TOP ad placement
    if (targetOrder.listingId) {
      setListings(prev => prev.map(l => l.id === targetOrder.listingId ? {
        ...l,
        isBoosted: true,
        paymentStatus: 'APPROVED',
      } : l));
    } else {
      // Find matching ad by title
      setListings(prev => prev.map(l => l.title === targetOrder.adTitle ? {
        ...l,
        isBoosted: true,
        paymentStatus: 'APPROVED',
      } : l));
    }

    confetti({ particleCount: 70, spread: 60 });

    triggerPushNotification({
      id: 'notif_boost_approved_' + Date.now(),
      title: '🌟 Ad Boost Approved! TOP Active',
      body: `Boost payment for "${targetOrder.adTitle}" approved! Your ad is now in TOP search results.`,
      type: 'boost',
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // Admin declines boost order
  const handleDeclineBoostOrder = (orderId: string) => {
    setBoostOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Declined' } : o));
    triggerPushNotification({
      id: 'notif_boost_declined_' + Date.now(),
      title: 'Boost Order Declined',
      body: 'Boost payment could not be matched with telecom transaction. Please check details.',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // Toggle Sold state and record in completed sales
  const handleToggleSold = (listingId: string) => {
    const item = listings.find(l => l.id === listingId);
    if (!item) return;

    const newSoldState = !item.isSold;
    setListings(listings.map(l => l.id === listingId ? { ...l, isSold: newSoldState } : l));

    if (newSoldState) {
      const newSale = {
        id: 'sale_' + Date.now(),
        listingId: item.id,
        title: item.title,
        category: item.category,
        price: item.price,
        soldDate: new Date().toISOString(),
        buyerName: 'Kampala Verified Buyer',
        location: item.locationDetails,
        paymentMethod: 'MTN_MOMO' as const,
        referenceNumber: 'UG-MTN-' + Math.floor(1000000 + Math.random() * 9000000),
      };

      setCurrentUser(prev => ({
        ...prev,
        completedSales: [newSale, ...(prev.completedSales || [])],
      }));

      confetti({ particleCount: 60, spread: 70 });
    }
  };

  // Switch demo user
  const handleSwitchUserRole = () => {
    if (currentUser.id === INITIAL_CURRENT_USER.id) {
      setCurrentUser(INITIAL_SELLERS[0]); // Brenda Nakato
    } else {
      setCurrentUser(INITIAL_CURRENT_USER); // Brian Kigozi
    }
  };

  // Update profile picture
  const handleUpdateAvatar = (newAvatar: string) => {
    setCurrentUser(prev => {
      const updated = { ...prev, avatar: newAvatar };
      localStorage.setItem('shoplocal_current_user', JSON.stringify(updated));
      return updated;
    });
    setViewProfileUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
  };

  // Open listing and persist to Recently Viewed (last 5 items tapped)
  const handleOpenListing = (listing: Listing) => {
    setSelectedListing(listing);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== listing.id);
      const updated = [listing, ...filtered].slice(0, 5);
      localStorage.setItem('shoplocal_recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear recently viewed history
  const handleClearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('shoplocal_recently_viewed');
  };

  // Sign out from settings anytime
  const handleSignOut = () => {
    localStorage.removeItem('shoplocal_current_user');
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      name: 'Guest User',
      phone: '+256 700 000 000',
      email: 'guest@shoplocal.ug',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      district: 'Kampala',
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      isPhoneVerified: false,
      isProMember: false,
      freeListingsUsed: 0,
      freeListingsTotal: 18,
      hasBiometrics: false,
      joinedDate: new Date().toISOString(),
      responseTime: 'Offline',
      badges: ['Guest User'],
      activePlan: 'FREE_18',
      completedSales: [],
    };
    setCurrentUser(guestUser);
    setViewProfileUser(null);
    triggerPushNotification({
      id: 'notif_signout_' + Date.now(),
      title: 'Signed Out Successfully 👋',
      body: 'You have signed out. You can sign back in or create a new account anytime.',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // Add review for seller
  const handleAddReview = (sellerId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: 'rev_' + Date.now(),
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      sellerId,
      rating,
      comment,
      date: new Date().toISOString(),
      verifiedPurchase: true,
    };

    setReviews([newRev, ...reviews]);
    confetti({ particleCount: 50, spread: 60 });
  };

  // Report submission handler
  const handleReportSubmit = (reason: string, details: string) => {
    triggerPushNotification({
      id: 'notif_report_' + Date.now(),
      title: 'Report Received 🛡️',
      body: `Thank you for reporting. Our Kampala trust & safety team has received your report (${reason}). We investigate all flagged listings within 24 hours.`,
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // Handle Mobile navigation tabs
  const handleMobileTabChange = (tab: 'home' | 'saved' | 'post' | 'messages' | 'dashboard') => {
    setMobileTab(tab);
    if (tab === 'home') {
      setShowSavedOnly(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'saved') {
      setShowSavedOnly(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'post') {
      setIsPostAdOpen(true);
    } else if (tab === 'messages') {
      setIsChatOpen(true);
    } else if (tab === 'dashboard') {
      setIsDashboardOpen(true);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-950 pb-[85px] md:pb-10 transition-colors ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F5F5F5] text-[#222222]'
    }`}>
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={setSelectedDistrict}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenMessages={() => setIsChatOpen(true)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenProModal={() => setIsPricingModalOpen(true)}
        onOpenAdminBoostOrders={() => setIsAdminBoostOrdersOpen(true)}
        pendingBoostOrdersCount={boostOrders.filter(o => o.status === 'Pending').length}
        onOpenBiometrics={() => setIsBiometricsModalOpen(true)}
        onOpenSafetyTips={() => setIsSafetyTipsOpen(true)}
        onOpenPayoutSettings={() => setIsPayoutSettingsOpen(true)}
        onOpenSignUp={() => setIsSignUpModalOpen(true)}
        onOpenProfile={(u) => setViewProfileUser(u)}
        onSwitchUserRole={handleSwitchUserRole}
        onSignOut={handleSignOut}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Jiji Main Marketplace Layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          {/* Left Category Sidebar (Desktop Only - Jiji Signature Architecture) */}
          <div className="w-64 xl:w-72 shrink-0 hidden lg:block space-y-4 sticky top-28">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={setSelectedSubcategory}
              darkMode={darkMode}
            />

            {/* Safe Trading Sidebar Box */}
            <div className={`p-4 rounded-xl border text-xs space-y-2.5 shadow-2xs ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-emerald-50/70 border-emerald-200/80 text-slate-800'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-[#00B53F]">
                <ShieldCheck className="w-4 h-4 text-[#00B53F]" />
                <span className="uppercase tracking-wider text-[11px]">Safe Trading on ShopLocal UG</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                Meet in person in safe public places (Acacia Mall, police stations, town centers) before sending mobile money payments.
              </p>
              <button
                onClick={() => setIsSafetyTipsOpen(true)}
                className="text-[11px] font-bold text-[#00B53F] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Read Safety Tips</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Hero Promotional Banner - 100% like Jiji.ug mobile web (height 140px, rounded 12px, gradient #00B53F to #008A30) */}
            <section className="bg-gradient-to-r from-[#00B53F] to-[#008A30] text-white rounded-[12px] p-4 sm:p-5 shadow-xs relative overflow-hidden min-h-[140px] flex items-center">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative z-10 w-full">
                <div className="space-y-1.5 text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold">
                    <span>INTERACTIVE MARKETPLACE DEMO</span>
                  </div>
                  <h1 className="font-display font-black text-lg sm:text-2xl text-white tracking-tight leading-snug">
                    Browse & sell locally with <span className="text-amber-200">ShopLocal UG</span>
                  </h1>
                  <p className="text-[11px] sm:text-xs text-emerald-50 leading-relaxed">
                    Sample listings and replies. Profiles and promotions stay in this browser; checkout is simulated and no money moves.
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                    <button
                      onClick={() => setIsPostAdOpen(true)}
                      className="px-4 py-2 rounded-lg bg-[#ff7e00] hover:bg-[#e67200] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>POST FREE AD</span>
                    </button>
                    <button
                      onClick={() => setIsPricingModalOpen(true)}
                      className="px-3.5 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-200" />
                      <span>Boost Ad</span>
                    </button>
                  </div>
                </div>

                {/* Right Mini Promo Box */}
                <div className="bg-black/15 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-white max-w-xs w-full space-y-1 hidden sm:block">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-200">ShopLocal UG demo</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">
                      {currentUser.isProMember ? 'PRO' : `${currentUser.freeListingsUsed} / ${currentUser.freeListingsTotal}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-50 leading-tight">
                    Browse sample listings, try an account, and preview chat and checkout. All activity stays in this browser.
                  </p>
                  <div className="pt-1 text-[10px] flex items-center justify-between text-emerald-100 border-t border-white/10">
                    <span>MTN demo: simulated</span>
                    <span>Airtel demo: simulated</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Mobile Category Circular Grid (Iconic Jiji Mobile UX) */}
            <div id="jiji-categories-section" className="lg:hidden">
              <CategoryCircleGrid
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectSubcategory={setSelectedSubcategory}
                darkMode={darkMode}
              />
            </div>

            {/* Subcategory Pills Strip (When category is selected) */}
            {selectedCategory !== 'all' && (
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 overflow-x-auto text-xs no-scrollbar ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}>
                <span className="text-[11px] font-bold text-[#3db83a] uppercase tracking-wider shrink-0 pl-1">
                  Filter:
                </span>
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedSubcategory === null
                      ? 'bg-[#3db83a] text-white'
                      : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All in Category
                </button>
                {CATEGORIES.find(c => c.id === selectedCategory)?.subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      selectedSubcategory === sub
                        ? 'bg-[#3db83a] text-white font-bold'
                        : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Jiji Safety Banner */}
            <JijiSafetyBanner
              onOpenSafetyTips={() => setIsSafetyTipsOpen(true)}
              darkMode={darkMode}
            />

            {/* Saved Items Notice Banner */}
            {showSavedOnly && (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-2xs ${
                darkMode ? 'bg-slate-900 border-[#3db83a]/40 text-slate-200' : 'bg-emerald-50 border-[#3db83a]/30 text-emerald-950'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3db83a]/20 flex items-center justify-center text-[#3db83a]">
                    <Heart className="w-4 h-4 fill-[#3db83a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">
                      Saved Classifieds ({favorites.length})
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Items you bookmarked for later review
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowSavedOnly(false); setMobileTab('home'); }}
                  className="px-3 py-1.5 rounded-lg bg-[#3db83a] text-white text-xs font-bold hover:bg-[#34a331] transition-colors cursor-pointer"
                >
                  View All Ads
                </button>
              </div>
            )}

            {/* Jiji Feed Switcher Tabs & Filters */}
            <div className={`rounded-xl border p-3 sm:p-4 shadow-2xs space-y-3 transition-colors ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}>
              {/* Top Feed Tabs (Trending, Recent, Verified, Great Deals) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setFeedTab('trending')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    feedTab === 'trending'
                      ? 'bg-[#00B53F] text-white shadow-xs'
                      : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  <span>Trending Ads</span>
                </button>

                <button
                  onClick={() => setFeedTab('recent')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    feedTab === 'recent'
                      ? 'bg-[#00B53F] text-white shadow-xs'
                      : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Recent / Fresh</span>
                </button>

                <button
                  onClick={() => setFeedTab('verified')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    feedTab === 'verified'
                      ? 'bg-[#00B53F] text-white shadow-xs'
                      : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sample Badges Only</span>
                </button>

                <button
                  onClick={() => setFeedTab('deals')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    feedTab === 'deals'
                      ? 'bg-[#00B53F] text-white shadow-xs'
                      : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Great Deals (&lt; UGX 200k)</span>
                </button>
              </div>

              {/* Secondary Filter Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 pr-2 border-r border-slate-200 dark:border-slate-700">
                    <Filter className="w-3.5 h-3.5 text-[#00B53F]" />
                    <span>{sortedListings.length} Ads</span>
                  </div>

                  {/* Condition Filter */}
                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value as any)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none cursor-pointer ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="all">All Conditions</option>
                    <option value="Brand New">Brand New Only</option>
                    <option value="Like New">Like New</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>

                  {/* Price Filter */}
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none cursor-pointer ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value="all">All Prices</option>
                    <option value="under-50k">Under UGX 50,000</option>
                    <option value="50k-500k">UGX 50,000 - 500,000</option>
                    <option value="500k-2m">UGX 500k - 2,000,000</option>
                    <option value="above-2m">Above UGX 2,000,000</option>
                  </select>

                  {/* Active District Tag if filtered */}
                  {selectedDistrict !== 'All Uganda' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00B53F]/10 text-[#00B53F] font-bold text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{selectedDistrict}</span>
                      <button 
                        onClick={() => setSelectedDistrict('All Uganda')} 
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className={`pl-2.5 pr-6 py-1.5 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer appearance-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="latest">Latest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Header: Trending Ads (2-column on mobile like Jiji) */}
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff7e00]" />
                <h2 className="font-display font-black text-sm sm:text-base text-[#222222]">
                  {feedTab === 'trending' ? 'Trending Ads' : feedTab === 'recent' ? 'Recent / Fresh Ads' : feedTab === 'verified' ? 'Sample Badge Ads' : 'Great Deals'}
                </h2>
                <span className="text-xs font-bold text-[#00B53F] bg-[#00B53F]/10 px-2 py-0.5 rounded-full">
                  {sortedListings.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedDistrict}
              </span>
            </div>

            {/* Jiji Listings Grid (Compact 2-col on mobile, 3-4 col on desktop) */}
            {sortedListings.length === 0 ? (
              <div className={`p-10 text-center rounded-2xl border shadow-xs max-w-lg mx-auto space-y-3 my-6 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="w-14 h-14 rounded-full bg-[#00B53F]/15 text-[#00B53F] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#222222]">
                    No classifieds found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try clearing district or price filters, or post your ad to be the first seller in this section!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDistrict('All Uganda');
                      setSelectedCategory('all');
                      setSelectedSubcategory(null);
                      setVerifiedOnly(false);
                      setConditionFilter('all');
                      setPriceRange('all');
                      setFeedTab('trending');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsPostAdOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#ff7e00] hover:bg-[#e67200] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs uppercase tracking-wider"
                  >
                    POST FREE AD
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                {sortedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorite={favorites.includes(listing.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectListing={(item) => handleOpenListing(item)}
                    onOpenChat={(item, e) => handleStartChatWithSeller(item, e)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}

            {/* Recently Viewed Component at bottom of main page (last 5 items tapped, persists locally) */}
            <RecentlyViewed
              items={recentlyViewed}
              onOpenListing={handleOpenListing}
              onClear={handleClearRecentlyViewed}
              darkMode={darkMode}
            />
          </div>
        </div>
      </main>

      {/* Footer - Clean light Jiji theme (no dark blue anymore) */}
      <footer className={`mt-auto text-xs py-8 border-t ${
        darkMode ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-white border-slate-200 text-[#757575]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/icon.svg"
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg"
            />
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-xl tracking-tight text-[#00B53F]">
                ShopLocal
              </span>
              <span className="w-2 h-2 rounded-full bg-[#ff7e00] inline-block mb-1"></span>
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#00B53F] text-white px-1 py-0.2 rounded font-mono">
                UG
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-[#222222] font-semibold">
              © {new Date().getFullYear()} ShopLocal UG Classifieds. The best place to buy and sell anything to real people.
            </p>
            <p className="text-[#757575] text-[11px]">
              Active in Kampala, Wakiso, Mukono, Jinja, Mbarara, Gulu, Mbale, Arua & all 135+ Ugandan districts.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentTab={mobileTab}
        onChangeTab={handleMobileTabChange}
        unreadCount={unreadMessagesCount}
        favoritesCount={favorites.length}
        darkMode={darkMode}
      />

      {/* MODAL 1: Listing Details */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onOpenChat={(item) => handleStartChatWithSeller(item)}
          onOpenMomoCheckout={(item) => {
            setMomoModalConfig({
              isOpen: true,
              amount: item.price,
              purpose: 'ESCROW_PURCHASE',
              itemTitle: item.title,
              listingId: item.id,
              sellerName: item.seller.name,

            });
          }}
          onOpenUserProfile={(u) => setViewProfileUser(u)}
          isFavorite={favorites.includes(selectedListing.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenSafetyTips={() => setIsSafetyTipsOpen(true)}
          onOpenReport={(item) => setReportConfig({ isOpen: true, listingTitle: item.title, sellerName: item.seller.name })}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 2: Post Ad */}
      {isPostAdOpen && (
        <PostAdModal
          currentUser={currentUser}
          onClose={() => setIsPostAdOpen(false)}
          onSubmit={handlePostAd}
          onOpenProModal={() => {
            setIsPostAdOpen(false);
            setIsPricingModalOpen(true);
          }}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 3: Real-Time Chat & Negotiation */}
      {isChatOpen && (
        <ChatModal
          conversations={conversations}
          activeConversationId={activeChatConvId}
          onSelectConversation={(id) => setActiveChatConvId(id)}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onClose={() => {
            setIsChatOpen(false);
            setActiveChatConvId(null);
            setMobileTab('home');
          }}
          onOpenMomoCheckout={(itemTitle, amount) => {
            const activeConv = conversations.find(c => c.id === activeChatConvId);
            const otherPartyName = activeConv ? (activeConv.buyerId === currentUser.id ? activeConv.sellerName : activeConv.buyerName) : 'Seller';
            setMomoModalConfig({
              isOpen: true,
              amount,
              purpose: 'ESCROW_PURCHASE',
              itemTitle,
              listingId: activeConv?.listingId,
              sellerName: otherPartyName,

            });
          }}
          onOpenSafetyTips={() => setIsSafetyTipsOpen(true)}
          onOpenReport={(itemTitle, sellerName) => setReportConfig({ isOpen: true, listingTitle: itemTitle, sellerName })}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 4: Pricing Plans (Weekly 22 ads 18k, Monthly 40 ads 30k, Unlimited 65k, Boost 10k) */}
      {isPricingModalOpen && (
        <PricingPlansModal
          onClose={() => {
            setIsPricingModalOpen(false);
            setSelectedBoostListing(null);
          }}
          onSelectPlan={handleSelectPricingPlan}
          selectedBoostListingTitle={selectedBoostListing?.title}
          selectedBoostListingId={selectedBoostListing?.id}
          onOpenManualBoost={handleOpenManualBoost}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 4C: Admin Boost Orders Modal (Verification & Approval) */}
      {isAdminBoostOrdersOpen && (
        <AdminBoostOrdersModal
          orders={boostOrders}
          listings={listings}
          onClose={() => setIsAdminBoostOrdersOpen(false)}
          onApproveOrder={handleApproveBoostOrder}
          onDeclineOrder={handleDeclineBoostOrder}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 5: MTN MoMo & Airtel Money Checkout */}
      {momoModalConfig.isOpen && (
        <MomoPaymentModal
          amount={momoModalConfig.amount}
          purpose={momoModalConfig.purpose}
          itemTitle={momoModalConfig.itemTitle}
          listingId={momoModalConfig.listingId}
          sellerName={momoModalConfig.sellerName}

          onClose={() => {
            setMomoModalConfig(prev => ({ ...prev, isOpen: false }));
            setSelectedBoostListing(null);
          }}
          onSuccess={handlePaymentSuccess}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 6: One-Time Sign-Up */}
      {isSignUpModalOpen && (
        <SignUpModal
          onClose={() => setIsSignUpModalOpen(false)}
          onSignUpComplete={(newUser) => {
            setCurrentUser(newUser);
            localStorage.setItem('shoplocal_current_user', JSON.stringify(newUser));
            setIsSignUpModalOpen(false);
            // Let account appear directly in profile without sign-in details
            setViewProfileUser(newUser);
            triggerPushNotification({
              id: 'notif_welcome_' + Date.now(),
              title: `Demo profile created for ${newUser.name}`,
              body: 'Your sample profile is saved in this browser with an allowance of 18 demo listings. No login or identity checks were performed.',
              type: 'system',
              timestamp: new Date().toISOString(),
              read: false,
            });
          }}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 7: ShopLocal Ug Safety Rules & Scam Prevention Guide */}
      {isSafetyTipsOpen && (
        <SafetyTipsModal
          onClose={() => setIsSafetyTipsOpen(false)}
          onOpenReport={() => {
            setIsSafetyTipsOpen(false);
            setReportConfig({ isOpen: true });
          }}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 7B: Report Suspicious Listing or Seller */}
      {reportConfig.isOpen && (
        <ReportModal
          listingTitle={reportConfig.listingTitle}
          sellerName={reportConfig.sellerName}
          onClose={() => setReportConfig({ isOpen: false })}
          onSubmitReport={handleReportSubmit}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 8: Biometric Passkey Enrollment Standalone */}
      {isBiometricsModalOpen && (
        <BiometricAuthModal
          currentUser={currentUser}
          onClose={() => setIsBiometricsModalOpen(false)}
          onEnrollSuccess={(credId) => {
            setCurrentUser(prev => ({
              ...prev,
              hasBiometrics: true,
              biometricCredentialId: credId,
              badges: [...prev.badges, 'Biometric Passkey Verified'],
            }));
          }}
        />
      )}

      {/* MODAL 9: Seller Studio & Inventory Management */}
      {isDashboardOpen && (
        <SellerDashboard
          currentUser={currentUser}
          listings={listings}
          onClose={() => {
            setIsDashboardOpen(false);
            setMobileTab('home');
          }}
          onOpenPostAd={() => {
            setIsDashboardOpen(false);
            setIsPostAdOpen(true);
          }}
          onOpenProModal={() => {
            setIsDashboardOpen(false);
            setIsPricingModalOpen(true);
          }}
          onOpenMessages={() => {
            setIsDashboardOpen(false);
            setIsChatOpen(true);
          }}
          onOpenPayoutSettings={() => {
            setIsDashboardOpen(false);
            setIsPayoutSettingsOpen(true);
          }}
          onOpenAdminBoostOrders={() => {
            setIsDashboardOpen(false);
            setIsAdminBoostOrdersOpen(true);
          }}
          pendingBoostOrdersCount={boostOrders.filter(o => o.status === 'Pending').length}
          onToggleSold={handleToggleSold}
          onBoostListing={(id) => {
            const item = listings.find(l => l.id === id);
            if (item) handleTriggerBoost(item);
          }}
          onDeleteListing={(id) => {
            if (confirm('Delete this listing?')) {
              setListings(listings.filter(l => l.id !== id));
            }
          }}
          onUpdateAvatar={handleUpdateAvatar}
          onSignOut={handleSignOut}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenNotifications={() => {
            setIsDashboardOpen(false);
            setIsNotificationCenterOpen(true);
          }}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 10: Expanded User Profile with 10 Reviews Rule, Sales History, Testimonials */}
      {viewProfileUser && (
        <UserProfileModal
          user={viewProfileUser}
          reviews={reviews}
          listings={listings}
          onClose={() => setViewProfileUser(null)}
          onOpenListing={(l) => {
            setViewProfileUser(null);
            handleOpenListing(l);
          }}
          onAddReview={handleAddReview}
          currentUser={currentUser}
          onOpenReport={(u) => {
            setViewProfileUser(null);
            setReportConfig({ isOpen: true, sellerName: u.name });
          }}
          onUpdateAvatar={handleUpdateAvatar}
          onSignOut={handleSignOut}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenNotifications={() => {
            setViewProfileUser(null);
            setIsNotificationCenterOpen(true);
          }}
          onOpenMessages={() => {
            setViewProfileUser(null);
            setIsChatOpen(true);
          }}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 11: Dedicated Notification Center */}
      {isNotificationCenterOpen && (
        <NotificationCenterModal
          notifications={notifications}
          onClose={() => setIsNotificationCenterOpen(false)}
          onAction={handleNotificationAction}
          onClearAll={() => setNotifications([])}
          onRequestBrowserPush={handleRequestBrowserPush}
          onSimulateInquiry={handleSimulateInquiry}
          onSimulateOffer={handleSimulateOffer}
          darkMode={darkMode}
        />
      )}

      {/* MODAL 12: Direct MTN & Airtel Payout Settings */}
      {isPayoutSettingsOpen && (
        <PayoutSettingsModal
          currentUser={currentUser}
          onClose={() => setIsPayoutSettingsOpen(false)}
          onSave={handleSavePayoutSettings}
          onSimulateTestPayoutAlert={handleSimulateTestPayoutAlert}
          darkMode={darkMode}
        />
      )}

      {/* Actionable Push Notification Toast */}
      <NotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onAction={handleNotificationAction}
        darkMode={darkMode}
      />
    </div>
  );
}
