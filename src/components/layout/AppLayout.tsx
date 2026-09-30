"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  Building2,
  BarChart3,
  Bell,
  ChevronRight,
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'My Wish List', href: '/', icon: Heart, description: 'Set your buying criteria' },
    { label: 'Matched Vehicles', href: '/matches', icon: Search, description: 'Heiwa auction matches' },
    { label: 'NZ Market View', href: '/market', icon: BarChart3, description: 'Compare NZ pricing' },
  ];

  return (
    <div className="flex h-screen bg-[#FAFBFC] text-[#0F1419] font-sans antialiased overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[264px] bg-[#0F1419] text-white/80 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#C8102E] flex items-center justify-center overflow-hidden shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
                <img
                  src="/autohub-logo.jpg"
                  alt="AutoHub"
                  className="w-7 h-7 rounded-lg object-cover"
                />
              </div>
              <div>
                <span className="text-[15px] font-bold text-white block leading-none tracking-wide">AutoHub</span>
                <span className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Dealer Intelligence</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-white/50 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4 space-y-1">
            <div className="px-3 pb-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
              Sourcing Journey
            </div>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive
                    ? 'bg-white/[0.08] text-white font-semibold nav-active-glow'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isActive
                    ? 'bg-[#C8102E] shadow-md shadow-red-900/40'
                    : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                  }`}>
                    <Icon size={16} className={isActive ? 'text-white' : 'text-white/50 group-hover:text-white/70'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block leading-tight">{item.label}</span>
                    <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-white/40' : 'text-white/25'}`}>
                      {item.description}
                    </span>
                  </div>
                  {/* Step indicator */}
                  <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-md transition-all ${isActive
                    ? 'bg-[#C8102E]/30 text-[#FF6B78]'
                    : 'bg-white/[0.04] text-white/25'
                  }`}>
                    {index + 1}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Exchange Rate Widget */}
          <div className="mx-4 mt-8 p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Exchange Rate</div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-white/50">JPY / NZD</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white font-mono">¥91.24</div>
                <div className="text-[10px] text-emerald-400/70">Live rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 mx-4 mb-4 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#E8384F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-red-900/30">
              DM
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">David Miller</div>
              <div className="text-[10px] text-white/35 truncate flex items-center gap-1">
                <Building2 size={10} /> Auckland Auto Group
              </div>
            </div>
          </div>
          <Link
            href="/login"
            title="Logout"
            className="p-2 text-white/30 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
          >
            <LogOut size={14} />
          </Link>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-[68px] bg-white border-b border-[#E8ECF0] px-5 sm:px-8 flex items-center justify-between shrink-0 shadow-subtle">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#536471] hover:text-[#0F1419] rounded-xl hover:bg-[#F0F2F5] transition-colors"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] text-[#8899A6]">
              <span className="font-semibold text-[#0F1419]">Auckland Auto Group</span>
              <ChevronRight size={12} className="text-[#AAB8C2]" />
              <span className="text-[#536471] font-medium">Dealer Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden lg:flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AAB8C2]" />
              <input 
                type="text" 
                placeholder="Search make, model, year or keyword..." 
                className="pl-10 pr-4 py-2.5 bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl focus:bg-white focus:border-[#C8102E]/30 focus:ring-2 focus:ring-[#C8102E]/10 outline-none transition-all w-[280px] text-[13px] placeholder:text-[#AAB8C2] font-medium"
              />
            </div>
            
            {/* Notification Bell */}
            <button className="relative p-2.5 text-[#536471] hover:text-[#0F1419] hover:bg-[#F0F2F5] rounded-xl transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#C8102E] rounded-full border-2 border-white animate-pulse-dot"></span>
            </button>

            {/* User Avatar (compact) */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E8ECF0]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8102E] to-[#E8384F] text-white flex items-center justify-center font-bold text-[11px]">
                DM
              </div>
              <div className="hidden xl:block">
                <div className="text-[12px] font-semibold text-[#0F1419] leading-none">David Miller</div>
                <div className="text-[10px] text-[#8899A6] mt-0.5">Dealer</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#FAFBFC] p-5 sm:p-8 lg:p-10">
          <div className="max-w-[1240px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
