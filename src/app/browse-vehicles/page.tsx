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
  getStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
  getEstimatedNZRetailPrice,
  WishListCriteria,
  DEFAULT_WISHLIST,
} from "@/lib/dealerStore";
import WishlistHeaderModal from "@/components/layout/WishlistHeaderModal";

// Format single clean specs line: e.g. "72,456 km · Hybrid · Automatic · Grade 4.5"
function formatSpecsLine(v: HeiwaVehicle): string {
  const fuel = v.fuelType === "H" ? "Hybrid" : v.fuelType === "D" ? "Diesel" : v.fuelType === "E" ? "Electric" : "Petrol";
  const trans = v.trans === "FAT" || v.trans === "AT" || v.trans === "DAT" ? "Automatic" : v.trans === "MT" ? "Manual" : "Automatic";
  const kms = `${v.kms.toLocaleString("en-US")} km`;
  const grade = v.grade ? ` · Grade ${v.grade}` : "";
  return `${kms} · ${fuel} · ${trans}${grade}`;
}

function BrowseVehiclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Top Scope: "all" general stock vs "wishlist" matched stock
  const [activeScope, setActiveScope] = useState<"all" | "wishlist">(() => {
    return searchParams.get("filter") === "wishlist" ? "wishlist" : "all";
  });
  const [wishlistModalOpen, setWishlistModalOpen] = useState<boolean>(false);
  const [wishlistCriteria, setWishlistCriteria] = useState<WishListCriteria[]>(DEFAULT_WISHLIST);

  // Filter States
  const [selectedMake, setSelectedMake] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedFuel, setSelectedFuel] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort & View States
  const [sortBy, setSortBy] = useState<string>("ending_soon");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination (6 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Watchlist synchronization
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  const refreshWishlistCriteria = () => {
    try {
      setWishlistCriteria(getStoredWishlistCriteria());
    } catch {
      // ignore
    }
  };

  const refreshWatchlist = () => {
    try {
      setWatchlistIds(getStoredWatchlist());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshWishlistCriteria();
    refreshWatchlist();
    const handler = () => {
      refreshWishlistCriteria();
      refreshWatchlist();
    };
    window.addEventListener("autohub_dealer_store_change", handler);
    return () => window.removeEventListener("autohub_dealer_store_change", handler);
  }, []);

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "wishlist") {
      setActiveScope("wishlist");
    }
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

  // Vehicles matching active Wishlist criteria
  const matchedWishlistVehicles = useMemo(() => {
    return matchVehiclesAgainstWishlist(allCars, wishlistCriteria);
  }, [allCars, wishlistCriteria]);

  // Primary criteria representation for summary card
  const primaryCriteria = wishlistCriteria.find((c) => c.make.trim() !== "") || wishlistCriteria[0];

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

  // Active filtered vehicles
  const filteredVehicles = useMemo(() => {
    const pool = activeScope === "wishlist" ? matchedWishlistVehicles : allCars;
    return pool.filter((v) => {
      if (activeScope === "all") {
        if (selectedMake !== "all" && v.make.toLowerCase() !== selectedMake.toLowerCase()) {
          return false;
        }
        if (selectedModel !== "all" && v.model.toLowerCase() !== selectedModel.toLowerCase()) {
          return false;
        }
        if (selectedYear !== "all") {
          const minYear = parseInt(selectedYear);
          if (v.year < minYear) return false;
        }
        if (selectedFuel !== "all") {
          if (selectedFuel === "H" && v.fuelType !== "H") return false;
          if (selectedFuel === "D" && v.fuelType !== "D") return false;
          if (selectedFuel === "E" && v.fuelType !== "E" && v.cc !== 0) return false;
          if (selectedFuel === "P" && v.fuelType !== "P" && v.fuelType !== "") return false;
        }
      }
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
  }, [allCars, matchedWishlistVehicles, activeScope, selectedMake, selectedModel, selectedYear, selectedFuel, searchQuery]);

  // Sorting
  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    if (sortBy === "ending_soon") {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111C2D] tracking-tight">
            Find Vehicles at Auction
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            AutoHub Dealer Intelligence Platform · Quality used vehicles from Japan auction inventory.
          </p>
        </div>

        {/* Top Scope Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => {
              setActiveScope("all");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeScope === "all"
                ? "bg-[#0F1B2E] text-white border-[#0F1B2E] shadow-sm"
                : "bg-white text-[#64748B] border-[#CBD5E1] hover:text-[#111C2D] hover:bg-[#F8FAFC]"
            }`}
          >
            <Car size={15} />
            <span>All Auction Stock ({allCars.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveScope("wishlist");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeScope === "wishlist"
                ? "bg-[#E11D48] text-white border-[#E11D48] shadow-sm shadow-rose-950/20"
                : "bg-white text-[#64748B] border-[#CBD5E1] hover:text-[#111C2D] hover:bg-rose-50/50"
            }`}
          >
            <Heart size={15} className={activeScope === "wishlist" ? "fill-white" : "text-[#E11D48]"} />
            <span>Matching Wishlist ({matchedWishlistVehicles.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Conditional Header Area: Wishlist Search Card OR Standard Filters ─── */}
      {activeScope === "wishlist" ? (
        <div className="space-y-4">
          {/* ┌──────────────────────────────────────────────────────┐
              │ Your current search                                  │
              │                                                      │
              │ Make              Toyota                             │
              │ Model             Aqua / C-HR                        │
              │ Year              2022 or newer                      │
              │ Kilometres        Under 60,000 km                    │
              │ Budget            Up to NZ$25,000                    │
              │                                                      │
              │                 [ Edit Wishlist ]                    │
              └──────────────────────────────────────────────────────┘ */}
          <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xs p-6 max-w-xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8ECF0]">
              <h2 className="text-base font-bold text-[#111C2D]">Your current search</h2>
              <button
                onClick={() => setWishlistModalOpen(true)}
                className="text-xs font-semibold text-[#E11D48] hover:text-[#BE123C] px-3 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                Edit Wishlist
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs font-medium">
              <div className="grid grid-cols-3 py-1 border-b border-[#F8FAFC]">
                <span className="text-[#64748B]">Make</span>
                <span className="col-span-2 text-[#111C2D] font-bold">{primaryCriteria?.make || "Toyota"}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-[#F8FAFC]">
                <span className="text-[#64748B]">Model</span>
                <span className="col-span-2 text-[#111C2D] font-bold">{primaryCriteria?.model || "Aqua / C-HR"}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-[#F8FAFC]">
                <span className="text-[#64748B]">Year</span>
                <span className="col-span-2 text-[#111C2D] font-bold">
                  {primaryCriteria?.yearFrom && primaryCriteria.yearFrom > 2013 ? `${primaryCriteria.yearFrom} or newer` : "2022 or newer"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-[#F8FAFC]">
                <span className="text-[#64748B]">Kilometres</span>
                <span className="col-span-2 text-[#111C2D] font-bold">
                  {primaryCriteria?.maxKms && primaryCriteria.maxKms < 100000 ? `Under ${primaryCriteria.maxKms.toLocaleString("en-US")} km` : "Under 60,000 km"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="text-[#64748B]">Budget</span>
                <span className="col-span-2 text-[#111C2D] font-bold">
                  {primaryCriteria?.maxBudget ? `Up to NZ$${primaryCriteria.maxBudget.toLocaleString("en-US")}` : "Up to NZ$25,000"}
                </span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setWishlistModalOpen(true)}
                className="px-6 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#111C2D] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-[#94A3B8]"
              >
                [ Edit Wishlist ]
              </button>
            </div>
          </div>

          {/* 18 matching vehicles */}
          <div className="pt-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#111C2D] tracking-tight">
              {filteredVehicles.length} matching vehicles
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-1">
              {filteredVehicles.length} vehicles currently match your requirements.
            </p>
          </div>

          {/* Neutral summary strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <span className="text-sm font-bold text-[#111C2D]">
                Vehicles matching your wishlist
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E11D48] text-white self-start sm:self-auto shadow-xs">
                {filteredVehicles.length} matching vehicles
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3.5 pt-3 text-xs font-medium text-slate-700">
              <span className="font-bold text-[#111C2D]">
                {primaryCriteria?.make || "Toyota"} {primaryCriteria?.model || "C-HR"}
              </span>
              <span className="text-slate-300">·</span>
              <span>2022+</span>
              <span className="text-slate-300">·</span>
              <span>Under 60,000 km</span>
              <span className="text-slate-300">·</span>
              <span>Budget up to NZ$30,000</span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Filter Bar when in All Auction Stock mode */
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs">
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
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] appearance-none pr-8 cursor-pointer"
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
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] appearance-none pr-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] appearance-none pr-8 cursor-pointer"
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
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] appearance-none pr-8 cursor-pointer"
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
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] appearance-none pr-8 cursor-pointer"
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
                className="w-full py-2.5 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 h-[41px]"
              >
                <Search size={15} />
                <span>Search Stock</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── Results Header & Sorter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div>
          <span className="text-[15px] font-bold text-[#111C2D]">
            {totalItems} Vehicles Available
          </span>
          {(selectedMake !== "all" || selectedModel !== "all" || selectedYear !== "all" || selectedFuel !== "all" || searchQuery) && (
            <button
              onClick={resetFilters}
              className="ml-3 text-xs text-[#E11D48] hover:underline font-semibold"
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
                className="bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] pr-7 cursor-pointer shadow-2xs"
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
                  ? "bg-[#0F1B2E] text-white shadow-xs"
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
                  ? "bg-[#0F1B2E] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#111C2D]"
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Vehicle Cards Grid — Simplified & Professional ─── */}
      {currentVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm">
          <Car size={44} className="mx-auto text-[#94A3B8] mb-3" />
          <h3 className="text-base font-bold text-[#111C2D]">No Vehicles Found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-5">
            No stock matching your current criteria. Try adjusting make, model, or year.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors shadow-sm hover:shadow-md"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentVehicles.map((vehicle, index) => {
            const photoUrl = getVehiclePhoto(vehicle);
            const landed = calculateLandedCost(vehicle.priceFob);
            const estimatedNz = getEstimatedNZRetailPrice(vehicle);
            const isWatchlisted = watchlistIds.includes(vehicle.chassis);
            const uniqueId = encodeURIComponent(vehicle.chassis);

            return (
              <div
                key={vehicle.chassis + vehicle.stockId + index}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* ─── Clean Image Container ─── */}
                <div className="relative aspect-[16/10] w-full bg-[#F1F5F9] overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Minimal Watchlist Button (Top Right) */}
                  <button
                    onClick={(e) => handleToggleWatchlist(e, vehicle)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-[#64748B] hover:text-[#E11D48] transition-colors"
                    title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                  >
                    <Heart
                      size={15}
                      className={isWatchlisted ? "fill-[#E11D48] text-[#E11D48]" : ""}
                    />
                  </button>
                </div>

                {/* ─── Simplified Details ─── */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 className="text-[16px] font-bold text-[#111C2D] truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    {/* Single Clean Specs Line */}
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
      ) : (
        /* List View — Simplified */
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F1F5F9]">
          {currentVehicles.map((vehicle, index) => {
            const photoUrl = getVehiclePhoto(vehicle);
            const landed = calculateLandedCost(vehicle.priceFob);
            const estimatedNz = getEstimatedNZRetailPrice(vehicle);
            const isWatchlisted = watchlistIds.includes(vehicle.chassis);
            const uniqueId = encodeURIComponent(vehicle.chassis);

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
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#111C2D] truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1 font-medium">
                      {formatSpecsLine(vehicle)}
                    </p>
                    <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5 block">
                      Lot #{vehicle.stockId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9]">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-[#8899A6] font-semibold uppercase">Landed Cost</div>
                    <div className="text-base font-extrabold text-[#111C2D] font-mono">
                      NZ${landed.totalLanded.toLocaleString("en-US")}
                    </div>
                  </div>

                  <div className="text-left sm:text-right hidden md:block">
                    <div className="text-[10px] text-[#8899A6] font-semibold uppercase">NZ Market Indicator</div>
                    <div className="text-sm font-bold text-slate-700 font-mono">
                      NZ${estimatedNz.retailPrice.toLocaleString("en-US")}
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
                        className={isWatchlisted ? "fill-[#E11D48] text-[#E11D48]" : ""}
                      />
                    </button>
                    <Link
                      href={`/vehicles/${uniqueId}`}
                      className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-1"
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

      {/* ─── Bottom Pagination Bar ─── */}
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
                      ? "bg-[#E11D48] text-white shadow-xs"
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
                      ? "bg-[#E11D48] text-white shadow-xs"
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

      {/* Wishlist Header Modal accessible directly from Edit Wishlist buttons */}
      <WishlistHeaderModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        onApply={() => {
          setActiveScope("wishlist");
          setWishlistModalOpen(false);
          refreshWishlistCriteria();
        }}
      />
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
