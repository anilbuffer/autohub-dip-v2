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
    <div className="flex h-screen bg-[#FAFBFC] text-[#0F1419] font-sans antialiased overflow-hidden">
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

      {/* ─── Left Sidebar Navigation ─── */}
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
                <span className="text-[15px] font-bold text-white block leading-none tracking-wide">AutoHub DIP</span>
                <span className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Dealer Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-white/50 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-7 px-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.16em]">
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
                    ? 'bg-white/[0.09] text-white font-semibold shadow-inner'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white/85'
                    }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isActive
                    ? 'bg-[#C8102E] shadow-md shadow-red-900/40 text-white'
                    : 'bg-white/[0.05] group-hover:bg-white/[0.08] text-white/50 group-hover:text-white/70'
                    }`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block leading-tight text-[13px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-white/10 text-white/70'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
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

      {/* ─── Main Viewport ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-[68px] bg-white border-b border-[#E8ECF0] px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-subtle z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#536471] hover:text-[#0F1419] rounded-xl hover:bg-[#F0F2F5] transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-[12px] text-[#8899A6]">
              <span className="font-semibold text-[#0F1419]">Auckland Auto Group</span>
              <ChevronRight size={12} className="text-[#AAB8C2]" />
              <span className="text-[#536471] font-medium hidden sm:inline">Dealer Portal</span>
              <ChevronRight size={12} className="text-[#AAB8C2] hidden sm:inline" />
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#AAB8C2]" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={e => setHeaderSearchQuery(e.target.value)}
                placeholder="Search Heiwa stock..."
                className="pl-9 pr-3 py-1.5 bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl focus:bg-white focus:border-[#C8102E]/30 focus:ring-2 focus:ring-[#C8102E]/10 outline-none transition-all w-[220px] lg:w-[280px] text-xs placeholder:text-[#AAB8C2] font-medium"
              />
            </form>

            {/* Wishlist Accessible from Header */}
            <WishlistButton onClick={() => setWishlistModalOpen(true)} />

            {/* Notification Bell */}
            <button className="relative p-2 text-[#536471] hover:text-[#0F1419] hover:bg-[#F0F2F5] rounded-xl transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C8102E] rounded-full border-2 border-white animate-pulse-dot"></span>
            </button>

            {/* User Profile */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E8ECF0]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8102E] to-[#E8384F] text-white flex items-center justify-center font-bold text-[11px]">
                DM
              </div>
              <div className="hidden xl:block">
                <div className="text-[12px] font-semibold text-[#0F1419] leading-none">David Miller</div>
                <div className="text-[10px] text-[#8899A6] mt-0.5">Dealer Principal</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#FAFBFC] p-4 sm:p-7 lg:p-9">
          <div className="max-w-[1280px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
