"use client";

import React, { useState, useEffect, Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Car,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Gauge,
} from "lucide-react";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
  getNZComparables,
  NZComparable,
} from "@/lib/heiwaData";

function MarketContent() {
  const searchParams = useSearchParams();

  // Get specific vehicle from URL params, or show overview
  const stockId = searchParams.get("stock");
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const year = parseInt(searchParams.get("year") || "0");
  const kms = parseInt(searchParams.get("kms") || "0");
  const landedParam = parseInt(searchParams.get("landed") || "0");

  const [comparables, setComparables] = useState<NZComparable[]>([]);
  const [allVehicles, setAllVehicles] = useState<HeiwaVehicle[]>([]);
  const [selectedVehicleIdx, setSelectedVehicleIdx] = useState<number | null>(null);

  // Load wish list matches for overview mode
  useEffect(() => {
    if (stockId && make && model) {
      // Single vehicle comparison mode
      const comps = getNZComparables(make, model, year, kms);
      setComparables(comps);
    } else {
      // Overview mode — load matches from localStorage
      const saved = localStorage.getItem("autohub_wishlist");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const carVehicles = HEIWA_VEHICLES.filter(
            (v) =>
              !["CBR650R", "CBR250R", "REBEL 250", "STREETFIGHTER", "NINE T SCRAMBLER UNKNOWN"].includes(v.model)
          );

          const matched = new Set<string>();
          const result: HeiwaVehicle[] = [];

          for (const item of parsed) {
            if (!item.make) continue;
            for (const v of carVehicles) {
              if (matched.has(v.stockId + v.chassis)) continue;
              const makeMatch = v.make.toLowerCase() === item.make.toLowerCase();
              const modelMatch = !item.model || v.model.toLowerCase().includes(item.model.toLowerCase());
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
          setAllVehicles(result);
        } catch {/* ignore */}
      }
    }
  }, [stockId, make, model, year, kms]);

  // Single vehicle comparison view
  if (stockId && make && model && landedParam > 0) {
    const avgNzPrice = comparables.length > 0
      ? Math.round(comparables.reduce((acc, c) => acc + c.price, 0) / comparables.length)
      : 0;
    const margin = avgNzPrice - landedParam;
    const marginPercent = avgNzPrice > 0 ? Math.round((margin / avgNzPrice) * 100) : 0;
    const avgDaysListed = comparables.length > 0
      ? Math.round(comparables.reduce((acc, c) => acc + c.daysListed, 0) / comparables.length)
      : 0;

    return (
      <div className="space-y-7 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#536471] hover:text-[#C8102E] bg-white border border-[#E8ECF0] hover:border-[#C8102E]/20 px-4 py-2 rounded-xl transition-all hover:bg-[#FFF0F1] mb-4"
            >
              <ArrowLeft size={14} />
              Back to Matches
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8102E]/10 to-[#C8102E]/5 flex items-center justify-center border border-[#C8102E]/10">
                <BarChart3 size={20} className="text-[#C8102E]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1419] tracking-tight">
                  NZ Market Comparison
                </h1>
                <p className="text-[14px] text-[#536471] mt-0.5">
                  How the <strong className="text-[#0F1419]">{year} {make} {model}</strong> from Heiwa compares against similar vehicles currently for sale in New Zealand.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Key Metrics Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#E8ECF0] p-5 shadow-card">
            <div className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider mb-3">Heiwa Landed Cost</div>
            <div className="text-2xl font-extrabold text-[#0F1419]">NZ${landedParam.toLocaleString()}</div>
            <div className="text-[12px] text-[#8899A6] mt-1.5 font-medium">Inc. FOB, freight, compliance, GST</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E8ECF0] p-5 shadow-card">
            <div className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider mb-3">Avg NZ Retail</div>
            <div className="text-2xl font-extrabold text-[#0F1419]">NZ${avgNzPrice.toLocaleString()}</div>
            <div className="text-[12px] text-[#8899A6] mt-1.5 font-medium">Based on {comparables.length} similar listings</div>
          </div>
          <div className={`rounded-2xl border-2 p-5 shadow-card ${margin > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
            <div className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider mb-3">Estimated Margin</div>
            <div className={`text-2xl font-extrabold flex items-center gap-2 ${margin > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {margin > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              NZ${Math.abs(margin).toLocaleString()}
            </div>
            <div className={`text-[12px] mt-1.5 font-semibold ${margin > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {marginPercent}% {margin > 0 ? 'potential upside' : 'below retail'}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E8ECF0] p-5 shadow-card">
            <div className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider mb-3">Avg Days Listed</div>
            <div className="text-2xl font-extrabold text-[#0F1419] flex items-center gap-2">
              <Clock size={20} className="text-[#AAB8C2]" />
              {avgDaysListed}
            </div>
            <div className="text-[12px] text-[#8899A6] mt-1.5 font-medium">Market selling velocity</div>
          </div>
        </div>

        {/* ─── Visual Comparison Bar ─── */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6 shadow-card">
          <h3 className="text-[15px] font-bold text-[#0F1419] mb-5">Price Positioning</h3>
          <div className="relative">
            {/* Price range bar */}
            <div className="h-4 bg-[#F0F2F5] rounded-full relative overflow-visible">
              {comparables.length > 0 && (() => {
                const prices = comparables.map(c => c.price);
                const minPrice = Math.min(...prices, landedParam);
                const maxPrice = Math.max(...prices, landedParam);
                const range = maxPrice - minPrice || 1;
                const landedPos = ((landedParam - minPrice) / range) * 100;

                return (
                  <>
                    <div
                      className="absolute h-full bg-[#E8ECF0] rounded-full"
                      style={{ left: '0%', width: '100%' }}
                    />
                    {/* Heiwa position marker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#C8102E] border-3 border-white shadow-lg z-10 flex items-center justify-center"
                      style={{ left: `${Math.min(Math.max(landedPos, 2), 98)}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="text-[7px] font-bold text-white">H</span>
                    </div>
                    {/* NZ comparable markers */}
                    {comparables.map((c, i) => {
                      const pos = ((c.price - minPrice) / range) * 100;
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#536471] border-2 border-white shadow-md"
                          style={{ left: `${Math.min(Math.max(pos, 2), 98)}%`, transform: 'translate(-50%, -50%)' }}
                          title={`${c.source}: NZ$${c.price.toLocaleString()}`}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </div>
            <div className="flex items-center justify-between mt-4 text-[12px] text-[#536471] font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C8102E]" />
                Heiwa Landed Cost
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#536471]" />
                NZ Market Listings
              </div>
            </div>
          </div>
        </div>

        {/* ─── NZ Comparable Listings Table ─── */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E8ECF0]">
            <h3 className="text-[16px] font-bold text-[#0F1419]">
              Similar Vehicles in NZ Market
            </h3>
            <p className="text-[13px] text-[#8899A6] mt-1">
              Current listings for comparable {make} {model} vehicles in New Zealand
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-[10px] font-bold text-[#AAB8C2] uppercase tracking-wider border-b border-[#E8ECF0] bg-[#FAFBFC]">
                  <th className="text-left px-6 py-3.5">Source</th>
                  <th className="text-left px-6 py-3.5">Vehicle</th>
                  <th className="text-right px-6 py-3.5">Kms</th>
                  <th className="text-left px-6 py-3.5">Location</th>
                  <th className="text-right px-6 py-3.5">Price</th>
                  <th className="text-right px-6 py-3.5">Days Listed</th>
                  <th className="text-right px-6 py-3.5">vs Heiwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {comparables.map((comp, idx) => {
                  const diff = comp.price - landedParam;
                  return (
                    <tr key={idx} className="hover:bg-[#FAFBFC] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#0F1419]">{comp.source}</span>
                      </td>
                      <td className="px-6 py-4 text-[#536471]">{comp.title}</td>
                      <td className="px-6 py-4 text-[#536471] text-right font-mono font-medium">{comp.kms.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[#536471]">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-[#AAB8C2]" />
                          {comp.location}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-[#0F1419]">
                        NZ${comp.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-[#8899A6] font-medium">
                        {comp.daysListed} days
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[12px] font-bold px-3 py-1 rounded-lg ${
                          diff > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {diff > 0 ? '+' : ''}{diff > 0 ? `NZ$${diff.toLocaleString()}` : `-NZ$${Math.abs(diff).toLocaleString()}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Summary Insight ─── */}
        <div className={`rounded-2xl border-2 p-6 ${margin > 0 ? 'bg-emerald-50/30 border-emerald-200' : 'bg-amber-50/30 border-amber-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${margin > 0 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {margin > 0 ? <TrendingUp size={20} className="text-emerald-700" /> : <Minus size={20} className="text-amber-700" />}
            </div>
            <div>
              <p className={`text-[15px] font-bold ${margin > 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                {margin > 0
                  ? `This vehicle has an estimated NZ$${margin.toLocaleString()} margin opportunity`
                  : `This vehicle's landed cost is close to NZ retail — margin may be tight`
                }
              </p>
              <p className="text-[13px] text-[#536471] mt-2 leading-relaxed">
                The Heiwa landed cost of <strong className="text-[#0F1419]">NZ${landedParam.toLocaleString()}</strong> compares against an average
                NZ retail price of <strong className="text-[#0F1419]">NZ${avgNzPrice.toLocaleString()}</strong> across {comparables.length} similar
                listings. Similar vehicles are selling in an average of <strong className="text-[#0F1419]">{avgDaysListed} days</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Overview mode — show all matched vehicles with NZ comparison ───
  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8102E]/10 to-[#C8102E]/5 flex items-center justify-center border border-[#C8102E]/10">
            <BarChart3 size={20} className="text-[#C8102E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1419] tracking-tight">
              NZ Market View
            </h1>
            <p className="text-[14px] text-[#536471] mt-0.5">
              Compare your matched Heiwa vehicles against current NZ retail pricing to identify the best sourcing opportunities.
            </p>
          </div>
        </div>
      </div>

      {allVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-16 text-center shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F2F5] flex items-center justify-center mx-auto mb-5">
            <BarChart3 size={28} className="text-[#AAB8C2]" />
          </div>
          <h3 className="text-xl font-bold text-[#0F1419] mb-2">No matches to compare</h3>
          <p className="text-[14px] text-[#536471] max-w-md mx-auto mb-8 leading-relaxed">
            Set up your wish list and find matching vehicles first, then come here to compare against NZ market pricing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#C8102E] text-white text-[14px] font-bold rounded-xl hover:bg-[#A30D24] transition-all shadow-md shadow-red-900/20"
          >
            <Search size={16} />
            Set Up Wish List
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {allVehicles.map((vehicle, idx) => {
            const landed = calculateLandedCost(vehicle.priceFob);
            const comps = getNZComparables(vehicle.make, vehicle.model, vehicle.year, vehicle.kms);
            const avgNzPrice = comps.length > 0
              ? Math.round(comps.reduce((acc, c) => acc + c.price, 0) / comps.length)
              : 0;
            const margin = avgNzPrice - landed.totalLanded;
            const isExpanded = selectedVehicleIdx === allVehicles.indexOf(vehicle);

            return (
              <div
                key={vehicle.stockId + vehicle.chassis}
                className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden shadow-card card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-6 cursor-pointer"
                  onClick={() => setSelectedVehicleIdx(isExpanded ? null : allVehicles.indexOf(vehicle))}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold text-[#0F1419]">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-3.5 mt-1.5 text-[13px] text-[#536471]">
                      <span>{vehicle.kms.toLocaleString()} km</span>
                      <span>{vehicle.colorDesc}</span>
                      <span>{vehicle.cc > 0 ? `${vehicle.cc}cc` : 'EV'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-[#AAB8C2] uppercase tracking-wider font-bold">Landed</div>
                      <div className="text-[15px] font-extrabold text-[#0F1419] mt-0.5">NZ${landed.totalLanded.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#AAB8C2] uppercase tracking-wider font-bold">NZ Avg</div>
                      <div className="text-[15px] font-bold text-[#536471] mt-0.5">NZ${avgNzPrice.toLocaleString()}</div>
                    </div>
                    <div className={`text-right px-3.5 py-2 rounded-xl border ${margin > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="text-[10px] text-[#AAB8C2] uppercase tracking-wider font-bold">Margin</div>
                      <div className={`text-[15px] font-extrabold mt-0.5 ${margin > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {margin > 0 ? '+' : ''}NZ${margin.toLocaleString()}
                      </div>
                    </div>
                    <Link
                      href={`/market?stock=${vehicle.stockId}&make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&kms=${vehicle.kms}&landed=${landed.totalLanded}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12px] font-bold text-[#C8102E] hover:underline flex items-center gap-1.5 bg-[#FFF0F1] px-3 py-2 rounded-lg border border-[#FFE0E3] hover:bg-[#FFE0E3] transition-all"
                    >
                      Detail <ExternalLink size={11} />
                    </Link>
                    <button className="p-2 text-[#AAB8C2] hover:text-[#536471] hover:bg-[#F0F2F5] rounded-xl transition-all">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#E8ECF0] bg-[#FAFBFC] p-5 sm:p-6">
                    <div className="text-[12px] font-bold text-[#536471] uppercase tracking-wider mb-3">NZ Market Comparables</div>
                    <div className="space-y-2">
                      {comps.slice(0, 4).map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-[13px] py-3 px-4 bg-white rounded-xl border border-[#E8ECF0]">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#0F1419]">{c.source}</span>
                            <span className="text-[#D1D5DB]">·</span>
                            <span className="text-[#536471]">{c.title}</span>
                            <span className="text-[#AAB8C2] text-[12px]">{c.kms.toLocaleString()} km</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[#AAB8C2] text-[12px]">{c.location}</span>
                            <span className="font-extrabold text-[#0F1419]">NZ${c.price.toLocaleString()}</span>
                            <span className="text-[#AAB8C2] text-[12px] font-medium">{c.daysListed}d</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MarketPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-[#E8ECF0] border-t-[#C8102E] rounded-full animate-spin" />
        </div>
      }>
        <MarketContent />
      </Suspense>
    </AppLayout>
  );
}
