"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link
              href="/matches"
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-[#DF2B44] transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              Back to Matches
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#DF2B44]/10 flex items-center justify-center">
                <BarChart3 size={16} className="text-[#DF2B44]" />
              </div>
              <h1 className="text-2xl font-bold text-[#10100E] tracking-tight">
                NZ Market Comparison
              </h1>
            </div>
            <p className="text-sm text-neutral-500 ml-10">
              How the <strong className="text-neutral-700">{year} {make} {model}</strong> from Heiwa compares against similar vehicles currently for sale in New Zealand.
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-sm">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Heiwa Landed Cost</div>
            <div className="text-xl font-bold text-[#10100E]">NZ${landedParam.toLocaleString()}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Inc. FOB, freight, compliance, GST</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-sm">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Avg NZ Retail</div>
            <div className="text-xl font-bold text-[#10100E]">NZ${avgNzPrice.toLocaleString()}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Based on {comparables.length} similar listings</div>
          </div>
          <div className={`rounded-xl border p-4 shadow-sm ${margin > 0 ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-red-50/50 border-red-200/60'}`}>
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Estimated Margin</div>
            <div className={`text-xl font-bold flex items-center gap-2 ${margin > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {margin > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              NZ${Math.abs(margin).toLocaleString()}
            </div>
            <div className={`text-[11px] mt-1 ${margin > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {marginPercent}% {margin > 0 ? 'potential upside' : 'below retail'}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-sm">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Avg Days Listed</div>
            <div className="text-xl font-bold text-[#10100E] flex items-center gap-2">
              <Clock size={18} className="text-neutral-400" />
              {avgDaysListed}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">Market selling velocity</div>
          </div>
        </div>

        {/* Visual Comparison Bar */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-sm">
          <h3 className="text-[13px] font-semibold text-[#10100E] mb-4">Price Positioning</h3>
          <div className="relative">
            {/* Price range bar */}
            <div className="h-3 bg-neutral-100 rounded-full relative overflow-hidden">
              {comparables.length > 0 && (() => {
                const prices = comparables.map(c => c.price);
                const minPrice = Math.min(...prices, landedParam);
                const maxPrice = Math.max(...prices, landedParam);
                const range = maxPrice - minPrice || 1;
                const landedPos = ((landedParam - minPrice) / range) * 100;

                return (
                  <>
                    <div
                      className="absolute h-full bg-neutral-300/50 rounded-full"
                      style={{ left: '0%', width: '100%' }}
                    />
                    {/* Heiwa position marker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#DF2B44] border-2 border-white shadow-md z-10 flex items-center justify-center"
                      style={{ left: `${Math.min(Math.max(landedPos, 2), 98)}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="text-[6px] font-bold text-white">H</span>
                    </div>
                    {/* NZ comparable markers */}
                    {comparables.map((c, i) => {
                      const pos = ((c.price - minPrice) / range) * 100;
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neutral-400 border-2 border-white shadow-sm"
                          style={{ left: `${Math.min(Math.max(pos, 2), 98)}%`, transform: 'translate(-50%, -50%)' }}
                          title={`${c.source}: NZ$${c.price.toLocaleString()}`}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DF2B44]" />
                Heiwa Landed Cost
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                NZ Market Listings
              </div>
            </div>
          </div>
        </div>

        {/* NZ Comparable Listings Table */}
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-[13px] font-semibold text-[#10100E]">
              Similar Vehicles in NZ Market
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Current listings for comparable {make} {model} vehicles in New Zealand
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  <th className="text-left px-5 py-3">Source</th>
                  <th className="text-left px-5 py-3">Vehicle</th>
                  <th className="text-right px-5 py-3">Kms</th>
                  <th className="text-left px-5 py-3">Location</th>
                  <th className="text-right px-5 py-3">Price</th>
                  <th className="text-right px-5 py-3">Days Listed</th>
                  <th className="text-right px-5 py-3">vs Heiwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {comparables.map((comp, idx) => {
                  const diff = comp.price - landedParam;
                  return (
                    <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-[#10100E] text-[13px]">{comp.source}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-neutral-600">{comp.title}</td>
                      <td className="px-5 py-3.5 text-[13px] text-neutral-600 text-right font-mono">{comp.kms.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[13px] text-neutral-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-neutral-400" />
                          {comp.location}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#10100E] text-[13px]">
                        NZ${comp.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] text-neutral-500">
                        {comp.daysListed} days
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-[12px] font-semibold px-2 py-0.5 rounded ${
                          diff > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
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

        {/* Summary Insight */}
        <div className={`rounded-xl border p-5 ${margin > 0 ? 'bg-emerald-50/30 border-emerald-200/50' : 'bg-amber-50/30 border-amber-200/50'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${margin > 0 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {margin > 0 ? <TrendingUp size={16} className="text-emerald-700" /> : <Minus size={16} className="text-amber-700" />}
            </div>
            <div>
              <p className={`text-[13px] font-semibold ${margin > 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                {margin > 0
                  ? `This vehicle has an estimated NZ$${margin.toLocaleString()} margin opportunity`
                  : `This vehicle's landed cost is close to NZ retail — margin may be tight`
                }
              </p>
              <p className="text-[12px] text-neutral-500 mt-1 leading-relaxed">
                The Heiwa landed cost of <strong>NZ${landedParam.toLocaleString()}</strong> compares against an average
                NZ retail price of <strong>NZ${avgNzPrice.toLocaleString()}</strong> across {comparables.length} similar
                listings. Similar vehicles are selling in an average of <strong>{avgDaysListed} days</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview mode — show all matched vehicles with NZ comparison
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#DF2B44]/10 flex items-center justify-center">
            <BarChart3 size={16} className="text-[#DF2B44]" />
          </div>
          <h1 className="text-2xl font-bold text-[#10100E] tracking-tight">
            NZ Market View
          </h1>
        </div>
        <p className="text-sm text-neutral-500 ml-10">
          Compare your matched Heiwa vehicles against current NZ retail pricing to identify the best sourcing opportunities.
        </p>
      </div>

      {allVehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={20} className="text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold text-[#10100E] mb-1">No matches to compare</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
            Set up your wish list and find matching vehicles first, then come here to compare against NZ market pricing.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DF2B44] text-white text-sm font-semibold rounded-xl hover:bg-[#c91f38] transition-colors"
          >
            <Search size={14} />
            Set Up Wish List
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allVehicles.map((vehicle) => {
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
                className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-sm"
              >
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 cursor-pointer"
                  onClick={() => setSelectedVehicleIdx(isExpanded ? null : allVehicles.indexOf(vehicle))}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-bold text-[#10100E]">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-500">
                      <span>{vehicle.kms.toLocaleString()} km</span>
                      <span>{vehicle.colorDesc}</span>
                      <span>{vehicle.cc > 0 ? `${vehicle.cc}cc` : 'EV'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Landed</div>
                      <div className="text-[13px] font-bold text-[#10100E]">NZ${landed.totalLanded.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">NZ Avg</div>
                      <div className="text-[13px] font-bold text-neutral-600">NZ${avgNzPrice.toLocaleString()}</div>
                    </div>
                    <div className={`text-right px-2.5 py-1 rounded-lg ${margin > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Margin</div>
                      <div className={`text-[13px] font-bold ${margin > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {margin > 0 ? '+' : ''}NZ${margin.toLocaleString()}
                      </div>
                    </div>
                    <Link
                      href={`/market?stock=${vehicle.stockId}&make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&kms=${vehicle.kms}&landed=${landed.totalLanded}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-[#DF2B44] hover:underline flex items-center gap-1"
                    >
                      Detail <ExternalLink size={10} />
                    </Link>
                    <button className="p-1 text-neutral-400">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-neutral-100 bg-neutral-50/30 p-4">
                    <div className="text-[11px] font-semibold text-neutral-500 mb-2">NZ Market Comparables</div>
                    <div className="space-y-1.5">
                      {comps.slice(0, 4).map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-[12px] py-1.5 border-b border-neutral-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-700">{c.source}</span>
                            <span className="text-neutral-400">·</span>
                            <span className="text-neutral-500">{c.title}</span>
                            <span className="text-neutral-400">{c.kms.toLocaleString()} km</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-400 text-[11px]">{c.location}</span>
                            <span className="font-bold text-[#10100E]">NZ${c.price.toLocaleString()}</span>
                            <span className="text-neutral-400 text-[11px]">{c.daysListed}d</span>
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
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-[#DF2B44] rounded-full animate-spin" />
        </div>
      }>
        <MarketContent />
      </Suspense>
    </AppLayout>
  );
}
