export const PAYMENT_CONFIG = {
  businessName: 'ShopLocal UG Demo',
  mtnMomo: '',
  mtnName: '',
  airtelMoney: '',
  airtelName: '',
  tillNumber: '',
  adminPhone: '',
  adminAccount: 'ShopLocal UG Demo',
};

export const ADMIN_CONFIG = {
  ownerNumber: '',
  ownerAirtel: '',
  loginEmail: 'demo@example.com',
  businessName: 'ShopLocal UG Demo',
};

export function getCheckoutMessage(network: string, amount: number) {
  return `Demo checkout preview for UGX ${amount.toLocaleString()} using ${network}. No carrier request was sent and no funds moved.`;
}

export function isOwnerUser(user?: { id?: string } | null): boolean {
  return user?.id === 'usr_me_001';
}

