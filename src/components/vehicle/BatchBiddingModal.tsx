"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gavel,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { HeiwaVehicle, calculateLandedCost, LANDED_COST_CONSTANTS } from "@/lib/heiwaData";
import { batchPlaceDealerBids, getVehiclePhoto } from "@/lib/dealerStore";

interface BatchBiddingModalProps {
  isOpen: boolean;
  vehicles: HeiwaVehicle[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchBiddingModal({
  isOpen,
  vehicles,
  onClose,
  onSuccess,
}: BatchBiddingModalProps) {
  // Store individual bid inputs per vehicle chassis
  const [bidsMap, setBidsMap] = useState<Record<string, { bidJpy: number; house: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Initialize bids with starting FOB price + standard increment
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const initial: Record<string, { bidJpy: number; house: string }> = {};
      vehicles.forEach((v) => {
        initial[v.chassis] = {
          bidJpy: v.priceFob + 30000,
          house: "USS Tokyo / Yokohama",
        };
      });
      setBidsMap(initial);
      setSubmittedSuccess(false);
    }
  }, [vehicles]);

  if (!isOpen || vehicles.length === 0) return null;

  const handleBidChange = (chassis: string, newJpy: number) => {
    setBidsMap((prev) => ({
      ...prev,
      [chassis]: {
        ...prev[chassis],
        bidJpy: Math.max(0, newJpy),
      },
    }));
  };

  const handleHouseChange = (chassis: string, house: string) => {
    setBidsMap((prev) => ({
      ...prev,
      [chassis]: {
        ...prev[chassis],
        house,
      },
    }));
  };

  const incrementBid = (chassis: string, delta: number) => {
    const current = bidsMap[chassis]?.bidJpy || 0;
    handleBidChange(chassis, current + delta);
  };

  // Calculate total landed commitments across all selected vehicles
  const totalLandedCommitmentNzd = vehicles.reduce((sum, v) => {
    const jpy = bidsMap[v.chassis]?.bidJpy || v.priceFob;
    return sum + calculateLandedCost(jpy).totalLanded;
  }, 0);

  const handleSubmitAllBids = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bidsToSubmit = vehicles.map((v) => ({
      vehicle: v,
      bidFobJpy: bidsMap[v.chassis]?.bidJpy || v.priceFob,
      auctionHouse: bidsMap[v.chassis]?.house || "USS Tokyo / Yokohama",
    }));

    setTimeout(() => {
      batchPlaceDealerBids(bidsToSubmit);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      onSuccess();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header ─── */}
        <div className="px-6 py-5 bg-[#0A1322] border-b border-[#1B2A42] flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] p-0.5 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <Gavel size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-extrabold tracking-tight text-white leading-none">
                  Submit Batch Auction Bids
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wide">
                  {vehicles.length} of 4 Cars
                </span>
              </div>
              <p className="text-[11.5px] text-[#94A3B8] font-medium mt-1 leading-none">
                Direct proxy bidding to USS / Heiwa Japan live auction network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* ─── Modal Content ─── */}
        {!submittedSuccess ? (
          <form onSubmit={handleSubmitAllBids} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Vehicle Bidding Rows */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-[12px] text-blue-900">
                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Multi-Vehicle Proxy Bidding:</span> You can place bids for up to 4 vehicles together. Each vehicle will be registered independently in the Japan auction system with your specified max FOB price and landed cost limit.
                </div>
              </div>

              {vehicles.filter(Boolean).map((v, index) => {
                const photoUrl = getVehiclePhoto(v);
                const currentBidJpy = bidsMap[v.chassis]?.bidJpy || v.priceFob;
                const landed = calculateLandedCost(currentBidJpy);

                return (
                  <div
                    key={v.chassis}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC]/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Top Row: Vehicle Info & Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-[#0A1322] font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={photoUrl}
                            alt={`${v.make} ${v.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-[#0A1322] truncate">
                              {v.year} {v.make} {v.model}
                            </h3>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                              Grade {v.grade || "4.0"}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                            <span>Chassis: <strong className="font-semibold text-slate-700">{v.chassis}</strong></span>
                            <span>·</span>
                            <span>{v.kms.toLocaleString()} km</span>
                            <span>·</span>
                            <span>{v.colorDesc || v.color}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reserve price indicator */}
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10.5px] uppercase font-bold text-[#94A3B8] tracking-wider block">
                          Reserve / Starting FOB
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          ¥{v.priceFob.toLocaleString()} JPY
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Bid Input & Quick Increments & Live Landed Cost */}
                    <div className="pt-3 border-t border-slate-200/70 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Auction House Selector */}
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-[#475569] mb-1">
                          Auction House
                        </label>
                        <select
                          value={bidsMap[v.chassis]?.house || "USS Tokyo / Yokohama"}
                          onChange={(e) => handleHouseChange(v.chassis, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#E11D48]"
                        >
                          <option value="USS Tokyo / Yokohama">USS Tokyo / Yokohama</option>
                          <option value="CAA Chubu (Nagoya)">CAA Chubu (Nagoya)</option>
                          <option value="HAA Kobe / Osaka">HAA Kobe / Osaka</option>
                          <option value="TAA Yokohama">TAA Yokohama</option>
                        </select>
                      </div>

                      {/* Max FOB Bid Input */}
                      <div className="md:col-span-4">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-[#475569]">
                            Your Max Bid (JPY)
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => incrementBid(v.chassis, 20000)}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 hover:bg-slate-300 transition-colors"
                            >
                              +20k
                            </button>
                            <button
                              type="button"
                              onClick={() => incrementBid(v.chassis, 50000)}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 hover:bg-slate-300 transition-colors"
                            >
                              +50k
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            ¥
                          </span>
                          <input
                            type="number"
                            min={v.priceFob}
                            step={10000}
                            value={currentBidJpy}
                            onChange={(e) => handleBidChange(v.chassis, parseInt(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-[#0A1322] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                          />
                        </div>
                      </div>

                      {/* Live Landed Cost NZD Calculation */}
                      <div className="md:col-span-4 p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider block">
                            Est. Landed (NZD)
                          </span>
                          <span className="text-[13px] font-black text-[#E11D48]">
                            NZ${landed.totalLanded.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-right text-slate-500 font-medium">
                          <span>Incl. Freight,</span><br />
                          <span>Compliance & GST</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Modal Footer with Total Commitment & Submit ─── */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                  Total Landed Commitment ({vehicles.length} Vehicles)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#0A1322]">
                    NZ${totalLandedCommitmentNzd.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Dealer Facility Approved</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-950/20 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting {vehicles.length} Bids to Japan…</span>
                    </>
                  ) : (
                    <>
                      <Gavel size={15} />
                      <span>Submit {vehicles.length} Bids to Auction</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ─── Success Confirmation View ─── */
          <div className="p-8 sm:p-12 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
              <CheckCircle2 size={32} />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-extrabold text-[#0A1322] tracking-tight">
                {vehicles.length} Auction Bids Submitted!
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Your proxy bids have been registered with the Heiwa Auto Japan procurement network. You are currently the leading bidder on these lots.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto text-left space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Vehicles Bid:</span>
                <strong className="text-slate-900">{vehicles.length} lots</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Landed Exposure:</span>
                <strong className="text-[#E11D48] font-bold">NZ${totalLandedCommitmentNzd.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Dispatch Status:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active in Auction Queue
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/my-bids"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0A1322] hover:bg-[#1E3A5F] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>View in My Bids</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Continue Browsing Stock
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
