import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft,
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, PaymentTransaction, PaymentPurpose } from '../types';
import { formatUGX, detectUgandanCarrier, generateUgTxRef } from '../utils/helpers';
import { PAYMENT_CONFIG, getCheckoutMessage } from '../config/paymentConfig';

interface MomoPaymentModalProps {
  amount: number;
  purpose: PaymentPurpose;
  itemTitle?: string;
  listingId?: string;
  sellerName?: string;
  sellerMtnLine?: string;
  sellerAirtelLine?: string;
  onClose: () => void;
  onSuccess: (transaction: PaymentTransaction) => void;
  darkMode?: boolean;
}

type PaymentStep = 'input' | 'push_prompt' | 'processing' | 'success';

export const MomoPaymentModal: React.FC<MomoPaymentModalProps> = ({
  amount,
  purpose,
  itemTitle,
  listingId,
  sellerName,
  sellerMtnLine,
  sellerAirtelLine,
  onClose,
  onSuccess,
  darkMode,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('0772 849 201');
  const [step, setStep] = useState<PaymentStep>('input');
  const [pin, setPin] = useState('');
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  // Determine recipient receiving line
  const isDirectToSeller = purpose === 'ESCROW_PURCHASE' && Boolean(sellerName);
  const recipientName = isDirectToSeller ? sellerName : PAYMENT_CONFIG.businessName;
  const recipientLine = isDirectToSeller
    ? (selectedMethod === 'MTN_MOMO' ? (sellerMtnLine || PAYMENT_CONFIG.mtnMomo) : (sellerAirtelLine || PAYMENT_CONFIG.airtelMoney))
    : (selectedMethod === 'MTN_MOMO' ? `${PAYMENT_CONFIG.mtnMomo} (${PAYMENT_CONFIG.businessName})` : `${PAYMENT_CONFIG.airtelMoney} (${PAYMENT_CONFIG.businessName})`);

  const getPurposeLabel = (p: PaymentPurpose) => {
    switch (p) {
      case 'BOOST_LISTING': return 'Weekly Ad Boost (UGX 10k)';
      case 'PACKAGE_WEEKLY': return 'Weekly Seller Pack (22 Ads - UGX 18k)';
      case 'PACKAGE_MONTHLY': return 'Monthly Growth Pack (40 Ads - UGX 30k)';
      case 'PACKAGE_UNLIMITED': return 'Lifetime Unlimited Pass (UGX 65k)';
      case 'PRO_SUBSCRIPTION': return 'Lifetime PRO Merchant Pass (UGX 65k)';
      case 'ESCROW_PURCHASE': return 'Direct Purchase to Seller Line';
      default: return 'Marketplace Purchase';
    }
  };

  // Auto detect operator on typing
  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const carrier = detectUgandanCarrier(val);
    if (carrier === 'MTN') setSelectedMethod('MTN_MOMO');
    if (carrier === 'AIRTEL') setSelectedMethod('AIRTEL_MONEY');
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 9) {
      alert('Please enter a valid Ugandan phone number (e.g. 077... or 070...)');
      return;
    }
    // Simulate carrier USSD Push prompt to phone
    setStep('push_prompt');
  };

  const handleAuthorizePin = () => {
    setStep('processing');
    setTimeout(() => {
      const tx: PaymentTransaction = {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        reference: generateUgTxRef(selectedMethod),
        method: selectedMethod,
        phoneNumber,
        amount,
        purpose,
        status: 'COMPLETED',
        date: new Date().toISOString(),
        itemTitle,
        listingId,
        recipientPhoneNumber: recipientLine,
        recipientName,
        recipientNetwork: selectedMethod === 'MTN_MOMO' ? 'MTN' : 'AIRTEL',
        recipientType: isDirectToSeller ? 'SELLER_DIRECT' : 'PLATFORM_MERCHANT',
      };

      setCompletedTx(tx);
      setStep('success');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      onSuccess(tx);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Back Arrow */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-100 bg-white text-slate-900'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base">
                Uganda Mobile Money Checkout
              </h3>
              <p className="text-[11px] text-slate-400">Direct Telecom Payouts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Phone & Provider Selection */}
        {step === 'input' && (
          <form onSubmit={handleInitiatePayment} className="p-6 space-y-4">
            {/* Amount Summary */}
            <div className={`p-4 rounded-2xl border text-center ${
              darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {getPurposeLabel(purpose)}
              </span>
              <span className="font-display font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {formatUGX(amount)}
              </span>
              {itemTitle && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-300 truncate block mt-1">
                  Item: {itemTitle}
                </span>
              )}

              {/* Direct Payout Line Indicator */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Crediting Directly: <strong>{recipientName}</strong> ({recipientLine})</span>
              </div>
            </div>

            {/* Provider Tabs: MTN MoMo vs Airtel Money */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Mobile Money Network
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* MTN MoMo */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('MTN_MOMO')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    selectedMethod === 'MTN_MOMO'
                      ? 'border-[#FFCC00] bg-[#FFF9E6] shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FFCC00] text-slate-900 flex items-center justify-center font-black text-xs shadow-xs mb-1">
                    MTN
                  </div>
                  <span className="text-xs font-bold text-slate-900">MTN MoMo</span>
                  <span className="text-[10px] text-slate-500">*165# USSD</span>
                </button>

                {/* Airtel Money */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('AIRTEL_MONEY')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    selectedMethod === 'AIRTEL_MONEY'
                      ? 'border-[#E50000] bg-[#FFF0F0] shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#E50000] text-white flex items-center justify-center font-black text-xs shadow-xs mb-1">
                    AIR
                  </div>
                  <span className="text-xs font-bold text-slate-900">Airtel Money</span>
                  <span className="text-[10px] text-slate-500">*185# USSD</span>
                </button>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Mobile Money Number
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="077... / 078... or 070... / 075..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                You will receive a prompt on your phone to confirm with your PIN.
              </p>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedMethod === 'MTN_MOMO'
                  ? 'bg-[#FFCC00] hover:bg-[#F0B800] text-slate-950 shadow-amber-400/20'
                  : 'bg-[#E50000] hover:bg-[#C90000] text-white shadow-red-500/20'
              }`}
            >
              <span>Send Payment Prompt to Phone</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: USSD Push Phone Prompt Simulation */}
        {step === 'push_prompt' && (
          <div className="p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-800 mb-1">
                <Smartphone className="w-6 h-6 animate-bounce" />
              </div>
              <h4 className="font-display font-bold text-base text-slate-900">
                Check Your Phone Screen
              </h4>
              <p className="text-xs text-slate-500">
                A secure USSD prompt has been sent to <strong>{phoneNumber}</strong>
              </p>
            </div>

            {/* Realistic Telecom Phone Pop-up Simulation */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400">
                <span>{selectedMethod === 'MTN_MOMO' ? 'MTN MoMo *165#' : 'Airtel Money *185#'}</span>
                <span>Push Notice</span>
              </div>

              <p className="text-slate-200 leading-snug">
                Authorize payment of <strong>{formatUGX(amount)}</strong> to <strong>{recipientName}</strong> (Line: <strong className="text-amber-300">{recipientLine}</strong>)?
              </p>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Enter 5-Digit MoMo PIN to authorize:
                </label>
                <input
                  type="password"
                  maxLength={5}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="•••••"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-center text-sm font-bold tracking-widest text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAuthorizePin}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center cursor-pointer transition-colors"
                >
                  Confirm & Authorize
                </button>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted 256-bit Bank Grade Telecom Escrow</span>
            </div>
          </div>
        )}

        {/* STEP 3: Processing State */}
        {step === 'processing' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
            <h4 className="font-bold text-base text-slate-900">
              Confirming Network Authorization...
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Connecting with {selectedMethod === 'MTN_MOMO' ? 'MTN Uganda' : 'Airtel Uganda'} telecom gateway. Please keep this open.
            </p>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && completedTx && (
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDirectToSeller
                  ? `Funds deposited directly to ${recipientName}'s ${selectedMethod === 'MTN_MOMO' ? 'MTN line' : 'Airtel line'}!`
                  : purpose === 'PRO_SUBSCRIPTION'
                    ? 'Your Lifetime PRO Seller Membership is now active!'
                    : 'Payment confirmed! Funds credited directly.'}
              </p>
            </div>

            {/* Direct Telecom SMS notification simulation for seller */}
            {isDirectToSeller && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left font-mono text-[11px] text-amber-950 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-800">
                  <span>📱 Telecom SMS Alert Sent to Seller Handset:</span>
                  <span className="bg-amber-200 px-1.5 py-0.5 rounded text-[9px]">Delivered</span>
                </div>
                <p className="italic bg-white p-2 rounded-xl border border-amber-200">
                  {selectedMethod === 'MTN_MOMO' 
                    ? `Y'ello! UGX ${amount.toLocaleString()} received from ${phoneNumber} for "${itemTitle || 'Marketplace Item'}". TransID: ${completedTx.reference}. New Balance updated on ${recipientLine}.`
                    : `AirtelMoney: Trans ID ${completedTx.reference} Confirmed. You have received UGX ${amount.toLocaleString()} from ${phoneNumber} for "${itemTitle || 'Marketplace Item'}". Direct deposit on line ${recipientLine}.`}
                </p>
              </div>
            )}

            {/* Receipt snippet */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{completedTx.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700">{formatUGX(completedTx.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="font-semibold text-slate-700">
                  {completedTx.method === 'MTN_MOMO' ? 'MTN Mobile Money' : 'Airtel Money'}
                </span>
              </div>
              {completedTx.recipientPhoneNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Credited Directly To:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {completedTx.recipientPhoneNumber} ({completedTx.recipientName})
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{new Date(completedTx.date).toLocaleString('en-GB')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Done & Return to Market
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
