"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";
import {
  Users,
  Heart,
  Car,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Check,
  Ship,
  Gavel,
} from "lucide-react";
import { DEALERS } from "@/lib/data";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
} from "@/lib/heiwaData";
import {
  getAllVehicles,
  getStoredWishlistCriteria,
  getStoredBids,
  getStoredPurchases,
  getStoredDealers,
  matchVehiclesAgainstWishlist,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
  isCarVehicle,
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
  const [dealersCount, setDealersCount] = useState<number>(DEALERS.length);
  const [notifiedLots, setNotifiedLots] = useState<string[]>([]);
  const [allVehiclesCount, setAllVehiclesCount] = useState<number>(() => getAllVehicles().filter(isCarVehicle).length);

  useEffect(() => {
    const wl = getStoredWishlistCriteria();
    setWishlists(wl);
    const b = getStoredBids();
    setBids(b);
    const p = getStoredPurchases();
    setPurchases(p);
    setDealersCount(getStoredDealers().length);

    const vehicles = getAllVehicles().filter(isCarVehicle);
    setAllVehiclesCount(vehicles.length);

    // Calculate live matches against active criteria
    const matches = matchVehiclesAgainstWishlist(vehicles, wl);
    setMatchedLots(matches);

    const handleStoreChange = () => {
      const updatedWl = getStoredWishlistCriteria();
      setWishlists(updatedWl);
      setBids(getStoredBids());
      setPurchases(getStoredPurchases());
      setDealersCount(getStoredDealers().length);
      const updatedVehicles = getAllVehicles().filter(isCarVehicle);
      setAllVehiclesCount(updatedVehicles.length);
      setMatchedLots(matchVehiclesAgainstWishlist(updatedVehicles, updatedWl));
    };

    window.addEventListener("autohub_dealer_store_change", handleStoreChange);
    return () => window.removeEventListener("autohub_dealer_store_change", handleStoreChange);
  }, []);

  const totalDealers = dealersCount;
  const totalVehicles = allVehiclesCount;
  const totalMatchedCount = matchedLots.length;

  // Calculate total gross margin opportunity across matched inventory
  const totalMarginPotential = matchedLots.reduce((acc, v) => {
    const { grossMargin } = getEstimatedNZRetailPrice(v);
    return acc + Math.max(0, grossMargin);
  }, 0);

  const handleNotify = (stockId: string, model: string) => {
    notifyDealersFromAdmin(stockId, model);
    setNotifiedLots((prev) => [...prev, stockId]);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 font-sans">
        {/* ─── Top Header & Quick Actions ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827]">
              Admin Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Live demand matching and Heiwa auction supply intelligence
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link
              href="/admin/wishlists"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#111827] text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
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

        {/* ─── Core KPI Metric Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Dealers */}
          <Link
            href="/admin/dealers"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:border-[#1E3A5F]/40 hover:shadow-soft-md transition-all relative overflow-hidden"
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
            </div>
          </Link>

          {/* Card 2: Live Wish Lists */}
          <Link
            href="/admin/wishlists"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:border-[#E11D48]/40 hover:shadow-soft-md transition-all relative overflow-hidden"
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
            </div>
          </Link>

          {/* Card 3: Heiwa Auction Supply */}
          <Link
            href="/admin/vehicles"
            className="group bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:border-[#1E3A5F]/40 hover:shadow-soft-md transition-all relative overflow-hidden"
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
            </div>
          </Link>

          {/* Card 4: Matched Gross Margin Opportunity */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-soft hover:shadow-soft-md transition-all relative overflow-hidden">
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
            </div>
          </div>
        </div>

        {/* ─── Demand vs Supply Matches & Live Dealer Activity ─── */}
        <div className="space-y-6">
          {/* Top Matched Opportunities */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
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
                const { grossMargin } = getEstimatedNZRetailPrice(v);
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${isNotified
                          ? "bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm"
                          : "bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm"
                          }`}
                      >
                        {isNotified ? (
                          <>
                            <Check size={13} />
                            <span>Notified</span>
                          </>
                        ) : (
                          <>
                            <Zap size={13} className="text-rose-100" />
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
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-5 space-y-4">
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
                {bids.slice(0, 3).map((b) => (
                  <div key={b.id} className="text-xs border-t border-slate-200/60 pt-2 flex justify-between">
                    <span className="font-semibold text-[#334155] truncate max-w-[160px]">
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
                {purchases.slice(0, 3).map((p) => (
                  <div key={p.id} className="text-xs border-t border-slate-200/60 pt-2 flex justify-between">
                    <span className="font-semibold text-[#334155] truncate max-w-[160px]">
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
      </div>
    </AdminLayout>
  );
}
