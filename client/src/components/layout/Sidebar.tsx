import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
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
  { path: '/alerts', label: 'Expiry Alerts', icon: BellRing },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 h-full text-slate-300 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <ShieldAlert className="w-6 h-6 text-blue-500 mr-3" />
        <span className="text-white font-bold text-lg tracking-tight">ExpiryGuard</span>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-slate-500">DevOps Project</p>
          </div>
        </div>
      </div>
    </div>
  );
}
