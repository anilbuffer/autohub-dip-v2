"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Car, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  ChevronRight, 
  Database,
  RefreshCw,
  LogOut,
  Shield,
  Sparkles
} from 'lucide-react';
import { GLOBAL_SETTINGS } from '@/lib/data';
import RoleSwitcher from './RoleSwitcher';
import { useSyncStore } from '@/lib/syncStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { state: syncState } = useSyncStore();

  const getBreadcrumbs = () => {
    if (pathname === '/admin') return [{ label: 'Demand Intelligence', href: '/admin' }];
    if (pathname === '/admin/vehicles') return [{ label: 'Auction Inventory', href: '/admin/vehicles' }];
    if (pathname.startsWith('/admin/vehicles/')) return [
      { label: 'Auction Inventory', href: '/admin/vehicles' },
      { label: 'Vehicle Broker Sheet', href: pathname }
    ];
    if (pathname === '/admin/dealers') return [{ label: 'Dealership Network', href: '/admin/dealers' }];
    if (pathname.startsWith('/admin/dealers/')) return [
      { label: 'Dealership Network', href: '/admin/dealers' },
      { label: 'Dealer Profile & Criteria', href: pathname }
    ];
    if (pathname === '/admin/settings') return [{ label: 'Global FX & Calculation Engine', href: '/admin/settings' }];
    return [{ label: 'Demand Intelligence', href: '/admin' }];
  };

  const navItems = [
    { label: 'Demand Intelligence', href: '/admin', icon: Sparkles, badge: 'Live AI' },
    { label: 'Auction Lots', href: '/admin/vehicles', icon: Car, badge: '38 Lots' },
    { label: 'Dealers CRM', href: '/admin/dealers', icon: Users, badge: '3 Active' },
    { label: 'Calculation Engine', href: '/admin/settings', icon: Settings, badge: null },
  ];

  const handleRefreshFeeds = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex h-screen bg-[#FAFBFC] text-[#0F1419] font-sans antialiased overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar - Deep Navy ─── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[272px] bg-[#0B1322] text-white/80 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Logo & Header */}
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#080E1A]">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B2A4A] to-[#2B406B] flex items-center justify-center shadow-lg shadow-blue-950/50 group-hover:scale-105 transition-transform border border-[#2B406B]/50">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-black text-white tracking-wider leading-none">AUTOHEIWA</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-[#C8102E] text-white">OPS</span>
                </div>
                <span className="block text-[10px] font-semibold text-white/30 tracking-[0.12em] mt-1">BROKER & ADMIN</span>
              </div>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-white/50 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Live Scraper Engine Status */}
          <div className="px-4 py-2.5 mx-4 mt-4 flex items-center justify-between bg-[#0E182A] rounded-xl border border-[#1B2A4A]/40 text-[11px]">
            <div className="flex items-center gap-2 text-white/60 font-medium">
              <Database size={13} className="text-blue-400" />
              <span>Auction Feeds:</span>
              <span className="font-bold text-white">4 Online</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot"></span>
            </div>
            <button 
              onClick={handleRefreshFeeds}
              title="Sync Feeds"
              className="text-white/30 hover:text-white p-1 hover:bg-white/[0.06] rounded-md transition-all"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            <div className="px-3 pb-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.15em]">
              Management & Intelligence
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/[0.06] text-white font-semibold nav-active-glow'
                      : 'text-white/45 hover:bg-white/[0.03] hover:text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-[#C8102E] shadow-md shadow-red-900/40' 
                        : 'bg-white/[0.04] group-hover:bg-white/[0.06]'
                    }`}>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      isActive 
                        ? 'bg-[#C8102E]/20 text-[#FF6B78]' 
                        : 'bg-white/[0.04] text-white/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Super Admin Footer */}
        <div className="p-4 mx-4 mb-4 bg-[#080E1A] rounded-xl border border-[#1B2A4A]/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B2A4A] to-[#2B406B] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#2B406B]/50">
              AD
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">Platform Admin</div>
              <div className="text-[10px] text-white/30 truncate">Super Admin Role</div>
            </div>
          </div>
          <Link 
            href="/login" 
            title="Switch User / Logout"
            className="p-2 text-white/25 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
          >
            <LogOut size={14} />
          </Link>
        </div>
      </aside>

      {/* ─── Main Content Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-[68px] bg-white border-b border-[#E8ECF0] px-5 sm:px-8 flex items-center justify-between shrink-0 shadow-subtle z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#536471] hover:text-[#0F1419] rounded-xl hover:bg-[#F0F2F5] transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              {/* Breadcrumbs */}
              <div className="text-[11px] text-[#8899A6] font-medium flex items-center gap-1.5">
                <span className="font-semibold text-[#536471]">Admin Operations</span>
                {getBreadcrumbs().map((b, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight size={11} className="text-[#AAB8C2] shrink-0" />
                    <Link href={b.href} className="hover:text-[#0F1419] truncate transition-colors">
                      {b.label}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
              {/* Page Title */}
              <div className="text-lg font-extrabold text-[#0F1419] tracking-tight flex items-center gap-2.5 mt-0.5">
                {pathname === '/admin' ? 'Demand Intelligence' : 'Command Center'}
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-[#536471] bg-[#F0F2F5] px-2.5 py-1 rounded-lg border border-[#E8ECF0]">
                  <Shield size={11} className="text-[#C8102E]" /> 
                  {pathname === '/admin' ? 'Autohub & Heiwa Sourcing' : 'Brokerage Super Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden xl:flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AAB8C2]" />
              <input 
                type="text" 
                placeholder="Search models, dealers, VINs..." 
                className="pl-10 pr-14 py-2.5 bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl focus:bg-white focus:border-[#1B2A4A]/40 focus:ring-2 focus:ring-[#1B2A4A]/10 outline-none transition-all w-[260px] text-[13px] placeholder:text-[#AAB8C2] font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-[#E8ECF0] text-[#AAB8C2] rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                ⌘K
              </span>
            </div>

            {/* Role Switcher */}
            <RoleSwitcher />

            {/* Notification Bell */}
            <button className="relative p-2.5 text-[#536471] hover:text-[#0F1419] transition-colors border border-[#E8ECF0] rounded-xl hover:bg-[#F0F2F5] bg-white">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#C8102E] rounded-full border-2 border-white animate-pulse-dot"></span>
            </button>

            {/* Settings Quick Icon */}
            <Link
              href="/admin/settings"
              className="p-2.5 text-[#536471] hover:text-[#0F1419] transition-colors border border-[#E8ECF0] rounded-xl hover:bg-[#F0F2F5] bg-white"
              title="Global Settings"
            >
              <Settings size={18} />
            </Link>
          </div>
        </header>

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#FAFBFC] p-5 sm:p-8 lg:p-10">
          <div className="max-w-[1520px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
