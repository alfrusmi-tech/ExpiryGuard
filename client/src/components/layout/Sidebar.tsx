import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ScanLine,
  BellRing, 
  Tags, 
  BarChart3, 
  Settings,
  ShieldAlert,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/add-product', label: 'Add Product', icon: PlusCircle },
  { path: '/scan-product', label: 'Scan Product', icon: ScanLine },
  { path: '/alerts', label: 'Expiry Alerts', icon: BellRing },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, openLogoutModal } = useAuth();

  const sidebarContent = (
    <div className="w-64 bg-slate-900 h-full text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-3 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight block leading-tight">ExpiryGuard</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 block">Pharmacy System</span>
          </div>
        </div>

        {/* Mobile close button */}
        {onMobileClose && (
          <button 
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Nav items */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.filter(item =>  user?.role === 'ADMIN' || !['/settings', '/reports'].includes(item.path) )
  .map((item) => (
    // Keep your existing navigation item JSX here.
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onMobileClose && onMobileClose()}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-emerald-600/15 text-emerald-400 font-semibold" 
                  : "hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="flex-1">{item.label}</span>
            {item.path === '/scan-product' && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Live
              </span>
            )}
          </NavLink>
        ))}
      </div>
      
      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20 shrink-0">
              RX
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Pharmacist Admin'}</p>
              <p className="text-xs text-emerald-400/80 truncate">Pharmacy Inventory</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onMobileClose) onMobileClose();
              openLogoutModal();
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={onMobileClose} 
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
