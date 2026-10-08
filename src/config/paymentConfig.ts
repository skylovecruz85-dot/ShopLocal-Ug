// PRIME SANITARY CENTRE - PAYMENT & ADMIN SETTINGS
export const PAYMENT_CONFIG = {
  businessName: "Prime Sanitary Centre",
  mtnMomo: "0765326279",
  mtnName: "VIOLA BABIRYE NAMULI",
  airtelMoney: "0754687918",
  airtelName: "MUSA KINTU",
  tillNumber: "", // Leave empty until you get your own Till from Airtel
  adminPhone: "0754687918", // Where you receive admin alerts
  adminAccount: "Prime Sanitary Centre"
};

export const ADMIN_CONFIG = {
  ownerNumber: "0765326279",
  ownerAirtel: "0754687918",
  loginEmail: "prime sanitary centre account", // change to your Gmail you use to login
  businessName: "Prime Sanitary Centre"
};

export function getCheckoutMessage(network: 'MTN' | 'Airtel' | string, amount: number, phone: string) {
  if (network === 'MTN' || network === 'mtn') {
    return `Send UGX ${amount.toLocaleString()} to MTN: ${PAYMENT_CONFIG.mtnMomo} (${PAYMENT_CONFIG.businessName})\n\nThen enter Transaction ID to confirm`;
  } else {
    return `Airtel Push will be sent to ${phone}\n\nPay to: Airtel ${PAYMENT_CONFIG.airtelMoney} - ${PAYMENT_CONFIG.businessName}\nAmount: UGX ${amount.toLocaleString()}`;
  }
}

/**
 * Returns true if the given user is the Prime Sanitary Centre owner.
 */
export function isOwnerUser(user?: { id?: string; phone?: string; email?: string; businessName?: string } | null): boolean {
  if (!user) return false;
  const cleanPhone = (user.phone || '').replace(/\D/g, '');
  const ownerMtn = PAYMENT_CONFIG.mtnMomo.replace(/\D/g, '');
  const ownerAirtel = PAYMENT_CONFIG.airtelMoney.replace(/\D/g, '');

  return (
    user.id === 'usr_me_001' ||
    cleanPhone.endsWith(ownerMtn.slice(-9)) ||
    cleanPhone.endsWith(ownerAirtel.slice(-9)) ||
    (user.email || '').toLowerCase().includes('skylovecruz') ||
    (user.businessName === PAYMENT_CONFIG.businessName)
  );
}

