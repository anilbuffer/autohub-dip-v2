"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";
import {
  Car,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Heart,
  Sparkles,
  ExternalLink,
  Zap,
  Check,
  Send,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
  LANDED_COST_CONSTANTS,
  getUniqueMakes,
} from "@/lib/heiwaData";
import {
  getStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
  getVehiclePhoto,
  isCarVehicle,
  getEstimatedNZRetailPrice,
  WishListCriteria,
} from "@/lib/dealerStore";
import { useSyncStore } from "@/lib/syncStore";

export default function AdminVehiclesPage() {
  const { notifyDealersFromAdmin } = useSyncStore();
  const [vehicles] = useState<HeiwaVehicle[]>(() => HEIWA_VEHICLES.filter(isCarVehicle));
  const [wishlists, setWishlists] = useState<WishListCriteria[]>([]);
  const [matchedVehicleKeys, setMatchedVehicleKeys] = useState<Set<string>>(new Set());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState("all");
  const [demandFilter, setDemandFilter] = useState<"all" | "matched" | "high_margin">("all");
  const [notifiedLots, setNotifiedLots] = useState<string[]>([]);

  useEffect(() => {
    const wl = getStoredWishlistCriteria();
    setWishlists(wl);

    // Compute matched keys
    const matches = matchVehiclesAgainstWishlist(HEIWA_VEHICLES, wl);
    const keySet = new Set(matches.map((v) => `${v.stockId}-${v.chassis}`));
    setMatchedVehicleKeys(keySet);

    const handleStoreChange = () => {
      const updatedWl = getStoredWishlistCriteria();
      setWishlists(updatedWl);
      const updatedMatches = matchVehiclesAgainstWishlist(HEIWA_VEHICLES, updatedWl);
      setMatchedVehicleKeys(new Set(updatedMatches.map((v) => `${v.stockId}-${v.chassis}`)));
    };

    window.addEventListener("autohub_dealer_store_change", handleStoreChange);
    return () => window.removeEventListener("autohub_dealer_store_change", handleStoreChange);
  }, []);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const vKey = `${v.stockId}-${v.chassis}`;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (v.make || "").toLowerCase().includes(q) ||
      (v.model || "").toLowerCase().includes(q) ||
      (v.chassis || "").toLowerCase().includes(q) ||
      (v.stockId || "").toLowerCase().includes(q);

    const matchesMake =
      selectedMake === "all" ||
      (v.make || "").toLowerCase() === selectedMake.toLowerCase();

    const isMatchedDemand = matchedVehicleKeys.has(vKey);
    const { grossMargin } = getEstimatedNZRetailPrice(v);

    if (demandFilter === "matched" && !isMatchedDemand) return false;
    if (demandFilter === "high_margin" && grossMargin < 3500) return false;

    return matchesSearch && matchesMake;
  });

  const allMakes = ["all", ...getUniqueMakes()];

  const handleNotify = (stockId: string, model: string) => {
    notifyDealersFromAdmin(stockId, model);
    setNotifiedLots((prev) => [...prev, stockId]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-16 font-sans">
        {/* ─── Page Title & Header Actions ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight flex items-center gap-3">
              <span>Heiwa Auction Vehicles Inventory</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#1E3A5F] border border-blue-200">
                {vehicles.length} Car Lots
              </span>
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              "What vehicles are available?" — Live Japanese auction feed directly synced with dealer portal calculation engine and dealer demand.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/browse-vehicles"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#1E3A5F] hover:bg-slate-50 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <span>Preview Dealer View</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* ─── Filter & Search Bar ─── */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search make, model, chassis or stock ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
              />
            </div>

            {/* Quick Segment Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setDemandFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  demandFilter === "all"
                    ? "bg-[#1E3A5F] text-white shadow-xs"
                    : "bg-slate-100 text-[#475569] hover:bg-slate-200"
                }`}
              >
                All Lots ({vehicles.length})
              </button>

              <button
                onClick={() => setDemandFilter("matched")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  demandFilter === "matched"
                    ? "bg-[#E11D48] text-white shadow-xs"
                    : "bg-rose-50 text-[#E11D48] hover:bg-rose-100"
                }`}
              >
                <Sparkles size={12} />
                <span>Matched Demand ({matchedVehicleKeys.size})</span>
              </button>

              <button
                onClick={() => setDemandFilter("high_margin")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  demandFilter === "high_margin"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <TrendingUp size={12} />
                <span>High Margin (NZ$3,500+)</span>
              </button>
            </div>
          </div>

          {/* Secondary Make Filter Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9] overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-[#64748B] uppercase tracking-wider shrink-0 pl-1">
              Make:
            </span>
            {allMakes.map((make) => (
              <button
                key={make}
                onClick={() => setSelectedMake(make)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                  selectedMake === make
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-[#475569] hover:bg-slate-200"
                }`}
              >
                {make === "all" ? "All Makes" : make}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Vehicles Table View ─── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vehicle / Details</th>
                  <th className="py-3.5 px-3">Specs / Grade</th>
                  <th className="py-3.5 px-3">FOB (JPY)</th>
                  <th className="py-3.5 px-3">Landed (NZD)</th>
                  <th className="py-3.5 px-3">Est NZ Retail</th>
                  <th className="py-3.5 px-3">Gross Margin</th>
                  <th className="py-3.5 px-4 text-center">Demand Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredVehicles.map((v) => {
                  const vKey = `${v.stockId}-${v.chassis}`;
                  const isMatched = matchedVehicleKeys.has(vKey);
                  const landed = calculateLandedCost(v.priceFob || 500000);
                  const { retailPrice, grossMargin } = getEstimatedNZRetailPrice(v);
                  const isNotified = notifiedLots.includes(v.stockId);

                  const fuel =
                    v.fuelType === "H"
                      ? "Hybrid"
                      : v.fuelType === "D"
                      ? "Diesel"
                      : v.fuelType === "E"
                      ? "Electric"
                      : "Petrol";

                  return (
                    <tr
                      key={vKey}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isMatched ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* Vehicle & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getVehiclePhoto(v)}
                            alt={`${v.make} ${v.model}`}
                            className="w-14 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/vehicles/${v.stockId}-${v.chassis}`}
                              className="font-extrabold text-[#111827] hover:text-[#E11D48] transition-colors block truncate max-w-[200px]"
                            >
                              {v.year} {v.make} {v.model}
                            </Link>
                            <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                              {v.chassis} · Lot #{v.stockId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="py-3.5 px-3 text-[#475569]">
                        <div>
                          <span className="font-semibold text-[#111827]">
                            {(v.kms || 0).toLocaleString()} km
                          </span>
                          <span className="mx-1 text-[#94A3B8]">·</span>
                          <span>Grade {v.grade || "4.0"}</span>
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5 capitalize">
                          {v.color || "white"} · {v.cc > 0 ? `${v.cc}cc` : "EV"} · {fuel}
                        </div>
                      </td>

                      {/* FOB Price JPY */}
                      <td className="py-3.5 px-3 font-mono font-bold text-[#475569]">
                        ¥{(v.priceFob || 0).toLocaleString()}
                      </td>

                      {/* Landed Cost NZD */}
                      <td className="py-3.5 px-3 font-mono font-extrabold text-[#111827]">
                        NZ${(landed.totalLanded || 0).toLocaleString()}
                      </td>

                      {/* Est Retail NZD */}
                      <td className="py-3.5 px-3 font-mono text-[#475569]">
                        NZ${(retailPrice || 0).toLocaleString()}
                      </td>

                      {/* Projected Margin */}
                      <td className="py-3.5 px-3 font-mono font-extrabold text-emerald-700">
                        +NZ${(grossMargin || 0).toLocaleString()}
                      </td>

                      {/* Demand Status Match */}
                      <td className="py-3.5 px-4 text-center">
                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-[#E11D48] border border-rose-200">
                            <Sparkles size={11} />
                            <span>Matches Auckland Auto</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] font-medium">
                            General Auction
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleNotify(v.stockId, `${v.year} ${v.make} ${v.model}`)}
                            disabled={isNotified}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                              isNotified
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "hover:bg-slate-100 text-[#1E3A5F]"
                            }`}
                            title="Dispatch match notification to dealers"
                          >
                            {isNotified ? <Check size={16} /> : <Zap size={16} className="text-[#E11D48]" />}
                          </button>

                          <Link
                            href={`/vehicles/${v.stockId}-${v.chassis}`}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors"
                            title="Open Vehicle Details"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>Showing {filteredVehicles.length} of {vehicles.length} car auction lots</span>
            <span>FX Rate benchmark: ¥{LANDED_COST_CONSTANTS.fxRate} / NZD</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
