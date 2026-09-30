"use client";

import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Car,
  Calendar,
  Gauge,
  DollarSign,
  Fuel,
  Palette,
  Tag,
  ArrowUpDown,
  Filter,
  BarChart3,
  Heart,
} from "lucide-react";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
  LANDED_COST_CONSTANTS,
} from "@/lib/heiwaData";

interface WishListItem {
  id: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  maxKms: number;
  maxBudget: number;
}

export default function MatchesPage() {
  const [wishList, setWishList] = useState<WishListItem[]>([]);
  const [matches, setMatches] = useState<HeiwaVehicle[]>([]);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "year_desc" | "kms_asc">("price_asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("autohub_wishlist");
    if (saved) {
      try {
        const parsed: WishListItem[] = JSON.parse(saved);
        setWishList(parsed);

        // Match vehicles
        const matched = new Set<string>();
        const result: HeiwaVehicle[] = [];

        // Exclude motorcycles
        const carVehicles = HEIWA_VEHICLES.filter(
          (v) =>
            !["CBR650R", "CBR250R", "REBEL 250", "STREETFIGHTER", "NINE T SCRAMBLER UNKNOWN"].includes(v.model)
        );

        for (const item of parsed) {
          if (!item.make) continue;
          for (const v of carVehicles) {
            if (matched.has(v.stockId + v.chassis)) continue;

            const makeMatch = v.make.toLowerCase() === item.make.toLowerCase();
            const modelMatch =
              !item.model || v.model.toLowerCase().includes(item.model.toLowerCase());
            const yearMatch = v.year >= item.yearFrom && v.year <= item.yearTo;
            const kmsMatch = v.kms <= item.maxKms;
            const landed = calculateLandedCost(v.priceFob);
            const budgetMatch = landed.totalLanded <= item.maxBudget;

            if (makeMatch && modelMatch && yearMatch && kmsMatch && budgetMatch) {
              matched.add(v.stockId + v.chassis);
              result.push(v);
            }
          }
        }

        setMatches(result);
      } catch {
        /* ignore */
      }
    }
    setLoaded(true);
  }, []);

  const sortedMatches = useMemo(() => {
    const sorted = [...matches];
    switch (sortBy) {
      case "price_asc":
        sorted.sort((a, b) => a.priceFob - b.priceFob);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.priceFob - a.priceFob);
        break;
      case "year_desc":
        sorted.sort((a, b) => b.year - a.year);
        break;
      case "kms_asc":
        sorted.sort((a, b) => a.kms - b.kms);
        break;
    }
    return sorted;
  }, [matches, sortBy]);

  if (!loaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-[#DF2B44] rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const fuelLabel = (ft: string) => {
    switch (ft.toUpperCase()) {
      case "H": return "Hybrid";
      case "E": return "Electric";
      case "D": return "Diesel";
      case "P": return "Petrol";
      case "G": return "Petrol";
      default: return ft || "Petrol";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#DF2B44]/10 flex items-center justify-center">
                <Search size={16} className="text-[#DF2B44]" />
              </div>
              <h1 className="text-2xl font-bold text-[#10100E] tracking-tight">
                Matched Vehicles
              </h1>
              <span className="text-[12px] font-bold text-[#DF2B44] bg-[#DF2B44]/10 px-2.5 py-0.5 rounded-full">
                {matches.length} found
              </span>
            </div>
            <p className="text-sm text-neutral-500 ml-10">
              Vehicles from Heiwa Auto Japan matching your wish list criteria, with estimated NZ landed costs.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-[#DF2B44] transition-colors"
          >
            <ArrowLeft size={14} />
            Edit Wish List
          </Link>
        </div>

        {/* Active Criteria Summary */}
        {wishList.filter(w => w.make).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {wishList.filter(w => w.make).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-white border border-neutral-200/80 rounded-lg px-3 py-2 text-xs"
              >
                <Car size={12} className="text-[#DF2B44]" />
                <span className="font-semibold text-[#10100E]">
                  {item.make} {item.model || "(Any)"}
                </span>
                <span className="text-neutral-400">
                  {item.yearFrom}–{item.yearTo} · ≤{(item.maxKms / 1000).toFixed(0)}k km ·
                  ≤NZ${(item.maxBudget).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sort Controls */}
        {matches.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-neutral-400 font-medium">
              Showing {sortedMatches.length} vehicles from Heiwa auction data
            </span>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={13} className="text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#DF2B44]"
              >
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="year_desc">Year: Newest</option>
                <option value="kms_asc">Kms: Lowest</option>
              </select>
            </div>
          </div>
        )}

        {/* No Matches State */}
        {matches.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Search size={20} className="text-neutral-400" />
            </div>
            <h3 className="text-base font-semibold text-[#10100E] mb-1">
              No matches found
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
              {wishList.filter(w => w.make).length === 0
                ? "You haven't set up your wish list yet. Add your buying criteria to find matching vehicles."
                : "No vehicles in the current Heiwa inventory match your criteria. Try adjusting your year range, km limit, or budget."
              }
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DF2B44] text-white text-sm font-semibold rounded-xl hover:bg-[#c91f38] transition-colors"
            >
              <Heart size={14} />
              {wishList.filter(w => w.make).length === 0 ? "Set Up Wish List" : "Adjust Criteria"}
            </Link>
          </div>
        )}

        {/* Vehicle Cards */}
        <div className="space-y-3">
          {sortedMatches.map((vehicle) => {
            const landed = calculateLandedCost(vehicle.priceFob);
            const isExpanded = expandedId === vehicle.stockId + vehicle.chassis;

            return (
              <div
                key={vehicle.stockId + vehicle.chassis}
                className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden transition-all hover:shadow-sm"
              >
                {/* Main Row */}
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : vehicle.stockId + vehicle.chassis)}
                >
                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[15px] font-bold text-[#10100E]">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.grade && (
                        <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {vehicle.grade}
                        </span>
                      )}
                      {vehicle.fuelType && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          vehicle.fuelType === 'H' ? 'bg-emerald-50 text-emerald-700' :
                          vehicle.fuelType === 'E' ? 'bg-blue-50 text-blue-700' :
                          vehicle.fuelType === 'D' ? 'bg-amber-50 text-amber-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {fuelLabel(vehicle.fuelType)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Gauge size={11} />
                        {vehicle.kms.toLocaleString()} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Palette size={11} />
                        {vehicle.colorDesc}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={11} />
                        {vehicle.cc > 0 ? `${vehicle.cc}cc` : 'EV'}
                      </span>
                      <span className="text-neutral-300">|</span>
                      <span className="font-mono text-neutral-400 text-[11px]">
                        #{vehicle.stockId}
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">FOB Japan</div>
                      <div className="text-[13px] font-bold text-neutral-700 font-mono">
                        ¥{vehicle.priceFob.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Est. Landed NZD</div>
                      <div className="text-[15px] font-bold text-[#10100E]">
                        NZ${landed.totalLanded.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/market?stock=${vehicle.stockId}&make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&kms=${vehicle.kms}&landed=${landed.totalLanded}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#10100E] hover:bg-[#2a2a2a] text-white text-[12px] font-semibold rounded-lg transition-colors"
                      >
                        <BarChart3 size={12} />
                        NZ Compare
                      </Link>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Cost Breakdown */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 sm:p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">FOB (NZD)</span>
                        <span className="font-bold text-[#10100E]">NZ${landed.fobNzd.toLocaleString()}</span>
                        <span className="block text-neutral-400 text-[10px]">@ ¥{LANDED_COST_CONSTANTS.fxRate}/NZD</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">Freight</span>
                        <span className="font-bold text-[#10100E]">NZ${landed.freight.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">Compliance</span>
                        <span className="font-bold text-[#10100E]">NZ${landed.compliance.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">Port Fees</span>
                        <span className="font-bold text-[#10100E]">NZ${landed.portFees.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">GST (15%)</span>
                        <span className="font-bold text-[#10100E]">NZ${landed.gst.toLocaleString()}</span>
                      </div>
                      <div className="bg-[#DF2B44]/5 rounded-lg p-2 -m-2">
                        <span className="text-[10px] font-semibold text-[#DF2B44] uppercase tracking-wider block mb-0.5">Total Landed</span>
                        <span className="font-bold text-[#DF2B44] text-base">NZ${landed.totalLanded.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Additional vehicle details */}
                    <div className="mt-4 pt-3 border-t border-neutral-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Chassis</span>
                        <span className="font-mono text-neutral-700 text-[11px]">{vehicle.chassis}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Transmission</span>
                        <span className="text-neutral-700">{vehicle.trans}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Condition</span>
                        <span className="text-neutral-700">{vehicle.ac || "—"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Equipment</span>
                        <span className="text-neutral-700">{vehicle.equip || "Standard"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
