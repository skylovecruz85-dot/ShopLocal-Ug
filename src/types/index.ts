export type CategoryId = 
  | 'agriculture'
  | 'electronics'
  | 'vehicles'
  | 'fashion'
  | 'plumbing-water'
  | 'babies-kids'
  | 'furniture'
  | 'real-estate'
  | 'construction'
  | 'jobs-services'
  | 'machinery'
  | 'health-beauty'
  | 'education-books';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
  subcategories: string[];
}

export type UgandaDistrict = 
  | 'Kampala'
  | 'Wakiso'
  | 'Entebbe'
  | 'Mukono'
  | 'Jinja'
  | 'Mbarara'
  | 'Gulu'
  | 'Fort Portal'
  | 'Mbale'
  | 'Masaka'
  | 'Arua'
  | 'Kasese';

export type ItemCondition = 'Brand New' | 'Like New' | 'Used - Good' | 'Refurbished';

export interface CompletedSale {
  id: string;
  listingId?: string;
  title: string;
  category: CategoryId;
  price: number; // in UGX
  soldDate: string;
  buyerName: string;
  buyerAvatar?: string;
  location: string;
  paymentMethod: PaymentMethod | 'CASH_ON_DELIVERY';
  referenceNumber: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string; // e.g. "Wholesale Buyer, Owino Market"
  authorAvatar: string;
  content: string;
  rating: number;
  verifiedMerchant: boolean;
  date: string;
}

export interface VerificationApplication {
  ninNumber: string;
  idCardImageFront?: string;
  selfieImage?: string;
  businessRegNumber?: string;
  status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
  submittedDate?: string;
}

export interface User {
  id: string;
  name: string;
  businessName?: string;
  phone: string;
  email: string;
  avatar: string;
  district: UgandaDistrict;
  subCounty?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean; // NIN / National ID verified
  isPhoneVerified: boolean;
  isProMember: boolean; // Lifetime subscription holder
  proMemberSince?: string;
  freeListingsUsed: number;
  freeListingsTotal: number; // base 18 free listings or upgraded
  hasBiometrics: boolean;
  biometricCredentialId?: string;
  joinedDate: string;
  responseTime: string;
  badges: string[];
  completedSales?: CompletedSale[];
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
  ninNumber?: string;
  activePlan?: 'FREE_18' | 'WEEKLY_22' | 'MONTHLY_40' | 'UNLIMITED_65';
  // Direct Payout Lines Configuration
  mtnMomoNumber?: string;
  mtnMomoName?: string;
  airtelMoneyNumber?: string;
  airtelMoneyName?: string;
  momoPayMerchantCode?: string;
  directPayoutsEnabled?: boolean;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  sellerId: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  productTitle?: string;
  verifiedPurchase: boolean;
}

export interface Listing {
  id: string;
  sellerId: string;
  seller: User;
  title: string;
  description: string;
  price: number; // in UGX
  isNegotiable: boolean;
  exchangePossible?: boolean;
  category: CategoryId;
  subcategory: string;
  condition: ItemCondition;
  district: UgandaDistrict;
  locationDetails: string; // e.g. "Acacia Mall, Kisementi, Kampala"
  images: string[];
  views: number;
  inquiriesCount: number;
  isBoosted: boolean;
  isSold: boolean;
  paymentStatus?: 'PENDING_PAYMENT' | 'APPROVED' | 'ACTIVE';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  brand?: string;
  type?: string;
  featuredUntil?: string;
  boostedUntil?: string;
}

export interface BoostOrder {
  id: string;
  adTitle: string;
  userPhone: string;
  plan: '7 days' | '30 days' | 'Boost Premium';
  amount: 9500 | 21500 | 28550 | number;
  network: 'MTN' | 'Airtel';
  payerNumber: string;
  txnId: string;
  screenshot?: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Declined';
  listingId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'declined';
  listingId?: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export type PaymentMethod = 'MTN_MOMO' | 'AIRTEL_MONEY';

export type PaymentPurpose = 
  | 'PRO_SUBSCRIPTION' 
  | 'ESCROW_PURCHASE' 
  | 'BOOST_LISTING' 
  | 'PACKAGE_WEEKLY' 
  | 'PACKAGE_MONTHLY' 
  | 'PACKAGE_UNLIMITED';

export interface PaymentTransaction {
  id: string;
  reference: string;
  method: PaymentMethod;
  phoneNumber: string;
  amount: number;
  purpose: PaymentPurpose;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  itemTitle?: string;
  listingId?: string;
  // Receiving Direct Lines
  recipientPhoneNumber?: string;
  recipientName?: string;
  recipientNetwork?: 'MTN' | 'AIRTEL';
  recipientType?: 'SELLER_DIRECT' | 'PLATFORM_MERCHANT';
}

export interface NotificationAction {
  label: string;
  actionKey: 'reply' | 'accept_offer' | 'decline_offer' | 'view_listing' | 'boost';
  style?: 'primary' | 'secondary' | 'danger';
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'message' | 'offer' | 'payment' | 'system' | 'boost';
  timestamp: string;
  read: boolean;
  conversationId?: string;
  listingId?: string;
  offerAmount?: number;
  senderName?: string;
  actions?: NotificationAction[];
}

export interface UserPurchase {
  id: string;
  listingId?: string;
  title: string;
  category: CategoryId;
  price: number;
  sellerName: string;
  sellerPhone: string;
  sellerAvatar?: string;
  district: string;
  purchaseDate: string;
  paymentMethod: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CASH';
  referenceNumber: string;
  status: 'DELIVERED' | 'COMPLETED' | 'CONFIRMED';
  image: string;
}
