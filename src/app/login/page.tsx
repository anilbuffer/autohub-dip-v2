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
  ChevronRight,
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

      {/* ─── Left — Brand panel (Light Navy Theme) ─── */}
      <div className="hidden lg:flex lg:w-[500px] xl:w-[540px] flex-col justify-between bg-gradient-to-b from-[#182C48] via-[#14243B] to-[#101C2E] border-r border-[#1E3A5F]/40 text-white p-12 relative overflow-hidden">

        {/* Subtle decorative elements */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#1E3A5F]/40 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-[#E11D48]/[0.08] blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-[#2B5885]/20 blur-2xl" />

        {/* Logo & brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48] flex items-center justify-center shadow-lg shadow-rose-950/40">
              <img
                src="/autohub-logo.jpg"
                alt="AutoHub"
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <div>
              <span className="text-[16px] font-bold tracking-wide block leading-none">AutoHub</span>
              <span className="text-[11px] text-[#9AB9D5] font-semibold tracking-widest uppercase">
                Dealer Intelligence Platform
              </span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-8 my-auto">
          <div>
            <h1 className="text-4xl font-extrabold leading-snug tracking-tight text-white">
              Source smarter from<br />
              <span className="text-[#9AB9D5]">Japan to New Zealand.</span>
            </h1>
            <p className="text-[15px] text-[#BACDD8] leading-relaxed max-w-sm mt-4">
              Create your wish list, match against live Heiwa auction inventory,
              and compare landed costs with NZ retail pricing — all in one place.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] text-[#9AB9D5] font-medium">
          © {new Date().getFullYear()} AutoHub New Zealand. All rights reserved.
        </div>
      </div>

      {/* ─── Right — Login form ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#E11D48] flex items-center justify-center shadow-md shadow-rose-950/20">
              <img
                src="/autohub-logo.jpg"
                alt="AutoHub"
                className="w-7 h-7 rounded-lg object-cover"
              />
            </div>
            <div>
              <span className="text-[15px] font-bold text-[#111C2D] block leading-none">AutoHub</span>
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Dealer Intelligence Platform</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#111C2D] tracking-tight">
              Sign in
            </h2>
            <p className="text-[14px] text-[#475569] mt-1.5">
              Enter your credentials or use the demo account.
            </p>
          </div>

          {/* Demo access */}
          <div className="mb-7">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.12em] block mb-2.5">
              Quick Access
            </span>
            <button
              id="demo-dealer-login"
              type="button"
              onClick={loginAsDemo}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#E2E8F0] hover:border-[#1E3A5F]/30 bg-white hover:bg-[#F0F4F9]/60 transition-all text-left group disabled:opacity-50 shadow-subtle hover:shadow-card"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <Building2 size={18} className="text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-[#111C2D]">Demo Dealer Account</div>
                <div className="text-[12px] text-[#64748B] mt-0.5">
                  {loading ? 'Signing in…' : 'Auckland Auto Group · David Miller'}
                </div>
              </div>
              <ArrowRight size={16} className="text-[#CBD5E1] group-hover:text-[#1E3A5F] group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F8FAFC] px-4 text-[11px] text-[#94A3B8] uppercase tracking-wider font-bold">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email-input" className="text-[12px] font-semibold text-[#536471] block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAB8C2]" size={16} />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@dealership.co.nz"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8ECF0] rounded-xl text-[14px] outline-none focus:bg-white focus:border-[#E11D48]/40 focus:ring-2 focus:ring-[#E11D48]/10 transition-all placeholder:text-[#AAB8C2] font-medium hover:border-[#D1D5DB]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password-input" className="text-[12px] font-semibold text-[#536471]">
                  Password
                </label>
                <a href="#" className="text-[12px] font-semibold text-[#E11D48] hover:text-[#BE123C] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAB8C2]" size={16} />
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8ECF0] rounded-xl text-[14px] outline-none focus:bg-white focus:border-[#E11D48]/40 focus:ring-2 focus:ring-[#E11D48]/10 transition-all placeholder:text-[#AAB8C2] font-medium hover:border-[#D1D5DB]"
                />
              </div>
            </div>

            <button
              id="sign-in-button"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-[15px] rounded-xl transition-all flex items-center justify-center gap-2.5 mt-3 disabled:opacity-60 shadow-md shadow-rose-950/20 hover:shadow-lg hover:shadow-rose-950/30"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-10 text-center text-[11px] text-[#AAB8C2] font-medium">
            Secure access · AutoHub Dealer Intelligence Platform
          </p>

        </div>
      </div>

    </div>
  );
}
