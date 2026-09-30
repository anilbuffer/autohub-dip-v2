"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  BarChart3,
  Globe,
  DollarSign,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingRole, setLoadingRole] = useState<'dealer' | 'admin' | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase().includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  const loginAsDemo = (role: 'dealer' | 'admin') => {
    setLoadingRole(role);
    if (role === 'admin') {
      setEmail("admin@autohub.co.nz");
      setPassword("adminSecure2026");
      setTimeout(() => router.push("/admin"), 400);
    } else {
      setEmail("dealer@autohub.co.nz");
      setPassword("dealerSecure2026");
      setTimeout(() => router.push("/"), 400);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-[#10100E] text-white p-10 relative overflow-hidden">
        
        {/* Subtle decorative element */}
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#DF2B44]/8" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#DF2B44]/5" />

        {/* Logo & brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#DF2B44] flex items-center justify-center">
              <img 
                src="/autohub-logo.jpg" 
                alt="AutoHub" 
                className="w-7 h-7 rounded object-cover"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-wide block leading-none">AutoHub</span>
              <span className="text-[11px] text-neutral-400 font-medium tracking-wide">
                Dealer Intelligence Platform
              </span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6 my-auto">
          <h1 className="text-3xl font-bold leading-snug tracking-tight text-white">
            Market data and landed costs,<br />
            <span className="text-neutral-400">all in one place.</span>
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            Access NZ market indicators, real-time exchange rates, shipping estimates, 
            and compliance data — so you can make informed sourcing decisions.
          </p>

          {/* Feature highlights */}
          <div className="space-y-3 pt-2">
            {[
              { icon: BarChart3, label: "NZ market trends & pricing data" },
              { icon: DollarSign, label: "Live landed cost calculations" },
              { icon: Globe, label: "JPY/NZD rates & shipping estimates" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-[#DF2B44]" />
                </div>
                <span className="text-sm text-neutral-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] text-neutral-500">
          © {new Date().getFullYear()} AutoHub New Zealand. All rights reserved.
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#DF2B44] flex items-center justify-center">
              <img 
                src="/autohub-logo.jpg" 
                alt="AutoHub" 
                className="w-6 h-6 rounded object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-[#10100E] block leading-none">AutoHub</span>
              <span className="text-[10px] text-neutral-400">Dealer Intelligence Platform</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#10100E] tracking-tight">
              Sign in
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Enter your credentials or select a demo account.
            </p>
          </div>

          {/* Demo access buttons */}
          <div className="space-y-2 mb-6">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
              Demo Access
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="demo-dealer-login"
                type="button"
                onClick={() => loginAsDemo('dealer')}
                disabled={loadingRole !== null}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:border-[#DF2B44]/40 bg-white hover:bg-[#DF2B44]/[0.03] transition-all text-left group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Building2 size={15} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#10100E]">Dealer</div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {loadingRole === 'dealer' ? 'Signing in…' : 'View dealer portal'}
                  </div>
                </div>
              </button>

              <button
                id="demo-admin-login"
                type="button"
                onClick={() => loginAsDemo('admin')}
                disabled={loadingRole !== null}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:border-[#DF2B44]/40 bg-white hover:bg-[#DF2B44]/[0.03] transition-all text-left group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-[#DF2B44]/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={15} className="text-[#DF2B44]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#10100E]">Admin</div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {loadingRole === 'admin' ? 'Signing in…' : 'Platform management'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase tracking-wider">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email-input" className="text-xs font-medium text-neutral-600 block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input 
                  id="email-input"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@dealership.co.nz"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password-input" className="text-xs font-medium text-neutral-600">
                  Password
                </label>
                <a href="#" className="text-[11px] font-medium text-[#DF2B44] hover:text-[#DF2B44]/80 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input 
                  id="password-input"
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all placeholder:text-neutral-400"
                />
              </div>
            </div>

            <button
              id="sign-in-button"
              type="submit"
              className="w-full py-2.5 bg-[#DF2B44] hover:bg-[#d01c36] text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Sign in
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-8 text-center text-[11px] text-neutral-400">
            Secure access · AutoHub Dealer Intelligence Platform
          </p>

        </div>
      </div>

    </div>
  );
}
