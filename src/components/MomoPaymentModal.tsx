import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Smartphone, X } from 'lucide-react';
import { PaymentMethod, PaymentPurpose, PaymentTransaction } from '../types';
import { detectUgandanCarrier, formatUGX, generateUgTxRef } from '../utils/helpers';

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

type PaymentStep = 'input' | 'confirmation' | 'processing' | 'success';

const getPurposeLabel = (purpose: PaymentPurpose) => {
  switch (purpose) {
    case 'BOOST_LISTING': return 'Listing boost preview';
    case 'PACKAGE_WEEKLY': return 'Weekly seller pack preview';
    case 'PACKAGE_MONTHLY': return 'Monthly seller pack preview';
    case 'PACKAGE_UNLIMITED': return 'Unlimited seller pack preview';
    case 'PRO_SUBSCRIPTION': return 'PRO membership preview';
    case 'ESCROW_PURCHASE': return 'Buyer checkout preview';
    default: return 'Marketplace checkout preview';
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<PaymentStep>('input');
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const timeoutRef = useRef<number | null>(null);

  const isDirectToSeller = purpose === 'ESCROW_PURCHASE' && Boolean(sellerName);
  const recipientName = isDirectToSeller ? sellerName : 'ShopLocal UG demo';

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError('');
    const carrier = detectUgandanCarrier(value);
    if (carrier === 'MTN') setSelectedMethod('MTN_MOMO');
    if (carrier === 'AIRTEL') setSelectedMethod('AIRTEL_MONEY');
  };

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = phoneNumber.replace(/\D/g, '');
    const nationalNumber = digits.startsWith('256')
      ? digits.slice(3)
      : digits.startsWith('0')
        ? digits.slice(1)
        : digits;

    if (!/^7\d{8}$/.test(nationalNumber)) {
      setPhoneError('Enter a 9-digit Ugandan mobile number, for example 0772 000 000.');
      return;
    }

    setPhoneError('');
    setStep('confirmation');
  };

  const handleSimulateSuccess = () => {
    setStep('processing');
    timeoutRef.current = window.setTimeout(() => {
      const digits = phoneNumber.replace(/\D/g, '');
      const transaction: PaymentTransaction = {
        id: `demo_tx_${Date.now()}`,
        reference: `DEMO-${generateUgTxRef(selectedMethod)}`,
        method: selectedMethod,
        phoneNumber: `Test number ending ${digits.slice(-4)}`,
        amount,
        purpose,
        status: 'COMPLETED',
        isDemo: true,
        date: new Date().toISOString(),
        itemTitle,
        listingId,
        recipientName,
        recipientNetwork: selectedMethod === 'MTN_MOMO' ? 'MTN' : 'AIRTEL',
        recipientType: isDirectToSeller ? 'SELLER_DIRECT' : 'PLATFORM_MERCHANT',
      };

      setCompletedTx(transaction);
      setStep('success');
      onSuccess(transaction);
    }, 650);
  };

  const panelClass = darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900';
  const secondaryTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const controlClass = darkMode
    ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500'
    : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm">
      <section
        aria-labelledby="demo-checkout-title"
        aria-modal="true"
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${panelClass}`}
        onClick={(event) => event.stopPropagation()}
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
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold" id="demo-checkout-title">Demo checkout</h2>
              <p className={`text-[11px] ${secondaryTextClass}`}>Preview only · no live payment</p>
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
          <form className="space-y-5 p-5" onSubmit={handleContinue}>
            <div className={`rounded-2xl border p-4 text-center ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
              <span className={`block text-[11px] font-bold uppercase tracking-wider ${secondaryTextClass}`}>{getPurposeLabel(purpose)}</span>
              <strong className="mt-1 block font-display text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatUGX(amount)}</strong>
              {itemTitle && <span className={`mt-1 block truncate text-xs ${secondaryTextClass}`}>{itemTitle}</span>}
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="note">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p><strong>Interactive demo only.</strong> No request is sent to MTN or Airtel, no PIN is requested, and no money moves.</p>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider">Preview a mobile money network</legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  aria-pressed={selectedMethod === 'MTN_MOMO'}
                  className={`rounded-2xl border-2 p-3 text-center transition-colors ${selectedMethod === 'MTN_MOMO' ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' : darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                  onClick={() => setSelectedMethod('MTN_MOMO')}
                  type="button"
                >
                  <span className="mx-auto mb-1 flex size-8 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950">MTN</span>
                  <span className="block text-xs font-bold">MTN MoMo</span>
                  <span className={`block text-[10px] ${secondaryTextClass}`}>Demo selection</span>
                </button>
                <button
                  aria-pressed={selectedMethod === 'AIRTEL_MONEY'}
                  className={`rounded-2xl border-2 p-3 text-center transition-colors ${selectedMethod === 'AIRTEL_MONEY' ? 'border-red-400 bg-red-50 dark:bg-red-950/30' : darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                  onClick={() => setSelectedMethod('AIRTEL_MONEY')}
                  type="button"
                >
                  <span className="mx-auto mb-1 flex size-8 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">AIR</span>
                  <span className="block text-xs font-bold">Airtel Money</span>
                  <span className={`block text-[10px] ${secondaryTextClass}`}>Demo selection</span>
                </button>
              </div>
            </fieldset>

            <div>
              <label className="mb-1.5 block text-xs font-bold" htmlFor="demo-phone-number">Test mobile number</label>
              <input
                aria-describedby={phoneError ? 'demo-phone-error' : 'demo-phone-help'}
                aria-invalid={Boolean(phoneError)}
                autoComplete="off"
                className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${controlClass}`}
                id="demo-phone-number"
                inputMode="tel"
                onChange={(event) => handlePhoneChange(event.target.value)}
                placeholder="0772 000 000"
                type="tel"
                value={phoneNumber}
              />
              <p className={`mt-1 text-[11px] ${phoneError ? 'text-red-500' : secondaryTextClass}`} id={phoneError ? 'demo-phone-error' : 'demo-phone-help'}>
                {phoneError || 'Use a test number. It is used only in this preview and is not saved.'}
              </p>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700" type="submit">
              Continue to demo confirmation <ArrowRight className="size-4" />
            </button>
          </form>
        )}

        {step === 'confirmation' && (
          <div className="space-y-5 p-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Smartphone className="size-6" />
              </div>
              <h3 className="font-display text-lg font-extrabold">Preview confirmation</h3>
              <p className={`mt-1 text-sm ${secondaryTextClass}`}>Selected network: {selectedMethod === 'MTN_MOMO' ? 'MTN MoMo' : 'Airtel Money'}</p>
            </div>

            <div className={`rounded-2xl border p-4 text-sm ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Demo amount</span><strong>{formatUGX(amount)}</strong></div>
              <div className="mt-2 flex justify-between gap-3"><span className={secondaryTextClass}>Demo recipient</span><strong className="text-right">{recipientName}</strong></div>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="note">
              No telecom prompt was sent. Never enter or share a real mobile money PIN in this demo.
            </div>

            <div className="flex gap-2">
              <button className={`flex-1 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => setStep('input')} type="button">Back</button>
              <button className="flex-1 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700" onClick={handleSimulateSuccess} type="button">Simulate success</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div aria-live="polite" className="space-y-4 p-8 text-center">
            <div className="mx-auto size-11 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <h3 className="font-display text-base font-extrabold">Preparing demo receipt</h3>
            <p className={`mx-auto max-w-xs text-xs leading-relaxed ${secondaryTextClass}`}>This short animation is local to the demo. No carrier or payment service is contacted.</p>
          </div>
        )}

        {step === 'success' && completedTx && (
          <div aria-live="polite" className="space-y-5 p-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:bg-amber-950 dark:text-amber-200">Demo only</span>
              <h3 className="mt-2 font-display text-xl font-extrabold">Payment simulated</h3>
              <p className={`mt-1 text-xs leading-relaxed ${secondaryTextClass}`}>No payment was initiated, no funds moved, and this screen is not proof of payment.</p>
            </div>

            <div className={`space-y-2 rounded-2xl border p-4 text-left text-xs ${darkMode ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Demo reference</span><span className="font-mono font-bold">{completedTx.reference}</span></div>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Displayed amount</span><span className="font-bold">{formatUGX(completedTx.amount)}</span></div>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Network preview</span><span className="font-semibold">{completedTx.method === 'MTN_MOMO' ? 'MTN MoMo' : 'Airtel Money'}</span></div>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Result</span><span className="font-bold text-amber-700 dark:text-amber-300">Not paid — simulated</span></div>
              <div className="flex justify-between gap-3"><span className={secondaryTextClass}>Created</span><span>{new Date(completedTx.date).toLocaleString('en-GB')}</span></div>
            </div>

            <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700" onClick={onClose} type="button">Return to marketplace</button>
          </div>
        )}
      </section>
    </div>
  );
};
