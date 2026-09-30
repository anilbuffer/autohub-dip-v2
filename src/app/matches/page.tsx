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
  Layers,
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
          <div className="w-6 h-6 border-2 border-[#E8ECF0] border-t-[#C8102E] rounded-full animate-spin" />
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
        
        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8102E]/10 to-[#C8102E]/5 flex items-center justify-center border border-[#C8102E]/10">
                <Search size={20} className="text-[#C8102E]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1419] tracking-tight">
                    Matched Vehicles
                  </h1>
                  <span className="text-[13px] font-bold text-[#C8102E] bg-[#FFF0F1] px-3 py-1 rounded-lg border border-[#FFE0E3]">
                    {matches.length} found
                  </span>
                </div>
                <p className="text-[14px] text-[#536471] mt-0.5">
                  Vehicles from Heiwa Auto Japan matching your wish list criteria, with estimated NZ landed costs.
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] font-semibold text-[#536471] hover:text-[#C8102E] bg-white border border-[#E8ECF0] hover:border-[#C8102E]/20 px-4 py-2.5 rounded-xl transition-all hover:bg-[#FFF0F1]"
          >
            <ArrowLeft size={14} />
            Edit Wish List
          </Link>
        </div>

        {/* ─── Active Criteria Summary ─── */}
        {wishList.filter(w => w.make).length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {wishList.filter(w => w.make).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 bg-white border border-[#E8ECF0] rounded-xl px-4 py-2.5 text-[13px] shadow-subtle"
              >
                <div className="w-6 h-6 rounded-md bg-[#C8102E]/10 flex items-center justify-center">
                  <Car size={12} className="text-[#C8102E]" />
                </div>
                <span className="font-bold text-[#0F1419]">
                  {item.make} {item.model || "(Any)"}
                </span>
                <span className="text-[#8899A6] text-[12px]">
                  {item.yearFrom}–{item.yearTo} · ≤{(item.maxKms / 1000).toFixed(0)}k km ·
                  ≤NZ${(item.maxBudget).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ─── Sort Controls ─── */}
        {matches.length > 0 && (
          <div className="flex items-center justify-between bg-white border border-[#E8ECF0] rounded-xl px-5 py-3 shadow-subtle">
            <span className="text-[13px] text-[#536471] font-medium flex items-center gap-2">
              <Layers size={14} className="text-[#AAB8C2]" />
              Showing <strong className="text-[#0F1419]">{sortedMatches.length}</strong> vehicles from Heiwa auction data
            </span>
            <div className="flex items-center gap-2.5">
              <ArrowUpDown size={14} className="text-[#AAB8C2]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-[13px] font-semibold text-[#0F1419] bg-[#F7F9FA] border border-[#E8ECF0] rounded-lg px-3 py-2 outline-none focus:border-[#C8102E]/30 cursor-pointer"
              >
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="year_desc">Year: Newest</option>
                <option value="kms_asc">Kms: Lowest</option>
              </select>
            </div>
          </div>
        )}

        {/* ─── No Matches State ─── */}
        {matches.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E8ECF0] p-16 text-center shadow-card">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F2F5] flex items-center justify-center mx-auto mb-5">
              <Search size={28} className="text-[#AAB8C2]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F1419] mb-2">
              No matches found
            </h3>
            <p className="text-[14px] text-[#536471] max-w-md mx-auto mb-8 leading-relaxed">
              {wishList.filter(w => w.make).length === 0
                ? "You haven't set up your wish list yet. Add your buying criteria to find matching vehicles."
                : "No vehicles in the current Heiwa inventory match your criteria. Try adjusting your year range, km limit, or budget."
              }
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#C8102E] text-white text-[14px] font-bold rounded-xl hover:bg-[#A30D24] transition-all shadow-md shadow-red-900/20"
            >
              <Heart size={16} />
              {wishList.filter(w => w.make).length === 0 ? "Set Up Wish List" : "Adjust Criteria"}
            </Link>
          </div>
        )}

        {/* ─── Vehicle Cards ─── */}
        <div className="space-y-4">
          {sortedMatches.map((vehicle, idx) => {
            const landed = calculateLandedCost(vehicle.priceFob);
            const isExpanded = expandedId === vehicle.stockId + vehicle.chassis;

            return (
              <div
                key={vehicle.stockId + vehicle.chassis}
                className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden shadow-card card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                {/* Main Row */}
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-6 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : vehicle.stockId + vehicle.chassis)}
                >
                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-[16px] font-bold text-[#0F1419]">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.grade && (
                        <span className="text-[11px] font-semibold text-[#536471] bg-[#F0F2F5] px-2.5 py-0.5 rounded-md border border-[#E8ECF0]">
                          {vehicle.grade}
                        </span>
                      )}
                      {vehicle.fuelType && (
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                          vehicle.fuelType === 'H' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          vehicle.fuelType === 'E' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          vehicle.fuelType === 'D' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-[#F0F2F5] text-[#536471] border border-[#E8ECF0]'
                        }`}>
                          {fuelLabel(vehicle.fuelType)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[13px] text-[#536471]">
                      <span className="flex items-center gap-1.5">
                        <Gauge size={12} className="text-[#AAB8C2]" />
                        {vehicle.kms.toLocaleString()} km
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Palette size={12} className="text-[#AAB8C2]" />
                        {vehicle.colorDesc}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Tag size={12} className="text-[#AAB8C2]" />
                        {vehicle.cc > 0 ? `${vehicle.cc}cc` : 'EV'}
                      </span>
                      <span className="hidden sm:inline text-[#D1D5DB]">|</span>
                      <span className="hidden sm:inline font-mono text-[#AAB8C2] text-[12px]">
                        #{vehicle.stockId}
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider">FOB Japan</div>
                      <div className="text-[14px] font-bold text-[#536471] font-mono mt-0.5">
                        ¥{vehicle.priceFob.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider">Est. Landed NZD</div>
                      <div className="text-[18px] font-extrabold text-[#0F1419] mt-0.5">
                        NZ${landed.totalLanded.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/market?stock=${vehicle.stockId}&make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&kms=${vehicle.kms}&landed=${landed.totalLanded}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1419] hover:bg-[#2C3640] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        <BarChart3 size={14} />
                        NZ Compare
                      </Link>
                      <button className="p-2.5 text-[#AAB8C2] hover:text-[#536471] hover:bg-[#F0F2F5] rounded-xl transition-all">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Cost Breakdown */}
                {isExpanded && (
                  <div className="border-t border-[#E8ECF0] bg-[#FAFBFC] p-5 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-5 text-[13px]">
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider block mb-1">FOB (NZD)</span>
                        <span className="font-bold text-[#0F1419]">NZ${landed.fobNzd.toLocaleString()}</span>
                        <span className="block text-[#AAB8C2] text-[10px] mt-0.5">@ ¥{LANDED_COST_CONSTANTS.fxRate}/NZD</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider block mb-1">Freight</span>
                        <span className="font-bold text-[#0F1419]">NZ${landed.freight.toLocaleString()}</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider block mb-1">Compliance</span>
                        <span className="font-bold text-[#0F1419]">NZ${landed.compliance.toLocaleString()}</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider block mb-1">Port Fees</span>
                        <span className="font-bold text-[#0F1419]">NZ${landed.portFees.toLocaleString()}</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider block mb-1">GST (15%)</span>
                        <span className="font-bold text-[#0F1419]">NZ${landed.gst.toLocaleString()}</span>
                      </div>
                      <div className="bg-gradient-to-br from-[#C8102E]/10 to-[#C8102E]/5 rounded-xl p-3 border border-[#C8102E]/15">
                        <span className="text-[10px] font-bold text-[#C8102E] uppercase tracking-wider block mb-1">Total Landed</span>
                        <span className="font-extrabold text-[#C8102E] text-lg">NZ${landed.totalLanded.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Additional vehicle details */}
                    <div className="mt-5 pt-4 border-t border-[#E8ECF0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[#AAB8C2] block text-[10px] font-bold uppercase tracking-wider mb-1">Chassis</span>
                        <span className="font-mono text-[#0F1419] text-[12px] font-semibold">{vehicle.chassis}</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[#AAB8C2] block text-[10px] font-bold uppercase tracking-wider mb-1">Transmission</span>
                        <span className="text-[#0F1419] font-semibold">{vehicle.trans}</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[#AAB8C2] block text-[10px] font-bold uppercase tracking-wider mb-1">Condition</span>
                        <span className="text-[#0F1419] font-semibold">{vehicle.ac || "—"}</span>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-[#E8ECF0]">
                        <span className="text-[#AAB8C2] block text-[10px] font-bold uppercase tracking-wider mb-1">Equipment</span>
                        <span className="text-[#0F1419] font-semibold">{vehicle.equip || "Standard"}</span>
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
