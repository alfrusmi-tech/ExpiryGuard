import React from 'react';
import { Menu, Search, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { user, openLogoutModal } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-emerald-950/10 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
      <div className="flex items-center">
        <button 
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center ml-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search className="w-4 h-4 mr-2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Quick search medicines, batches..." 
            className="border-none focus:outline-none focus:ring-0 text-sm bg-transparent w-64 placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Pharmacy Status Pill */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Pharmacy Active
        </div>

        {/* Notifications */}
        <button 
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Alerts and Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Pill (desktop) */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium">
          <div className="w-6 h-6 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-[10px]">
            RX
          </div>
          <span className="max-w-[120px] truncate">{user?.name || 'Pharmacist Admin'}</span>
        </div>

        {/* Prominent Logout Button */}
        <button
          onClick={openLogoutModal}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-xs sm:text-sm font-medium transition-colors shadow-2xs"
          title="Sign out of ExpiryGuard"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-600" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
