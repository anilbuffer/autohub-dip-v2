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
  Sparkles,
  LayoutDashboard,
  Heart
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
    if (pathname === '/admin') return [{ label: 'Overview', href: '/admin' }];
    if (pathname === '/admin/dealers') return [{ label: 'Dealers', href: '/admin/dealers' }];
    if (pathname.startsWith('/admin/dealers/')) return [
      { label: 'Dealers', href: '/admin/dealers' },
      { label: 'Dealer Profile', href: pathname }
    ];
    if (pathname === '/admin/wishlists') return [{ label: 'Wish Lists', href: '/admin/wishlists' }];
    if (pathname === '/admin/vehicles') return [{ label: 'Heiwa Vehicles', href: '/admin/vehicles' }];
    if (pathname.startsWith('/admin/vehicles/')) return [
      { label: 'Heiwa Vehicles', href: '/admin/vehicles' },
      { label: 'Vehicle Sheet', href: pathname }
    ];
    return [{ label: 'Overview', href: '/admin' }];
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, badge: 'Live' },
    { label: 'Dealers', href: '/admin/dealers', icon: Users, badge: '3 Active' },
    { label: 'Wish Lists', href: '/admin/wishlists', icon: Heart, badge: 'Active' },
    { label: 'Heiwa Vehicles', href: '/admin/vehicles', icon: Car, badge: '38 Lots' },
  ];

  const handleRefreshFeeds = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#111C2D] font-sans antialiased overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar - Light Navy Theme ─── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[272px] bg-gradient-to-b from-[#182C48] via-[#14243B] to-[#101C2E] border-r border-[#1E3A5F]/40 text-white/90 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Logo & Header */}
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.08] bg-white/[0.03]">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#E11D48] flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/autohub-logo.jpg"
                  alt="AutoHub"
                  className="w-7 h-7 rounded-lg object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold text-white tracking-tight leading-none">AutoHub</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-[#E11D48] text-white">OPS</span>
                </div>
                <span className="block text-[9.5px] font-bold text-[#4B88CF] tracking-[0.14em] uppercase mt-1 leading-none">
                  INTELLIGENCE PLATFORM
                </span>
              </div>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Live Scraper Engine Status */}
          <div className="px-4 py-2.5 mx-4 mt-4 flex items-center justify-between bg-[#0E1B2C]/70 rounded-xl border border-[#1E3A5F]/40 text-[11px]">
            <div className="flex items-center gap-2 text-[#BACDD8] font-medium">
              <Database size={13} className="text-blue-400" />
              <span>Auction Feeds:</span>
              <span className="font-bold text-white">4 Online</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot"></span>
            </div>
            <button 
              onClick={handleRefreshFeeds}
              title="Sync Feeds"
              className="text-[#9AB9D5] hover:text-white p-1 hover:bg-white/[0.08] rounded-md transition-all"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            <div className="px-3 pb-3 text-[10px] font-bold text-[#7E9CBA] uppercase tracking-[0.15em]">
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
                      ? 'bg-[#1E3A5F] text-white font-semibold border border-[#2B4E7D]/50 nav-active-glow'
                      : 'text-[#BACDD8] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-[#E11D48] shadow-md shadow-rose-950/40 text-white' 
                        : 'bg-white/[0.06] group-hover:bg-white/[0.1] text-[#9AB9D5] group-hover:text-white'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      isActive 
                        ? 'bg-[#E11D48]/20 text-rose-300' 
                        : 'bg-white/[0.08] text-white/60'
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
        <div className="p-4 mx-4 mb-4 bg-[#0E1B2C]/70 rounded-xl border border-[#1E3A5F]/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2B5885] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#2B5885]/50">
              AD
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">Platform Admin</div>
              <div className="text-[10px] text-[#9AB9D5] truncate">Super Admin Role</div>
            </div>
          </div>
          <Link 
            href="/login" 
            title="Switch User / Logout"
            className="p-2 text-[#9AB9D5] hover:text-white hover:bg-white/[0.08] rounded-lg transition-all"
          >
            <LogOut size={14} />
          </Link>
        </div>
      </aside>

      {/* ─── Main Content Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-[68px] bg-white border-b border-[#E2E8F0] px-5 sm:px-8 flex items-center justify-between shrink-0 shadow-subtle z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#475569] hover:text-[#111C2D] rounded-xl hover:bg-[#F1F5F9] transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              {/* Breadcrumbs */}
              <div className="text-[11px] text-[#64748B] font-medium flex items-center gap-1.5">
                <span className="font-semibold text-[#475569]">Admin Operations</span>
                {getBreadcrumbs().map((b, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight size={11} className="text-[#94A3B8] shrink-0" />
                    <Link href={b.href} className="hover:text-[#111C2D] truncate transition-colors">
                      {b.label}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
              {/* Page Title */}
              <div className="text-lg font-extrabold text-[#111C2D] tracking-tight flex items-center gap-2.5 mt-0.5">
                {pathname === '/admin' 
                  ? 'Overview & System Health' 
                  : pathname === '/admin/dealers' 
                  ? 'Dealers Network & Criteria' 
                  : pathname === '/admin/wishlists' 
                  ? 'Dealer Wish Lists & Matches' 
                  : pathname === '/admin/vehicles' 
                  ? 'Heiwa Auction Vehicles' 
                  : 'Command Center'}
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
                  <Shield size={11} className="text-[#E11D48]" /> 
                  {pathname === '/admin' ? 'AutoHub Dealer Intelligence Platform (DIP)' : 'DIP Brokerage Super Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden xl:flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input 
                type="text" 
                placeholder="Search models, dealers, VINs..." 
                className="pl-10 pr-14 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15 outline-none transition-all w-[260px] text-[13px] text-[#111C2D] placeholder:text-[#94A3B8] font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-[#CBD5E1] text-[#94A3B8] rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                ⌘K
              </span>
            </div>

            {/* Role Switcher */}
            <RoleSwitcher />

            {/* Notification Bell */}
            <button className="relative p-2.5 text-[#475569] hover:text-[#111C2D] transition-colors border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] bg-white">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E11D48] rounded-full border-2 border-white animate-pulse-dot"></span>
            </button>

            {/* Settings Quick Icon */}
            <Link
              href="/admin/settings"
              className="p-2.5 text-[#475569] hover:text-[#111C2D] transition-colors border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] bg-white"
              title="Global Settings"
            >
              <Settings size={18} />
            </Link>
          </div>
        </header>

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-5 sm:p-8 lg:p-10">
          <div className="max-w-[1520px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
