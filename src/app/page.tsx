"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Car,
  Search,
  Filter,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Sparkles,
  LayoutGrid,
  List,
  Fuel,
  Gauge,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
  getUniqueMakes,
  getModelsForMake,
} from "@/lib/heiwaData";
import {
  getStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
  getStoredWatchlist,
  toggleStoredWatchlist,
  placeDealerBid,
  isCarVehicle,
} from "@/lib/dealerStore";

function BrowseVehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query params
  const urlFilter = searchParams.get("filter");
  const urlSearch = searchParams.get("search") || "";

  // State
  const [activeTab, setActiveTab] = useState<"all" | "wishlist">(
    urlFilter === "wishlist" ? "wishlist" : "all"
  );
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedMake, setSelectedMake] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedFuel, setSelectedFuel] = useState<string>("all");
  const [maxKms, setMaxKms] = useState<number>(200000);
  const [maxBudget, setMaxBudget] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<"landed_asc" | "landed_desc" | "margin_desc" | "year_desc" | "kms_asc">("landed_asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [quickBidVehicle, setQuickBidVehicle] = useState<HeiwaVehicle | null>(null);
  const [quickBidAmount, setQuickBidAmount] = useState<number>(0);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Sync with URL search
  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    if (urlFilter === "wishlist") {
      setActiveTab("wishlist");
    }
  }, [urlFilter]);

  // Load watchlist & sync
  const refreshWatchlist = () => {
    setWatchlist(getStoredWatchlist());
  };

  useEffect(() => {
    refreshWatchlist();
    const handler = () => refreshWatchlist();
    window.addEventListener("autohub_dealer_store_change", handler);
    return () => window.removeEventListener("autohub_dealer_store_change", handler);
  }, []);

  const wishlistCriteria = useMemo(() => {
    return getStoredWishlistCriteria().filter((c) => c.make.trim() !== "");
  }, [activeTab]);

  // Car vehicles only
  const allCarVehicles = useMemo(() => {
    return HEIWA_VEHICLES.filter(isCarVehicle);
  }, []);

  // Filtered by Wishlist matches
  const wishlistMatches = useMemo(() => {
    return matchVehiclesAgainstWishlist(allCarVehicles, wishlistCriteria);
  }, [allCarVehicles, wishlistCriteria]);

  // Available makes
  const makes = useMemo(() => getUniqueMakes(), []);
  const availableModels = useMemo(() => {
    if (selectedMake === "all") return [];
    return getModelsForMake(selectedMake);
  }, [selectedMake]);

  // Working vehicle list based on tab
  const baseList = activeTab === "wishlist" ? wishlistMatches : allCarVehicles;

  // Filter and sort vehicles
  const displayedVehicles = useMemo(() => {
    return baseList
      .filter((v) => {
        // Keyword Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = `${v.year} ${v.make} ${v.model} ${v.grade}`.toLowerCase().includes(q);
          const matchChassis = v.chassis.toLowerCase().includes(q);
          const matchStock = v.stockId.toLowerCase().includes(q);
          if (!matchTitle && !matchChassis && !matchStock) return false;
        }

        // Make filter
        if (selectedMake !== "all" && v.make.toLowerCase() !== selectedMake.toLowerCase()) {
          return false;
        }

        // Model filter
        if (selectedModel !== "all" && !v.model.toLowerCase().includes(selectedModel.toLowerCase())) {
          return false;
        }

        // Fuel filter
        if (selectedFuel !== "all") {
          if (selectedFuel === "hybrid" && v.fuelType !== "H" && !v.model.toLowerCase().includes("hybrid")) return false;
          if (selectedFuel === "petrol" && v.fuelType !== "P" && v.fuelType !== "G" && v.fuelType !== "") return false;
          if (selectedFuel === "diesel" && v.fuelType !== "D") return false;
          if (selectedFuel === "ev" && v.fuelType !== "E" && v.cc !== 0) return false;
        }

        // Kilometres
        if (v.kms > maxKms) return false;

        // Budget (NZD Landed)
        const landed = calculateLandedCost(v.priceFob).totalLanded;
        if (landed > maxBudget) return false;

        return true;
      })
      .sort((a, b) => {
        const landedA = calculateLandedCost(a.priceFob).totalLanded;
        const landedB = calculateLandedCost(b.priceFob).totalLanded;
        const marginA = getEstimatedNZRetailPrice(a).grossMargin;
        const marginB = getEstimatedNZRetailPrice(b).grossMargin;

        if (sortBy === "landed_asc") return landedA - landedB;
        if (sortBy === "landed_desc") return landedB - landedA;
        if (sortBy === "margin_desc") return marginB - marginA;
        if (sortBy === "year_desc") return b.year - a.year;
        if (sortBy === "kms_asc") return a.kms - b.kms;
        return 0;
      });
  }, [baseList, searchQuery, selectedMake, selectedModel, selectedFuel, maxKms, maxBudget, sortBy]);

  const handleToggleWatchlist = (e: React.MouseEvent, chassis: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStoredWatchlist(chassis);
  };

  const openQuickBid = (e: React.MouseEvent, v: HeiwaVehicle) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickBidVehicle(v);
    setQuickBidAmount(v.priceFob);
    setBidSuccess(false);
  };

  const submitQuickBid = () => {
    if (!quickBidVehicle) return;
    placeDealerBid(quickBidVehicle, quickBidAmount);
    setBidSuccess(true);
    setTimeout(() => {
      setBidSuccess(false);
      setQuickBidVehicle(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Hero Banner & Journey Header ─── */}
      <div className="bg-[#0F1419] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#C8102E]/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 border border-white/10">
                <Sparkles size={13} className="text-[#FF6B78]" />
                <span>Phase-1 Dealer MVP Journey</span>
                <span className="text-white/40">·</span>
                <span className="text-emerald-400 font-mono">Heiwa CSV Stock Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Browse Vehicles & Match Stock
              </h1>
              <p className="text-sm text-white/70 max-w-2xl mt-1.5 leading-relaxed">
                Source directly from Japan auctions. Every lot features fully calculated NZ landed yard costs and real-time TradeMe market price comparisons.
              </p>
            </div>

            {/* Quick Sourcing Stats */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white/[0.04] p-3 sm:p-4 rounded-xl border border-white/[0.08]">
              <div className="text-left px-2 sm:px-3 border-r border-white/10">
                <div className="text-xs text-white/50">Total Japan Stock</div>
                <div className="text-lg sm:text-xl font-bold text-white font-mono">{allCarVehicles.length} Lots</div>
              </div>
              <div className="text-left px-2 sm:px-3 border-r border-white/10">
                <div className="text-xs text-rose-300/80">Wishlist Matches</div>
                <div className="text-lg sm:text-xl font-bold text-rose-400 font-mono">{wishlistMatches.length} Cars</div>
              </div>
              <div className="text-left px-2 sm:px-3">
                <div className="text-xs text-emerald-400/80">FX Benchmark</div>
                <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">¥91.24</div>
              </div>
            </div>
          </div>

          {/* ─── Mode Switcher (All Stock vs Wishlist Matches) ─── */}
          <div className="mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-white/[0.06] rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "wishlist"
                    ? "bg-[#C8102E] text-white shadow-md shadow-red-900/30"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Heart size={14} className={activeTab === "wishlist" ? "fill-white" : ""} />
                <span>Matched to My Wishlist</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {wishlistMatches.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-[#0F1419] shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Car size={14} />
                <span>All Heiwa Stock</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-black/10 text-current">
                  {allCarVehicles.length}
                </span>
              </button>
            </div>

            {/* Active Wishlist Criteria Reminder */}
            {activeTab === "wishlist" && wishlistCriteria.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="text-white/40">Active Targets:</span>
                {wishlistCriteria.slice(0, 2).map((c) => (
                  <span key={c.id} className="bg-white/10 text-white px-2.5 py-1 rounded-md text-[11px] font-medium border border-white/10">
                    {c.make} {c.model || "All"} ({c.yearFrom}-{c.yearTo}) · &lt;${(c.maxBudget / 1000).toFixed(0)}k
                  </span>
                ))}
                {wishlistCriteria.length > 2 && (
                  <span className="text-white/40 text-[11px]">+{wishlistCriteria.length - 2} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Search & Comprehensive Filter Controls ─── */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8ECF0] shadow-subtle space-y-4">
        {/* Row 1: Search + View Toggles + Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AAB8C2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, chassis, lot ID (e.g. Aqua, C-HR, ZYX10)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl text-xs sm:text-sm font-medium text-[#0F1419] placeholder:text-[#AAB8C2] focus:bg-white focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/10 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8899A6] hover:text-[#0F1419]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#F7F9FA] border border-[#E8ECF0] px-3 py-2 rounded-xl text-xs">
              <ArrowUpDown size={14} className="text-[#8899A6]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-[#0F1419] outline-none cursor-pointer text-xs"
              >
                <option value="landed_asc">Landed Cost: Low to High</option>
                <option value="landed_desc">Landed Cost: High to Low</option>
                <option value="margin_desc">Highest Margin Spread</option>
                <option value="year_desc">Newest Year</option>
                <option value="kms_asc">Lowest Mileage</option>
              </select>
            </div>

            {/* Grid / Table View Switcher */}
            <div className="flex items-center p-1 bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-[#0F1419] shadow-xs" : "text-[#8899A6] hover:text-[#0F1419]"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-white text-[#0F1419] shadow-xs" : "text-[#8899A6] hover:text-[#0F1419]"
                }`}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-3 border-t border-[#F0F2F5]">
          {/* Make Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#8899A6] uppercase tracking-wider mb-1">
              Make
            </label>
            <select
              value={selectedMake}
              onChange={(e) => {
                setSelectedMake(e.target.value);
                setSelectedModel("all");
              }}
              className="w-full bg-[#F7F9FA] border border-[#E8ECF0] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F1419] outline-none focus:border-[#C8102E]"
            >
              <option value="all">All Makes</option>
              {makes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#8899A6] uppercase tracking-wider mb-1">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={selectedMake === "all"}
              className="w-full bg-[#F7F9FA] border border-[#E8ECF0] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F1419] outline-none focus:border-[#C8102E] disabled:opacity-50"
            >
              <option value="all">{selectedMake === "all" ? "Select Make first" : `All ${selectedMake} Models`}</option>
              {availableModels.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>

          {/* Fuel Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#8899A6] uppercase tracking-wider mb-1">
              Powertrain / Fuel
            </label>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full bg-[#F7F9FA] border border-[#E8ECF0] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F1419] outline-none focus:border-[#C8102E]"
            >
              <option value="all">All Powertrains</option>
              <option value="hybrid">Hybrid Only</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="ev">Electric (EV)</option>
            </select>
          </div>

          {/* Max KM */}
          <div>
            <label className="block text-[10px] font-bold text-[#8899A6] uppercase tracking-wider mb-1">
              Max Mileage
            </label>
            <select
              value={maxKms}
              onChange={(e) => setMaxKms(parseInt(e.target.value))}
              className="w-full bg-[#F7F9FA] border border-[#E8ECF0] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F1419] outline-none focus:border-[#C8102E]"
            >
              <option value={50000}>Under 50,000 km</option>
              <option value={80000}>Under 80,000 km</option>
              <option value={100000}>Under 100,000 km</option>
              <option value={130000}>Under 130,000 km</option>
              <option value={200000}>Any Mileage</option>
            </select>
          </div>

          {/* Max Budget NZD */}
          <div>
            <label className="block text-[10px] font-bold text-[#8899A6] uppercase tracking-wider mb-1">
              Max Landed Budget
            </label>
            <select
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseInt(e.target.value))}
              className="w-full bg-[#F7F9FA] border border-[#E8ECF0] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F1419] outline-none focus:border-[#C8102E]"
            >
              <option value={12000}>Under $12,000 NZD</option>
              <option value={18000}>Under $18,000 NZD</option>
              <option value={25000}>Under $25,000 NZD</option>
              <option value={35000}>Under $35,000 NZD</option>
              <option value={50000}>Any Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Results Counter & Status Bar ─── */}
      <div className="flex items-center justify-between text-xs text-[#536471] px-1">
        <div>
          Showing <span className="font-bold text-[#0F1419]">{displayedVehicles.length}</span> matching vehicles
          {activeTab === "wishlist" && (
            <span className="ml-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Matched against your Wish List
            </span>
          )}
        </div>
        {(selectedMake !== "all" || selectedFuel !== "all" || searchQuery || maxKms < 200000 || maxBudget < 50000) && (
          <button
            onClick={() => {
              setSelectedMake("all");
              setSelectedModel("all");
              setSelectedFuel("all");
              setMaxKms(200000);
              setMaxBudget(50000);
              setSearchQuery("");
            }}
            className="text-[#C8102E] font-semibold hover:underline flex items-center gap-1"
          >
            <RefreshCw size={11} /> Reset Filters
          </button>
        )}
      </div>

      {/* ─── Vehicle Options (Clean List / Grid) ─── */}
      {displayedVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E8ECF0] shadow-subtle">
          <Car size={48} className="mx-auto text-[#AAB8C2] mb-4" />
          <h3 className="text-base font-bold text-[#0F1419]">No Vehicles Found</h3>
          <p className="text-xs text-[#536471] max-w-md mx-auto mt-1 mb-5">
            {activeTab === "wishlist"
              ? "None of the currently listed Japan auction stock strictly meets your wish list parameters. Try broadening your criteria or switch to All Heiwa Stock."
              : "No stock matching your current filter combination. Try clearing some filters."}
          </p>
          <div className="flex items-center justify-center gap-3">
            {activeTab === "wishlist" && (
              <button
                onClick={() => setActiveTab("all")}
                className="px-4 py-2 rounded-xl bg-[#0F1419] text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Browse All Heiwa Stock ({allCarVehicles.length})
              </button>
            )}
            <button
              onClick={() => {
                setSelectedMake("all");
                setSelectedFuel("all");
                setMaxKms(200000);
                setMaxBudget(50000);
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#F0F2F5] text-[#0F1419] text-xs font-semibold hover:bg-[#E8ECF0] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ─── 3-COLUMN CARD GRID ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedVehicles.map((vehicle) => {
            const photoUrl = getVehiclePhoto(vehicle);
            const landed = calculateLandedCost(vehicle.priceFob);
            const nzRetail = getEstimatedNZRetailPrice(vehicle);
            const isWatchlisted = watchlist.includes(vehicle.chassis);
            const uniqueId = encodeURIComponent(vehicle.chassis);

            return (
              <div
                key={`${vehicle.stockId}-${vehicle.chassis}`}
                className="bg-white rounded-2xl border border-[#E8ECF0] hover:border-[#CCD6DD] shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Image Container with Badges */}
                <div className="relative h-48 bg-[#F0F2F5] overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider font-mono">
                      LOT #{vehicle.stockId}
                    </span>
                    {vehicle.ac && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold">
                        {vehicle.ac}
                      </span>
                    )}
                  </div>

                  {/* Watchlist Heart Button */}
                  <button
                    onClick={(e) => handleToggleWatchlist(e, vehicle.chassis)}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                      isWatchlisted
                        ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
                        : "bg-black/40 text-white hover:bg-black/60"
                    }`}
                    title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                  >
                    <Heart size={14} className={isWatchlisted ? "fill-white" : ""} />
                  </button>

                  {/* Bottom Image Overlay Badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold drop-shadow-sm flex items-center gap-1">
                      <Fuel size={12} className="text-emerald-400" />
                      {vehicle.fuelType === "H" ? "Hybrid" : vehicle.fuelType === "D" ? "Diesel" : vehicle.fuelType === "E" ? "EV" : "Petrol"}
                    </span>
                    <span className="text-[11px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm font-mono">
                      {vehicle.chassis}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Vehicle Title */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-base font-bold text-[#0F1419] group-hover:text-[#C8102E] transition-colors leading-snug">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.grade && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0F2F5] text-[#536471] border border-[#E8ECF0]">
                          {vehicle.grade}
                        </span>
                      )}
                    </div>

                    {/* Specs Pill Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#536471] mb-4">
                      <span className="inline-flex items-center gap-1 font-mono font-medium">
                        <Gauge size={12} className="text-[#8899A6]" />
                        {vehicle.kms.toLocaleString()} km
                      </span>
                      <span>·</span>
                      <span className="font-medium">{vehicle.cc > 0 ? `${vehicle.cc}cc` : "EV"}</span>
                      <span>·</span>
                      <span className="capitalize">{vehicle.colorDesc || vehicle.color}</span>
                      <span>·</span>
                      <span>{vehicle.trans}</span>
                    </div>

                    {/* ─── Financials & Landed Cost Breakdown Box ─── */}
                    <div className="p-3.5 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] mb-4 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider">
                          NZ Landed Cost
                        </span>
                        <span className="text-base font-extrabold text-[#C8102E] font-mono">
                          ${landed.totalLanded.toLocaleString()} NZD
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#536471] pt-1.5 border-t border-[#E8ECF0]">
                        <span>Japan FOB: ¥{vehicle.priceFob.toLocaleString()}</span>
                        <span className="font-mono text-[#8899A6]">${landed.fobNzd.toLocaleString()} NZD</span>
                      </div>

                      {/* NZ Market Comparison Spread */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E8ECF0]/60">
                        <span className="text-[11px] text-[#536471] flex items-center gap-1">
                          <TrendingUp size={11} className="text-emerald-600" />
                          Est. NZ Retail:
                        </span>
                        <span className="text-xs font-bold text-[#0F1419] font-mono">
                          ${nzRetail.retailPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Margin Potential Badge */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[#8899A6]">Margin Potential:</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300/60 px-2 py-0.5 rounded-full font-mono">
                          +${nzRetail.grossMargin.toLocaleString()} ({nzRetail.marginPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F0F2F5]">
                    <Link
                      href={`/vehicles/${uniqueId}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#0F1419] hover:bg-black text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 group-hover:bg-[#C8102E] shadow-sm"
                    >
                      <span>View Details & NZ Market</span>
                      <ArrowRight size={13} />
                    </Link>

                    <button
                      onClick={(e) => openQuickBid(e, vehicle)}
                      className="px-3 py-2.5 rounded-xl border border-[#E8ECF0] hover:bg-[#F0F2F5] text-[#0F1419] text-xs font-semibold transition-colors"
                      title="Quick Auction Bid"
                    >
                      Bid
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── DATA TABLE VIEW ─── */
        <div className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FA] border-b border-[#E8ECF0] text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Vehicle / Lot</th>
                  <th className="py-3.5 px-4">Grade & Specs</th>
                  <th className="py-3.5 px-4">Mileage</th>
                  <th className="py-3.5 px-4">FOB Japan</th>
                  <th className="py-3.5 px-4 text-right">AutoHub Landed NZD</th>
                  <th className="py-3.5 px-4 text-right">Est. NZ Retail</th>
                  <th className="py-3.5 px-4 text-right">Margin Spread</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF0]">
                {displayedVehicles.map((vehicle) => {
                  const photoUrl = getVehiclePhoto(vehicle);
                  const landed = calculateLandedCost(vehicle.priceFob);
                  const nzRetail = getEstimatedNZRetailPrice(vehicle);
                  const uniqueId = encodeURIComponent(vehicle.chassis);
                  const isWatchlisted = watchlist.includes(vehicle.chassis);

                  return (
                    <tr
                      key={`${vehicle.stockId}-${vehicle.chassis}`}
                      className="hover:bg-[#F7F9FA] transition-colors group"
                    >
                      {/* Vehicle & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={photoUrl}
                            alt=""
                            className="w-12 h-9 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                          <div>
                            <Link
                              href={`/vehicles/${uniqueId}`}
                              className="font-bold text-[#0F1419] hover:text-[#C8102E] text-xs block leading-tight"
                            >
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </Link>
                            <div className="text-[10px] text-[#8899A6] font-mono mt-0.5">
                              Lot #{vehicle.stockId} · {vehicle.chassis}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Grade & Specs */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F1419]">{vehicle.grade || "Standard"}</div>
                        <div className="text-[10px] text-[#8899A6]">
                          {vehicle.cc > 0 ? `${vehicle.cc}cc` : "EV"} · {vehicle.fuelType === "H" ? "Hybrid" : "Petrol"}
                        </div>
                      </td>

                      {/* Mileage */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[#0F1419]">
                        {vehicle.kms.toLocaleString()} km
                      </td>

                      {/* FOB Japan */}
                      <td className="py-3.5 px-4 font-mono text-[#536471]">
                        ¥{vehicle.priceFob.toLocaleString()}
                      </td>

                      {/* Landed NZD */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#C8102E]">
                        ${landed.totalLanded.toLocaleString()} NZD
                      </td>

                      {/* Est NZ Retail */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0F1419]">
                        ${nzRetail.retailPrice.toLocaleString()}
                      </td>

                      {/* Margin Spread */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                          +${nzRetail.grossMargin.toLocaleString()} ({nzRetail.marginPercent}%)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => handleToggleWatchlist(e, vehicle.chassis)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isWatchlisted
                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                : "border-[#E8ECF0] text-[#8899A6] hover:text-[#0F1419]"
                            }`}
                            title="Watchlist"
                          >
                            <Heart size={13} className={isWatchlisted ? "fill-rose-600" : ""} />
                          </button>
                          <Link
                            href={`/vehicles/${uniqueId}`}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0F1419] hover:bg-[#C8102E] text-white text-[11px] font-bold transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Fast Auction Bid Modal ─── */}
      {quickBidVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E8ECF0] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8899A6]">
                  Heiwa Japan Auction Bid
                </span>
                <h3 className="text-base font-bold text-[#0F1419]">
                  {quickBidVehicle.year} {quickBidVehicle.make} {quickBidVehicle.model}
                </h3>
                <p className="text-xs text-[#536471] font-mono mt-0.5">
                  Lot #{quickBidVehicle.stockId} · {quickBidVehicle.chassis}
                </p>
              </div>
              <button
                onClick={() => setQuickBidVehicle(null)}
                className="text-[#8899A6] hover:text-[#0F1419]"
              >
                ✕
              </button>
            </div>

            {bidSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <Check size={20} />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">Bid Successfully Dispatched!</h4>
                <p className="text-xs text-emerald-700">
                  Your bid has been placed with Heiwa Japan. You can track auction progress in &quot;My Bids&quot;.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#536471]">Current FOB Guideline:</span>
                    <span className="font-bold font-mono">¥{quickBidVehicle.priceFob.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#536471]">Est. Landed Cost (at this bid):</span>
                    <span className="font-bold text-[#C8102E] font-mono">
                      ${calculateLandedCost(quickBidAmount).totalLanded.toLocaleString()} NZD
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#536471] mb-1.5">
                    Your Max FOB Bid (JPY)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#8899A6]">¥</span>
                    <input
                      type="number"
                      step={10000}
                      value={quickBidAmount}
                      onChange={(e) => setQuickBidAmount(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#CCD6DD] rounded-xl font-mono font-bold text-sm text-[#0F1419] focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setQuickBidVehicle(null)}
                    className="flex-1 py-2.5 border border-[#E8ECF0] rounded-xl text-xs font-semibold text-[#536471] hover:bg-[#F0F2F5]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitQuickBid}
                    className="flex-1 py-2.5 bg-[#C8102E] hover:bg-[#A80D26] text-white rounded-xl text-xs font-bold shadow-md shadow-red-900/20"
                  >
                    Confirm Auction Bid
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowseVehiclesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#8899A6]">Loading stock...</div>}>
        <BrowseVehiclesContent />
      </Suspense>
    </AppLayout>
  );
}
