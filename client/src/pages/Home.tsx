import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { 
  ShieldAlert, 
  Pill, 
  BellRing, 
  Activity, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 p-1.5 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ExpiryGuard</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Home</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Features</a>
            <a href="#trust" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">About Us</a>
          </nav>
          <div className="flex items-center">
            <Link to="/login">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative py-16 lg:py-24 overflow-hidden bg-white">
          {/* Subtle medical cross pattern background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 text-slate-50 opacity-50 pointer-events-none">
            <Stethoscope className="w-96 h-96" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center md:justify-between gap-12">
            {/* Left Content */}
            <div className="md:w-1/2 space-y-8 mt-8 md:mt-0">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold mb-2 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
                Pharmacy Management System
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Smart Pharmacy <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Inventory & Expiry</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
                Manage medicines, monitor stock levels, track expiry dates, and receive timely alerts — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base bg-teal-600 hover:bg-teal-700 shadow-md">
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base border-slate-300 text-slate-700 hover:bg-slate-50">
                    Explore Features
                  </Button>
                </a>
              </div>
            </div>
            
            {/* Right Content - Hero Image */}
            <div className="w-full md:w-1/2 relative flex justify-center">
              <div className="relative w-full max-w-lg aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform transition-transform duration-500 hover:scale-[1.02]">
                <img 
                  src="/hero-bg.png" 
                  alt="Modern Pharmacy Interior" 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    // Fallback visually appealing gradient if image doesn't load locally during dev
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-gradient-to-tr', 'from-teal-100', 'to-emerald-50');
                  }}
                />
                
                {/* Floating Alert Element */}
                <div className="absolute -bottom-2 -left-2 md:bottom-6 md:-left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center space-x-4 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="p-2.5 bg-red-100 text-red-600 rounded-full">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Urgent Alert</p>
                    <p className="text-xs text-slate-500 font-medium">2 Medicines Expiring</p>
                  </div>
                </div>

                {/* Floating Success Element */}
                <div className="absolute top-6 -right-2 md:-right-6 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Stock Optimal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Everything Your Pharmacy Needs</h2>
              <p className="mt-4 text-slate-600 text-lg">A robust suite of tools designed exclusively for medicine inventory safety and efficiency.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow hover:border-teal-200 group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Pill className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Medicine Inventory</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Manage medicine details, stock quantities and product information effortlessly in one centralized database.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow hover:border-teal-200 group">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Expiry Monitoring</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Track medicine expiry dates with precision and automatically identify products that need immediate attention.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow hover:border-teal-200 group">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <BellRing className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Alerts</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Quickly identify medicines that are expired or approaching expiry with our smart, proactive notification engine.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow hover:border-teal-200 group">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Reports & Analytics</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Understand inventory status, historical waste, and reorder requirements through clear reports and useful insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / Information Section */}
        <section id="trust" className="py-24 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-8">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Keep Your Pharmacy Safe and Organized</h2>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              ExpiryGuard is built specifically for modern pharmacies. Our system helps reduce the risks associated with expired medicines, significantly improves stock visibility, and makes daily pharmacy inventory management easier and more compliant.
            </p>
            <div className="mt-12">
              <Link to="/login">
                <Button size="lg" className="px-8 bg-slate-900 hover:bg-slate-800 text-white">
                  Join the Platform
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-teal-600 p-1 rounded-md">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">ExpiryGuard</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              Smart Pharmacy Inventory & Expiry Management. Built for safety, designed for efficiency.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end justify-center space-y-4 mt-6 md:mt-0">
            <div className="flex space-x-6">
              <a href="#home" className="text-sm hover:text-teal-400 transition-colors">Home</a>
              <a href="#features" className="text-sm hover:text-teal-400 transition-colors">Features</a>
              <Link to="/login" className="text-sm hover:text-teal-400 transition-colors">Login</Link>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} ExpiryGuard Pharmacy Systems. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
