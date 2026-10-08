import React from 'react';
import { 
  X, 
  ArrowLeft, 
  Bell, 
  MessageSquare, 
  Sparkles, 
  Check, 
  XCircle, 
  CheckCheck, 
  Smartphone,
  Flame,
  Volume2
} from 'lucide-react';
import { AppNotification } from '../types';
import { formatTimeAgo } from '../utils/helpers';

interface NotificationCenterModalProps {
  notifications: AppNotification[];
  onClose: () => void;
  onAction: (actionKey: string, notification: AppNotification) => void;
  onClearAll: () => void;
  onRequestBrowserPush: () => void;
  onSimulateInquiry: () => void;
  onSimulateOffer: () => void;
  darkMode?: boolean;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  onClose,
  onAction,
  onClearAll,
  onRequestBrowserPush,
  onSimulateInquiry,
  onSimulateOffer,
  darkMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className={`rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden relative border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Back Arrow */}
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-display font-black text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Seller Alerts & Push Inquiries</span>
              </h3>
              <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time buyer notifications & direct offers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Push Permission & Quick Test Simulation Bar */}
        <div className={`p-4 border-b space-y-2.5 ${
          darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Device Push Alerts</span>
            </span>

            <button
              onClick={onRequestBrowserPush}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Enable Browser Push
            </button>
          </div>

          {/* Real-time simulation triggers */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium">Test Real-Time Push:</span>
            <button
              onClick={onSimulateInquiry}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                darkMode ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-emerald-600" />
              <span>Simulate Buyer Inquiry</span>
            </button>

            <button
              onClick={onSimulateOffer}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                darkMode ? 'border-amber-800/60 bg-amber-950/40 text-amber-300' : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Simulate UGX Offer</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p>No new notifications right now.</p>
              <p className="text-[11px] opacity-75">Click "Simulate Buyer Inquiry" above to test an incoming alert!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  notif.read
                    ? darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    : darkMode ? 'bg-slate-800 border-emerald-500/40' : 'bg-white border-emerald-500/40 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      notif.type === 'offer'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {notif.type === 'offer' ? <Sparkles className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-bold text-xs">{notif.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTimeAgo(notif.timestamp)}
                  </span>
                </div>

                <p className={`text-xs mt-1.5 leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {notif.body}
                </p>

                {/* Actions */}
                {notif.actions && notif.actions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {notif.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => onAction(act.actionKey, notif)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          act.style === 'primary'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : act.style === 'danger'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                            : darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {act.actionKey === 'accept_offer' && <Check className="w-3 h-3" />}
                        {act.actionKey === 'decline_offer' && <XCircle className="w-3 h-3" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
