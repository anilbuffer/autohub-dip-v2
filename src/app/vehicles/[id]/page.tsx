"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  ChevronDown,
  Share2,
  Layers,
  FileCheck,
  Wind,
  X,
} from "lucide-react";
import {
  HeiwaVehicle,
  calculateLandedCost,
  getNZComparables,
  NZComparable,
  LANDED_COST_CONSTANTS,
  getVehicleConditionScore,
  ListingType,
  getVehicleListingType,
} from "@/lib/heiwaData";
import {
  findHeiwaVehicle,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
  getStoredWatchlist,
  toggleStoredWatchlist,
  placeDealerBid,
} from "@/lib/dealerStore";

function VehicleDetailContent({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = vehicleId;
  const urlType = searchParams?.get("type") as ListingType | null;

  const [vehicle, setVehicle] = useState<HeiwaVehicle | null>(() => {
    if (!id) return null;
    return findHeiwaVehicle(id) || null;
  });

  const listingType: ListingType = useMemo(() => {
    if (urlType === "reserve" || urlType === "auction") return urlType;
    if (vehicle) return getVehicleListingType(vehicle);
    return "auction";
  }, [urlType, vehicle]);

  const isReserve = listingType === "reserve";

  const [comparables, setComparables] = useState<NZComparable[]>(() => {
    if (!id) return [];
    const found = findHeiwaVehicle(id);
    return found ? getNZComparables(found.make, found.model, found.year, found.kms) : [];
  });
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Auction Bid Modal State
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidAmountJpy, setBidAmountJpy] = useState<number>(() => {
    if (!id) return 0;
    const found = findHeiwaVehicle(id);
    return found ? found.priceFob : 0;
  });
  const [bidSuccess, setBidSuccess] = useState(false);

  // Enquire / Reserve Modal State
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState<"reserve" | "inspection" | "quote">("reserve");
  const [enquiryNotes, setEnquiryNotes] = useState<string>("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Intelligence Layer Accordion State (first open by default, rest closed)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    landed_cost: true,
    nz_market: false,
    comparables: false,
    specs: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allSectionsOpen = useMemo(() => {
    return Object.values(openSections).every(Boolean);
  }, [openSections]);

  const toggleAllSections = () => {
    const nextState = !allSectionsOpen;
    setOpenSections({
      landed_cost: nextState,
      nz_market: nextState,
      comparables: nextState,
      specs: nextState,
    });
  };

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

  // Exact NZ Market Retail Indicator matching the card
  const avgNzPrice = nzRetail.retailPrice;
  const conditionScore = getVehicleConditionScore(vehicle);

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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${isWatchlisted
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

            {isReserve ? (
              <button
                onClick={() => {
                  setEnquiryModalOpen(true);
                  setEnquirySuccess(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm shadow-rose-950/20 transition-all hover:shadow-md cursor-pointer"
              >
                <Clock size={14} />
                <span>Enquire / Reserve</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setBidModalOpen(true);
                  setBidSuccess(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm shadow-rose-950/20 transition-all hover:shadow-md cursor-pointer"
              >
                <Gavel size={14} />
                <span>Place Proxy Bid</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── INTELLIGENCE LAYER 1: HEIWA VEHICLE HERO ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow p-6 overflow-hidden">
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
                    Stockid #{vehicle.stockId}
                  </span>
                  {isReserve ? (
                    <span className="bg-emerald-600/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-xs flex items-center gap-1">
                      <Clock size={12} />
                      Reserve Stock
                    </span>
                  ) : (
                    <span className="bg-blue-600/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-xs flex items-center gap-1">
                      <Gavel size={12} />
                      Auction Lot
                    </span>
                  )}
                  <span className="bg-white/95 backdrop-blur-xs text-[#111C2D] border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold shadow-xs flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    Condition {conditionScore}/10
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
                  Heiwa Japan Direct
                </span>
                <span className="font-mono font-semibold text-[#111C2D]">
                  Odometer: {vehicle.kms.toLocaleString("en-US")} km
                </span>
              </div>
            </div>

            {/* Vehicle Overview & Pricing Hero */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8899A6] mb-1">
                  {isReserve ? (
                    <>
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                        <Clock size={13} className="text-emerald-600" />
                        DIRECT HEIWA JAPAN ALLOCATION
                      </span>
                      <span>·</span>
                      <span className="text-[#E11D48] font-bold">24H FIXED PRICE RESERVATION</span>
                    </>
                  ) : (
                    <>
                      <span className="text-blue-700 font-extrabold flex items-center gap-1.5">
                        <Gavel size={13} className="text-blue-600" />
                        HEIWA AUTO JAPAN AUCTION
                      </span>
                      <span>·</span>
                      <span className="text-[#E11D48] font-bold">USS TOKYO LOT · PROXY BIDDING</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111C2D] tracking-tight">
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.grade}
                  </h1>
                  {isReserve ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <Clock size={12} className="text-emerald-600" />
                      Reserve
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                      <Gavel size={12} className="text-blue-600" />
                      Auction
                    </span>
                  )}
                </div>

                {/* Key Spec Badges: kms, fuel, cc, trans, ac, equip as in CSV file */}
                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                  {/* Kilometres */}
                  <div
                    title="Certified Odometer"
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D] flex items-center gap-1.5"
                  >
                    <Gauge size={13} className="text-[#8899A6]" />
                    <span className="font-mono">{vehicle.kms.toLocaleString("en-US")} km</span>
                  </div>

                  {/* Fuel Type */}
                  <div
                    title="Fuel Type"
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D] flex items-center gap-1.5"
                  >
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

                  {/* Engine CC */}
                  <div
                    title={`Engine Displacement: ${vehicle.cc > 0 ? `${vehicle.cc}cc` : "Electric"}`}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D]"
                  >
                    {vehicle.cc > 0 ? `${vehicle.cc}cc Engine` : "Electric Motor"}
                  </div>

                  {/* Transmission (trans) */}
                  <div
                    title={`Transmission: ${vehicle.trans}`}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D]"
                  >
                    {vehicle.trans === "FAT"
                      ? "Floor Automatic"
                      : vehicle.trans === "DAT"
                        ? "Direct AT"
                        : vehicle.trans === "AT"
                          ? "Automatic"
                          : vehicle.trans === "MT"
                            ? "Manual"
                            : vehicle.trans}
                  </div>

                  {/* Air Conditioning (ac) */}
                  {vehicle.ac && (
                    <div
                      title={`Air Conditioning: ${vehicle.ac}`}
                      className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D] flex items-center gap-1.5"
                    >
                      <Wind size={13} className="text-sky-600" />
                      <span>
                        {vehicle.ac.toUpperCase().includes("AC")
                          ? vehicle.ac
                          : `${vehicle.ac} AC`}
                      </span>
                    </div>
                  )}

                  {/* Equipment (equip) */}
                  {Boolean(vehicle.equip && vehicle.equip.trim() !== "") && (
                    <div
                      title={`Equipment Features: ${vehicle.equip}`}
                      className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF0] text-xs font-semibold text-[#111C2D] flex items-center gap-1.5"
                    >
                      <Sparkles size={13} className="text-amber-600" />
                      <span className="font-mono uppercase">
                        Equip: {vehicle.equip}
                      </span>
                    </div>
                  )}

                  {/* Condition Score (1-10) */}
                  <div
                    title={`Auction Condition Score: ${getVehicleConditionScore(vehicle)}/10`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-2xs"
                  >
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Condition: {getVehicleConditionScore(vehicle)}/10</span>
                  </div>
                </div>
              </div>

              {/* ─── Landed Cost vs NZ Market Spread Grid ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E8ECF0]">
                {/* AutoHub Landed Cost */}
                <div className="p-3 bg-white rounded-lg border border-[#E8ECF0] shadow-2xs">
                  <div className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                    {isReserve ? "Direct Landed Cost (Fixed)" : "AutoHub Landed Cost (Guide)"}
                  </div>
                  <div className="text-xl font-extrabold text-[#E11D48] font-mono mt-0.5">
                    NZ${landed.totalLanded.toLocaleString("en-US")}
                  </div>
                  <div className="text-[11px] text-[#536471] mt-0.5 font-mono">
                    {isReserve ? `Fixed Buy FOB ¥${vehicle.priceFob.toLocaleString("en-US")}` : `Guide FOB ¥${vehicle.priceFob.toLocaleString("en-US")}`}
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
                {isReserve ? (
                  <button
                    onClick={() => {
                      setEnquiryModalOpen(true);
                      setEnquirySuccess(false);
                    }}
                    className="flex-1 py-3 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-rose-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Clock size={16} />
                    <span>
                      Enquire / Reserve (Fixed FOB ¥{vehicle.priceFob.toLocaleString("en-US")})
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setBidModalOpen(true);
                      setBidSuccess(false);
                    }}
                    className="flex-1 py-3 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-rose-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gavel size={16} />
                    <span>
                      Place Proxy Bid (Guide FOB ¥{vehicle.priceFob.toLocaleString("en-US")})
                    </span>
                  </button>
                )}

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

        {/* ─── INTELLIGENCE LAYER ACCORDION SUITE ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-lg font-bold text-[#111C2D] flex items-center gap-2">
                <Layers size={18} className="text-[#E11D48]" />
                <span>Vehicle Intelligence Suite</span>
              </h2>
            </div>

            <button
              type="button"
              onClick={toggleAllSections}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#111C2D] border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs hover:border-slate-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>{allSectionsOpen ? "Collapse All" : "Expand All"}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${allSectionsOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* ─── ACCORDION 1: ESTIMATED LANDED COST ─── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => toggleSection("landed_cost")}
              className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer select-none ${openSections.landed_cost ? "bg-slate-50/60 border-b border-slate-100" : "hover:bg-slate-50/80"
                }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <DollarSign size={20} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-[#111C2D]">
                      Estimated Landed Cost
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs font-bold text-[#E11D48] bg-rose-50 border border-rose-200/80 px-3 py-1 rounded-lg">
                  NZ${landed.totalLanded.toLocaleString("en-US")} Landed
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 bg-slate-100 transition-transform duration-200 ${openSections.landed_cost ? "rotate-180 text-slate-700" : ""}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {openSections.landed_cost && (
              <div className="p-6 space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                  <div>
                    <h3 className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
                      <DollarSign size={16} className="text-[#E11D48]" />
                      <span>Estimated Landed Cost (Japan Auction ➔ NZ Dealership Door)</span>
                    </h3>
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
                          All-inclusive calculated landed benchmark
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
          </div>

          {/* ─── ACCORDION 2: NZ MARKET COMPARISON ─── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => toggleSection("nz_market")}
              className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer select-none ${openSections.nz_market ? "bg-slate-50/60 border-b border-slate-100" : "hover:bg-slate-50/80"
                }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div className="truncate">
                  <span className="text-sm sm:text-base font-bold text-[#111C2D]">
                    NZ Market Comparison
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-lg">
                  +NZ${grossMargin.toLocaleString("en-US")} ({marginPercent}%) Margin
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 bg-slate-100 transition-transform duration-200 ${openSections.nz_market ? "rotate-180 text-slate-700" : ""}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {openSections.nz_market && (
              <div className="p-5 sm:p-6 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
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

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
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

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
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

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
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
          </div>

          {/* ─── ACCORDION 3: COMPARABLE LISTINGS ─── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => toggleSection("comparables")}
              className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer select-none ${openSections.comparables ? "bg-slate-50/60 border-b border-slate-100" : "hover:bg-slate-50/80"
                }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <Car size={20} />
                </div>
                <div className="truncate">
                  <span className="text-sm sm:text-base font-bold text-[#111C2D]">
                    Comparable Listings
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-xs text-slate-700 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-lg">
                  {comparables.length} live comparables
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 bg-slate-100 transition-transform duration-200 ${openSections.comparables ? "rotate-180 text-slate-700" : ""}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {openSections.comparables && (
              <div className="animate-fadeIn">
                <div className="p-5 border-b border-[#E8ECF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
                  <div>
                    <h3 className="text-sm font-bold text-[#111C2D]">
                      Similar NZ Market Listings (Trade Me Motors, Turners, AutoTrader)
                    </h3>
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
                                className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${isPositive
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
          </div>

          {/* ─── ACCORDION 4: INSPECTION & SPECS ─── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => toggleSection("specs")}
              className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer select-none ${openSections.specs ? "bg-slate-50/60 border-b border-slate-100" : "hover:bg-slate-50/80"
                }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <FileCheck size={20} />
                </div>
                <div className="truncate">
                  <span className="text-sm sm:text-base font-bold text-[#111C2D]">
                    Inspection & Specs
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-lg">
                  Grade {vehicle.grade || "4.0"} · {vehicle.kms.toLocaleString("en-US")} km
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 bg-slate-100 transition-transform duration-200 ${openSections.specs ? "rotate-180 text-slate-700" : ""}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {openSections.specs && (
              <div className="p-6 space-y-6 animate-fadeIn">
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
                      <span className="text-[#536471]">Condition Score (1–10):</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {getVehicleConditionScore(vehicle)} / 10
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
                      <span className="text-[#536471]">Odometer:</span>
                      <span className="font-bold font-mono text-[#111C2D]">
                        {vehicle.kms.toLocaleString("en-US")} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── ENQUIRE / RESERVE MODAL ─── */}
        {enquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-emerald-50/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-widest">
                      Direct Heiwa Japan Allocation
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#111827] mt-0.5">
                    Enquire / Reserve Vehicle
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Lock in a 24-hour fixed price reservation or request inspector verification.
                  </p>
                </div>
                <button
                  onClick={() => setEnquiryModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                {enquirySuccess ? (
                  <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 size={26} />
                    </div>
                    <h4 className="text-base font-extrabold text-emerald-900">
                      Reservation & Enquiry Confirmed!
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                      Your request for <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> (Stockid #{vehicle.stockId}) has been logged. An AutoHub Japanese export specialist will contact Auckland Auto Group within 15 minutes.
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEnquiryModalOpen(false);
                          setEnquirySuccess(false);
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Vehicle Mini Card */}
                    <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <img
                        src={photoUrl}
                        alt={vehicle.model}
                        className="w-16 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#111827] truncate">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                            Grade {vehicle.grade || "4.0"}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#64748B] font-mono mt-0.5 flex items-center gap-2">
                          <span>Stockid #{vehicle.stockId}</span>
                          <span>·</span>
                          <span>FOB ¥{vehicle.priceFob.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>


                    {/* Dealership Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Dealership</label>
                        <input
                          type="text"
                          defaultValue="Auckland Auto Group"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:border-[#E11D48]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                        <input
                          type="text"
                          defaultValue="+64 21 582 9104"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:border-[#E11D48]"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Notes / Instructions (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={enquiryNotes}
                        onChange={(e) => setEnquiryNotes(e.target.value)}
                        placeholder="e.g. Please hold lot for Auckland Auto Group inspection confirmation"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#E11D48] resize-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEnquiryModalOpen(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnquirySuccess(true)}
                        className="flex-1 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                      >
                        Confirm Reservation
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── AUCTION PROXY BIDDING MODAL ─── */}
        {bidModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E8ECF0] p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Live Japan Auction Proxy Bidding
                  </span>
                  <h3 className="text-lg font-bold text-[#111C2D]">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-xs text-[#536471] font-mono mt-0.5">
                    Stockid #{vehicle.stockId} · Chassis: {vehicle.chassis}
                  </p>
                </div>
                <button
                  onClick={() => setBidModalOpen(false)}
                  className="text-[#8899A6] hover:text-[#111C2D] p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {bidSuccess ? (
                <div className="p-6 text-center space-y-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Auction Proxy Bid Submitted!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-xs mx-auto">
                    Your proxy bid of ¥{bidAmountJpy.toLocaleString("en-US")} has been queued with USS Tokyo Japan. You can monitor its status under &quot;My Bids&quot;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Real-time Impact */}
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E8ECF0] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#536471]">Auction Guide FOB:</span>
                      <span className="font-bold font-mono">
                        ¥{vehicle.priceFob.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#536471]">Calculated Landed Cost (at this offer):</span>
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
                      Target FOB Price (JPY)
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

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      onClick={() => setBidModalOpen(false)}
                      className="flex-1 py-2.5 border border-[#E8ECF0] rounded-xl text-xs font-semibold text-[#536471] hover:bg-[#F0F2F5] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePlaceBid}
                      className="flex-1 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Gavel size={14} />
                      <span>Submit Proxy Bid</span>
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

export default function VehicleDetailPage({ params }: { params?: { id?: string } }) {
  const routeParams = useParams();
  const rawId = params?.id || (Array.isArray(routeParams?.id) ? routeParams.id[0] : (routeParams?.id as string)) || "";

  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading vehicle details...</div>}>
      <VehicleDetailContent vehicleId={rawId} />
    </Suspense>
  );
}
