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
    <div className="flex items-center gap-1 bg-[#F0F2F5] p-1 rounded-xl border border-[#E8ECF0]">
      <span className="text-[10px] font-bold text-[#AAB8C2] pl-2 pr-1 uppercase tracking-wider hidden sm:inline select-none">
        View:
      </span>

      {/* Dealer Role Button */}
      <Link
        href="/"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all select-none ${
          !isAdmin
            ? 'bg-white text-[#0F1419] shadow-sm border border-[#E8ECF0]'
            : 'text-[#8899A6] hover:text-[#536471] hover:bg-white/50'
        }`}
        title="Switch to Dealer Portal View"
      >
        <Building2 
          size={14} 
          className={!isAdmin ? 'text-emerald-600' : 'text-[#AAB8C2]'} 
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
            ? 'bg-[#0F1419] text-white shadow-sm'
            : 'text-[#8899A6] hover:text-[#536471] hover:bg-white/50'
        }`}
        title="Switch to Autohub / Heiwa Admin Command Center"
      >
        <ShieldCheck 
          size={14} 
          className={isAdmin ? 'text-blue-300' : 'text-[#AAB8C2]'} 
        />
        <span>Admin</span>
        {isAdmin && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 hidden md:inline-block animate-pulse-dot"></span>
        )}
      </Link>
    </div>
  );
}
