"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Heart,
  DollarSign,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';
import { useSyncStore } from '@/lib/syncStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  
  const { state: syncState } = useSyncStore();

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/admin/vehicles?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    } else {
      router.push('/admin/vehicles');
    }
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, badge: 'Live' },
    { label: 'Dealers', href: '/admin/dealers', icon: Users, badge: '3 Active' },
    { label: 'Wish Lists', href: '/admin/wishlists', icon: Heart, badge: 'Active' },
    { label: 'Heiwa Vehicles', href: '/admin/vehicles', icon: Car, badge: '38 Lots' },
  ];

  const secondaryNavItems = [
    { label: 'Auction Feeds', href: '/admin/vehicles', icon: Database, badge: '4 Live' },
    { label: 'FX Benchmark', href: '/admin', icon: DollarSign, badge: '¥91.24' },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar - Modern High-Contrast Navy Blue ─── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[268px] bg-[#0A1322] border-r border-[#1B2A42] text-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* ─── 1. Top Brand Header (Aligned to 68px) ─── */}
        <div className="h-[68px] px-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] shrink-0">
          <Link href="/admin" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
            {/* AutoHub Logo Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] p-0.5 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                <img
                  src="/autohub-logo.jpg"
                  alt="AutoHub"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Brand Titles */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[16px] font-extrabold text-white tracking-tight leading-none">AutoHub</span>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wide leading-none">
                  ADMIN OPS
                </span>
              </div>
              <span className="block text-[9.5px] font-extrabold text-[#60A5FA] tracking-[0.16em] uppercase mt-1 leading-none">
                INTELLIGENCE PLATFORM
              </span>
            </div>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── 2. Scrollable Navigation Menus ─── */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Main Admin Menu */}
          <div>
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold text-[#94A3B8] uppercase tracking-[0.14em]">
                Admin Management
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80"></span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-semibold shadow-lg shadow-rose-950/40 ring-1 ring-white/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? 'text-white stroke-[2.2]' : 'text-slate-400 group-hover:text-white transition-colors'}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-white text-[#BE123C] shadow-xs' 
                          : 'bg-white/15 text-slate-200 group-hover:bg-white/20'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Engine & Feeds Section */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold text-[#94A3B8] uppercase tracking-[0.14em]">
                Engine & Brokerage
              </span>
              <button
                onClick={handleRefreshFeeds}
                title="Sync Feeds"
                className="text-slate-400 hover:text-white transition-colors p-0.5"
              >
                <RefreshCw size={11} className={isRefreshing ? 'animate-spin text-rose-400' : ''} />
              </button>
            </div>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      isActive && item.label !== 'FX Benchmark' && item.label !== 'Auction Feeds'
                        ? 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-semibold shadow-lg shadow-rose-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className="text-slate-400 group-hover:text-white transition-colors"
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                        item.badge.includes('Live')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20'
                          : 'bg-white/10 text-slate-200 border border-white/10'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ─── 3. Elevated Docked Bottom Card (Clearly Separated) ─── */}
        <div className="p-3 shrink-0">
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.09] p-3 space-y-3 backdrop-blur-md shadow-xl">
            {/* Super Admin Profile Row */}
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2B5885] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ring-1 ring-white/20">
                  AH
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-white truncate leading-tight">
                    Super Admin
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                    <Shield size={11} className="text-rose-400 shrink-0" />
                    <span>AutoHub Operations</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <Link
                href="/login"
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] rounded-lg transition-colors shrink-0"
              >
                <LogOut size={15} />
              </Link>
            </div>

            {/* DIP Engine Status Pill */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium text-[11px]">DIP Engine Online</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">¥91.24/NZD</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar — Aligned to 68px */}
        <header className="h-[68px] bg-white border-b border-[#E5E7EB] px-4 sm:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#4B5563] hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Centered/Wide Search Input with / shortcut badge */}
            <form onSubmit={handleHeaderSearch} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="Search models, dealers, VINs or lots..."
                className="w-full pl-10 pr-12 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-all"
              />
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF] bg-slate-100 border border-[#E5E7EB] rounded">
                /
              </span>
            </form>
          </div>

          {/* Right Header: Role Switcher + Feeds Sync + Notification + Admin Profile Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 ml-3 sm:ml-4">
            {/* View Switcher: Dealer / Admin */}
            <RoleSwitcher />

            {/* Feeds Refresh Button */}
            <button
              onClick={handleRefreshFeeds}
              className={`p-2 text-[#4B5563] hover:text-[#111827] hover:bg-slate-100 rounded-full transition-colors ${
                isRefreshing ? 'text-rose-600' : ''
              }`}
              title="Sync Live Heiwa Feeds"
            >
              <RefreshCw size={17} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            {/* Notification Bell */}
            <button
              className="relative p-2 text-[#4B5563] hover:text-[#111827] hover:bg-slate-100 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white"></span>
            </button>

            {/* Admin Profile Pill */}
            <div className="relative">
              <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-left cursor-default">
                <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-[#273B5E]">
                  AH
                </div>
                <div className="hidden sm:block">
                  <span className="text-[13px] font-bold text-[#111827] block leading-tight">
                    Super Admin
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                    AutoHub Operations
                  </span>
                </div>
              </div>
            </div>
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
