
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { user, openLogoutModal } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    navigate(
      query
        ? `/inventory?search=${encodeURIComponent(query)}`
        : '/inventory'
    );
  };

  return (
    <header className="h-16 bg-white border-b border-emerald-950/10 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form
          onSubmit={handleSearch}
          role="search"
          className="hidden md:flex items-center ml-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-emerald-500"
        >
          <button
            type="submit"
            aria-label="Search inventory"
            className="mr-2 text-slate-400 hover:text-emerald-700"
          >
            <Search className="w-4 h-4" />
          </button>

          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Quick search medicines, batches..."
            aria-label="Search medicines and batches"
            className="border-none outline-none text-sm bg-transparent w-64 text-slate-700"
          />
        </form>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Pharmacy Active
        </div>

        <Link
          to="/alerts"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          title="View expiry and stock alerts"
          aria-label="View expiry and stock alerts"
        >
          <Bell className="w-5 h-5" />
        </Link>

        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
          <div className="w-6 h-6 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-[10px]">
            RX
          </div>
          <span className="max-w-[120px] truncate">
            {user?.name || 'Pharmacist Admin'}
          </span>
        </div>

        <button
          type="button"
          onClick={openLogoutModal}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm font-medium"
          title="Sign out of ExpiryGuard"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
