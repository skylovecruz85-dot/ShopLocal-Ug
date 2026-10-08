import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Send, 
  DollarSign, 
  Check, 
  XCircle, 
  ShieldCheck, 
  Sparkles, 
  Smartphone,
  MessageSquare,
  X
} from 'lucide-react';
import { Conversation, User } from '../types';
import { formatUGX, formatTimeAgo } from '../utils/helpers';

interface ChatModalProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  currentUser: User;
  onSendMessage: (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => void;
  onAcceptOffer?: (conversationId: string, messageId: string) => void;
  onDeclineOffer?: (conversationId: string, messageId: string) => void;
  onClose: () => void;
  onOpenMomoCheckout?: (listingTitle: string, amount: number) => void;
  onOpenSafetyTips?: () => void;
  onOpenReport?: (title: string, sellerName: string) => void;
  darkMode?: boolean;
}

const QUICK_REPLIES = [
  'Is this still available?',
  'What is your last cash price in UGX?',
  'Can I try the demo checkout?',
  'Can we meet in Kampala / Acacia Mall?',
  'Do you deliver to Wakiso / Mukono / Entebbe?',
];

export const ChatModal: React.FC<ChatModalProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUser,
  onSendMessage,
  onClose,
  onOpenMomoCheckout,
  onOpenSafetyTips,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [offerInput, setOfferInput] = useState<number | ''>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation object if one is selected
  const hasSpecificActive = Boolean(activeConversationId && conversations.some(c => c.id === activeConversationId));
  const activeConv = hasSpecificActive
    ? conversations.find(c => c.id === activeConversationId)
    : null;

  // Auto scroll to bottom when messages update in active conversation
  useEffect(() => {
    if (activeConv) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (hasSpecificActive) {
          onSelectConversation(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSpecificActive, onSelectConversation, onClose]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleSendOffer = () => {
    if (!offerInput || !activeConv) return;
    const amount = Number(offerInput);
    onSendMessage(
      activeConv.id,
      `Official Offer: ${formatUGX(amount)}`,
      true,
      amount
    );
    setShowOfferBox(false);
    setOfferInput('');
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherPartyName = c.buyerId === currentUser.id ? c.sellerName : c.buyerName;
    return (
      otherPartyName.toLowerCase().includes(q) ||
      c.listingTitle.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  return (
    <div 
      className="fixed inset-0 bottom-[65px] z-30 bg-[#F5F5F5] flex flex-col md:inset-0 md:bottom-0 md:z-50 md:bg-slate-900/60 md:backdrop-blur-xs md:flex md:items-center md:justify-center md:p-4"
      onClick={() => {
        // Clicking backdrop on desktop closes modal
      }}
    >
      <div 
        className="w-full h-full flex flex-col bg-[#F5F5F5] overflow-hidden md:max-w-4xl md:h-[85vh] md:rounded-2xl md:shadow-2xl md:border md:border-slate-200 md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left column / Chat List View */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col h-full bg-[#F5F5F5] border-r border-[#EEEEEE] ${
          hasSpecificActive ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Top Bar Header */}
          <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-2xs">
            {/* Left: Back arrow + "Messages" black bold */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-1 -ml-1 text-[#222222] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-[#222222] stroke-[2.5]" />
              </button>
              <h1 className="text-lg font-black text-[#222222] tracking-tight">
                Messages
              </h1>
            </div>

            {/* Right: small green dot + green text "2 online" */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00B53F]">
              <span className="w-2 h-2 rounded-full bg-[#00B53F] animate-pulse"></span>
              <span>{conversations.length} online</span>
            </div>
          </div>

          {/* Search Bar under Header */}
          <div className="p-3 bg-white border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-lg px-3 py-2 border border-slate-200/80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, product..."
                className="w-full bg-transparent text-xs text-[#222222] placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold px-1"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Chat List Body (Light Mode: Cards white #FFFFFF with 8px radius and light shadow) */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-200/70 text-slate-400 flex items-center justify-center mb-2">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-[13px] font-bold text-slate-700">
                  No chats found
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No conversations match "{searchQuery}"
                </p>
              </div>
            ) : (
              <>
                {filteredConversations.map((conv) => {
                  const isSelected = hasSpecificActive && conv.id === activeConv?.id;
                  const otherPartyName = conv.buyerId === currentUser.id ? conv.sellerName : conv.buyerName;
                  const otherPartyAvatar = conv.buyerId === currentUser.id ? conv.sellerAvatar : conv.buyerAvatar;
                  const hasUnread = Boolean(conv.unreadCount && conv.unreadCount > 0);

                  return (
                    <div
                      key={conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      className={`bg-white rounded-[8px] p-3 shadow-xs border border-[#EEEEEE] hover:border-[#00B53F]/50 transition-all cursor-pointer flex items-center gap-3 relative ${
                        isSelected ? 'ring-2 ring-[#00B53F] bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Avatar: 48px circle with green border if verified */}
                      <div className="relative shrink-0">
                        <img
                          src={otherPartyAvatar}
                          alt={otherPartyName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#00B53F]"
                        />
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white"></span>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        {/* Line 1: Name left, Time right "3d ago" grey 11px */}
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-[14px] text-[#222222] truncate">
                            {otherPartyName}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] text-[#757575] font-medium">
                              {formatTimeAgo(conv.lastTimestamp)}
                            </span>
                            {/* Blue dot for unread */}
                            {hasUnread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                            )}
                          </div>
                        </div>

                        {/* Line 2: Product name green #00B53F 12px */}
                        <p className="text-[12px] font-semibold text-[#00B53F] truncate leading-tight mb-0.5">
                          {conv.listingTitle}
                        </p>

                        {/* Line 3: Last message grey cut with ... */}
                        <p className="text-[12px] text-[#666666] truncate leading-tight">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Illustration: "No more chats" centered */}
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200/70 text-slate-400 flex items-center justify-center mb-1.5">
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-600">
                    No more chats
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                    All your buyer inquiries and seller messages are up to date.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column / Active conversation thread */}
        {hasSpecificActive && activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] overflow-hidden">
            {/* Conversation Header */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Back button to return to chat list */}
                <button
                  type="button"
                  onClick={() => onSelectConversation(null)}
                  className="p-1 -ml-1 text-[#222222] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Back to chat list"
                >
                  <ArrowLeft className="w-5 h-5 text-[#222222] stroke-[2.5]" />
                </button>

                {/* 48px Avatar */}
                <img
                  src={activeConv.buyerId === currentUser.id ? activeConv.sellerAvatar : activeConv.buyerAvatar}
                  alt=""
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#00B53F] shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[14px] text-[#222222] truncate">
                      {activeConv.buyerId === currentUser.id ? activeConv.sellerName : activeConv.buyerName}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00B53F] shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#00B53F] font-medium leading-none mt-0.5">
                    <span>Demo conversation</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {onOpenSafetyTips && (
                  <button
                    type="button"
                    onClick={onOpenSafetyTips}
                    className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-[#00B53F] text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer hidden sm:flex items-center gap-1"
                    title="Safety Tips"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Safety</span>
                  </button>
                )}

                {onOpenMomoCheckout && (
                  <button
                    type="button"
                    onClick={() => onOpenMomoCheckout(activeConv.listingTitle, activeConv.listingPrice)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#ff7e00] hover:bg-[#e67200] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    title="Demo checkout preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Demo checkout</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer hidden md:block"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Summary Bar */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={activeConv.listingImage}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#00B53F] truncate">
                    {activeConv.listingTitle}
                  </p>
                  <p className="text-[13px] font-extrabold text-[#222222]">
                    {formatUGX(activeConv.listingPrice)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowOfferBox(!showOfferBox);
                  setOfferInput(Math.round(activeConv.listingPrice * 0.9));
                }}
                className="px-3 py-1.5 rounded-lg bg-[#00B53F] hover:bg-[#009e37] text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Make demo offer</span>
              </button>
            </div>

            {/* Offer Box Drawer */}
            {showOfferBox && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0 animate-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900">Your Offer:</span>
                  <input
                    type="number"
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value ? Number(e.target.value) : '')}
                    className="w-28 sm:w-36 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    placeholder="UGX amount"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setOfferInput(Math.round(activeConv.listingPrice * 0.95))}
                      className="text-[10px] bg-white border border-emerald-300 px-1.5 py-1 rounded text-emerald-800 font-bold"
                    >
                      -5%
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferInput(Math.round(activeConv.listingPrice * 0.90))}
                      className="text-[10px] bg-white border border-emerald-300 px-1.5 py-1 rounded text-emerald-800 font-bold"
                    >
                      -10%
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendOffer}
                    className="px-3 py-1.5 rounded-lg bg-[#00B53F] hover:bg-[#009e37] text-white text-xs font-bold cursor-pointer"
                  >
                    Send Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfferBox(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Message Bubbles Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#F5F5F5]">
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 text-xs shadow-2xs ${
                        isMe
                          ? 'bg-[#E7FFDB] text-[#222222] border border-[#c6edb7] rounded-br-xs'
                          : 'bg-white text-[#222222] border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.isOffer ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-[#00B53F]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>SAMPLE OFFER</span>
                          </div>
                          <p className="text-base font-extrabold text-[#222222]">
                            {formatUGX(msg.offerAmount || 0)}
                          </p>
                          <p className="text-[11px] text-slate-600">{msg.text}</p>

                          {msg.offerStatus && (
                            <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-bold">
                              {msg.offerStatus === 'accepted' && (
                                <span className="text-[#00B53F] flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Accepted in demo
                                </span>
                              )}
                              {msg.offerStatus === 'declined' && (
                                <span className="text-red-500 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Declined in demo
                                </span>
                              )}
                            </div>
                          )}

                          {msg.offerStatus === 'accepted' && onOpenMomoCheckout && (
                            <button
                              type="button"
                              onClick={() => onOpenMomoCheckout(activeConv.listingTitle, msg.offerAmount || activeConv.listingPrice)}
                              className="mt-2 w-full py-1.5 px-3 bg-[#ff7e00] hover:bg-[#e67200] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Preview demo checkout</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-line leading-relaxed text-[13px]">{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 px-1 font-medium">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply chips */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_REPLIES.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputText(reply)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-[#F0F2F5] hover:bg-emerald-50 text-slate-700 hover:text-[#00B53F] border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={handleSend} 
              className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a demo message..."
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F0F2F5] border border-slate-200 text-xs sm:text-sm text-[#222222] placeholder-slate-400 focus:outline-none focus:border-[#00B53F] focus:bg-white"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-xl bg-[#00B53F] hover:bg-[#009e37] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Send Message"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Desktop placeholder when no conversation is selected */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00B53F] flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-[#222222] mb-1">
              Select a Conversation
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Preview sample conversations and counter-offers. Replies are simulated, and no payments are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
