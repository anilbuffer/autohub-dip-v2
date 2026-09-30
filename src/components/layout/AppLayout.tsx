"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Car,
  Gavel,
  Heart,
  FileText,
  User,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { getStoredBids, getStoredWatchlist, getStoredPurchases } from '@/lib/dealerStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Dynamic counts for sidebar badges
  const [bidsCount, setBidsCount] = useState<number>(0);
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [purchasesCount, setPurchasesCount] = useState<number>(0);

  const refreshBadgeCounts = () => {
    try {
      const bids = getStoredBids();
      setBidsCount(bids.filter(b => b.status === 'leading' || b.status === 'under_reserve').length);
      const wl = getStoredWatchlist();
      setWatchlistCount(wl.length);
      const purchases = getStoredPurchases();
      setPurchasesCount(purchases.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshBadgeCounts();
    const handler = () => refreshBadgeCounts();
    window.addEventListener('autohub_dealer_store_change', handler);
    return () => window.removeEventListener('autohub_dealer_store_change', handler);
  }, []);

  // Primary menu items matching reference image
  const primaryNavItems = [
    {
      label: 'Browse Vehicles',
      href: '/browse-vehicles',
      icon: Car,
      activeCheck: (p: string) =>
        p === '/browse-vehicles' || p === '/' || p.startsWith('/vehicles') || p.startsWith('/vehicle'),
    },
    {
      label: 'My Bids',
      href: '/my-bids',
      icon: Gavel,
      badge: bidsCount > 0 ? bidsCount : null,
      activeCheck: (p: string) => p.startsWith('/my-bids') || p.startsWith('/bids'),
    },
    {
      label: 'Watchlist',
      href: '/watchlist',
      icon: Heart,
      badge: watchlistCount > 0 ? watchlistCount : null,
      activeCheck: (p: string) => p.startsWith('/watchlist'),
    },
    {
      label: 'Purchases',
      href: '/purchases',
      icon: FileText,
      badge: purchasesCount > 0 ? purchasesCount : null,
      activeCheck: (p: string) => p.startsWith('/purchases'),
    },
  ];

  // Secondary lower menu items matching reference image
  const secondaryNavItems = [
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
      activeCheck: (p: string) => p.startsWith('/profile'),
    },
    {
      label: 'Help',
      href: '/help',
      icon: HelpCircle,
      activeCheck: (p: string) => p.startsWith('/help'),
    },
  ];

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/browse-vehicles?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    } else {
      router.push('/browse-vehicles');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#111827] font-sans antialiased overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Left Sidebar Navigation — Clean White matching Reference Design ─── */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50 w-[240px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="flex-1 flex flex-col pt-5 px-3">
          {/* Brand Header: Auckland Auto Group */}
          <div className="flex items-center justify-between px-3 mb-6">
            <Link
              href="/browse-vehicles"
              className="flex items-center gap-2.5 text-[#111827] group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center border border-[#DBEAFE] group-hover:scale-105 transition-transform">
                <Car size={18} className="stroke-[2.2]" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-[#111827]">
                Auckland Auto Group
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-[#9CA3AF] hover:text-[#111827] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.activeCheck(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#1E3A5F] font-semibold'
                      : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={isActive ? 'text-[#1E3A5F] stroke-[2.2]' : 'text-[#6B7280]'}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#1E3A5F] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Lower Links */}
          <div className="mt-8 pt-4 border-t border-[#F1F5F9] space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.activeCheck(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#1E3A5F] font-semibold'
                      : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-[#1E3A5F] stroke-[2.2]' : 'text-[#6B7280]'}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Small footer info */}
        <div className="p-4 border-t border-[#F1F5F9] text-[11px] text-[#9CA3AF] flex items-center justify-between">
          <span>AutoHub DIP v2.4</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected to Heiwa Live Feed" />
        </div>
      </aside>

      {/* ─── Main Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar matching reference */}
        <header className="h-[64px] bg-white border-b border-[#E5E7EB] px-4 sm:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#4B5563] hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Centered/Wide Search Input matching reference */}
            <form onSubmit={handleHeaderSearch} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="Search make, model, year or keyword..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] transition-all"
              />
            </form>
          </div>

          {/* Right Header: Notification + Dealer Profile */}
          <div className="flex items-center gap-3 ml-4">
            {/* Notification Bell */}
            <button
              className="relative p-2 text-[#4B5563] hover:text-[#111827] hover:bg-slate-100 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Profile Pill matching reference screenshot */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  AA
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-[#111827]">
                    Auckland Auto Group
                  </span>
                  <ChevronDown size={14} className="text-[#6B7280]" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-1 z-50 text-xs">
                    <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
                      <div className="font-bold text-[#111827]">Auckland Auto Group</div>
                      <div className="text-[11px] text-[#6B7280]">Registered NZ Motor Trader</div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#374151] hover:bg-slate-50"
                    >
                      <User size={14} />
                      <span>Dealership Profile</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#374151] hover:bg-slate-50"
                    >
                      <HelpCircle size={14} />
                      <span>Help & Documentation</span>
                    </Link>
                    <div className="border-t border-[#F1F5F9] my-1" />
                    <Link
                      href="/login"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-7 lg:p-9">
          <div className="max-w-[1280px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
