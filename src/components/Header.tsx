import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Camera, 
  MessageSquare, 
  ShieldCheck, 
  Crown, 
  User as UserIcon, 
  Bell, 
  Moon, 
  Sun, 
  ChevronDown, 
  LogOut, 
  Settings,
  Flame,
  UserPlus
} from 'lucide-react';
import { User } from '../types';
import { UGANDA_DISTRICTS } from '../data/mockData';
import { isOwnerUser } from '../config/paymentConfig';

interface HeaderProps {
  currentUser: User;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadCount: number;
  unreadNotificationsCount: number;
  onOpenPostAd: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  onOpenDashboard: () => void;
  onOpenProModal: () => void;
  onOpenBiometrics: () => void;
  onOpenSafetyTips: () => void;
  onOpenPayoutSettings: () => void;
  onOpenAdminBoostOrders?: () => void;
  pendingBoostOrdersCount?: number;
  onOpenSignUp: () => void;
  onOpenProfile: (user: User) => void;
  onSwitchUserRole: () => void;
  onSignOut?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const TRENDING_TAGS = [
  'Toyota Harrier',
  'iPhone 13',
  'Boda Boda Boxer',
  'Crestank 5000L',
  'Plot in Gayaza',
  'Sofa Set',
  'Solar Inverter',
  'PPR Pipes',
  'Matooke'
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  selectedDistrict,
  onSelectDistrict,
  searchQuery,
  onSearchChange,
  unreadCount,
  unreadNotificationsCount,
  onOpenPostAd,
  onOpenMessages,
  onOpenNotifications,
  onOpenDashboard,
  onOpenProModal,
  onOpenAdminBoostOrders,
  pendingBoostOrdersCount = 0,
  onOpenSafetyTips,
  onOpenSignUp,
  onOpenProfile,
  onSwitchUserRole,
  onSignOut,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Jiji Style Green Logo on White Background */}
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onSearchChange(''); onSelectDistrict('All Uganda'); }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <img
                src="/icon.svg"
                alt=""
                aria-hidden="true"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-[#00B53F]">
                    ShopLocal
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#ff7e00] inline-block mb-1"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#00B53F] text-white px-1 py-0.2 rounded font-mono">
                    UG
                  </span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-amber-900">
                    Demo
                  </span>
                </div>
                <span className="text-[9px] text-[#757575] font-semibold tracking-tight -mt-0.5 hidden sm:block">
                  Interactive marketplace preview
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Search Bar (Grey background #F0F2F5, green search button) */}
          <div className="hidden md:flex flex-1 items-center max-w-2xl">
            <div className="flex items-center w-full rounded-xl bg-[#F0F2F5] border border-slate-200 overflow-hidden shadow-2xs">
              {/* Location Dropdown with MapPin icon */}
              <div className="relative border-r border-slate-300 shrink-0">
                <div className="flex items-center gap-1.5 pl-3 pr-2 py-2 text-xs font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-[#00B53F] shrink-0" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => onSelectDistrict(e.target.value)}
                    aria-label="Select Uganda District"
                    className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    {UGANDA_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-white text-slate-900">
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1 pointer-events-none" />
                </div>
              </div>

              {/* Keyword Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search phones, cars, chairs..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-[#222222] placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Search Button (Green #00B53F) */}
              <button 
                type="button"
                className="bg-[#00B53F] hover:bg-[#008A30] text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Right Action Icons (Green Camera Icon on right, User Profile) */}
          <div className="flex items-center gap-2">
            {/* Green Camera Icon button on the right */}
            <button
              onClick={onOpenPostAd}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-xl bg-[#00B53F] hover:bg-[#008A30] text-white shadow-xs transition-all cursor-pointer group"
              title="Post Ad"
              aria-label="Post Ad"
            >
              <Camera className="w-5 h-5 text-white stroke-[2.2]" />
            </button>

            {/* User Account / Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 bg-[#F0F2F5] hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="User Profile Menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {/* Profile Dropdown with Settings */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border border-slate-200 bg-white text-slate-800 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[11px] text-slate-500 font-medium">Active demo profile</p>
                    <p className="text-xs font-bold truncate text-[#222222]">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.phone}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { onOpenDashboard(); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-[#00B53F]" />
                        <span>Seller Studio & Inventory</span>
                      </div>
                      <span className="text-[10px] bg-[#00B53F]/15 text-[#00B53F] font-bold px-1.5 py-0.5 rounded">
                        {currentUser.freeListingsUsed} Ads
                      </span>
                    </button>

                    <button
                      onClick={() => { onOpenSignUp(); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                    >
                      <UserPlus className="w-4 h-4 text-[#00B53F]" />
                      <span>Create another demo profile</span>
                    </button>

                    <button
                      onClick={() => { onOpenProfile(currentUser); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#00B53F]" />
                      <span>My Public Profile</span>
                    </button>

                    <button
                      onClick={() => { onOpenSafetyTips(); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#00B53F]" />
                      <span>Safety Rules</span>
                    </button>

                    <button
                      onClick={() => { onOpenProModal(); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-2 cursor-pointer text-[#ff7e00] hover:bg-orange-50/60"
                    >
                      <Crown className="w-4 h-4 text-[#ff7e00]" />
                      <span>Boost Ad</span>
                    </button>

                    {onOpenAdminBoostOrders && (
                      <button
                        onClick={() => { onOpenAdminBoostOrders(); setMobileMenuOpen(false); }}
                        className="w-full px-4 py-2 text-left text-xs font-bold flex items-center justify-between cursor-pointer text-[#00B53F] hover:bg-emerald-50/60"
                      >
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-[#00B53F]" />
                          <span>Admin: Boost Orders</span>
                        </div>
                        {pendingBoostOrdersCount > 0 && (
                          <span className="text-[10px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded-full">
                            {pendingBoostOrdersCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Settings Zone in Profile */}
                    <div className="border-t border-slate-100 my-1.5 pt-1.5 pb-1 px-1.5">
                      <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                        <Settings className="w-3 h-3 text-slate-400" />
                        <span>Settings</span>
                      </p>

                      {/* Theme Toggle in Settings */}
                      <button
                        onClick={onToggleDarkMode}
                        className="w-full px-2.5 py-2 text-left text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 text-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          {darkMode ? <Moon className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                          <span>Appearance</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">
                          {darkMode ? 'Dark' : 'Light'}
                        </span>
                      </button>

                      {/* Notification in Settings */}
                      <button
                        onClick={() => { onOpenNotifications(); setMobileMenuOpen(false); }}
                        className="w-full px-2.5 py-2 text-left text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 text-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#00B53F]" />
                          <span>Notifications</span>
                        </div>
                        {unreadNotificationsCount > 0 ? (
                          <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                            {unreadNotificationsCount} new
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">0</span>
                        )}
                      </button>

                      {/* Messages in Settings */}
                      <button
                        onClick={() => { onOpenMessages(); setMobileMenuOpen(false); }}
                        className="w-full px-2.5 py-2 text-left text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 text-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#00B53F]" />
                          <span>Messages</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-[#00B53F] text-white font-bold px-1.5 py-0.2 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Sign Out */}
                      {onSignOut && (
                        <button
                          onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                          className="w-full px-2.5 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Row (Grey input #F0F2F5, with Location selector that has MapPin icon) */}
        <div className="md:hidden mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search phones, cars, chairs..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F0F2F5] text-xs text-[#222222] placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Mobile Location dropdown with MapPin icon */}
          <div className="relative flex items-center bg-[#F0F2F5] rounded-xl px-2.5 py-2 border border-slate-200 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#00B53F] mr-1 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => onSelectDistrict(e.target.value)}
              aria-label="Filter by District"
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-3 appearance-none max-w-[90px] truncate"
            >
              {UGANDA_DISTRICTS.map((d) => (
                <option key={d} value={d} className="bg-white text-slate-900">{d}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Jiji Popular Trending Search Chips (Scrollable, no text cut-off, ample padding) */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1.5 pr-6 scrollbar-none no-scrollbar text-xs w-full min-w-0">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider pl-0.5">
            Trending:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => onSearchChange(tag)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-[#00B53F] text-white font-bold shadow-xs'
                    : 'bg-[#F0F2F5] text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
