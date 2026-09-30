"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Car,
  Gavel,
  Heart,
  PackageCheck,
  Search,
  Menu,
  X,
  LogOut,
  Building2,
  Bell,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import WishlistHeaderModal, { WishlistButton } from './WishlistHeaderModal';
import { getStoredBids, getStoredWatchlist, getStoredPurchases } from '@/lib/dealerStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  // Dynamic counts for sidebar badges
  const [bidsCount, setBidsCount] = useState<number>(3);
  const [watchlistCount, setWatchlistCount] = useState<number>(2);
  const [purchasesCount, setPurchasesCount] = useState<number>(2);

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

  const navItems = [
    {
      label: 'Browse Vehicles',
      href: '/',
      icon: Car,
      badge: null,
    },
    {
      label: 'My Bids',
      href: '/bids',
      icon: Gavel,
      badge: bidsCount > 0 ? `${bidsCount} Active` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      label: 'My Watchlist',
      href: '/watchlist',
      icon: Heart,
      badge: watchlistCount > 0 ? `${watchlistCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      label: 'Purchases',
      href: '/purchases',
      icon: PackageCheck,
      badge: purchasesCount > 0 ? `${purchasesCount}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#111C2D] font-sans antialiased overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Wishlist Modal in Header ─── */}
      <WishlistHeaderModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
      />

      {/* ─── Left Sidebar Navigation — Light Navy Theme ─── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[264px] bg-gradient-to-b from-[#182C48] via-[#14243B] to-[#101C2E] border-r border-[#1E3A5F]/40 text-white/90 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.08]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#C8102E] flex items-center justify-center overflow-hidden shadow-lg shadow-red-950/40 group-hover:scale-105 transition-transform">
                <img
                  src="/autohub-logo.jpg"
                  alt="AutoHub"
                  className="w-7 h-7 rounded-lg object-cover"
                />
              </div>
              <div>
                <span className="text-[15px] font-bold text-white block leading-none tracking-wide">AutoHub DIP</span>
                <span className="text-[10px] text-[#9AB9D5] font-semibold tracking-widest uppercase">Dealer Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-7 px-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold text-[#7E9CBA] uppercase tracking-[0.16em]">
              Dealer Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/'
                ? (pathname === '/' || pathname.startsWith('/vehicles') || pathname.startsWith('/vehicle'))
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive
                    ? 'bg-[#1E3A5F] text-white font-semibold shadow-sm border border-[#2B4E7D]/50 nav-active-glow'
                    : 'text-[#BACDD8] hover:bg-white/[0.06] hover:text-white'
                    }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isActive
                    ? 'bg-[#C8102E] shadow-md shadow-red-950/40 text-white'
                    : 'bg-white/[0.06] group-hover:bg-white/[0.1] text-[#9AB9D5] group-hover:text-white'
                    }`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block leading-tight text-[13px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-white/10 text-white/80 border-white/20'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 mx-4 mb-4 bg-[#0E1B2C]/70 rounded-xl border border-[#1E3A5F]/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#E8384F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-red-950/30">
              DM
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">David Miller</div>
              <div className="text-[10px] text-[#9AB9D5] truncate flex items-center gap-1">
                <Building2 size={10} /> Auckland Auto Group
              </div>
            </div>
          </div>
          <Link
            href="/login"
            title="Logout"
            className="p-2 text-[#9AB9D5] hover:text-white hover:bg-white/[0.08] rounded-lg transition-all"
          >
            <LogOut size={14} />
          </Link>
        </div>
      </aside>

      {/* ─── Main Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-[68px] bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-subtle z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#475569] hover:text-[#111C2D] rounded-xl hover:bg-[#F1F5F9] transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
              <span className="font-bold text-[#111C2D]">Auckland Auto Group</span>
              <ChevronRight size={12} className="text-[#94A3B8]" />
              <span className="text-[#475569] font-medium hidden sm:inline">Dealer Portal</span>
              <ChevronRight size={12} className="text-[#94A3B8] hidden sm:inline" />
              <span className="text-[#C8102E] font-semibold">
                {pathname === '/' ? 'Browse Vehicles' :
                  pathname.startsWith('/bids') ? 'My Bids' :
                    pathname.startsWith('/watchlist') ? 'My Watchlist' :
                      pathname.startsWith('/purchases') ? 'Purchases' :
                        pathname.startsWith('/vehicles') || pathname.startsWith('/vehicle') ? 'Vehicle Detail' :
                          'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search in Header */}
            <form onSubmit={handleHeaderSearch} className="relative hidden md:flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={e => setHeaderSearchQuery(e.target.value)}
                placeholder="Search Heiwa stock..."
                className="pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15 outline-none transition-all w-[220px] lg:w-[280px] text-xs text-[#111C2D] placeholder:text-[#94A3B8] font-medium"
              />
            </form>

            {/* Wishlist Accessible from Header */}
            <WishlistButton onClick={() => setWishlistModalOpen(true)} />

            {/* Notification Bell */}
            <button className="relative p-2 text-[#475569] hover:text-[#111C2D] hover:bg-[#F1F5F9] rounded-xl transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C8102E] rounded-full border-2 border-white animate-pulse-dot"></span>
            </button>

            {/* User Profile */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8102E] to-[#E8384F] text-white flex items-center justify-center font-bold text-[11px]">
                DM
              </div>
              <div className="hidden xl:block">
                <div className="text-[12px] font-semibold text-[#111C2D] leading-none">David Miller</div>
                <div className="text-[10px] text-[#64748B] mt-0.5">Dealer Principal</div>
              </div>
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
