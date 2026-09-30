"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  Gavel,
  Clock,
  Car,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Plus,
  ArrowUpRight,
  RefreshCw,
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
      <div className="space-y-6 pb-16">
        {/* ─── Hero Header ─── */}
        <div className="bg-[#0F1419] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 border border-white/10">
                <Gavel size={13} className="text-amber-400" />
                <span>Heiwa Auto Japan Auction Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                My Auction Bids
              </h1>
              <p className="text-sm text-white/70 max-w-xl mt-1.5 leading-relaxed">
                Track your active bids on Japan auction lots. AutoHub handles bid execution, currency locking, and import entry.
              </p>
            </div>

            {/* Quick Bid Metrics */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white/[0.04] p-3 sm:p-4 rounded-xl border border-white/[0.08]">
              <div className="text-left px-3 border-r border-white/10">
                <div className="text-xs text-white/50">Active Bids</div>
                <div className="text-xl font-bold text-white font-mono">{activeBids.length} Lots</div>
              </div>
              <div className="text-left px-3 border-r border-white/10">
                <div className="text-xs text-emerald-400/80">Won Lots</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">{wonBids.length}</div>
              </div>
              <div className="text-left px-3">
                <div className="text-xs text-amber-300/80">Pending Action</div>
                <div className="text-xl font-bold text-amber-300 font-mono">1 Under Reserve</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Filter Tabs & Actions ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-white border border-[#E8ECF0] rounded-xl shadow-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-[#0F1419] text-white"
                  : "text-[#536471] hover:text-[#0F1419]"
              }`}
            >
              All Bids ({bids.length})
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "active"
                  ? "bg-[#0F1419] text-white"
                  : "text-[#536471] hover:text-[#0F1419]"
              }`}
            >
              Active Bids ({activeBids.length})
            </button>
            <button
              onClick={() => setActiveFilter("won")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "won"
                  ? "bg-[#0F1419] text-white"
                  : "text-[#536471] hover:text-[#0F1419]"
              }`}
            >
              Won at Auction ({wonBids.length})
            </button>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#A80D26] text-white text-xs font-bold shadow-md shadow-red-900/20 transition-all"
          >
            <Plus size={14} /> Browse Stock to Place New Bid
          </Link>
        </div>

        {/* ─── Bids List ─── */}
        {displayedBids.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E8ECF0] shadow-subtle">
            <Gavel size={44} className="mx-auto text-[#AAB8C2] mb-3" />
            <h3 className="text-base font-bold text-[#0F1419]">No Bids In This View</h3>
            <p className="text-xs text-[#536471] max-w-sm mx-auto mt-1 mb-5">
              Explore current Japan auction stock to find matching inventory and submit bids.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1419] text-white text-xs font-bold hover:bg-black transition-colors"
            >
              <Car size={14} /> Browse Heiwa Stock
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="bg-white rounded-2xl border border-[#E8ECF0] hover:border-[#CCD6DD] shadow-subtle overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Header Image with Status */}
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={`${bid.year} ${bid.make} ${bid.model}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {bid.status === "leading" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500 text-white shadow-sm">
                            <CheckCircle2 size={12} /> Leading Bidder
                          </span>
                        )}
                        {bid.status === "under_reserve" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-sm">
                            <AlertCircle size={12} /> Under Reserve
                          </span>
                        )}
                        {bid.status === "won" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm">
                            <CheckCircle2 size={12} /> Won at Auction
                          </span>
                        )}
                      </div>

                      {/* Countdown Timer */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                          LOT #{bid.vehicleStockId}
                        </span>
                        <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm font-semibold">
                          <Clock size={12} className="text-amber-400" />
                          {bid.auctionTimeLeft}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-[#0F1419]">
                          {bid.year} {bid.make} {bid.model}
                        </h3>
                        <div className="text-xs text-[#536471] font-mono mt-0.5">
                          {bid.vehicleChassis} · {bid.kms.toLocaleString()} km
                        </div>
                      </div>

                      {/* Bid Financials */}
                      <div className="p-3.5 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                            Your Max Bid (FOB)
                          </span>
                          <span className="text-sm font-bold font-mono text-[#0F1419]">
                            ¥{bid.bidFobJpy.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1 border-t border-[#E8ECF0]">
                          <span className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                            NZ Landed Total
                          </span>
                          <span className="text-base font-extrabold font-mono text-[#C8102E]">
                            ${bid.landedCostNzd.toLocaleString()} NZD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-[#FAFBFC] border-t border-[#E8ECF0] flex items-center gap-2">
                    {bid.status !== "won" ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingBid(bid);
                            setNewBidAmount(bid.bidFobJpy + 20000);
                          }}
                          className="flex-1 py-2 bg-[#0F1419] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          Modify Bid
                        </button>
                        <button
                          onClick={() => handleCancelBid(bid.id)}
                          className="px-3 py-2 border border-[#E8ECF0] hover:bg-rose-50 hover:text-[#C8102E] text-xs font-medium text-[#536471] rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/purchases"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Track Delivery in Purchases</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Modify Bid Modal ─── */}
        {editingBid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#E8ECF0] shadow-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                    Adjust Max Auction Bid
                  </span>
                  <h3 className="text-base font-bold text-[#0F1419]">
                    {editingBid.year} {editingBid.make} {editingBid.model}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingBid(null)}
                  className="text-[#8899A6] hover:text-[#0F1419]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#536471]">
                  New FOB Bid (JPY)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#8899A6]">¥</span>
                  <input
                    type="number"
                    step={10000}
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#CCD6DD] rounded-xl font-mono font-bold text-sm text-[#0F1419] focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
                <div className="text-xs text-[#536471]">
                  Recalculated Landed Cost:{" "}
                  <span className="font-bold text-[#C8102E] font-mono">
                    ${calculateLandedCost(newBidAmount).totalLanded.toLocaleString()} NZD
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setEditingBid(null)}
                  className="flex-1 py-2.5 border border-[#E8ECF0] rounded-xl text-xs font-semibold text-[#536471]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBid}
                  className="flex-1 py-2.5 bg-[#C8102E] hover:bg-[#A80D26] text-white rounded-xl text-xs font-bold"
                >
                  Update Bid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
