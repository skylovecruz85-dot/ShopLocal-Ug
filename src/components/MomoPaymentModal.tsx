import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Smartphone, X, Zap } from 'lucide-react';
import { PaymentPurpose, PaymentTransaction } from '../types';
import { formatUGX } from '../utils/helpers';

interface MomoPaymentModalProps {
  amount: number;
  purpose: PaymentPurpose;
  itemTitle?: string;
  listingId?: string;
  sellerName?: string;
  onClose: () => void;
  onSuccess: (transaction: PaymentTransaction) => void;
  darkMode?: boolean;
}

type PaymentStep = 'input' | 'processing' | 'success';

const getPurposeLabel = (purpose: PaymentPurpose) => {
  switch (purpose) {
    case 'BOOST_LISTING': return 'Listing Featured Boost';
    case 'PACKAGE_WEEKLY': return 'Weekly Seller Pack (22 Ads)';
    case 'PACKAGE_MONTHLY': return 'Monthly Seller Pack (40 Ads)';
    case 'PACKAGE_UNLIMITED': return 'PRO Unlimited Seller Pack';
    case 'PRO_SUBSCRIPTION': return 'ShopLocal PRO Membership';
    case 'ESCROW_PURCHASE': return 'Direct Secure Escrow Checkout';
    default: return 'Marketplace Checkout';
  }
};

