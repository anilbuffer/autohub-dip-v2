"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  Building2,
  ShieldCheck,
  Sparkles,
  Zap,
  Layers,
  Car,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dealer" | "admin">("dealer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<"dealer" | "admin" | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = activeTab === "admin" || email.toLowerCase().includes("admin");
    setLoading(true);
    setLoadingRole(isAdmin ? "admin" : "dealer");
    setTimeout(() => {
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/browse-vehicles");
      }
    }, 450);
  };

  const quickLogin = (role: "dealer" | "admin") => {
    setActiveTab(role);
    setLoading(true);
    setLoadingRole(role);
    if (role === "admin") {
      setEmail("admin@autohub.co.nz");
      setPassword("••••••••••••");
      setTimeout(() => router.push("/admin"), 450);
    } else {
      setEmail("dealer@autohub.co.nz");
      setPassword("••••••••••••");
      setTimeout(() => router.push("/browse-vehicles"), 450);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#F8FAFC]">
      {/* ─── Left — Brand & Intelligence Showcase Panel ─── */}
      <div className="hidden lg:flex lg:w-[520px] xl:w-[580px] flex-col justify-between bg-gradient-to-b from-[#0A1322] via-[#101F35] to-[#0A1322] border-r border-[#1B2A42] text-white p-12 relative overflow-hidden shrink-0">
        {/* Subtle decorative glowing background orbs */}
        <div className="absolute -right-28 -top-28 w-[420px] h-[420px] rounded-full bg-[#1E3A5F]/40 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#E11D48]/[0.12] blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-[#2563EB]/15 blur-2xl pointer-events-none" />

        {/* 1. Header Logo & Brand Badge */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] p-0.5 flex items-center justify-center shadow-xl shadow-rose-950/60">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                <img
                  src="/autohub-logo.jpg"
                  alt="AutoHub"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[19px] font-extrabold tracking-tight text-white block leading-none">
                  AutoHub
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wide">
                  DIP v2
                </span>
              </div>
              <span className="text-[10px] text-[#60A5FA] font-bold tracking-[0.16em] uppercase mt-1 block">
                DEALER INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* 2. Middle Value Proposition & Live Platform Highlights */}
        <div className="relative z-10 space-y-7 my-auto py-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-[#93C5FD] text-[11.5px] font-semibold mb-4 backdrop-blur-md">
              <Sparkles size={13} className="text-rose-400" />
              <span>Japan Auction Live Feeds & Landed Cost Analytics</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-snug tracking-tight text-white">
              Source smarter from<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93C5FD] via-[#60A5FA] to-[#F43F5E]">
                Japan to New Zealand.
              </span>
            </h1>
            <p className="text-[14.5px] text-[#94A3B8] leading-relaxed max-w-md mt-3.5">
              Connect directly with live Heiwa auction inventory, automate wishlist matches,
              and calculate landed FOB-to-NZD cost margins in real-time.
            </p>
          </div>

          {/* Dual Panel Highlights Feature Cards */}
          <div className="space-y-3 max-w-md">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-all backdrop-blur-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 size={16} className="text-emerald-400" />
              </div>
              <div className="text-[12.5px]">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Dealer Workspace</span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">NZ Dealers</span>
                </div>
                <div className="text-[#94A3B8] mt-0.5">
                  Browse 24,000+ Japanese auction lots, manage bids, watchlist & landed cost profitability.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-all backdrop-blur-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={16} className="text-blue-400" />
              </div>
              <div className="text-[12.5px]">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>AutoHub Admin Operations</span>
                  <span className="text-[10px] text-blue-300 font-semibold bg-blue-500/10 px-1.5 py-0.2 rounded">Ops Command</span>
                </div>
                <div className="text-[#94A3B8] mt-0.5">
                  Live Heiwa sync, cross-dealer wishlist matching dispatch, and operational KPI command center.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time stats row */}
          <div className="pt-2 grid grid-cols-3 gap-3 border-t border-white/[0.08] max-w-md">
            <div>
              <div className="text-[18px] font-extrabold text-white">24,800+</div>
              <div className="text-[11px] text-[#64748B]">Live Auction Lots</div>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-white">98.6%</div>
              <div className="text-[11px] text-[#64748B]">Match Accuracy</div>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-white">NZD / JPY</div>
              <div className="text-[11px] text-[#64748B]">Live FX Rate</div>
            </div>
          </div>
        </div>

        {/* 3. Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-[#64748B] font-medium border-t border-white/[0.08] pt-4">
          <span>© {new Date().getFullYear()} AutoHub New Zealand Ltd.</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Systems Operational
          </span>
        </div>
      </div>

      {/* ─── Right — Dual Portal Login & Quick Launch ─── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-[460px]">
          {/* Mobile brand header (< lg) */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48] flex items-center justify-center shadow-md shadow-rose-950/20 p-0.5">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                <img
                  src="/autohub-logo.jpg"
                  alt="AutoHub"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-extrabold text-[#0A1322] leading-none">AutoHub</span>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded font-extrabold bg-rose-100 text-rose-700 uppercase">DIP</span>
              </div>
              <span className="text-[9.5px] text-[#2563EB] uppercase tracking-[0.14em] font-extrabold mt-0.5 block">
                INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#0A1322] tracking-tight">
              Sign in to AutoHub
            </h2>
            <p className="text-[13.5px] text-[#64748B] mt-1">
              Select your workspace or sign in with your credentials.
            </p>
          </div>

          {/* ─── Fast Launch / One-Click Quick Access ─── */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-extrabold text-[#94A3B8] uppercase tracking-[0.14em]">
                One-Click Quick Access
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Instant demo switch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quick Launch: Dealer Portal */}
              <button
                id="quick-access-dealer-btn"
                type="button"
                onClick={() => quickLogin("dealer")}
                disabled={loading}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative group cursor-pointer disabled:opacity-60 ${
                  activeTab === "dealer"
                    ? "border-emerald-500/50 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Dealer View
                  </span>
                </div>
                <div className="font-bold text-[13.5px] text-[#0A1322] group-hover:text-emerald-700 transition-colors">
                  Auckland Auto
                </div>
                <div className="text-[11.5px] text-[#64748B] mt-0.5 truncate">
                  David Miller · Dealer
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-600">
                  <span>Enter Dealer Portal</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Quick Launch: Admin Console */}
              <button
                id="quick-access-admin-btn"
                type="button"
                onClick={() => quickLogin("admin")}
                disabled={loading}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative group cursor-pointer disabled:opacity-60 ${
                  activeTab === "admin"
                    ? "border-[#1E3A5F] bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-[#1E3A5F]/40 bg-white hover:bg-blue-50/20 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1E3A5F] flex items-center justify-center font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                    Admin View
                  </span>
                </div>
                <div className="font-bold text-[13.5px] text-[#0A1322] group-hover:text-[#1E3A5F] transition-colors">
                  AutoHub Ops
                </div>
                <div className="text-[11.5px] text-[#64748B] mt-0.5 truncate">
                  Command Center · Admin
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#1E3A5F]">
                  <span>Enter Admin Console</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* ─── Role Switcher Segmented Tabs ─── */}
          <div className="mb-6">
            <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("dealer");
                  if (email === "admin@autohub.co.nz") setEmail("dealer@autohub.co.nz");
                }}
                className={`flex-1 py-2 rounded-lg text-[12.5px] font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "dealer"
                    ? "bg-white text-[#0A1322] shadow-xs border border-slate-200/80"
                    : "text-[#64748B] hover:text-[#0A1322]"
                }`}
              >
                <Building2 size={15} className={activeTab === "dealer" ? "text-emerald-600" : "text-[#94A3B8]"} />
                <span>Dealer Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("admin");
                  if (email === "dealer@autohub.co.nz") setEmail("admin@autohub.co.nz");
                }}
                className={`flex-1 py-2 rounded-lg text-[12.5px] font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "admin"
                    ? "bg-[#1E3A5F] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0A1322]"
                }`}
              >
                <ShieldCheck size={15} className={activeTab === "admin" ? "text-blue-300" : "text-[#94A3B8]"} />
                <span>Admin Operations</span>
              </button>
            </div>
          </div>

          {/* ─── Standard Email & Password Form ─── */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="email-input" className="text-[12px] font-bold text-[#475569]">
                  {activeTab === "admin" ? "Admin Staff Email" : "Registered Dealer Email"}
                </label>
                <button
                  type="button"
                  onClick={() => setEmail(activeTab === "admin" ? "admin@autohub.co.nz" : "dealer@autohub.co.nz")}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  Auto-fill demo
                </button>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === "admin" ? "admin@autohub.co.nz" : "dealer@autohub.co.nz"}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13.5px] outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/10 transition-all placeholder:text-[#94A3B8] font-medium text-[#0A1322]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password-input" className="text-[12px] font-bold text-[#475569]">
                  Password
                </label>
                <a href="#" className="text-[11px] font-semibold text-[#E11D48] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13.5px] outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/10 transition-all placeholder:text-[#94A3B8] font-medium text-[#0A1322]"
                />
              </div>
            </div>

            {/* Destination Panel Preview Notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11.5px] text-[#475569]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className={activeTab === "admin" ? "text-blue-600" : "text-emerald-600"} />
                <span>Redirects to:</span>
              </span>
              <span className="font-bold text-[#0A1322]">
                {activeTab === "admin" ? "AutoHub Admin Command (/admin)" : "Dealer Portal (/browse-vehicles)"}
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="sign-in-button"
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold text-[14.5px] rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-md disabled:opacity-70 cursor-pointer ${
                activeTab === "admin"
                  ? "bg-[#1E3A5F] hover:bg-[#152842] shadow-blue-950/20"
                  : "bg-[#E11D48] hover:bg-[#BE123C] shadow-rose-950/20"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {loadingRole === "admin"
                      ? "Connecting to Admin Command Center…"
                      : "Opening Dealer Workspace…"}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Sign in to {activeTab === "admin" ? "Admin Console" : "Dealer Portal"}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-[11.5px] text-[#94A3B8] font-medium flex items-center justify-center gap-1.5">
              <span>🔒 256-bit Encrypted Session</span>
              <span>·</span>
              <span>AutoHub Japan & NZ Direct Link</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
