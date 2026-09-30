"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Heart,
  Car,
  Trash2,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  getStoredWatchlist,
  toggleStoredWatchlist,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
} from "@/lib/dealerStore";
import {
  HEIWA_VEHICLES,
  calculateLandedCost,
  HeiwaVehicle,
} from "@/lib/heiwaData";

// Format single clean specs line: e.g. "1.8L Hybrid | Automatic | 72,456 km"
function formatSpecsLine(v: HeiwaVehicle): string {
  const disp = v.cc > 0 ? `${(v.cc / 1000).toFixed(1)}L` : "EV";
  const fuel = v.fuelType === "H" ? "Hybrid" : v.fuelType === "D" ? "Diesel" : v.fuelType === "E" ? "Electric" : "Petrol";
  const trans = v.trans === "FAT" || v.trans === "AT" || v.trans === "DAT" ? "Automatic" : v.trans === "MT" ? "Manual" : "Automatic";
  const kms = `${v.kms.toLocaleString("en-US")} km`;
  return `${disp} ${fuel} | ${trans} | ${kms}`;
}

export default function WatchlistPage() {
  const [watchlistChassis, setWatchlistChassis] = useState<string[]>([]);

  const refreshWatchlist = () => {
    try {
      setWatchlistChassis(getStoredWatchlist());
    } catch {
      // ignore
    }
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

  const handleRemove = (e: React.MouseEvent, vehicle: HeiwaVehicle) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStoredWatchlist(vehicle.chassis);
    refreshWatchlist();
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-16 font-sans">
        {/* ─── Page Title & Action Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Watchlist
            </h1>
          </div>

          <Link
            href="/browse-vehicles"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Find More Vehicles</span>
          </Link>
        </div>

        {/* ─── Vehicles Count ─── */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[15px] font-bold text-[#111827]">
            {savedVehicles.length} Saved {savedVehicles.length === 1 ? "Vehicle" : "Vehicles"}
          </span>
        </div>

        {/* ─── Clean Listing Grid ─── */}
        {savedVehicles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-soft">
            <Heart size={44} className="mx-auto text-[#94A3B8] mb-3" />
            <h3 className="text-base font-bold text-[#111827]">Your Watchlist is Empty</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-5">
              Click the heart icon on any vehicle card in &quot;Browse Vehicles&quot; to bookmark it here for quick monitoring.
            </p>
            <Link
              href="/browse-vehicles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Car size={15} />
              <span>Browse Auction Stock</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedVehicles.map((vehicle) => {
              const photoUrl = getVehiclePhoto(vehicle);
              const landed = calculateLandedCost(vehicle.priceFob);
              const estimatedNz = getEstimatedNZRetailPrice(vehicle);
              const uniqueId = encodeURIComponent(vehicle.chassis);

              return (
                <div
                  key={vehicle.chassis}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Image container */}
                  <div className="relative aspect-[16/10] w-full bg-[#F1F5F9] overflow-hidden">
                    <img
                      src={photoUrl}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Remove button (Heart active) */}
                    <button
                      onClick={(e) => handleRemove(e, vehicle)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-[#E11D48] hover:text-[#BE123C] transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Heart size={15} className="fill-[#E11D48] text-[#E11D48]" />
                    </button>
                  </div>

                  {/* Clean details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111C2D] truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1.5 font-medium truncate">
                        {formatSpecsLine(vehicle)}
                      </p>
                    </div>

                    {/* Neutral Pricing: Landed Cost & NZ Market Indicator */}
                    <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-[#8899A6] font-semibold uppercase tracking-wider">
                          Landed Cost
                        </div>
                        <div className="text-lg font-extrabold text-[#111C2D] font-mono tracking-tight">
                          NZ${landed.totalLanded.toLocaleString("en-US")}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-[#8899A6] font-semibold uppercase tracking-wider">
                          NZ Market Indicator
                        </div>
                        <div className="text-sm font-bold text-slate-700 font-mono">
                          NZ${estimatedNz.retailPrice.toLocaleString("en-US")}
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Button */}
                    <div className="mt-3.5">
                      <Link
                        href={`/vehicles/${uniqueId}`}
                        className="w-full py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
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
