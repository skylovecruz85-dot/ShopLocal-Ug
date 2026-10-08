import React, { useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Sparkles, 
  X, 
  Check, 
  XCircle, 
  ArrowRight,
  Flame,
  CreditCard
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onAction: (actionKey: string, notification: AppNotification) => void;
  darkMode?: boolean;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onAction,
  darkMode,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000); // 10 seconds display
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className={`rounded-2xl shadow-2xl p-4 border overflow-hidden backdrop-blur-md transition-colors ${
        darkMode 
          ? 'bg-slate-900/95 border-emerald-500/50 text-white' 
          : 'bg-white/95 border-emerald-500/40 text-slate-900 shadow-emerald-900/10'
      }`}>
        <div className="flex items-start gap-3">
          {/* Notification Type Icon */}
          <div className={`p-2.5 rounded-xl shrink-0 ${
            notification.type === 'offer'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : notification.type === 'boost'
              ? 'bg-red-500 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            {notification.type === 'offer' ? (
              <Sparkles className="w-5 h-5 fill-slate-950" />
            ) : notification.type === 'boost' ? (
              <Flame className="w-5 h-5 fill-white" />
            ) : notification.type === 'payment' ? (
              <CreditCard className="w-5 h-5" />
            ) : (
              <MessageSquare className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                notification.type === 'offer'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {notification.type === 'offer' ? 'New Price Counter-Offer' : 'New Buyer Inquiry'}
              </span>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>

            <h4 className="font-bold text-xs sm:text-sm mt-1 truncate">
              {notification.title}
            </h4>

            <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {notification.body}
            </p>

            {/* Actionable Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {notification.actions && notification.actions.length > 0 ? (
                notification.actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => onAction(act.actionKey, notification)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      act.style === 'primary'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : act.style === 'danger'
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {act.actionKey === 'accept_offer' && <Check className="w-3.5 h-3.5" />}
                    {act.actionKey === 'decline_offer' && <XCircle className="w-3.5 h-3.5" />}
                    <span>{act.label}</span>
                  </button>
                ))
              ) : (
                <button
                  onClick={() => onAction('reply', notification)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open & Reply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={onDismiss}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
