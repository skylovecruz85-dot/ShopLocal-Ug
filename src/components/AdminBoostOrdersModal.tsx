import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Eye, 
  Phone, 
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { BoostOrder, Listing } from '../types';

interface AdminBoostOrdersModalProps {
  orders: BoostOrder[];
  listings: Listing[];
  onClose: () => void;
  onApproveOrder: (orderId: string) => void;
  onDeclineOrder: (orderId: string) => void;
  darkMode?: boolean;
}

export const AdminBoostOrdersModal: React.FC<AdminBoostOrdersModalProps> = ({
  orders,
  listings,
  onClose,
  onApproveOrder,
  onDeclineOrder,
  darkMode,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Declined'>('Pending');
  const [search, setSearch] = useState('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch = 
      o.adTitle.toLowerCase().includes(search.toLowerCase()) ||
      o.payerNumber.includes(search) ||
      o.txnId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-zinc-800 bg-[#121212] text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2A2A] bg-[#181818] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 -ml-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[16px] text-white">
                  Admin &gt; Boost Orders
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase border border-amber-500/40 animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Review sample boost requests. Approval changes this preview only.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div role="note" className="px-5 py-3 bg-amber-950/30 border-b border-amber-500/20 text-xs text-amber-100">
          Demo orders only. Payment verification, carrier alerts, and fund transfers are not connected.
        </div>

        {/* Filter Pills + Search */}
        <div className="p-4 border-b border-[#2A2A2A] bg-[#141414] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setFilter('Pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filter === 'Pending'
                  ? 'bg-amber-500 text-black shadow-xs'
                  : 'bg-[#1E1E1E] text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('Approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filter === 'Approved'
                  ? 'bg-[#00E676] text-black shadow-xs'
                  : 'bg-[#1E1E1E] text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('Declined')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filter === 'Declined'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-[#1E1E1E] text-zinc-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Declined</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filter === 'ALL'
                  ? 'bg-zinc-200 text-black shadow-xs'
                  : 'bg-[#1E1E1E] text-zinc-400 hover:text-white'
              }`}
            >
              <span>All ({orders.length})</span>
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search TXN, phone, ad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#00E676]"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm font-semibold">No boost orders found in this filter.</p>
              <p className="text-xs text-zinc-600 mt-0.5">When users pay to boost an ad via MTN or Airtel, orders appear here.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const matchedListing = listings.find(l => l.id === order.listingId);
              return (
                <div 
                  key={order.id}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-zinc-700 transition-all"
                >
                  {/* Left Column: Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        order.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : order.status === 'Approved'
                          ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}>
                        {order.status}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.network === 'MTN'
                          ? 'bg-[#FFCC00] text-black font-mono'
                          : 'bg-[#E60000] text-white font-mono'
                      }`}>
                        {order.network} MoMo
                      </span>

                      <span className="text-xs font-black text-[#00E676]">
                        USh {order.amount.toLocaleString()}
                      </span>

                      <span className="text-[11px] text-zinc-400">
                        • {order.plan}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate">
                      {order.adTitle}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-300 font-mono">
                      <div>
                        <span className="text-zinc-500">Payer Line:</span>{' '}
                        <strong className="text-white">{order.payerNumber}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">TXN ID:</span>{' '}
                        <strong className="text-[#00E676]">{order.txnId}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Time:</span>{' '}
                        <span>{new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.time).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Ad Status:</span>{' '}
                        <span className={order.status === 'Approved' ? 'text-[#00E676]' : 'text-amber-400'}>
                          {order.status === 'Approved' ? 'TOP Active' : 'PENDING PAYMENT (Hidden from TOP)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Screenshot & Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    {order.screenshot && (
                      <button
                        type="button"
                        onClick={() => setPreviewScreenshot(order.screenshot!)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="View SMS Screenshot"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00E676]" />
                        <span>Screenshot</span>
                      </button>
                    )}

                    {order.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApproveOrder(order.id)}
                          className="px-3 py-2 rounded-lg bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Approve &amp; Set TOP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeclineOrder(order.id)}
                          className="px-2.5 py-2 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {order.status === 'Approved' && (
                      <span className="text-xs text-[#00E676] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Approved
                      </span>
                    )}

                    {order.status === 'Declined' && (
                      <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Declined
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Screenshot preview overlay */}
        {previewScreenshot && (
          <div 
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewScreenshot(null)}
          >
            <div className="relative max-w-md w-full bg-zinc-950 p-2 rounded-2xl border border-zinc-700">
              <button
                type="button"
                onClick={() => setPreviewScreenshot(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={previewScreenshot} 
                alt="SMS Payment Screenshot" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
