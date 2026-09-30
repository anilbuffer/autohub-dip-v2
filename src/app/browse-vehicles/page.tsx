"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Car,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
} from "@/lib/heiwaData";
import {
  getVehiclePhoto,
  isCarVehicle,
  getStoredWatchlist,
  toggleStoredWatchlist,
} from "@/lib/dealerStore";

// Deterministic auction countdown badge helper matching reference
function getAuctionTimeRemaining(index: number): string {
  const times = [
    "Ends in 2h 15m",
    "Ends in 4h 32m",
    "Ends in 6h 18m",
    "Ends in 8h 05m",
    "Ends in 12h 30m",
    "Ends in 1d 2h",
    "Ends in 1d 6h",
    "Ends in 1d 14h",
    "Ends in 2d 4h",
    "Ends in 2d 9h",
    "Ends in 3d 1h",
    "Ends in 3d 12h",
  ];
  return times[index % times.length];
}

// Format single clean specs line: e.g. "1.8L Hybrid | Automatic | 72,456 km"
function formatSpecsLine(v: HeiwaVehicle): string {
  const disp = v.cc > 0 ? `${(v.cc / 1000).toFixed(1)}L` : "EV";
  const fuel = v.fuelType === "H" ? "Hybrid" : v.fuelType === "D" ? "Diesel" : v.fuelType === "E" ? "Electric" : "Petrol";
  const trans = v.trans === "FAT" || v.trans === "AT" || v.trans === "DAT" ? "Automatic" : v.trans === "MT" ? "Manual" : "Automatic";
  const kms = `${v.kms.toLocaleString()} km`;
  return `${disp} ${fuel} | ${trans} | ${kms}`;
}

function BrowseVehiclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States matching reference dropdowns
  const [selectedMake, setSelectedMake] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedFuel, setSelectedFuel] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort & View States
  const [sortBy, setSortBy] = useState<string>("ending_soon");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination (6 items per page matching the reference image layout)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Watchlist synchronization
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setWatchlistIds(getStoredWatchlist());
    } catch {
      // ignore
    }
    const handler = () => {
      try {
        setWatchlistIds(getStoredWatchlist());
      } catch {
        // ignore
      }
    };
    window.addEventListener("autohub_dealer_store_change", handler);
    return () => window.removeEventListener("autohub_dealer_store_change", handler);
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const handleToggleWatchlist = (e: React.MouseEvent, vehicle: HeiwaVehicle) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStoredWatchlist(vehicle.chassis);
    setWatchlistIds(getStoredWatchlist());
  };

  // Base Vehicles (excluding motorbikes, pure clean cars)
  const allCars = useMemo(() => {
    return HEIWA_VEHICLES.filter(isCarVehicle);
  }, []);

  // Unique list of makes
  const makes = useMemo(() => {
    return Array.from(new Set(allCars.map((v) => v.make))).sort();
  }, [allCars]);

  // Models filtered by current make
  const availableModels = useMemo(() => {
    if (selectedMake === "all") return [];
    return Array.from(
      new Set(
        allCars
          .filter((v) => v.make.toLowerCase() === selectedMake.toLowerCase())
          .map((v) => v.model)
      )
    ).sort();
  }, [allCars, selectedMake]);

  // Filter logic
  const filteredVehicles = useMemo(() => {
    return allCars.filter((v) => {
      // Make
      if (selectedMake !== "all" && v.make.toLowerCase() !== selectedMake.toLowerCase()) {
        return false;
      }
      // Model
      if (selectedModel !== "all" && v.model.toLowerCase() !== selectedModel.toLowerCase()) {
        return false;
      }
      // Year
      if (selectedYear !== "all") {
        const minYear = parseInt(selectedYear);
        if (v.year < minYear) return false;
      }
      // Fuel
      if (selectedFuel !== "all") {
        if (selectedFuel === "H" && v.fuelType !== "H") return false;
        if (selectedFuel === "D" && v.fuelType !== "D") return false;
        if (selectedFuel === "E" && v.fuelType !== "E" && v.cc !== 0) return false;
        if (selectedFuel === "P" && v.fuelType !== "P" && v.fuelType !== "") return false;
      }
      // Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesText =
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.chassis.toLowerCase().includes(q) ||
          v.year.toString().includes(q);
        if (!matchesText) return false;
      }
      return true;
    });
  }, [allCars, selectedMake, selectedModel, selectedYear, selectedFuel, searchQuery]);

  // Sorting
  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    if (sortBy === "ending_soon") {
      // Stable order matching reference
      return list;
    }
    if (sortBy === "price_asc") {
      return list.sort((a, b) => a.priceFob - b.priceFob);
    }
    if (sortBy === "price_desc") {
      return list.sort((a, b) => b.priceFob - a.priceFob);
    }
    if (sortBy === "year_desc") {
      return list.sort((a, b) => b.year - a.year);
    }
    if (sortBy === "kms_asc") {
      return list.sort((a, b) => a.kms - b.kms);
    }
    return list;
  }, [filteredVehicles, sortBy]);

  // Pagination calculation
  const totalItems = sortedVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentVehicles = sortedVehicles.slice(startIndex, endIndex);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedMake("all");
    setSelectedModel("all");
    setSelectedYear("all");
    setSelectedFuel("all");
    setSelectedLocation("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ─── Page Title & Subtitle ─── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111C2D] tracking-tight">
          Find Vehicles at Auction
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Quality used vehicles from trusted auctions across New Zealand.
        </p>
      </div>

      {/* ─── Horizontal Filter Bar ─── */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-end">
          {/* Make */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
              Make
            </label>
            <div className="relative">
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("all");
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] appearance-none pr-8 cursor-pointer"
              >
                <option value="all">Any Make</option>
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
              Model
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={selectedMake === "all"}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] appearance-none pr-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">{selectedMake === "all" ? "Any Model" : `All ${selectedMake}`}</option>
                {availableModels.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
              Year
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] appearance-none pr-8 cursor-pointer"
              >
                <option value="all">Any Year</option>
                <option value="2022">2022 & Newer</option>
                <option value="2020">2020 & Newer</option>
                <option value="2018">2018 & Newer</option>
                <option value="2016">2016 & Newer</option>
                <option value="2014">2014 & Newer</option>
                <option value="2012">2012 & Newer</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
              Fuel Type
            </label>
            <div className="relative">
              <select
                value={selectedFuel}
                onChange={(e) => {
                  setSelectedFuel(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] appearance-none pr-8 cursor-pointer"
              >
                <option value="all">Any Fuel</option>
                <option value="H">Hybrid</option>
                <option value="P">Petrol</option>
                <option value="D">Diesel</option>
                <option value="E">Electric</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
              Location
            </label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] appearance-none pr-8 cursor-pointer"
              >
                <option value="all">All Locations</option>
                <option value="auckland">Auckland Yard</option>
                <option value="wellington">Wellington Yard</option>
                <option value="christchurch">Christchurch Yard</option>
                <option value="japan_yokohama">Yokohama Port (Direct)</option>
                <option value="japan_nagoya">Nagoya Port (Direct)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#1E3A5F] hover:bg-[#162C48] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 h-[41px]"
            >
              <Search size={15} />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* ─── Results Header & Sorter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div>
          <span className="text-[15px] font-bold text-[#111C2D]">
            {totalItems} Vehicles Found
          </span>
          {(selectedMake !== "all" || selectedModel !== "all" || selectedYear !== "all" || selectedFuel !== "all" || searchQuery) && (
            <button
              onClick={resetFilters}
              className="ml-3 text-xs text-[#1E3A5F] hover:underline font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="font-medium hidden sm:inline">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#1E3A5F] pr-7 cursor-pointer shadow-2xs"
              >
                <option value="ending_soon">Ending Soon</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Newest Year</option>
                <option value="kms_asc">Lowest Mileage</option>
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {/* View Toggles (Grid / List) */}
          <div className="flex items-center p-1 bg-white border border-[#CBD5E1] rounded-xl shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#1E3A5F] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#111C2D]"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[#1E3A5F] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#111C2D]"
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Vehicle Cards Grid (Clean Listing Layout matching reference) ─── */}
      {currentVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm">
          <Car size={44} className="mx-auto text-[#94A3B8] mb-3" />
          <h3 className="text-base font-bold text-[#111C2D]">No Vehicles Found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-5">
            No stock matching your current filter combination. Try adjusting make, model, or year.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#162C48] text-white text-xs font-bold transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentVehicles.map((vehicle, index) => {
            const globalIndex = startIndex + index;
            const photoUrl = getVehiclePhoto(vehicle);
            const landed = calculateLandedCost(vehicle.priceFob);
            const isWatchlisted = watchlistIds.includes(vehicle.chassis);
            const uniqueId = encodeURIComponent(vehicle.chassis);
            const timeRemaining = getAuctionTimeRemaining(globalIndex);

            return (
              <div
                key={vehicle.chassis + vehicle.stockId + index}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* ─── Image Container with Overlays ─── */}
                <div className="relative aspect-[16/10] w-full bg-[#F1F5F9] overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Auction Time Pill (Bottom Left) */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                    {timeRemaining}
                  </div>

                  {/* Watchlist Heart Button (Top Right) */}
                  <button
                    onClick={(e) => handleToggleWatchlist(e, vehicle)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-sm flex items-center justify-center text-[#64748B] hover:text-rose-600 transition-colors"
                    title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                  >
                    <Heart
                      size={15}
                      className={isWatchlisted ? "fill-rose-600 text-rose-600" : ""}
                    />
                  </button>
                </div>

                {/* ─── Clean Card Details ─── */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title: 2017 Toyota C-HR */}
                    <h3 className="text-[16px] font-bold text-[#111C2D] truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    {/* Clean Specs line: 1.8L Hybrid | Automatic | 72,456 km */}
                    <p className="text-xs text-[#64748B] mt-1.5 font-medium truncate">
                      {formatSpecsLine(vehicle)}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-[#F1F5F9]">
                    <div className="text-lg font-extrabold text-[#111C2D] font-mono tracking-tight">
                      NZ${landed.totalLanded.toLocaleString()}
                    </div>

                    <Link
                      href={`/vehicles/${uniqueId}`}
                      className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C48] text-white text-xs font-semibold rounded-xl transition-all shadow-2xs hover:shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
          {currentVehicles.map((vehicle, index) => {
            const globalIndex = startIndex + index;
            const photoUrl = getVehiclePhoto(vehicle);
            const landed = calculateLandedCost(vehicle.priceFob);
            const isWatchlisted = watchlistIds.includes(vehicle.chassis);
            const uniqueId = encodeURIComponent(vehicle.chassis);
            const timeRemaining = getAuctionTimeRemaining(globalIndex);

            return (
              <div
                key={vehicle.chassis + vehicle.stockId + index}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={photoUrl}
                      alt={vehicle.model}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                      {timeRemaining}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#111C2D] truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      {formatSpecsLine(vehicle)}
                    </p>
                    <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5 block">
                      Chassis: {vehicle.chassis}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9]">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Landed NZD</div>
                    <div className="text-lg font-extrabold text-[#111C2D] font-mono">
                      NZ${landed.totalLanded.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleWatchlist(e, vehicle)}
                      className="p-2 border border-[#CBD5E1] rounded-xl hover:bg-slate-50 text-[#64748B] transition-colors"
                      title="Watchlist"
                    >
                      <Heart
                        size={16}
                        className={isWatchlisted ? "fill-rose-600 text-rose-600" : ""}
                      />
                    </button>
                    <Link
                      href={`/vehicles/${uniqueId}`}
                      className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C48] text-white text-xs font-semibold rounded-xl transition-all shadow-2xs"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Bottom Pagination Bar (Matching reference: Showing 1–6 of X vehicles, < [1] 2 3 4 5 >) ─── */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-medium">
            Showing <span className="font-bold text-[#111C2D]">{startIndex + 1}–{endIndex}</span> of{" "}
            <span className="font-bold text-[#111C2D]">{totalItems}</span> vehicles
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white flex items-center justify-center text-[#64748B] hover:text-[#111C2D] hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#1E3A5F] text-white shadow-2xs"
                      : "bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50 hover:text-[#111C2D]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="text-[#94A3B8] px-1">…</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === totalPages
                      ? "bg-[#1E3A5F] text-white shadow-2xs"
                      : "bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50 hover:text-[#111C2D]"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white flex items-center justify-center text-[#64748B] hover:text-[#111C2D] hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowseVehiclesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading auction catalog...</div>}>
        <BrowseVehiclesContent />
      </Suspense>
    </AppLayout>
  );
}
