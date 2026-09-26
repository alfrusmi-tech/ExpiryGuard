import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <button className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center ml-2 text-slate-500">
          <Search className="w-4 h-4 mr-2" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="border-none focus:outline-none focus:ring-0 text-sm bg-transparent w-64 placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
