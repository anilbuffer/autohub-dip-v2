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

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "";

  const [vehicle, setVehicle] = useState<HeiwaVehicle | null>(null);
  const [comparables, setComparables] = useState<NZComparable[]>([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidAmountJpy, setBidAmountJpy] = useState<number>(0);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"nz_market" | "landed_cost" | "specs">("nz_market");

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
          <h2 className="text-lg font-bold text-[#0F1419]">Vehicle Not Found</h2>
          <p className="text-xs text-[#536471]">
            The vehicle with ID &quot;{decodeURIComponent(id)}&quot; could not be found in active Heiwa auction stock.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-xl text-xs font-semibold hover:bg-[#A80D26] transition-colors"
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
  const avgNzPrice = comparables.length > 0
    ? Math.round(comparables.reduce((acc, c) => acc + c.price, 0) / comparables.length)
    : nzRetail.retailPrice;

  const lowestNzPrice = comparables.length > 0
    ? Math.min(...comparables.map((c) => c.price))
    : Math.round(avgNzPrice * 0.92);

  const highestNzPrice = comparables.length > 0
    ? Math.max(...comparables.map((c) => c.price))
    : Math.round(avgNzPrice * 1.1);

  const grossMargin = avgNzPrice - landed.totalLanded;
  const marginPercent = Math.round((grossMargin / avgNzPrice) * 100);
  const avgDaysListed = comparables.length > 0
    ? Math.round(comparables.reduce((acc, c) => acc + c.daysListed, 0) / comparables.length)
    : 16;

  // Real-time recalculation for bidding
  const customLanded = calculateLandedCost(bidAmountJpy);
  const customMargin = avgNzPrice - customLanded.totalLanded;
  const customMarginPercent = Math.round((customMargin / avgNzPrice) * 100);

  return (
    <AppLayout>
      <div className="space-y-6 pb-16">
        {/* ─── Breadcrumb & Navigation Bar ─── */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#536471] hover:text-[#0F1419] bg-white border border-[#E8ECF0] px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft size={14} /> Back to Browse Vehicles
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isWatchlisted
                  ? "bg-rose-50 text-rose-700 border-rose-200 shadow-xs"
                  : "bg-white text-[#536471] border-[#E8ECF0] hover:bg-[#F0F2F5] hover:text-[#0F1419]"
              }`}
            >
              <Heart size={14} className={isWatchlisted ? "fill-rose-600 text-rose-600" : ""} />
              <span>{isWatchlisted ? "Watchlisted" : "Add to Watchlist"}</span>
            </button>

            <button
              onClick={() => setBidModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#C8102E] hover:bg-[#A80D26] text-white shadow-md shadow-red-900/25 transition-all"
            >
              <Gavel size={14} />
              <span>Place Auction Bid</span>
            </button>
          </div>
        </div>

        {/* ─── Vehicle Hero Card ─── */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle p-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Vehicle Image & Badges */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative h-64 sm:h-72 rounded-xl bg-gray-100 overflow-hidden border border-[#E8ECF0]">
                <img
                  src={photoUrl}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-bold font-mono">
                    LOT #{vehicle.stockId}
                  </span>
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md text-xs font-bold">
                    Grade {vehicle.grade || "4.0"}
                  </span>
                </div>
                {vehicle.ac && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#0F1419] px-2 py-0.5 rounded text-[11px] font-bold">
                    {vehicle.ac}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono">
                  <span>Chassis: {vehicle.chassis}</span>
                  <span className="capitalize">{vehicle.colorDesc || vehicle.color}</span>
                </div>
              </div>

              {/* Japanese Inspection Note */}
              <div className="p-3 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] flex items-center justify-between text-xs text-[#536471]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  JEVIC Odometer Certified
                </span>
                <span className="font-semibold text-[#0F1419]">Verified Japan Stock</span>
              </div>
            </div>

            {/* Vehicle Overview & Pricing Hero */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8899A6] mb-1">
                  <span>HEIWA AUTO JAPAN AUCTION</span>
                  <span>·</span>
                  <span className="text-[#C8102E]">AUCTION LOT ACTIVE</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1419] tracking-tight">
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.grade}
                </h1>

                {/* Key Spec Badges */}
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  <div className="px-3 py-1.5 rounded-lg bg-[#F7F9FA] border border-[#E8ECF0] text-xs font-semibold text-[#0F1419] flex items-center gap-1.5">
                    <Gauge size={13} className="text-[#8899A6]" />
                    <span className="font-mono">{vehicle.kms.toLocaleString()} km</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#F7F9FA] border border-[#E8ECF0] text-xs font-semibold text-[#0F1419] flex items-center gap-1.5">
                    <Fuel size={13} className="text-emerald-600" />
                    <span>{vehicle.fuelType === "H" ? "Hybrid" : vehicle.fuelType === "D" ? "Diesel" : vehicle.fuelType === "E" ? "EV" : "Petrol"}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#F7F9FA] border border-[#E8ECF0] text-xs font-semibold text-[#0F1419]">
                    {vehicle.cc > 0 ? `${vehicle.cc}cc Engine` : "Electric Motor"}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#F7F9FA] border border-[#E8ECF0] text-xs font-semibold text-[#0F1419]">
                    {vehicle.trans === "FAT" ? "Floor Automatic" : vehicle.trans === "DAT" ? "Direct AT" : vehicle.trans}
                  </div>
                </div>
              </div>

              {/* ─── Landed Cost vs NZ Market Spread Grid ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gradient-to-br from-[#F7F9FA] to-white border border-[#E8ECF0]">
                {/* AutoHub Landed Cost */}
                <div className="p-3 bg-white rounded-lg border border-[#E8ECF0] shadow-xs">
                  <div className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                    AutoHub Landed Cost
                  </div>
                  <div className="text-xl font-extrabold text-[#C8102E] font-mono mt-0.5">
                    ${landed.totalLanded.toLocaleString()} NZD
                  </div>
                  <div className="text-[11px] text-[#536471] mt-0.5 font-mono">
                    FOB ¥{vehicle.priceFob.toLocaleString()}
                  </div>
                </div>

                {/* Avg NZ Market Retail */}
                <div className="p-3 bg-white rounded-lg border border-[#E8ECF0] shadow-xs">
                  <div className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                    Avg NZ Market Retail
                  </div>
                  <div className="text-xl font-extrabold text-[#0F1419] font-mono mt-0.5">
                    ${avgNzPrice.toLocaleString()} NZD
                  </div>
                  <div className="text-[11px] text-[#536471] mt-0.5">
                    Based on {comparables.length} NZ listings
                  </div>
                </div>

                {/* Estimated Dealer Margin */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 shadow-xs">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Gross Margin Spread
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">
                    +${grossMargin.toLocaleString()} NZD
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                    {marginPercent}% Target Return
                  </div>
                </div>
              </div>

              {/* Fast Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setBidModalOpen(true)}
                  className="flex-1 py-3 px-4 bg-[#C8102E] hover:bg-[#A80D26] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Gavel size={16} />
                  <span>Place Bid for Auction (JPY ¥{vehicle.priceFob.toLocaleString()})</span>
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className="p-3 bg-white border border-[#E8ECF0] hover:bg-[#F0F2F5] text-[#0F1419] rounded-xl transition-colors"
                  title="Toggle Watchlist"
                >
                  <Heart size={18} className={isWatchlisted ? "fill-rose-600 text-rose-600" : "text-[#536471]"} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Detail Tabs (NZ Market Comparison vs Landed Cost Breakdown vs Specs) ─── */}
        <div className="border-b border-[#E8ECF0] flex items-center gap-2">
          <button
            onClick={() => setActiveTab("nz_market")}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === "nz_market"
                ? "border-[#C8102E] text-[#C8102E]"
                : "border-transparent text-[#536471] hover:text-[#0F1419]"
            }`}
          >
            <TrendingUp size={16} />
            <span>Step 4: NZ Market Comparison (TradeMe / Comparables)</span>
          </button>

          <button
            onClick={() => setActiveTab("landed_cost")}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === "landed_cost"
                ? "border-[#C8102E] text-[#C8102E]"
                : "border-transparent text-[#536471] hover:text-[#0F1419]"
            }`}
          >
            <DollarSign size={16} />
            <span>AutoHub Landed Cost Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab("specs")}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === "specs"
                ? "border-[#C8102E] text-[#C8102E]"
                : "border-transparent text-[#536471] hover:text-[#0F1419]"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Inspection & Japanese Specs</span>
          </button>
        </div>

        {/* ─── TAB 1: NZ MARKET COMPARISON (STEP 4 OF MVP) ─── */}
        {activeTab === "nz_market" && (
          <div className="space-y-6">
            {/* Market Intelligence Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E8ECF0] shadow-subtle">
                <div className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                  NZ Market Range
                </div>
                <div className="text-lg font-extrabold text-[#0F1419] font-mono mt-1">
                  ${lowestNzPrice.toLocaleString()} - ${highestNzPrice.toLocaleString()}
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
                  +${grossMargin.toLocaleString()} ({marginPercent}%)
                </div>
                <div className="text-xs text-[#536471] mt-1">
                  Vs average NZ dealer retail asking
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8ECF0] shadow-subtle">
                <div className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                  Market Liquidity
                </div>
                <div className="text-lg font-extrabold text-[#0F1419] font-mono mt-1">
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

            {/* NZ Market Comparables Table */}
            <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle overflow-hidden">
              <div className="p-5 border-b border-[#E8ECF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F9FA]">
                <div>
                  <h3 className="text-sm font-bold text-[#0F1419]">
                    Similar NZ Market Listings (Trade Me Motors, Turners, AutoTrader)
                  </h3>
                  <p className="text-xs text-[#536471] mt-0.5">
                    Direct comparison against similar {vehicle.make} {vehicle.model} listings currently advertised in New Zealand
                  </p>
                </div>
                <div className="text-xs text-[#8899A6] font-medium">
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
                      <th className="py-3 px-5 text-right">Profit vs Landed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8ECF0]">
                    {comparables.map((comp, idx) => {
                      const compMargin = comp.price - landed.totalLanded;
                      const isPositive = compMargin > 0;

                      return (
                        <tr key={idx} className="hover:bg-[#F7F9FA] transition-colors">
                          <td className="py-3.5 px-5 font-semibold text-[#0F1419] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            {comp.source}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#0F1419]">
                            {comp.title}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#536471]">
                            {comp.kms.toLocaleString()} km
                          </td>
                          <td className="py-3.5 px-4 text-[#536471] flex items-center gap-1">
                            <MapPin size={11} className="text-[#8899A6]" />
                            {comp.location}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#536471]">
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-[#8899A6]" />
                              {comp.daysListed} days
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono font-bold text-[#0F1419]">
                            ${comp.price.toLocaleString()} NZD
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isPositive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {isPositive ? `+$${compMargin.toLocaleString()}` : `-$${Math.abs(compMargin).toLocaleString()}`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Position Meter */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8ECF0] shadow-subtle space-y-4">
              <h4 className="text-xs font-bold text-[#8899A6] uppercase tracking-wider">
                Price Positioning: AutoHub Landed vs NZ Market Retail
              </h4>

              <div className="relative pt-6 pb-2">
                {/* Track */}
                <div className="h-3 w-full bg-[#E8ECF0] rounded-full relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 w-full" />
                </div>

                {/* Landed Point */}
                <div className="flex items-center justify-between text-xs font-mono pt-3">
                  <div className="text-left">
                    <span className="block text-[10px] text-[#8899A6] font-sans">AutoHub Landed Cost</span>
                    <span className="font-bold text-[#C8102E]">${landed.totalLanded.toLocaleString()} NZD</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] text-[#8899A6] font-sans">Lowest NZ Listing</span>
                    <span className="font-semibold text-[#536471]">${lowestNzPrice.toLocaleString()} NZD</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-[#8899A6] font-sans">Avg NZ Dealer Price</span>
                    <span className="font-bold text-[#0F1419]">${avgNzPrice.toLocaleString()} NZD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: LANDED COST BREAKDOWN ─── */}
        {activeTab === "landed_cost" && (
          <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#0F1419]">
                AutoHub Landed Cost Transparency Formula
              </h3>
              <p className="text-xs text-[#536471] mt-0.5">
                Every fee from Japan auction yard to your Auckland dealership door is calculated using guaranteed commercial rates.
              </p>
            </div>

            <div className="border border-[#E8ECF0] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FA] border-b border-[#E8ECF0] text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Fee Component</th>
                    <th className="py-3 px-4">Basis / Commercial Terms</th>
                    <th className="py-3 px-4 text-right">JPY Amount</th>
                    <th className="py-3 px-4 text-right">NZD Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF0]">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0F1419]">
                      Japan FOB Auction Purchase Price
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Converted at benchmark rate ¥91.24
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#536471]">
                      ¥{vehicle.priceFob.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0F1419]">
                      ${landed.fobNzd.toLocaleString()} NZD
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0F1419]">
                      Ocean RoRo Freight & Transit Insurance
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Yokohama / Nagoya to Ports of Auckland
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono text-[#0F1419]">
                      ${landed.freight.toLocaleString()} NZD
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0F1419]">
                      NZ MAF Bio-Security & Entry Compliance
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      JEVIC inspection, heat treatment & NZTA entry compliance
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono text-[#0F1419]">
                      ${landed.compliance.toLocaleString()} NZD
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0F1419]">
                      Port Logistics & Document Clearing
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Wharfage, customs EDI dispatch & documentation
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono text-[#0F1419]">
                      ${landed.portFees.toLocaleString()} NZD
                    </td>
                  </tr>

                  <tr className="bg-[#F7F9FA]">
                    <td className="py-3 px-4 font-bold text-[#0F1419]">
                      GST (15% on CIF + Compliance)
                    </td>
                    <td className="py-3 px-4 text-[#536471]">
                      Inland Revenue GST payable at border (Claimable on GST return)
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8899A6]">-</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0F1419]">
                      ${landed.gst.toLocaleString()} NZD
                    </td>
                  </tr>

                  <tr className="bg-rose-50/70 border-t-2 border-[#C8102E]">
                    <td className="py-3.5 px-4 font-extrabold text-[#C8102E] text-sm">
                      Total Estimated Landed Cost (Yard Ready)
                    </td>
                    <td className="py-3.5 px-4 font-medium text-rose-900 text-xs">
                      All-inclusive guaranteed landed benchmark
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#536471]">
                      ¥{vehicle.priceFob.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-[#C8102E] text-base">
                      ${landed.totalLanded.toLocaleString()} NZD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 3: INSPECTION & SPECS ─── */}
        {activeTab === "specs" && (
          <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle p-6 space-y-6">
            <h3 className="text-base font-bold text-[#0F1419]">
              Heiwa Japan Vehicle Inspection Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] space-y-2.5">
                <span className="text-xs font-bold text-[#8899A6] uppercase tracking-wider block">
                  Mechanical & Chassis
                </span>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Chassis ID:</span>
                  <span className="font-mono font-bold text-[#0F1419]">{vehicle.chassis}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Engine Displacement:</span>
                  <span className="font-bold text-[#0F1419]">{vehicle.cc > 0 ? `${vehicle.cc} cc` : "Electric"}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Transmission:</span>
                  <span className="font-bold text-[#0F1419]">{vehicle.trans}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Fuel Type:</span>
                  <span className="font-bold text-[#0F1419]">
                    {vehicle.fuelType === "H" ? "Hybrid" : vehicle.fuelType === "D" ? "Diesel" : vehicle.fuelType === "E" ? "Electric" : "Petrol"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] space-y-2.5">
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
                  <span className="font-bold text-[#0F1419]">{vehicle.ac || "Clean Grade B"}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Equipment & Features:</span>
                  <span className="font-mono text-[#0F1419] uppercase">{vehicle.equip || "PS, PW, ABS, Airbags"}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-[#E8ECF0]">
                  <span className="text-[#536471]">Verified Odometer:</span>
                  <span className="font-bold font-mono text-[#0F1419]">{vehicle.kms.toLocaleString()} km</span>
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
                  <h3 className="text-lg font-bold text-[#0F1419]">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-xs text-[#536471] font-mono mt-0.5">
                    Lot #{vehicle.stockId} · Chassis: {vehicle.chassis}
                  </p>
                </div>
                <button
                  onClick={() => setBidModalOpen(false)}
                  className="text-[#8899A6] hover:text-[#0F1419] p-1 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {bidSuccess ? (
                <div className="p-6 text-center space-y-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">Auction Bid Dispatched!</h4>
                  <p className="text-xs text-emerald-700 max-w-xs mx-auto">
                    Your bid of ¥{bidAmountJpy.toLocaleString()} has been queued with Heiwa Japan. You can monitor its status under &quot;My Bids&quot;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Real-time Bid Impact */}
                  <div className="p-4 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#536471]">Recommended FOB:</span>
                      <span className="font-bold font-mono">¥{vehicle.priceFob.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#536471]">Calculated Landed Cost (at this bid):</span>
                      <span className="font-bold text-[#C8102E] font-mono">
                        ${customLanded.totalLanded.toLocaleString()} NZD
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#E8ECF0]">
                      <span className="text-[#536471]">Projected Margin vs NZ Market:</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        +${customMargin.toLocaleString()} NZD ({customMarginPercent}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#536471] mb-1.5">
                      Your Maximum FOB Bid (JPY)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#8899A6]">¥</span>
                      <input
                        type="number"
                        step={10000}
                        value={bidAmountJpy}
                        onChange={(e) => setBidAmountJpy(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-[#CCD6DD] rounded-xl font-mono font-bold text-base text-[#0F1419] focus:outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/10"
                      />
                    </div>
                  </div>

                  {/* Quick Bid Increment Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBidAmountJpy((prev) => Math.max(100000, prev - 20000))}
                      className="flex-1 py-1.5 bg-[#F7F9FA] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
                    >
                      -¥20,000
                    </button>
                    <button
                      onClick={() => setBidAmountJpy(vehicle.priceFob)}
                      className="flex-1 py-1.5 bg-[#F7F9FA] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setBidAmountJpy((prev) => prev + 20000)}
                      className="flex-1 py-1.5 bg-[#F7F9FA] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
                    >
                      +¥20,000
                    </button>
                    <button
                      onClick={() => setBidAmountJpy((prev) => prev + 50000)}
                      className="flex-1 py-1.5 bg-[#F7F9FA] hover:bg-[#F0F2F5] border border-[#E8ECF0] rounded-lg text-xs font-semibold text-[#536471]"
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
                      className="flex-1 py-2.5 bg-[#C8102E] hover:bg-[#A80D26] text-white rounded-xl text-xs font-bold shadow-md shadow-red-900/25 transition-all"
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
