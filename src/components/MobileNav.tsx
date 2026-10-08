import React from 'react';
import { Home, Camera, MessageSquare, User, Heart } from 'lucide-react';

interface MobileNavProps {
  currentTab: 'home' | 'saved' | 'post' | 'messages' | 'dashboard';
  onChangeTab: (tab: 'home' | 'saved' | 'post' | 'messages' | 'dashboard') => void;
  unreadCount: number;
  favoritesCount?: number;
  darkMode?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onChangeTab,
  unreadCount,
  favoritesCount = 0,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[65px] bg-white border-t border-slate-200 shadow-md flex items-center justify-around px-2">
      {/* Home Tab */}
      <button
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentTab === 'home' 
            ? 'text-[#00B53F] font-bold' 
            : 'text-[#757575] hover:text-[#222222]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* Saved / Favorites Tab */}
      <button
        onClick={() => onChangeTab('saved')}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentTab === 'saved' 
            ? 'text-[#00B53F] font-bold' 
            : 'text-[#757575] hover:text-[#222222]'
        }`}
      >
        <div className="relative">
          <Heart className={`w-5 h-5 ${currentTab === 'saved' ? 'fill-[#00B53F] text-[#00B53F]' : ''}`} />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {favoritesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5">Saved</span>
      </button>

      {/* 56px Centered Circle SELL Button - Not floating over page content */}
      <button
        onClick={() => onChangeTab('post')}
        className="flex flex-col items-center justify-center cursor-pointer group shrink-0"
        title="Post Free Ad"
      >
        <div className="w-[56px] h-[56px] rounded-full bg-[#00B53F] hover:bg-[#009e37] text-white flex flex-col items-center justify-center shadow-md group-active:scale-95 transition-all">
          <Camera className="w-5 h-5 stroke-[2.4]" />
          <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">
            SELL
          </span>
        </div>
      </button>

      {/* Messages / Chat Tab */}
      <button
        onClick={() => onChangeTab('messages')}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentTab === 'messages' 
            ? 'text-[#00B53F] font-bold' 
            : 'text-[#757575] hover:text-[#222222]'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#00B53F] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5">Messages</span>
      </button>

      {/* Profile / My Shop Tab */}
      <button
        onClick={() => onChangeTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentTab === 'dashboard' 
            ? 'text-[#00B53F] font-bold' 
            : 'text-[#757575] hover:text-[#222222]'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Profile</span>
      </button>
    </nav>
  );
};
