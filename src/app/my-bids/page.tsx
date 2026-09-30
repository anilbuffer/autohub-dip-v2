"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Gavel,
  Clock,
  Car,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import {
  DealerBid,
  getStoredBids,
  saveStoredBids,
  getVehiclePhoto,
} from "@/lib/dealerStore";
import { HEIWA_VEHICLES, calculateLandedCost } from "@/lib/heiwaData";

export default function MyBidsPage() {
  const [bids, setBids] = useState<DealerBid[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "won">("all");
  const [editingBid, setEditingBid] = useState<DealerBid | null>(null);
  const [newBidAmount, setNewBidAmount] = useState<number>(0);

  const refreshBids = () => {
    setBids(getStoredBids());
  };

  useEffect(() => {
    refreshBids();
    const handler = () => refreshBids();
    window.addEventListener("autohub_dealer_store_change", handler);
    return () => window.removeEventListener("autohub_dealer_store_change", handler);
  }, []);

  const activeBids = bids.filter((b) => b.status === "leading" || b.status === "under_reserve");
  const wonBids = bids.filter((b) => b.status === "won");

  const displayedBids = bids.filter((b) => {
    if (activeFilter === "active") return b.status === "leading" || b.status === "under_reserve";
    if (activeFilter === "won") return b.status === "won";
    return true;
  });

  const handleUpdateBid = () => {
    if (!editingBid) return;
    const landed = calculateLandedCost(newBidAmount).totalLanded;
    const updated = bids.map((b) => {
      if (b.id === editingBid.id) {
        return {
          ...b,
          bidFobJpy: newBidAmount,
          landedCostNzd: landed,
          status: "leading" as const,
        };
      }
      return b;
    });
    saveStoredBids(updated);
    setBids(updated);
    setEditingBid(null);
  };

  const handleCancelBid = (bidId: string) => {
    const updated = bids.filter((b) => b.id !== bidId);
    saveStoredBids(updated);
    setBids(updated);
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-16 font-sans">
        {/* ─── Page Title & Action Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              My Auction Bids
            </h1>
          </div>

          <Link
            href="/browse-vehicles"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Browse More Vehicles</span>
          </Link>
        </div>

        {/* ─── Filter Tabs ─── */}
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200/90 rounded-xl w-fit shadow-soft">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === "all"
              ? "bg-[#0F1B2E] text-white shadow-2xs"
              : "text-[#64748B] hover:text-[#111827]"
              }`}
          >
            All Bids ({bids.length})
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === "active"
              ? "bg-[#0F1B2E] text-white shadow-2xs"
              : "text-[#64748B] hover:text-[#111827]"
              }`}
          >
            Active Bids ({activeBids.length})
          </button>
          <button
            onClick={() => setActiveFilter("won")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === "won"
              ? "bg-[#0F1B2E] text-white shadow-2xs"
              : "text-[#64748B] hover:text-[#111827]"
              }`}
          >
            Won ({wonBids.length})
          </button>
        </div>

        {/* ─── Bids Grid ─── */}
        {displayedBids.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-soft">
            <Gavel size={44} className="mx-auto text-[#94A3B8] mb-3" />
            <h3 className="text-base font-bold text-[#111827]">No Bids Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-5">
              You haven't placed any proxy bids in this category yet. Explore Japan auction stock to place bids.
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
            {displayedBids.map((bid) => {
              const matchingCar = HEIWA_VEHICLES.find(
                (v) => v.chassis === bid.vehicleChassis || v.stockId === bid.vehicleStockId
              );
              const photoUrl = matchingCar
                ? getVehiclePhoto(matchingCar)
                : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";

              return (
                <div
                  key={bid.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden flex flex-col justify-between hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={`${bid.year} ${bid.make} ${bid.model}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        {bid.status === "leading" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                            <CheckCircle2 size={13} /> Leading Bid
                          </span>
                        )}
                        {bid.status === "under_reserve" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-2xs">
                            <Clock size={13} /> Under Reserve
                          </span>
                        )}
                        {bid.status === "won" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1E3A5F] text-white shadow-2xs">
                            <CheckCircle2 size={13} /> Auction Won
                          </span>
                        )}
                        {bid.status === "outbid" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-2xs">
                            <AlertCircle size={13} /> Outbid
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded">
                        Stockid #{bid.vehicleStockId}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                        {bid.auctionHouse || "USS Tokyo"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-[#111827] truncate">
                        {bid.year} {bid.make} {bid.model}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1 font-mono">
                        Stockid #{bid.vehicleStockId} · Chassis: {bid.vehicleChassis}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#F1F5F9] grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#94A3B8] font-medium block">Proxy Max (JPY)</span>
                          <span className="font-bold text-[#111827] font-mono">
                            ¥{bid.bidFobJpy.toLocaleString("en-US")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A3B8] font-medium block">Est. Landed (NZD)</span>
                          <span className="font-extrabold text-[#111827] font-mono text-sm">
                            NZ${bid.landedCostNzd.toLocaleString("en-US")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="p-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <Link
                      href={`/vehicles/${encodeURIComponent(bid.vehicleChassis)}`}
                      className="text-xs font-semibold text-[#E11D48] hover:underline"
                    >
                      View Stockid Specs
                    </Link>

                    {bid.status !== "won" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingBid(bid);
                            setNewBidAmount(bid.bidFobJpy);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-semibold text-[#111827] hover:bg-slate-50 transition-colors"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleCancelBid(bid.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Modify Bid Modal ─── */}
        {editingBid && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5E7EB]">
              <h3 className="text-base font-bold text-[#111827]">
                Modify Proxy Bid
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                {editingBid.year} {editingBid.make} {editingBid.model} ({editingBid.vehicleChassis})
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">
                    Maximum FOB Bid (JPY)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl text-sm font-mono font-bold text-[#111827] outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Calculated Landed NZD:</span>
                    <span className="font-bold text-[#111827] font-mono">
                      NZ${calculateLandedCost(newBidAmount).totalLanded.toLocaleString("en-US")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setEditingBid(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBid}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-xs"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
