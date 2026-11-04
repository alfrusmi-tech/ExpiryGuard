import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { LogoutConfirmModal } from '../components/auth/LogoutConfirmModal';

export function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f8faf9] overflow-hidden">
      {/* Sidebar with mobile support */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        onMobileClose={() => setMobileSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with hamburger toggle */}
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Confirmation Dialog for Sign Out */}
      <LogoutConfirmModal />
    </div>
  );
}
