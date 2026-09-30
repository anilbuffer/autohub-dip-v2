"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Heart,
  Car,
  Trash2,
  ArrowRight,
  Gavel,
  TrendingUp,
  Gauge,
  Fuel,
  DollarSign,
  Sparkles,
} from "lucide-react";
import {
  getStoredWatchlist,
  toggleStoredWatchlist,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
} from "@/lib/dealerStore";
import { HEIWA_VEHICLES, HeiwaVehicle, calculateLandedCost } from "@/lib/heiwaData";

export default function MyWatchlistPage() {
  const [watchlistChassis, setWatchlistChassis] = useState<string[]>([]);

  const refreshWatchlist = () => {
    setWatchlistChassis(getStoredWatchlist());
  };

  useEffect(() => {
    refreshWatchlist();
    const handler = () => refreshWatchlist();
    window.addEventListener("autohub_dealer_store_change", handler);
    return () => window.removeEventListener("autohub_dealer_store_change", handler);
  }, []);

  const savedVehicles = HEIWA_VEHICLES.filter((v) =>
    watchlistChassis.includes(v.chassis)
  );

  const handleRemove = (e: React.MouseEvent, chassis: string) => {
    e.preventDefault();
    toggleStoredWatchlist(chassis);
  };

  const avgLanded = savedVehicles.length > 0
    ? Math.round(
        savedVehicles.reduce((acc, v) => acc + calculateLandedCost(v.priceFob).totalLanded, 0) /
          savedVehicles.length
      )
    : 0;

  const totalMargin = savedVehicles.reduce(
    (acc, v) => acc + getEstimatedNZRetailPrice(v).grossMargin,
    0
  );

  return (
    <AppLayout>
      <div className="space-y-6 pb-16">
        {/* ─── Hero Header — Light Navy Theme ─── */}
        <div className="bg-gradient-to-r from-[#182C48] via-[#15253D] to-[#111E32] text-white rounded-2xl p-6 sm:p-8 shadow-elevated relative overflow-hidden border border-[#25426B]/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 border border-white/10">
                <Heart size={13} className="text-rose-400 fill-rose-400" />
                <span>Saved Inventory Shortlist</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                My Watchlist
              </h1>
              <p className="text-sm text-white/70 max-w-xl mt-1.5 leading-relaxed">
                Japan auction lots shortlisted for potential dealer inventory. Monitor price movements and landed margins before bidding.
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white/[0.04] p-3 sm:p-4 rounded-xl border border-white/[0.08]">
              <div className="text-left px-3 border-r border-white/10">
                <div className="text-xs text-white/50">Saved Lots</div>
                <div className="text-xl font-bold text-white font-mono">{savedVehicles.length} Cars</div>
              </div>
              <div className="text-left px-3 border-r border-white/10">
                <div className="text-xs text-white/50">Avg Landed</div>
                <div className="text-xl font-bold text-[#FF6B78] font-mono">
                  ${avgLanded.toLocaleString()} NZD
                </div>
              </div>
              <div className="text-left px-3">
                <div className="text-xs text-emerald-400/80">Est. Profit Pool</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  +${totalMargin.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Vehicles Grid ─── */}
        {savedVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-subtle">
            <Heart size={44} className="mx-auto text-[#94A3B8] mb-3" />
            <h3 className="text-base font-bold text-[#111C2D]">Your Watchlist is Empty</h3>
            <p className="text-xs text-[#475569] max-w-sm mx-auto mt-1 mb-5">
              Click the heart icon on any vehicle card in &quot;Browse Vehicles&quot; to bookmark it for fast monitoring.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A5F] text-white text-xs font-bold hover:bg-[#162C48] transition-colors"
            >
              <Car size={14} /> Browse Heiwa Stock
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedVehicles.map((vehicle) => {
              const photoUrl = getVehiclePhoto(vehicle);
              const landed = calculateLandedCost(vehicle.priceFob);
              const nzRetail = getEstimatedNZRetailPrice(vehicle);
              const uniqueId = encodeURIComponent(vehicle.chassis);

              return (
                <div
                  key={vehicle.chassis}
                  className="bg-white rounded-2xl border border-[#E8ECF0] hover:border-[#CCD6DD] shadow-subtle flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-bold">
                          LOT #{vehicle.stockId}
                        </span>
                        {vehicle.grade && (
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                            Grade {vehicle.grade}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleRemove(e, vehicle.chassis)}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-rose-600 text-white rounded-lg transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="font-mono text-[11px]">{vehicle.chassis}</span>
                        <span>{vehicle.kms.toLocaleString()} km</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-[#111C2D]">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="text-xs text-[#536471] mt-0.5">
                          {vehicle.cc > 0 ? `${vehicle.cc}cc` : "EV"} · {vehicle.fuelType === "H" ? "Hybrid" : "Petrol"} · {vehicle.colorDesc || vehicle.color}
                        </div>
                      </div>

                      {/* Landed & Margin */}
                      <div className="p-3.5 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                            AutoHub Landed
                          </span>
                          <span className="text-base font-extrabold text-[#C8102E] font-mono">
                            ${landed.totalLanded.toLocaleString()} NZD
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-[#E8ECF0]">
                          <span className="text-xs text-[#536471]">Est. Margin:</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                            +${nzRetail.grossMargin.toLocaleString()} ({nzRetail.marginPercent}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-[#FAFBFC] border-t border-[#E8ECF0] flex items-center gap-2">
                    <Link
                      href={`/vehicles/${uniqueId}`}
                      className="flex-1 py-2.5 bg-[#1E3A5F] hover:bg-[#C8102E] text-white text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>View Details & NZ Market</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
