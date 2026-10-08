import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, Upload, X } from 'lucide-react';
import { PAYMENT_CONFIG } from '../config/paymentConfig';

export type BoostPlanName = '7 days' | '30 days' | 'Boost Premium';

export interface ManualBoostPaymentConfig {
  amount: 9500 | 21500 | 28550;
  planName: BoostPlanName;
  adTitle: string;
  listingId: string;
}

export interface ManualBoostSubmission {
  network: 'MTN' | 'Airtel';
  payerNumber: string;
  transactionId: string;
  screenshotDataUrl: string;
}

interface ManualBoostPaymentModalProps {
  config: ManualBoostPaymentConfig;
  isAuthenticated: boolean;
  darkMode?: boolean;
  onClose: () => void;
  onRequestSignIn: () => void;
  onSubmit: (submission: ManualBoostSubmission) => Promise<void>;
}

const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function compressScreenshot(file: File): Promise<File> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Upload a JPG, PNG, or WEBP screenshot.');
  }

  if (file.size <= MAX_SCREENSHOT_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('This image could not be opened. Choose a JPG, PNG, or WEBP screenshot.');
  }

  try {
    const maxDimension = 2000;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('The screenshot could not be prepared. Try another image.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.86, 0.76, 0.66]) {
      const compressed = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality);
      });
      if (compressed && compressed.size <= MAX_SCREENSHOT_BYTES) {
        return new File([compressed], 'payment-screenshot.jpg', { type: 'image/jpeg' });
      }
    }

    throw new Error('The screenshot is too large. Choose a smaller image (maximum 2 MB).');
  } finally {
    bitmap.close();
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  const preparedFile = await compressScreenshot(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The screenshot could not be read. Please choose it again.'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('The screenshot could not be read. Please choose it again.'));
        return;
      }
      resolve(reader.result);
    };
    reader.readAsDataURL(preparedFile);
  });
}

