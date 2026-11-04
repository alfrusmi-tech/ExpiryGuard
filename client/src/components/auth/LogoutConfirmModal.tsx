import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export function LogoutConfirmModal() {
  const { isLogoutModalOpen, closeLogoutModal, logout } = useAuth();
  const navigate = useNavigate();

  if (!isLogoutModalOpen) return null;

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 id="logout-title" className="text-lg font-bold text-slate-900 tracking-tight">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ExpiryGuard Pharmacy System
              </p>
            </div>
          </div>
          <button 
            onClick={closeLogoutModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to end your current pharmacist session? You will be returned to the sign-in screen and will need your credentials to re-enter the application.
          </p>

          <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Unsaved changes on active forms will be discarded upon signing out.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={closeLogoutModal}
            className="text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            onClick={handleConfirmLogout}
            className="shadow-sm font-semibold flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
