const paymentEnv = import.meta.env as ImportMetaEnv & {
  VITE_SHOPLOCAL_MTN_NUMBER?: string;
  VITE_SHOPLOCAL_MTN_NAME?: string;
  VITE_SHOPLOCAL_AIRTEL_NUMBER?: string;
  VITE_SHOPLOCAL_AIRTEL_NAME?: string;
};

export const PAYMENT_CONFIG = {
  businessName: 'ShopLocal UG',
  mtnMomo: paymentEnv.VITE_SHOPLOCAL_MTN_NUMBER?.trim() ?? '',
  mtnName: paymentEnv.VITE_SHOPLOCAL_MTN_NAME?.trim() ?? '',
  airtelMoney: paymentEnv.VITE_SHOPLOCAL_AIRTEL_NUMBER?.trim() ?? '',
  airtelName: paymentEnv.VITE_SHOPLOCAL_AIRTEL_NAME?.trim() ?? '',
  tillNumber: '',
  adminPhone: '',
  adminAccount: 'ShopLocal UG',
};

export const ADMIN_CONFIG = {
  ownerNumber: '',
  ownerAirtel: '',
  loginEmail: 'demo@example.com',
  businessName: 'ShopLocal UG',
};

export function getCheckoutMessage(network: string, amount: number) {
  return `Demo checkout preview for UGX ${amount.toLocaleString()} using ${network}. No carrier request was sent and no funds moved.`;
}

export function isOwnerUser(user?: { id?: string } | null): boolean {
  return user?.id === 'usr_me_001';
}