export const ManualBoostPaymentModal: React.FC<ManualBoostPaymentModalProps> = ({
  config,
  isAuthenticated,
  darkMode = false,
  onClose,
  onRequestSignIn,
  onSubmit,
}) => {
  const [network, setNetwork] = useState<'MTN' | 'Airtel'>('MTN');
  const [payerNumber, setPayerNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const amountText = `USh ${config.amount.toLocaleString('en-UG')}`;
  const payeeNumber = network === 'MTN' ? PAYMENT_CONFIG.mtnMomo : PAYMENT_CONFIG.airtelMoney;
  const payeeName = network === 'MTN' ? PAYMENT_CONFIG.mtnName : PAYMENT_CONFIG.airtelName;
  const paymentDestinationConfigured = Boolean(payeeNumber.trim() && payeeName.trim());
  const surface = darkMode ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950';
  const muted = darkMode ? 'text-zinc-400' : 'text-zinc-600';
  const field = darkMode
    ? 'border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-[#00E676]'
    : 'border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-[#00C853]';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!paymentDestinationConfigured) {
      setErrorMessage(`${network} payment details are not configured yet. Do not send money until a verified receiver number is shown.`);
      return;
    }
    if (!isAuthenticated) {
      setErrorMessage('Sign in with a verified phone number before submitting payment details.');
      return;
    }
    if (!screenshot) {
      setErrorMessage('Upload a screenshot of the payment SMS to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const screenshotDataUrl = await fileToDataUrl(screenshot);
      await onSubmit({
        network,
        payerNumber: payerNumber.trim(),
        transactionId: transactionId.trim(),
        screenshotDataUrl,
      });
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'We could not submit the payment details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-boost-title"
        className={`my-auto flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl ${darkMode ? 'border-zinc-800' : 'border-zinc-200'} ${surface}`}
      >
        <header className={`flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">Manual Mobile Money</p>
            <h2 id="manual-boost-title" className="text-lg font-extrabold tracking-tight sm:text-xl">{submitted ? 'Payment details received' : 'Pay to Boost Your Ad'}</h2>
            <p className={`mt-1 text-sm ${muted}`}>{config.adTitle}</p>
          </div>
          {!submitted && (
            <button type="button" onClick={onClose} className={`rounded-full p-2 transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`} aria-label="Close payment details">
              <X aria-hidden="true" />
            </button>
          )}
        </header>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 overflow-y-auto px-6 py-10 text-center sm:py-12">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#00E676]/15 text-emerald-600">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-xl font-extrabold">Proof submitted for review</h3>
              <p className={`mt-2 text-sm leading-6 ${muted}`}>
                Your submission is pending manual review. The app does not initiate the transfer; you pay the displayed mobile-money receiver directly. An admin reviews the transaction before approving your boost.
              </p>
            </div>
            <button type="button" onClick={onClose} className="mt-2 rounded-xl bg-[#00E676] px-6 py-3 text-sm font-extrabold text-black transition-colors hover:bg-[#00C853]">
              Back to Seller Studio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div>
                <p className={`mb-3 text-sm font-semibold ${muted}`}>Choose the network you&apos;re paying with</p>
                <div role="tablist" aria-label="Mobile money network" className={`grid grid-cols-2 rounded-xl p-1 ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                  {(['MTN', 'Airtel'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={network === option}
                      onClick={() => setNetwork(option)}
                      className={`min-h-11 rounded-lg px-3 text-sm font-bold transition-colors ${network === option ? 'bg-[#00E676] text-black shadow-sm' : darkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'}`}
                    >
                      {option === 'MTN' ? 'MTN MoMo' : 'Airtel Money'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${darkMode ? 'border-zinc-800 bg-zinc-900/80' : 'border-emerald-100 bg-emerald-50/70'}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-extrabold">Pay {amountText} to boost</h3>
                  <span className={`shrink-0 text-xs font-semibold ${muted}`}>{config.planName}</span>
                </div>
                {paymentDestinationConfigured ? (
                  <>
                    {network === 'Airtel' && <p className="mt-3 text-xs font-bold uppercase tracking-wider text-red-600">Send Money</p>}
                    <ol className={`mt-3 list-inside list-decimal space-y-2 text-sm leading-5 ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
                      <li>Send {amountText} to <strong className="font-extrabold tracking-wide">{payeeNumber}</strong></li>
                      <li>Confirm the receiver name is <strong className="font-extrabold">{payeeName}</strong></li>
                      <li>After paying, submit the transaction ID and SMS screenshot below.</li>
                    </ol>
                    <p className={`mt-3 border-t pt-3 text-xs leading-5 ${darkMode ? 'border-zinc-800 text-zinc-400' : 'border-emerald-200 text-zinc-600'}`}>
                      Send the money directly to the receiver shown above. This form only records your payment details and proof for review.
                    </p>
                  </>
                ) : (
                  <p role="alert" className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm leading-5 text-amber-800 dark:text-amber-100">
                    {network} receiving details are not configured yet. Do not send money until a verified number and account name appear here.
                  </p>
                )}
              </div>

              {!isAuthenticated && (
                <div className={`flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between ${darkMode ? 'border-amber-700/50 bg-amber-950/30' : 'border-amber-200 bg-amber-50'}`}>
                  <p className={`text-xs leading-5 ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>Sign in with a verified phone number before submitting payment details.</p>
                  <button type="button" onClick={onRequestSignIn} className="shrink-0 rounded-lg border border-amber-500/50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/40">
                    Sign in
                  </button>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  <span>Network used to pay</span>
                  <select value={network} onChange={(event) => setNetwork(event.target.value as 'MTN' | 'Airtel')} className={`min-h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-[#00E676]/30 ${field}`}>
                    <option value="MTN">MTN</option>
                    <option value="Airtel">Airtel</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  <span>Phone number used to pay</span>
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    pattern="(?:07[0-9]{8}|\\+?2567[0-9]{8})"
                    title="Enter a Uganda mobile number, for example 0751234567."
                    value={payerNumber}
                    onChange={(event) => setPayerNumber(event.target.value)}
                    placeholder="07…"
                    className={`min-h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-[#00E676]/30 ${field}`}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                <span>Transaction ID from SMS</span>
                <input
                  required
                  type="text"
                  autoComplete="off"
                  minLength={6}
                  maxLength={32}
                  pattern="[A-Za-z0-9-]{6,32}"
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                  placeholder="e.g. 1234567890"
                  className={`min-h-11 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-[#00E676]/30 ${field}`}
                />
              </label>

              <label className="flex cursor-pointer flex-col gap-2 text-sm font-semibold">
                <span>Upload SMS screenshot</span>
                <span className={`flex min-h-14 items-center gap-3 rounded-lg border border-dashed px-3 py-3 transition-colors ${darkMode ? 'border-zinc-700 bg-zinc-900 hover:border-[#00E676]' : 'border-zinc-300 bg-zinc-50 hover:border-[#00C853]'}`}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#00E676]/15 text-emerald-700"><Upload className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{screenshot?.name ?? 'Choose a payment screenshot'}</span>
                    <span className={`mt-0.5 block text-xs font-normal ${muted}`}>JPG, PNG, or WEBP · maximum 2 MB</span>
                  </span>
                  <input
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    aria-label="Upload SMS payment screenshot"
                    onChange={(event) => {
                      setScreenshot(event.target.files?.[0] ?? null);
                      setErrorMessage(null);
                    }}
                  />
                </span>
              </label>

              {errorMessage && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800 dark:bg-red-950/40 dark:text-red-200">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>

            <footer className={`flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
              <button type="button" onClick={onClose} className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${darkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isAuthenticated || !paymentDestinationConfigured}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#00E676] px-5 text-center text-sm font-extrabold text-black transition-colors hover:bg-[#00C853] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? 'Submitting proof…' : 'Submit payment proof'}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
};

export { MAX_SCREENSHOT_BYTES };
export type ManualBoostPaymentNetwork = 'MTN' | 'Airtel';
export type ManualBoostSubmissionCallback = (submission: ManualBoostSubmission) => Promise<void>;
export type { ManualBoostPaymentModalProps };
