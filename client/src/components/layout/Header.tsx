import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-emerald-950/10 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <button className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700">
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
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Pharmacy Active
        </div>
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
