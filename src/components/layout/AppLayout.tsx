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
    <div className="flex h-screen bg-[#F7F8FA] text-slate-800 font-sans antialiased overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#10100E] text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand */}
          <div className="h-[68px] flex items-center justify-between px-5 border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#DF2B44] flex items-center justify-center overflow-hidden">
                <img
                  src="/autohub-logo.jpg"
                  alt="AutoHub"
                  className="w-6 h-6 rounded object-cover"
                />
              </div>
              <div>
                <span className="text-[14px] font-bold text-white block leading-none tracking-wide">AutoHub</span>
                <span className="text-[10px] text-neutral-500 font-medium tracking-wider">Dealer Intelligence</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 space-y-1">
            <div className="px-3 pb-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive
                    ? 'bg-[#DF2B44]/15 text-white font-semibold'
                    : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                  }`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${isActive ? 'bg-[#DF2B44]/20' : 'bg-white/[0.04]'}`}>
                    <Icon size={15} className={isActive ? 'text-[#DF2B44]' : 'text-neutral-500'} />
                  </div>
                  <div>
                    <span className="block leading-tight">{item.label}</span>
                    <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {item.description}
                    </span>
                  </div>
                  {/* Step number */}
                  <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-[#DF2B44]/20 text-[#DF2B44]' : 'bg-white/[0.04] text-neutral-600'}`}>
                    {index + 1}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-3 m-3 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#DF2B44]/15 text-[#DF2B44] flex items-center justify-center font-bold text-xs shrink-0">
              DM
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">David Miller</div>
              <div className="text-[10px] text-neutral-500 truncate flex items-center gap-1">
                <Building2 size={10} /> Auckland Auto Group
              </div>
            </div>
          </div>
          <Link
            href="/login"
            title="Logout"
            className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <LogOut size={13} />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-[60px] bg-white border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-base font-bold text-[#10100E] tracking-tight">
              Auckland Auto Group
            </h1>
            <span className="hidden sm:inline-flex text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
              Dealer Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-neutral-400 font-medium">JPY / NZD Rate</div>
              <div className="text-[12px] font-bold text-[#10100E] font-mono">¥91.24</div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
