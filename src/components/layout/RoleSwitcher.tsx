"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ShieldCheck } from 'lucide-react';

interface RoleSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function RoleSwitcher({ variant = 'light' }: RoleSwitcherProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
      <span className="text-[10px] font-bold text-[#94A3B8] pl-2 pr-1 uppercase tracking-wider hidden sm:inline select-none">
        View:
      </span>

      {/* Dealer Role Button */}
      <Link
        href="/"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all select-none ${
          !isAdmin
            ? 'bg-white text-[#111C2D] shadow-sm border border-[#E2E8F0]'
            : 'text-[#64748B] hover:text-[#111C2D] hover:bg-white/60'
        }`}
        title="Switch to Dealer Portal View"
      >
        <Building2 
          size={14} 
          className={!isAdmin ? 'text-emerald-600' : 'text-[#94A3B8]'} 
        />
        <span>Dealer</span>
        {!isAdmin && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 hidden md:inline-block animate-pulse-dot"></span>
        )}
      </Link>

      {/* Autohub Admin Role Button */}
      <Link
        href="/admin"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all select-none ${
          isAdmin
            ? 'bg-[#1E3A5F] text-white shadow-sm'
            : 'text-[#64748B] hover:text-[#111C2D] hover:bg-white/60'
        }`}
        title="Switch to Autohub / Heiwa Admin Command Center"
      >
        <ShieldCheck 
          size={14} 
          className={isAdmin ? 'text-blue-300' : 'text-[#94A3B8]'} 
        />
        <span>Admin</span>
        {isAdmin && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 hidden md:inline-block animate-pulse-dot"></span>
        )}
      </Link>
    </div>
  );
}
