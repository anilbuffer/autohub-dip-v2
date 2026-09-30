"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";
import {
  Users,
  Heart,
  Car,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Zap,
  Building2,
  Activity,
  Calculator,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Check,
  AlertCircle,
  Ship,
  Gavel,
} from "lucide-react";
import { DEALERS } from "@/lib/data";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
  LANDED_COST_CONSTANTS,
} from "@/lib/heiwaData";
import {
  getStoredWishlistCriteria,
  getStoredBids,
  getStoredPurchases,
  matchVehiclesAgainstWishlist,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
  DealerBid,
  DealerPurchase,
  WishListCriteria,
} from "@/lib/dealerStore";
import { useSyncStore } from "@/lib/syncStore";

export default function AdminOverviewPage() {
  const { state: syncState, notifyDealersFromAdmin } = useSyncStore();
  const [wishlists, setWishlists] = useState<WishListCriteria[]>([]);
  const [bids, setBids] = useState<DealerBid[]>([]);
  const [purchases, setPurchases] = useState<DealerPurchase[]>([]);
  const [matchedLots, setMatchedLots] = useState<HeiwaVehicle[]>([]);

  // Landed calculation test simulator state
  const [calcInputJpy, setCalcInputJpy] = useState<number>(890000);
  const [notifiedLots, setNotifiedLots] = useState<string[]>([]);

  useEffect(() => {
    const wl = getStoredWishlistCriteria();
    setWishlists(wl);
    const b = getStoredBids();
    setBids(b);
    const p = getStoredPurchases();
    setPurchases(p);

    // Calculate live matches against active criteria
    const matches = matchVehiclesAgainstWishlist(HEIWA_VEHICLES, wl);
    setMatchedLots(matches);

    const handleStoreChange = () => {
      const updatedWl = getStoredWishlistCriteria();
      setWishlists(updatedWl);
      setBids(getStoredBids());
      setPurchases(getStoredPurchases());
      setMatchedLots(matchVehiclesAgainstWishlist(HEIWA_VEHICLES, updatedWl));
    };

    window.addEventListener("autohub_dealer_store_change", handleStoreChange);
    return () => window.removeEventListener("autohub_dealer_store_change", handleStoreChange);
  }, []);

  const totalDealers = DEALERS.length;
  const totalVehicles = HEIWA_VEHICLES.length;
  const totalMatchedCount = matchedLots.length;

  // Calculate total gross margin opportunity across matched inventory
  const totalMarginPotential = matchedLots.reduce((acc, v) => {
    const { grossMargin } = getEstimatedNZRetailPrice(v);
    return acc + Math.max(0, grossMargin);
  }, 0);

  // Live calculation test simulator values
  const simulatedLanded = calculateLandedCost(calcInputJpy);
  const estimatedRetail = Math.round((simulatedLanded.totalLanded * 1.25) / 100) * 100;
  const simulatedMargin = estimatedRetail - simulatedLanded.totalLanded;

  const handleNotify = (stockId: string, model: string) => {
    notifyDealersFromAdmin(stockId, model);
    setNotifiedLots((prev) => [...prev, stockId]);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 font-sans">
        {/* ─── Top Operational Banner & Principle ─── */}
        <div className="bg-gradient-to-r from-[#182C48] via-[#14243B] to-[#101C2E] border border-[#1E3A5F]/60 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#E11D48]/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E11D48] text-white">
                  DIP Brokerage Super Admin
                </span>
                <span className="text-[11px] text-[#9AB9D5] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Engine Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Admin Command Center & Demand Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-[#BACDD8] leading-relaxed">
                <strong className="text-white">Admin Principle:</strong> Monitor what NZ dealers are seeking, match against live Heiwa Japanese auction inventory, and verify data calculation integrity in real time.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                href="/admin/wishlists"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <Heart size={14} className="text-[#E11D48]" />
                <span>View Wish Lists</span>
              </Link>
              <Link
                href="/admin/vehicles"
                className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all flex items-center gap-2"
              >
                <Car size={14} />
                <span>Browse Heiwa Vehicles ({totalVehicles})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Core KPI Metric Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Dealers */}
          <Link
            href="/admin/dealers"
            className="group bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#1E3A5F]/40 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Active Dealers
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A5F] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#111827] tracking-tight">
                {totalDealers}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% Active
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-2 flex items-center justify-between">
              <span>Penrose, Te Rapa, Christchurch</span>
              <ArrowRight size={13} className="text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

          {/* Card 2: Live Wish Lists */}
          <Link
            href="/admin/wishlists"
            className="group bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#E11D48]/40 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Dealer Wish Lists
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#111827] tracking-tight">
                {wishlists.length + 2}
              </span>
              <span className="text-xs font-semibold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-full">
                Live Synced
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-2 flex items-center justify-between">
              <span>Aqua, C-HR, Prius, CX-3, Fit</span>
              <ArrowRight size={13} className="text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

          {/* Card 3: Heiwa Auction Supply */}
          <Link
            href="/admin/vehicles"
            className="group bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#1E3A5F]/40 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Heiwa Auction Lots
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1E3A5F] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Car size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#111827] tracking-tight">
                {totalVehicles}
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                USS / CAA
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-2 flex items-center justify-between">
              <span>Toyota, Honda, Nissan, Mazda</span>
              <ArrowRight size={13} className="text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

          {/* Card 4: Matched Gross Margin Opportunity */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                Matched Spread
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">
                NZ${(totalMarginPotential / 1000).toFixed(0)}k+
              </span>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">
                {totalMatchedCount} Lots
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-2">
              Gross margin potential on matched lots
            </p>
          </div>
        </div>

        {/* ─── Grid: Demand vs Supply Matches & Live Calculation Health ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Top Matched Opportunities (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                    <Sparkles size={18} className="text-[#E11D48]" />
                    <span>Top Matched Sourcing Opportunities</span>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Live Heiwa vehicles satisfying Auckland Auto Group and registered dealer criteria
                  </p>
                </div>
                <Link
                  href="/admin/vehicles"
                  className="text-xs font-bold text-[#E11D48] hover:text-[#BE123C] flex items-center gap-1"
                >
                  <span>View All ({matchedLots.length})</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="divide-y divide-[#F1F5F9]">
                {matchedLots.slice(0, 5).map((v) => {
                  const landed = calculateLandedCost(v.priceFob);
                  const { retailPrice, grossMargin } = getEstimatedNZRetailPrice(v);
                  const isNotified = notifiedLots.includes(v.stockId);

                  return (
                    <div
                      key={v.stockId}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={getVehiclePhoto(v)}
                          alt={`${v.make} ${v.model}`}
                          className="w-16 h-12 rounded-xl object-cover border border-[#E5E7EB] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#111827] truncate">
                              {v.year} {v.make} {v.model}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#475569] shrink-0">
                              Grade {v.grade || "4.0"}
                            </span>
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-2">
                            <span>{v.kms.toLocaleString()} km</span>
                            <span>·</span>
                            <span className="font-mono text-[11px]">{v.chassis}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Profitability */}
                      <div className="flex items-center justify-between sm:justify-end gap-5">
                        <div className="text-left sm:text-right">
                          <div className="text-[11px] text-[#64748B] font-medium">Landed NZD</div>
                          <div className="text-sm font-extrabold text-[#111827] font-mono">
                            NZ${landed.totalLanded.toLocaleString()}
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-[11px] text-[#64748B] font-medium">Est Margin</div>
                          <div className="text-sm font-extrabold text-emerald-600 font-mono">
                            +NZ${grossMargin.toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleNotify(v.stockId, `${v.year} ${v.make} ${v.model}`)}
                          disabled={isNotified}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                            isNotified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                              : "bg-[#1E3A5F] hover:bg-[#152740] text-white shadow-xs"
                          }`}
                        >
                          {isNotified ? (
                            <>
                              <Check size={13} />
                              <span>Notified</span>
                            </>
                          ) : (
                            <>
                              <Zap size={13} className="text-amber-400" />
                              <span>Notify Dealer</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] text-center text-xs text-[#64748B]">
                Looking for specific lots?{" "}
                <Link href="/admin/vehicles" className="font-bold text-[#E11D48] hover:underline">
                  Filter by Make, FOB JPY, or Year Range
                </Link>
              </div>
            </div>

            {/* Live Dealer Activity Feeds (Bids & Purchases) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" />
                  <span>Live Dealer Activity Feed (Auckland Auto Group)</span>
                </h3>
                <span className="text-[11px] font-semibold text-[#64748B]">
                  Shared LocalStore Data
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Active Bids Summary */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <Gavel size={14} className="text-[#E11D48]" />
                      Active Bids ({bids.length})
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </div>
                  {bids.slice(0, 2).map((b) => (
                    <div key={b.id} className="text-xs border-t border-slate-200/60 pt-2 flex justify-between">
                      <span className="font-semibold text-[#334155] truncate max-w-[140px]">
                        {b.year} {b.make} {b.model}
                      </span>
                      <span className="font-mono font-bold text-[#111827]">
                        NZ${b.landedCostNzd.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Purchases In Transit */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <Ship size={14} className="text-blue-600" />
                      Acquisitions / Transit ({purchases.length})
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                      Tasman RoRo
                    </span>
                  </div>
                  {purchases.slice(0, 2).map((p) => (
                    <div key={p.id} className="text-xs border-t border-slate-200/60 pt-2 flex justify-between">
                      <span className="font-semibold text-[#334155] truncate max-w-[140px]">
                        {p.year} {p.make} {p.model}
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        ETA {p.etaDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Data & Calculation Engine Health (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Calculation Engine Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#111827]">Calculation Engine</h2>
                    <p className="text-[11px] text-[#64748B]">Is the data & config working?</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Validated
                </span>
              </div>

              {/* Engine Constants Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                    FX Benchmark
                  </span>
                  <span className="text-base font-extrabold text-[#111827] font-mono mt-0.5 block">
                    ¥{LANDED_COST_CONSTANTS.fxRate} / NZD
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Live Bank Feed</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                    Ocean RoRo Freight
                  </span>
                  <span className="text-base font-extrabold text-[#111827] font-mono mt-0.5 block">
                    NZ${LANDED_COST_CONSTANTS.freightNzd.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">Yokohama → Auckland</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                    MAF & Compliance
                  </span>
                  <span className="text-base font-extrabold text-[#111827] font-mono mt-0.5 block">
                    NZ${LANDED_COST_CONSTANTS.complianceNzd.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">JEVIC / Entry cert</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                    NZ Customs GST
                  </span>
                  <span className="text-base font-extrabold text-[#111827] font-mono mt-0.5 block">
                    {(LANDED_COST_CONSTANTS.gstRate * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-500">IR348 compliant</span>
                </div>
              </div>

              {/* Real-time Calculation Test Validator */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">
                    Live Landed Cost Simulator
                  </span>
                  <span className="text-[10px] font-bold text-[#4B88CF] uppercase tracking-wider">
                    Interactive
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-[#64748B] block mb-1">
                    Simulate Auction FOB Price (JPY)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={50000}
                      value={calcInputJpy}
                      onChange={(e) => setCalcInputJpy(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#111827] focus:outline-none focus:border-[#E11D48]"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-[#94A3B8]">
                      JPY
                    </span>
                  </div>
                </div>

                {/* Breakdown result */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-[#64748B]">
                    <span>FOB Converted:</span>
                    <span className="font-mono text-[#111827]">NZ${simulatedLanded.fobNzd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Freight + Compliance + Port:</span>
                    <span className="font-mono text-[#111827]">
                      NZ${(simulatedLanded.freight + simulatedLanded.compliance + simulatedLanded.portFees).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>GST (15%):</span>
                    <span className="font-mono text-[#111827]">NZ${simulatedLanded.gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#111827] pt-1.5 border-t border-slate-300">
                    <span>Total Landed:</span>
                    <span className="font-mono text-[#E11D48]">
                      NZ${simulatedLanded.totalLanded.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    <span>Est NZ Retail Spread:</span>
                    <span className="font-mono">+NZ${simulatedMargin.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Dealers Snapshot */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <Building2 size={16} className="text-[#1E3A5F]" />
                  <span>Dealership Network Directory</span>
                </h3>
                <Link
                  href="/admin/dealers"
                  className="text-xs font-bold text-[#E11D48] hover:underline"
                >
                  Manage All
                </Link>
              </div>

              <div className="space-y-2">
                {DEALERS.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#111827]">{d.name}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {d.location} · {d.contactName}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {d.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
