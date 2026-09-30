"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Building2, 
  Heart,
  Search,
  BarChart3,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/"), 400);
  };

  const loginAsDemo = () => {
    setEmail("dealer@autohub.co.nz");
    setPassword("••••••••");
    setLoading(true);
    setTimeout(() => router.push("/"), 400);
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-[#10100E] text-white p-10 relative overflow-hidden">
        
        {/* Subtle decorative element */}
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#DF2B44]/[0.06]" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#DF2B44]/[0.04]" />

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
            Source smarter from<br />
            <span className="text-neutral-400">Japan to New Zealand.</span>
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            Create your wish list, match against live Heiwa auction inventory, 
            and compare landed costs with NZ retail pricing — all in one place.
          </p>

          {/* 3-step journey preview */}
          <div className="space-y-3 pt-2">
            {[
              { icon: Heart, step: "1", label: "Set your wish list criteria" },
              { icon: Search, step: "2", label: "View matched Heiwa vehicles" },
              { icon: BarChart3, step: "3", label: "Compare against NZ market" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-[#DF2B44]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-[#DF2B44]/20 text-[#DF2B44] px-1.5 py-0.5 rounded">{item.step}</span>
                  <span className="text-sm text-neutral-300">{item.label}</span>
                </div>
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
              Enter your credentials or use the demo account.
            </p>
          </div>

          {/* Demo access */}
          <div className="mb-6">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-2">
              Quick Access
            </span>
            <button
              id="demo-dealer-login"
              type="button"
              onClick={loginAsDemo}
              disabled={loading}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-neutral-200 hover:border-[#DF2B44]/30 bg-white hover:bg-[#DF2B44]/[0.02] transition-all text-left group disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Building2 size={16} className="text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[#10100E]">Demo Dealer Account</div>
                <div className="text-[11px] text-neutral-400">
                  {loading ? 'Signing in…' : 'Auckland Auto Group · David Miller'}
                </div>
              </div>
              <ArrowRight size={14} className="text-neutral-300 group-hover:text-[#DF2B44] transition-colors" />
            </button>
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
              disabled={loading}
              className="w-full py-2.5 bg-[#DF2B44] hover:bg-[#c91f38] text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
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
