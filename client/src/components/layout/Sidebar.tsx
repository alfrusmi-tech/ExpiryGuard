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
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../utils/cn';

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

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 h-full text-slate-300 flex flex-col hidden md:flex border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight block leading-tight">ExpiryGuard</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 block">Pharmacy System</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
                New
              </span>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
            RX
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Pharmacist Admin</p>
            <p className="text-xs text-emerald-400/80">Pharmacy Inventory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