export const MomoPaymentModal: React.FC<MomoPaymentModalProps> = ({
  amount,
  purpose,
  itemTitle,
  listingId,
  sellerName,
  onClose,
  onSuccess,
  darkMode = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<PaymentStep>('input');
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirectToSeller = purpose === 'ESCROW_PURCHASE' && Boolean(sellerName);
  const recipientName = isDirectToSeller ? sellerName : 'ShopLocal UG (via Pesapal)';

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError('');
  };

  const handlePesapalCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const digits = phoneNumber.replace(/\D/g, '');
    const nationalNumber = digits.startsWith('256')
      ? digits.slice(3)
      : digits.startsWith('0')
        ? digits.slice(1)
        : digits;

    if (!/^7\d{8}$/.test(nationalNumber)) {
      setPhoneError('Please enter a valid 9-digit Ugandan mobile number (e.g. 0772 123 456).');
      return;
    }

    setPhoneError('');
    setPaymentError('');
    setIsSubmitting(true);
    setStep('processing');

    const formattedPhone = `256${nationalNumber}`;

    try {
      const response = await fetch('/api/payments/pesapal', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'UGX',
          description: itemTitle ? `${getPurposeLabel(purpose)} - ${itemTitle}` : getPurposeLabel(purpose),
          phoneNumber: formattedPhone,
          email: email.trim() || undefined,
          purpose,
          listingId,
        }),
      });

      const payload = await response.json() as {
        data?: {
          redirectUrl: string;
          merchantReference: string;
          orderTrackingId: string;
          isDemo?: boolean;
        };
        error?: string;
      };

      if (!response.ok || !payload.data?.redirectUrl) {
        throw new Error(payload.error || 'Pesapal checkout could not be created.');
      }

      if (payload.data.isDemo) {
        // Instant simulated demo payment for testing in dev environments
        const tx: PaymentTransaction = {
          id: payload.data.orderTrackingId,
          reference: payload.data.merchantReference,
          method: 'MTN_MOMO',
          phoneNumber: `+256 ${nationalNumber.slice(0, 3)} *** ${nationalNumber.slice(-3)}`,
          amount,
          purpose,
          status: 'COMPLETED',
          date: new Date().toISOString(),
          itemTitle,
          listingId,
          recipientName,
          recipientNetwork: 'MTN',
          recipientType: isDirectToSeller ? 'SELLER_DIRECT' : 'PLATFORM_MERCHANT',
        };
        setCompletedTx(tx);
        setStep('success');
        onSuccess(tx);
      } else {
        // Redirect to live Pesapal payment portal
        window.location.assign(payload.data.redirectUrl);
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Unable to reach Pesapal checkout.');
      setStep('input');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemo = () => {
    const digits = (phoneNumber.replace(/\D/g, '') || '772123456').slice(-9);
    const tx: PaymentTransaction = {
      id: `pesapal_${Date.now()}`,
      reference: `UG-PESAPAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      method: 'MTN_MOMO',
      phoneNumber: `+256 ${digits.slice(0, 3)} *** ${digits.slice(-3)}`,
      amount,
      purpose,
      status: 'COMPLETED',
      date: new Date().toISOString(),
      itemTitle,
      listingId,
      recipientName,
      recipientNetwork: 'MTN',
      recipientType: isDirectToSeller ? 'SELLER_DIRECT' : 'PLATFORM_MERCHANT',
    };
    setCompletedTx(tx);
    setStep('success');
    onSuccess(tx);
  };

  const panelClass = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900';
  const secondaryTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const controlClass = darkMode
    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
    : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm animate-in fade-in">
      <section
        aria-labelledby="payment-checkout-title"
        aria-modal="true"
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className={`flex items-center justify-between border-b px-5 py-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <button
              aria-label="Back to marketplace"
              className={`rounded-xl p-2 transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={onClose}
              type="button"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold" id="payment-checkout-title">Pesapal Checkout</h2>
              <p className={`text-[11px] ${secondaryTextClass}`}>MTN, Airtel &amp; Cards Accepted</p>
            </div>
          </div>
          <button
            aria-label="Close checkout"
            className={`rounded-lg p-2 transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </header>

        {step === 'input' && (
          <form className="space-y-4 p-5" onSubmit={handlePesapalCheckout}>
            <div className={`rounded-2xl border p-4 text-center ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
              <span className={`block text-[11px] font-bold uppercase tracking-wider ${secondaryTextClass}`}>{getPurposeLabel(purpose)}</span>
              <strong className="mt-1 block font-display text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatUGX(amount)}</strong>
              {itemTitle && <span className={`mt-1 block truncate text-xs ${secondaryTextClass}`}>{itemTitle}</span>}
            </div>

            {/* Supported payment methods badges */}
            <div className={`rounded-2xl border p-3 ${darkMode ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-2 text-center ${secondaryTextClass}`}>
                All Ugandan Payment Methods Supported on Pesapal
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-2">
                  <span className="block text-[11px] font-extrabold text-amber-900 dark:text-amber-300">MTN MoMo</span>
                  <span className="text-[9px] text-amber-700 dark:text-amber-400">Direct prompt</span>
                </div>
                <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-2">
                  <span className="block text-[11px] font-extrabold text-red-900 dark:text-red-300">Airtel Money</span>
                  <span className="text-[9px] text-red-700 dark:text-red-400">Direct prompt</span>
                </div>
                <div className="rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-2">
                  <span className="block text-[11px] font-extrabold text-blue-900 dark:text-blue-300">Visa / MC</span>
                  <span className="text-[9px] text-blue-700 dark:text-blue-400">Debit / Credit</span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold" htmlFor="payment-phone-number">
                Ugandan Mobile Number
              </label>
              <input
                aria-describedby={phoneError ? 'payment-phone-error' : undefined}
                aria-invalid={Boolean(phoneError)}
                autoComplete="tel"
                className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${controlClass}`}
                id="payment-phone-number"
                inputMode="tel"
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0772 000 000 or 0700 000 000"
                type="tel"
                value={phoneNumber}
                required
              />
              {phoneError && <p className="mt-1 text-xs text-red-500" id="payment-phone-error">{phoneError}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold" htmlFor="payment-email">
                Email Address (For Pesapal e-receipt)
              </label>
              <input
                autoComplete="email"
                className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${controlClass}`}
                id="payment-email"
                inputMode="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@example.com (optional)"
                type="email"
                value={email}
              />
            </div>

            {paymentError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200">
                {paymentError}
              </div>
            )}

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              Pay {formatUGX(amount)} with Pesapal <ArrowRight className="size-4" />
            </button>

            {/* Instant Demo Sandbox Shortcut */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleInstantDemo}
                className={`text-xs font-semibold underline underline-offset-4 transition-colors ${darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                Instant Demo Payment (Test Simulation)
              </button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div aria-live="polite" className="space-y-4 p-8 text-center">
            <div className="mx-auto size-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <h3 className="font-display text-base font-extrabold">Connecting to Pesapal...</h3>
            <p className={`mx-auto max-w-xs text-xs leading-relaxed ${secondaryTextClass}`}>
              Redirecting to secure Ugandan checkout portal. Please complete your payment prompt.
            </p>
          </div>
        )}

        {step === 'success' && completedTx && (
          <div aria-live="polite" className="space-y-5 p-6 text-center animate-in zoom-in-95">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                Verified
              </span>
              <h3 className="mt-2 font-display text-xl font-extrabold">Payment Confirmed</h3>
              <p className={`mt-1 text-xs leading-relaxed ${secondaryTextClass}`}>
                Your {getPurposeLabel(purpose)} has been successfully activated.
              </p>
            </div>

            <div className={`space-y-2 rounded-2xl border p-4 text-left text-xs ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Pesapal Reference</span><span className="font-mono font-bold">{completedTx.reference}</span></div>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Amount Paid</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{formatUGX(completedTx.amount)}</span></div>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Method</span><span className="font-semibold">Pesapal Gateway</span></div>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Date</span><span>{new Date(completedTx.date).toLocaleDateString('en-GB')}</span></div>
            </div>

            <button
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              onClick={onClose}
              type="button"
            >
              Return to Marketplace
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
