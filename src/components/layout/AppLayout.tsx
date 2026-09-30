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
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Building2,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';
import { getStoredBids, getStoredWatchlist, getStoredPurchases } from '@/lib/dealerStore';
import WishlistHeaderModal, { WishlistButton } from '@/components/layout/WishlistHeaderModal';
import RoleSwitcher from './RoleSwitcher';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);

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

  // Primary menu items for Dealer Portal
  const primaryNavItems = [
    {
      label: 'Browse Vehicles',
      href: '/browse-vehicles',
      icon: Car,
      badge: null,
      activeCheck: (p: string) =>
        p === '/browse-vehicles' || p === '/' || p.startsWith('/vehicles') || p.startsWith('/vehicle'),
    },
    {
      label: 'My Bids',
      href: '/my-bids',
      icon: Gavel,
      badge: bidsCount > 0 ? bidsCount : null,
      badgeColor: 'rose',
      activeCheck: (p: string) => p.startsWith('/my-bids') || p.startsWith('/bids'),
    },
    {
      label: 'Watchlist',
      href: '/watchlist',
      icon: Heart,
      badge: watchlistCount > 0 ? watchlistCount : null,
      badgeColor: 'slate',
      activeCheck: (p: string) => p.startsWith('/watchlist'),
    },
    {
      label: 'Purchases',
      href: '/purchases',
      icon: FileText,
      badge: purchasesCount > 0 ? purchasesCount : null,
      badgeColor: 'emerald',
      activeCheck: (p: string) => p.startsWith('/purchases'),
    },
  ];

  // Secondary Tools Navigation
  const secondaryNavItems = [
    {
      label: 'NZ Market Intel',
      href: '/market',
      icon: TrendingUp,
      badge: 'NZ Data',
      activeCheck: (p: string) => p.startsWith('/market'),
    },
    {
      label: 'Dealership Profile',
      href: '/profile',
      icon: Building2,
      badge: null,
      activeCheck: (p: string) => p.startsWith('/profile'),
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Left Sidebar Navigation — Modern High-Contrast Navy Blue ─── */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50 w-[268px] bg-[#0A1322] border-r border-[#1B2A42] flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out text-slate-200
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        {/* ─── 1. Top Brand Header (Aligned to 68px) ─── */}
        <div className="h-[68px] px-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] shrink-0">
          <Link
            href="/browse-vehicles"
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
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
                <span className="text-[16px] font-extrabold tracking-tight text-white leading-none">
                  AutoHub
                </span>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-wide leading-none">
                  DEALER
                </span>
              </div>
              <span className="text-[9.5px] font-extrabold text-[#60A5FA] tracking-[0.16em] uppercase block mt-1 leading-none">
                INTELLIGENCE PLATFORM
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── 2. Scrollable Navigation Menus ─── */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Main Dealer Menu */}
          <div>
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold text-[#94A3B8] uppercase tracking-[0.14em]">
                Dealer Workspace
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80"></span>
            </div>
            <nav className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.activeCheck(pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${isActive
                      ? 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-semibold shadow-lg shadow-rose-950/40 ring-1 ring-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? 'text-white stroke-[2.2]'
                            : 'text-slate-400 group-hover:text-white transition-colors'
                        }
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${isActive
                          ? 'bg-white text-[#BE123C] shadow-xs'
                          : 'bg-white/15 text-slate-200 group-hover:bg-white/20'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Intelligence & Tools Section */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold text-[#94A3B8] uppercase tracking-[0.14em]">
                Intelligence & Tools
              </span>
            </div>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.activeCheck(pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${isActive
                      ? 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] text-white font-semibold shadow-lg shadow-rose-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className={
                          isActive
                            ? 'text-white stroke-[2.2]'
                            : 'text-slate-400 group-hover:text-white transition-colors'
                        }
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/20 uppercase tracking-wide">
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
            {/* Dealer Profile Row */}
            <div className="flex items-center justify-between gap-2.5">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 min-w-0 group"
                title="View Dealership Profile"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ring-1 ring-white/20">
                  AA
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-white group-hover:text-rose-400 transition-colors truncate leading-tight">
                    Auckland Auto
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                    <span>Verified NZ Trader</span>
                  </div>
                </div>
              </Link>

              {/* Logout Button */}
              <Link
                href="/login"
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] rounded-lg transition-colors shrink-0"
              >
                <LogOut size={15} />
              </Link>
            </div>

            {/* Live Feed Status Pill */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-300 font-medium text-[11px]">Heiwa Feed Live</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Height aligned to 68px) */}
        <header className="h-[68px] bg-white border-b border-[#E5E7EB] px-4 sm:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#4B5563] hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Search Input with ⌘K Badge */}
            <form onSubmit={handleHeaderSearch} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="Search make, model, year or keyword..."
                className="w-full pl-10 pr-12 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition-all"
              />
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF] bg-slate-100 border border-[#E5E7EB] rounded">
                /
              </span>
            </form>
          </div>

          {/* Right Header: Role Switcher + Wishlist Button + Notifications + Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 ml-3 sm:ml-4">
            {/* View Switcher: Dealer / Admin */}
            <RoleSwitcher />

            {/* Wishlist Header Quick Access */}
            <WishlistButton onClick={() => setWishlistModalOpen(true)} />

            {/* Notification Bell */}
            <button
              className="relative p-2 text-[#4B5563] hover:text-[#111827] hover:bg-slate-100 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E11D48] rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Profile Pill Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#0F1B2E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-[#1E2E4A]">
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
                      href="/market"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#374151] hover:bg-slate-50"
                    >
                      <TrendingUp size={14} />
                      <span>NZ Market Intelligence</span>
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
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Wishlist Header Modal */}
      <WishlistHeaderModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
      />
    </div>
  );
}
