import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BoostOrder } from '../types';
import { PAYMENT_CONFIG } from '../config/paymentConfig';

interface ManualBoostPaymentModalProps {
  amount: 9500 | 21500 | 28550 | number;
  planName: '7 days' | '30 days' | 'Boost Premium';
  adTitle: string;
  userPhone: string;
  listingId?: string;
  onClose: () => void;
  onSubmitOrder: (order: BoostOrder) => void;
  darkMode?: boolean;
}

export const ManualBoostPaymentModal: React.FC<ManualBoostPaymentModalProps> = ({
  amount,
  planName,
  adTitle,
  userPhone,
  listingId,
  onClose,
  onSubmitOrder,
  darkMode,
}) => {
  const [networkTab, setNetworkTab] = useState<'MTN' | 'Airtel'>('MTN');
  const [networkDropdown, setNetworkDropdown] = useState<'MTN' | 'Airtel'>('MTN');
  const [payerPhone, setPayerPhone] = useState(userPhone || '07');
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mtnRecipientPhone = PAYMENT_CONFIG.mtnMomo;
  const mtnRecipientName = PAYMENT_CONFIG.mtnName;
  const airtelRecipientPhone = PAYMENT_CONFIG.airtelMoney;
  const airtelRecipientName = PAYMENT_CONFIG.airtelName;

  const handleCopyPhone = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = payerPhone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg('Please enter the full phone number used to make the payment (07...).');
      return;
    }

    if (!txnId.trim()) {
      setErrorMsg('Please enter the Transaction ID received from telecom SMS.');
      return;
    }

    const newOrder: BoostOrder = {
      id: 'boost_ord_' + Date.now(),
      adTitle: adTitle || 'Ad Promotion',
      userPhone: cleanPhone,
      plan: planName,
      amount,
      network: networkDropdown,
      payerNumber: cleanPhone,
      txnId: txnId.trim(),
      screenshot: screenshot || undefined,
      time: new Date().toISOString(),
      status: 'Pending',
      listingId,
    };

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setSubmitted(true);
    onSubmitOrder(newOrder);
  };

  const currentNumber = networkTab === 'MTN' ? mtnRecipientPhone : airtelRecipientPhone;
  const currentName = networkTab === 'MTN' ? mtnRecipientName : airtelRecipientName;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-800 bg-[#121212] text-white flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2A2A] bg-[#181818] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {!submitted && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 -ml-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-[16px] text-white leading-tight">
                Pay to Boost Your Ad
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[280px]">
                {adTitle || 'ShopLocal Ug Verified Ad'} • <strong className="text-[#00E676]">{planName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submitted ? (
          /* User Success Screen: Payment received! We are verifying... */
          <div className="p-6 sm:p-8 text-center space-y-4 bg-[#121212]">
            <div className="w-16 h-16 rounded-full bg-[#00E676]/15 border-2 border-[#00E676] flex items-center justify-center mx-auto text-[#00E676]">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-extrabold text-white">
                Payment Received!
              </h4>
              <p className="text-[13px] text-zinc-300 leading-relaxed font-medium">
                Payment received! We are verifying. Your ad will be <span className="text-[#00E676] font-bold">TOP within 5 minutes</span>. You will get SMS.
              </p>
            </div>

            <div className="bg-[#1C1C1C] rounded-xl p-3.5 border border-[#2A2A2A] text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Ad:</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{adTitle}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Plan:</span>
                <span className="text-[#00E676] font-bold">{planName} (USh {amount.toLocaleString()})</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Network:</span>
                <span className="text-white">{networkDropdown}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>TXN ID:</span>
                <span className="text-white font-bold">{txnId}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Status:</span>
                <span className="text-amber-400 font-bold uppercase">PENDING PAYMENT</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full h-[48px] rounded-lg bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-sm transition-all cursor-pointer shadow-md"
              >
                Done / View My Ads
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Network Tabs: [ MTN MoMo ] [ Airtel Money ] */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Choose Network
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#1C1C1C] p-1 rounded-xl border border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => {
                    setNetworkTab('MTN');
                    setNetworkDropdown('MTN');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    networkTab === 'MTN'
                      ? 'bg-[#FFCC00] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black/60"></span>
                  <span>MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNetworkTab('Airtel');
                    setNetworkDropdown('Airtel');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    networkTab === 'Airtel'
                      ? 'bg-[#E60000] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                  <span>Airtel Money</span>
                </button>
              </div>
            </div>

            {/* Instruction Card */}
            <div className={`p-4 rounded-xl border ${
              networkTab === 'MTN'
                ? 'bg-[#1D2115] border-[#FFCC00]/40 text-zinc-100'
                : 'bg-[#251515] border-[#E60000]/40 text-zinc-100'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                <span className="text-xs font-bold text-white">
                  Pay USh {amount.toLocaleString()} to boost
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-black/40 text-white font-mono">
                  {networkTab === 'MTN' ? '*165#' : '*185#'}
                </span>
              </div>

              {networkTab === 'MTN' ? (
                <ol className="text-xs space-y-1.5 text-zinc-200">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FFCC00]">1.</span>
                    <span>Dial <strong>*165#</strong> &gt; Send Money</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FFCC00]">2.</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Send USh <strong>{amount.toLocaleString()}</strong> to</span>
                      <span className="font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded text-[13px]">
                        0765326279
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone('0765326279')}
                        className="text-[11px] text-[#FFCC00] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedNumber ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FFCC00]">3.</span>
                    <span>Name will show as: <strong className="text-white">VIOLA BABIRYE NAMULI</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FFCC00]">4.</span>
                    <span className="text-zinc-400">Enter details below after paying</span>
                  </li>
                </ol>
              ) : (
                <ol className="text-xs space-y-1.5 text-zinc-200">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FF5252]">1.</span>
                    <span>Dial <strong>*185#</strong> &gt; Send Money</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FF5252]">2.</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Send USh <strong>{amount.toLocaleString()}</strong> to</span>
                      <span className="font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded text-[13px]">
                        0754687918
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone('0754687918')}
                        className="text-[11px] text-[#FF5252] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedNumber ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FF5252]">3.</span>
                    <span>Name will show as: <strong className="text-white">MUSA KINTU</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#FF5252]">4.</span>
                    <span className="text-zinc-400">Enter details below after paying</span>
                  </li>
                </ol>
              )}
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Verification Inputs */}
            <div className="space-y-3 pt-1">
              {/* Dropdown: Network Used */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Network Used *
                </label>
                <select
                  value={networkDropdown}
                  onChange={(e) => {
                    const val = e.target.value as 'MTN' | 'Airtel';
                    setNetworkDropdown(val);
                    setNetworkTab(val);
                  }}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#00E676]"
                >
                  <option value="MTN">MTN MoMo</option>
                  <option value="Airtel">Airtel Money</option>
                </select>
              </div>

              {/* Phone number used to pay */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Phone number used to pay (07...) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0772 123 456"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-hidden focus:border-[#00E676]"
                />
              </div>

              {/* Transaction ID from SMS */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Transaction ID from SMS (e.g. 1234567890) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1928482012 or MP240108..."
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-hidden focus:border-[#00E676]"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Copy from the telecom SMS message received after sending money.
                </span>
              </div>

              {/* Upload SMS screenshot */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Upload SMS screenshot (Optional but speeds up approval)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border border-dashed border-[#2A2A2A] hover:border-[#00E676] bg-[#1C1C1C] rounded-lg p-2.5 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs text-zinc-300">
                    <Upload className="w-4 h-4 text-[#00E676]" />
                    <span>{screenshot ? 'Replace Screenshot' : 'Upload SMS screenshot'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                  {screenshot && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#00E676] shrink-0">
                      <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full h-[50px] rounded-lg bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-[14px] flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                I have paid USh {amount.toLocaleString()}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
