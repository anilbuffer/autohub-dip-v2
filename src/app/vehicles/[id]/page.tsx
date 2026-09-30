"use client";

import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Gavel,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gauge,
  Fuel,
  Car,
  DollarSign,
  Download,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight,
  Share2,
  Calculator,
  BarChart3,
  Layers,
  FileCheck,
} from "lucide-react";
import {
  HeiwaVehicle,
  calculateLandedCost,
  getNZComparables,
  NZComparable,
  LANDED_COST_CONSTANTS,
} from "@/lib/heiwaData";
import {
  findHeiwaVehicle,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
  getStoredWatchlist,
  toggleStoredWatchlist,
  placeDealerBid,
} from "@/lib/dealerStore";
import PriceVsKmChart from "@/components/vehicle/PriceVsKmChart";
import MarginCalculator from "@/components/vehicle/MarginCalculator";

export default function VehicleDetailPage({ params }: { params?: { id?: string } }) {
  const routeParams = useParams();
  const router = useRouter();
  const rawId = params?.id || (Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id as string)) || "";
  const id = rawId;

  const [vehicle, setVehicle] = useState<HeiwaVehicle | null>(() => {
    if (!id) return null;
    return findHeiwaVehicle(id) || null;
  });
  const [comparables, setComparables] = useState<NZComparable[]>(() => {
    if (!id) return [];
    const found = findHeiwaVehicle(id);
    return found ? getNZComparables(found.make, found.model, found.year, found.kms) : [];
  });
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidAmountJpy, setBidAmountJpy] = useState<number>(() => {
    if (!id) return 0;
    const found = findHeiwaVehicle(id);
    return found ? found.priceFob : 0;
  });
  const [bidSuccess, setBidSuccess] = useState(false);

  // Intelligence Layer Active Section / Tab
  const [activeLayer, setActiveLayer] = useState<
    "all" | "landed_cost" | "nz_market" | "comparables" | "price_vs_km" | "margin_calc" | "specs"
  >("all");

  useEffect(() => {
    if (id) {
      const found = findHeiwaVehicle(id);
      if (found) {
        setVehicle(found);
        setBidAmountJpy(found.priceFob);
        const comps = getNZComparables(found.make, found.model, found.year, found.kms);
        setComparables(comps);
        const wl = getStoredWatchlist();
        setIsWatchlisted(wl.includes(found.chassis));
      }
    }
  }, [id]);

  const handleToggleWatchlist = () => {
    if (!vehicle) return;
    const res = toggleStoredWatchlist(vehicle.chassis);
    setIsWatchlisted(res);
  };

  const handlePlaceBid = () => {
    if (!vehicle) return;
    placeDealerBid(vehicle, bidAmountJpy);
    setBidSuccess(true);
    setTimeout(() => {
      setBidSuccess(false);
      setBidModalOpen(false);
    }, 1800);
  };

  if (!vehicle) {
    return (
      <AppLayout>
        <div className="py-16 text-center space-y-4">
          <Car size={48} className="mx-auto text-[#AAB8C2]" />
          <h2 className="text-lg font-bold text-[#111C2D]">Vehicle Not Found</h2>
          <p className="text-xs text-[#536471]">
            The vehicle with ID &quot;{decodeURIComponent(id)}&quot; could not be found in active Heiwa auction stock.
          </p>
          <Link
            href="/browse-vehicles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-xl text-xs font-semibold hover:bg-[#BE123C] transition-colors shadow-xs"
          >
            <ArrowLeft size={14} /> Return to Browse Vehicles
          </Link>
        </div>
      </AppLayout>
    );
  }

  const photoUrl = getVehiclePhoto(vehicle);
  const landed = calculateLandedCost(vehicle.priceFob);
  const nzRetail = getEstimatedNZRetailPrice(vehicle);

  // Market stats from comparables
  const avgNzPrice =
    comparables.length > 0
      ? Math.round(comparables.reduce((acc, c) => acc + c.price, 0) / comparables.length)
      : nzRetail.retailPrice;

  const lowestNzPrice =
    comparables.length > 0
      ? Math.min(...comparables.map((c) => c.price))
      : Math.round(avgNzPrice * 0.92);

  const highestNzPrice =
    comparables.length > 0
      ? Math.max(...comparables.map((c) => c.price))
      : Math.round(avgNzPrice * 1.1);

  const grossMargin = avgNzPrice - landed.totalLanded;
  const marginPercent = Math.round((grossMargin / avgNzPrice) * 100);
  const avgDaysListed =
    comparables.length > 0
      ? Math.round(comparables.reduce((acc, c) => acc + c.daysListed, 0) / comparables.length)
      : 16;

  // Real-time recalculation for bidding
  const customLanded = calculateLandedCost(bidAmountJpy);
  const customMargin = avgNzPrice - customLanded.totalLanded;
  const customMarginPercent = Math.round((customMargin / avgNzPrice) * 100);

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 font-sans">
        {/* ─── 0. Core Product Loop Breadcrumb ─── */}
        <div className="bg-white border border-[#E8ECF0] rounded-2xl px-4 py-3 flex items-center justify-between text-xs shadow-2xs overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[11px] font-medium shrink-0">
            <Link
              href="/browse-vehicles?filter=wishlist"
              className="text-slate-500 hover:text-[#111C2D] flex items-center gap-1 transition-colors"
            >
              <span>1. Wishlist</span>
            </Link>
            <ChevronRight size={12} className="text-slate-300" />
            <Link
              href="/browse-vehicles?filter=wishlist"
              className="text-slate-500 hover:text-[#111C2D] transition-colors"
            >
              <span>2. Match Heiwa Stock</span>
            </Link>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
              3. View Vehicle
            </span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="font-bold text-[#0F1B2E] bg-slate-100 px-2 py-0.5 rounded-md">
              4. Compare NZ Market
            </span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-400">5. Investigate</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Heiwa Direct Live Auction Feed</span>
          </div>
        </div>

        {/* ─── Action & Navigation Bar ─── */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/browse-vehicles"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#536471] hover:text-[#111C2D] bg-white border border-[#E8ECF0] px-3.5 py-2 rounded-xl transition-colors shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft size={14} /> Back to Browse Vehicles
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isWatchlisted
                  ? "bg-rose-50 text-rose-700 border-rose-200 shadow-2xs"
                  : "bg-white text-[#536471] border-[#E8ECF0] hover:bg-[#F0F2F5] hover:text-[#111C2D]"
              }`}
            >
              <Heart
                size={14}
                className={isWatchlisted ? "fill-[#E11D48] text-[#E11D48]" : ""}
              />
              <span>{isWatchlisted ? "Watchlisted" : "Add to Watchlist"}</span>
            </button>

            <button
              onClick={() => setBidModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm shadow-rose-950/20 transition-all hover:shadow-md"
            >
              <Gavel size={14} />
              <span>Place Auction Bid</span>
            </button>
          </div>
        </div>

        {/* ─── INTELLIGENCE LAYER 1: HEIWA VEHICLE HERO ─── */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle p-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Vehicle Image & Verified Badges */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-[16/10] sm:h-72 rounded-xl bg-gray-100 overflow-hidden border border-[#E8ECF0]">
                <img
                  src={photoUrl}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-[#0F1B2E]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-bold font-mono">
                    LOT #{vehicle.stockId}
                  </span>
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md text-xs font-bold">
                    Grade {vehicle.grade || "4.0"}
                  </span>
                </div>
                {vehicle.ac && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[#111C2D] px-2 py-0.5 rounded text-[11px] font-bold shadow-xs">
                    {vehicle.ac}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 bg-[#0F1B2E]/85 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono">
                  <span>Chassis: {vehicle.chassis}</span>
                  <span className="capitalize">{vehicle.colorDesc || vehicle.color}</span>
                </div>
              </div>

              {/* Japanese Inspection Note */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E8ECF0] flex items-center justify-between text-xs text-[#536471]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  JEVIC Odometer Certified
                </span>
                <span className="font-semibold text-[#111C2D]">Heiwa Japan Direct</span>
              </div>
            </div>

            {/* Vehicle Overview & Pricing Hero */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8899A6] mb-1">
                  <span>HEIWA AUTO JAPAN AUCTION</span>
                  <span>·</span>
                  <span className="text-[#E11D48] font-bold">AUCTION LOT ACTIVE</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111C2D] tracking-tight">
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.grade}
                </h1>

                {/* Key Spec Badges */}
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <div className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D] flex items-center gap-1.5">
                    <Gauge size={13} className="text-[#8899A6]" />
                    <span className="font-mono">{vehicle.kms.toLocaleString("en-US")} km</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D] flex items-center gap-1.5">
                    <Fuel size={13} className="text-emerald-600" />
                    <span>
                      {vehicle.fuelType === "H"
                        ? "Hybrid"
                        : vehicle.fuelType === "D"
                        ? "Diesel"
                        : vehicle.fuelType === "E"
                        ? "EV"
                        : "Petrol"}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D]">
                    {vehicle.cc > 0 ? `${vehicle.cc}cc Engine` : "Electric Motor"}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D]">
                    {vehicle.trans === "FAT"
                      ? "Floor Automatic"
                      : vehicle.trans === "DAT"
                      ? "Direct AT"
                      : vehicle.trans}
                  </div>
                </div>
              </div>

              {/* ─── Landed Cost vs NZ Market Spread Grid ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E8ECF0]">
                {/* AutoHub Landed Cost */}
                <div className="p-3 bg-white rounded-lg border border-[#E8ECF0] shadow-2xs">
                  <div className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                    AutoHub Landed Cost
                  </div>
                  <div className="text-xl font-extrabold text-[#E11D48] font-mono mt-0.5">
                    NZ${landed.totalLanded.toLocaleString("en-US")}
                  </div>
                  <div className="text-[11px] text-[#536471] mt-0.5 font-mono">
                    FOB ¥{vehicle.priceFob.toLocaleString("en-US")}
                  </div>
                </div>

                {/* Avg NZ Market Retail */}
                <div className="p-3 bg-white rounded-lg border border-[#E8ECF0] shadow-2xs">
                  <div className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                    NZ Market Indicator
                  </div>
                  <div className="text-xl font-extrabold text-[#111C2D] font-mono mt-0.5">
                    NZ${avgNzPrice.toLocaleString("en-US")}
                  </div>
                  <div className="text-[11px] text-[#536471] mt-0.5">
                    Based on {comparables.length} NZ listings
                  </div>
                </div>

                {/* Estimated Dealer Margin */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Gross Margin Potential
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">
                    +NZ${grossMargin.toLocaleString("en-US")}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                    {marginPercent}% Market Spread
                  </div>
                </div>
              </div>

              {/* Fast Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setBidModalOpen(true)}
                  className="flex-1 py-3 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Gavel size={16} />
                  <span>
                    Place Bid for Auction (JPY ¥{vehicle.priceFob.toLocaleString("en-US")})
                  </span>
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className="p-3 bg-white border border-[#E8ECF0] hover:bg-[#F0F2F5] text-[#111C2D] rounded-xl transition-colors shadow-2xs"
                  title="Toggle Watchlist"
                >
                  <Heart
                    size={18}
                    className={
                      isWatchlisted ? "fill-[#E11D48] text-[#E11D48]" : "text-[#536471]"
                    }
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── INTELLIGENCE LAYER SUB-NAVIGATION TABS ─── */}
        <div className="border-b border-[#E8ECF0] flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveLayer("all")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 ${
              activeLayer === "all"
                ? "bg-[#0F1B2E] text-white shadow-xs"
                : "text-[#536471] hover:text-[#111C2D] hover:bg-slate-100"
            }`}
          >
            <Layers size={14} />
            <span>Full Intelligence Flow (All)</span>
          </button>

          <button
            onClick={() => setActiveLayer("landed_cost")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeLayer === "landed_cost"
                ? "bg-[#E11D48] text-white shadow-xs"
                : "text-[#536471] hover:text-[#111C2D] hover:bg-slate-100"
            }`}
          >
            <DollarSign size={14} />
            <span>1. Estimated Landed Cost</span>
          </button>

          <button
            onClick={() => setActiveLayer("nz_market")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeLayer === "nz_market"
                ? "bg-[#E11D48] text-white shadow-xs"
                : "text-[#536471] hover:text-[#111C2D] hover:bg-slate-100"
            }`}
          >
            <TrendingUp size={14} />
            <span>2. NZ Market Comparison</span>
          </button>

          <button
            onClick={() => setActiveLayer("comparables")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeLayer === "comparables"
                ? "bg-[#E11D48] text-white shadow-xs"
                : "text-[#536471] hover:text-[#111C2D] hover:bg-slate-100"
            }`}
          >
            <Car size={14} />
            <span>3. Comparable Listings</span>
          </button>

          <button
            onClick={() => setActiveLayer("price_vs_km")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeLayer === "price_vs_km"
                ? "bg-[#E11D48] text-white shadow-xs"
                : "text-[#536471] hover:text-[#111C2D] hover:bg-slate-100"
            }`}
          >
            <BarChart3 size={14} />
            <span>4. Price vs KM</span>
          </button>

          <button
            onClick={() => setActiveLayer("margin_calc")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeLayer === "margin_calc"
                ? "bg-[#E11D48] text-white shadow-xs"
                : "text-[#536471] hover:text-[#111C2D] hover:bg-slate-100"
            }`}
          >
            <Calculator size={14} />
            <span>5. Margin Calculator</span>
          </button>

          <button
            onClick={() => setActiveLayer("specs")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeLayer === "specs"
                ? "bg-[#E11D48] text-white shadow-xs"
                : "text-[#536471] hover:text-[#111C2D] hover:bg-slate-100"
            }`}
          >
            <FileCheck size={14} />
            <span>Inspection & Specs</span>
          </button>
        </div>

        {/* ─── INTELLIGENCE LAYER 2: ESTIMATED LANDED COST ─── */}
        {(activeLayer === "all" || activeLayer === "landed_cost") && (
          <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
                  <DollarSign size={16} className="text-[#E11D48]" />
                  <span>Estimated Landed Cost (Japan Auction ➔ NZ Dealership Door)</span>
                </h3>
                <p className="text-xs text-[#536471] mt-0.5">
                  Calculated using AutoHub guaranteed commercial shipping, biosecurity compliance, and customs rates.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#8899A6] font-bold uppercase block">
                  Benchmark FX Rate
                </span>
                <span className="font-mono text-xs font-bold text-[#111C2D]">
                  1 NZD = {LANDED_COST_CONSTANTS.fxRate} JPY
                </span>
              </div>
            </div>

            <div className="border border-[#E8ECF0] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E8ECF0] text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Fee Component</th>
                    <th className="py-3 px-4">Basis / Commercial Terms</th>
                    <th className="py-3 px-4 text-right">JPY Amount</th>
                    <th className="py-3 px-4 text-right">NZD Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#111C2D]">
                      Japan FOB Auction Purchase Price
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Converted at commercial benchmark rate ¥91.24
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#536471]">
                      ¥{vehicle.priceFob.toLocaleString("en-US")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111C2D]">
                      NZ${landed.fobNzd.toLocaleString("en-US")}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#111C2D]">
                      Ocean RoRo Freight & Transit Marine Insurance
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Yokohama / Nagoya to Ports of Auckland / Tauranga
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono text-[#111C2D]">
                      NZ${landed.freight.toLocaleString("en-US")}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#111C2D]">
                      NZ MAF Bio-Security & Entry Compliance
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      JEVIC inspection, heat treatment & NZTA entry compliance
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono text-[#111C2D]">
                      NZ${landed.compliance.toLocaleString("en-US")}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#111C2D]">
                      Port Logistics & Document Clearing
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Wharfage, customs EDI dispatch & documentation
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono text-[#111C2D]">
                      NZ${landed.portFees.toLocaleString("en-US")}
                    </td>
                  </tr>

                  <tr className="bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-bold text-[#111C2D]">
                      GST (15% on CIF + Compliance)
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Inland Revenue GST payable at border (Claimable on GST return)
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#111C2D]">
                      NZ${landed.gst.toLocaleString("en-US")}
                    </td>
                  </tr>

                  <tr className="bg-rose-50/70 border-t-2 border-[#E11D48]">
                    <td className="py-3.5 px-4 font-extrabold text-[#E11D48] text-sm">
                      Total Estimated Landed Cost (Yard Ready)
                    </td>
                    <td className="py-3.5 px-4 font-medium text-rose-900 text-xs">
                      All-inclusive guaranteed landed benchmark
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#536471]">
                      ¥{vehicle.priceFob.toLocaleString("en-US")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#E11D48] text-base">
                      NZ${landed.totalLanded.toLocaleString("en-US")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── INTELLIGENCE LAYER 3: NZ MARKET COMPARISON ─── */}
        {(activeLayer === "all" || activeLayer === "nz_market") && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E8ECF0] shadow-subtle">
                <div className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                  NZ Market Range
                </div>
                <div className="text-lg font-extrabold text-[#111C2D] font-mono mt-1">
                  NZ${lowestNzPrice.toLocaleString("en-US")} - ${highestNzPrice.toLocaleString("en-US")}
                </div>
                <div className="text-xs text-[#536471] mt-1">
                  Lowest to highest asking price in NZ
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8ECF0] shadow-subtle">
                <div className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                  Gross Profit Margin
                </div>
                <div className="text-lg font-extrabold text-emerald-600 font-mono mt-1">
                  +NZ${grossMargin.toLocaleString("en-US")} ({marginPercent}%)
                </div>
                <div className="text-xs text-[#536471] mt-1">
                  Vs average NZ dealer retail asking
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8ECF0] shadow-subtle">
                <div className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                  Market Liquidity
                </div>
                <div className="text-lg font-extrabold text-[#111C2D] font-mono mt-1">
                  {avgDaysListed} Days
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  Fast Selling Model in NZ
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8ECF0] shadow-subtle">
                <div className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                  Margin Health Rating
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 mt-1">
                  <CheckCircle2 size={13} /> High Demand Sourcing
                </div>
                <div className="text-xs text-[#536471] mt-1.5">
                  Competitive vs Trade Me listings
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── INTELLIGENCE LAYER 4: COMPARABLE LISTINGS ─── */}
        {(activeLayer === "all" || activeLayer === "comparables") && (
          <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-[#E8ECF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
              <div>
                <h3 className="text-sm font-bold text-[#111C2D]">
                  Similar NZ Market Listings (Trade Me Motors, Turners, AutoTrader)
                </h3>
                <p className="text-xs text-[#536471] mt-0.5">
                  Direct comparison against similar {vehicle.make} {vehicle.model} listings currently advertised in New Zealand
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-[#E8ECF0]">
                {comparables.length} live market comparables
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBFC] border-b border-[#E8ECF0] text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Source</th>
                    <th className="py-3 px-4">Vehicle Listing</th>
                    <th className="py-3 px-4">Mileage</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Days on Market</th>
                    <th className="py-3 px-5 text-right">Advertised Price</th>
                    <th className="py-3 px-5 text-right">Margin vs Landed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  {comparables.map((comp, idx) => {
                    const compMargin = comp.price - landed.totalLanded;
                    const isPositive = compMargin > 0;

                    return (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-[#111C2D] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {comp.source}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#111C2D]">
                          {comp.title}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#536471]">
                          {comp.kms.toLocaleString("en-US")} km
                        </td>
                        <td className="py-3.5 px-4 text-[#536471]">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#8899A6]" />
                            {comp.location}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#536471]">
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-[#8899A6]" />
                            {comp.daysListed} days
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-[#111C2D]">
                          NZ${comp.price.toLocaleString("en-US")}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span
                            className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isPositive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isPositive
                              ? `+NZ$${compMargin.toLocaleString("en-US")}`
                              : `-NZ$${Math.abs(compMargin).toLocaleString("en-US")}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── INTELLIGENCE LAYER 5: PRICE VS KM SCATTER ANALYSIS ─── */}
        {(activeLayer === "all" || activeLayer === "price_vs_km") && (
          <PriceVsKmChart
            heiwaVehicle={{
              year: vehicle.year,
              make: vehicle.make,
              model: vehicle.model,
              kms: vehicle.kms,
              landedCost: landed.totalLanded,
            }}
            comparables={comparables}
          />
        )}

        {/* ─── INTELLIGENCE LAYER 6: OPTIONAL MARGIN CALCULATION ─── */}
        {(activeLayer === "all" || activeLayer === "margin_calc") && (
          <MarginCalculator
            landedCost={landed.totalLanded}
            nzMarketAverage={avgNzPrice}
            vehicleTitle={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          />
        )}

        {/* ─── INTELLIGENCE LAYER 7: JAPANESE INSPECTION & SPECS (INVESTIGATE) ─── */}
        {(activeLayer === "all" || activeLayer === "specs") && (
          <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-base font-bold text-[#111C2D]">
                Heiwa Japan Vehicle Inspection Data
              </h3>
              <span className="text-xs font-mono text-[#8899A6]">
                Chassis: {vehicle.chassis}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E8ECF0] space-y-2.5">
                <span className="text-xs font-bold text-[#8899A6] uppercase tracking-wider block">
                  Mechanical & Chassis
                </span>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Chassis ID:</span>
                  <span className="font-mono font-bold text-[#111C2D]">{vehicle.chassis}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Engine Displacement:</span>
                  <span className="font-bold text-[#111C2D]">
                    {vehicle.cc > 0 ? `${vehicle.cc} cc` : "Electric"}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Transmission:</span>
                  <span className="font-bold text-[#111C2D]">{vehicle.trans}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Fuel Type:</span>
                  <span className="font-bold text-[#111C2D]">
                    {vehicle.fuelType === "H"
                      ? "Hybrid"
                      : vehicle.fuelType === "D"
                      ? "Diesel"
                      : vehicle.fuelType === "E"
                      ? "Electric"
                      : "Petrol"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E8ECF0] space-y-2.5">
                <span className="text-xs font-bold text-[#8899A6] uppercase tracking-wider block">
                  Auction Grading & Interior
                </span>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Overall Auction Grade:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Grade {vehicle.grade || "4.0"}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">A/C & Interior Condition:</span>
                  <span className="font-bold text-[#111C2D]">{vehicle.ac || "Clean Grade B"}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Equipment & Features:</span>
                  <span className="font-mono text-[#111C2D] uppercase">
                    {vehicle.equip || "PS, PW, ABS, Airbags"}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Verified Odometer:</span>
                  <span className="font-bold font-mono text-[#111C2D]">
                    {vehicle.kms.toLocaleString("en-US")} km
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── AUCTION BIDDING MODAL ─── */}
        {bidModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8ECF0] p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8899A6]">
                    Direct Japan Auction Bidding
                  </span>
                  <h3 className="text-lg font-bold text-[#111C2D]">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-xs text-[#536471] font-mono mt-0.5">
                    Lot #{vehicle.stockId} · Chassis: {vehicle.chassis}
                  </p>
                </div>
                <button
                  onClick={() => setBidModalOpen(false)}
                  className="text-[#8899A6] hover:text-[#111C2D] p-1 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {bidSuccess ? (
                <div className="p-6 text-center space-y-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Auction Bid Dispatched!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-xs mx-auto">
                    Your bid of ¥{bidAmountJpy.toLocaleString("en-US")} has been queued with Heiwa
                    Japan. You can monitor its status under &quot;My Bids&quot;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Real-time Bid Impact */}
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E8ECF0] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#536471]">Auction Guide FOB:</span>
                      <span className="font-bold font-mono">
                        ¥{vehicle.priceFob.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#536471]">Calculated Landed Cost (at this bid):</span>
                      <span className="font-bold text-[#E11D48] font-mono">
                        NZ${customLanded.totalLanded.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E8ECF0]">
                      <span className="text-[#536471]">Projected Margin vs NZ Market:</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        +NZ${customMargin.toLocaleString("en-US")} ({customMarginPercent}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#536471] mb-1.5">
                      Your Maximum FOB Bid (JPY)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#8899A6]">
                        ¥
                      </span>
                      <input
                        type="number"
                        step={10000}
                        value={bidAmountJpy}
                        onChange={(e) => setBidAmountJpy(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-[#CCD6DD] rounded-xl font-mono font-bold text-base text-[#111C2D] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/10"
                      />
                    </div>
                  </div>

                  {/* Quick Bid Increment Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBidAmountJpy((prev) => Math.max(100000, prev - 20000))}
                      className="flex-1 py-1.5 bg-[#F8FAFC] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
                    >
                      -¥20,000
                    </button>
                    <button
                      onClick={() => setBidAmountJpy(vehicle.priceFob)}
                      className="flex-1 py-1.5 bg-[#F8FAFC] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setBidAmountJpy((prev) => prev + 20000)}
                      className="flex-1 py-1.5 bg-[#F8FAFC] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
                    >
                      +¥20,000
                    </button>
                    <button
                      onClick={() => setBidAmountJpy((prev) => prev + 50000)}
                      className="flex-1 py-1.5 bg-[#F8FAFC] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
                    >
                      +¥50,000
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      onClick={() => setBidModalOpen(false)}
                      className="flex-1 py-2.5 border border-[#E8ECF0] rounded-xl text-xs font-semibold text-[#536471] hover:bg-[#F0F2F5]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePlaceBid}
                      className="flex-1 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/20 transition-all"
                    >
                      Submit Official Bid
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
