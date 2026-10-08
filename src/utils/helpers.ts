/**
 * General helper utilities for ShopLocal Ug
 */

// Format Ugandan Shillings with commas and UGX prefix
export function formatUGX(amount: number, isNegotiable?: boolean): string {
  if (isNaN(amount) || amount === undefined || amount === null) return 'UGX 0';
  const formatted = 'UGX ' + Number(amount).toLocaleString('en-US');
  if (isNegotiable) {
    return `${formatted} • Negotiable`;
  }
  return formatted;
}

// Relative time formatter (e.g. "Just now", "20m ago", "2h ago", "1d ago", "3d ago")
export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 5) return `${diffInWeeks}w ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

// Detect telecom operator by Ugandan phone number prefix
export function detectUgandanCarrier(phoneNumber: string): 'MTN' | 'AIRTEL' | 'OTHER' {
  // Strip non-digits
  const clean = phoneNumber.replace(/\D/g, '');
  // Format check: 077, 078, 076, 25677, 25678, 25676 -> MTN
  // 070, 075, 074, 25670, 25675, 25674 -> Airtel
  let prefix = '';
  if (clean.startsWith('256')) {
    prefix = clean.substring(3, 5);
  } else if (clean.startsWith('0')) {
    prefix = clean.substring(1, 3);
  } else {
    prefix = clean.substring(0, 2);
  }

  if (['77', '78', '76'].includes(prefix)) {
    return 'MTN';
  }
  if (['70', '75', '74'].includes(prefix)) {
    return 'AIRTEL';
  }
  return 'OTHER';
}

// Generate transaction reference
export function generateUgTxRef(method: 'MTN_MOMO' | 'AIRTEL_MONEY'): string {
  const code = method === 'MTN_MOMO' ? 'MTN' : 'AIR';
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `UG-${code}-${random}`;
}
