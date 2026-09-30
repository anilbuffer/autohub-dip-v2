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
  Gavel,
  Check,
  CheckSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
  getVehicleConditionScore,
  ListingType,
  getVehicleListingType,
} from "@/lib/heiwaData";
import {
  getAllVehicles,
  getVehiclePhoto,
  isCarVehicle,
  getStoredWatchlist,
  toggleStoredWatchlist,
  getStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
  getEstimatedNZRetailPrice,
  placeDealerBid,
  WishListCriteria,
  DEFAULT_WISHLIST,
} from "@/lib/dealerStore";
import WishlistHeaderModal from "@/components/layout/WishlistHeaderModal";
import BatchBiddingModal from "@/components/vehicle/BatchBiddingModal";

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

  // Top Scope: "all" general stock vs "wishlist" matched stock (defaults to wishlist)
  const [activeScope, setActiveScope] = useState<"all" | "wishlist">(() => {
    const f = searchParams.get("filter");
    const t = searchParams.get("tab");
    if (f === "all" || t === "all") return "all";
    return "wishlist";
  });
  const [wishlistModalOpen, setWishlistModalOpen] = useState<boolean>(false);
  const [wishlistCriteria, setWishlistCriteria] = useState<WishListCriteria[]>(DEFAULT_WISHLIST);

  // Filter States
  const [selectedListingType, setSelectedListingType] = useState<"all" | "reserve" | "auction">("all");
  const [selectedMake, setSelectedMake] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedFuel, setSelectedFuel] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort & View States
  const [sortBy, setSortBy] = useState<string>("best_match");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Enquire / Reserve Modal State
  const [enquiryVehicle, setEnquiryVehicle] = useState<HeiwaVehicle | null>(null);
  const [enquirySuccess, setEnquirySuccess] = useState<boolean>(false);
  const [enquiryType, setEnquiryType] = useState<"reserve" | "inspection" | "quote">("reserve");
  const [enquiryNotes, setEnquiryNotes] = useState<string>("");

  // Auction Quick Bid Modal State
  const [bidVehicle, setBidVehicle] = useState<HeiwaVehicle | null>(null);
  const [bidAmountJpy, setBidAmountJpy] = useState<number>(0);
  const [bidSuccess, setBidSuccess] = useState<boolean>(false);

  // Pagination (18 items for wishlist to view all 14 matching vehicles at once, 12 for all auction stock)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = activeScope === "wishlist" ? 18 : 12;

  // Watchlist synchronization
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  // Batch bidding selection (submit bids for up to 4 cars together)
  const [selectedChassis, setSelectedChassis] = useState<string[]>([]);
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleSelectVehicle = (e: React.MouseEvent, chassis: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedChassis.includes(chassis)) {
      setSelectedChassis(selectedChassis.filter((c) => c !== chassis));
    } else {
      if (selectedChassis.length >= 4) {
        setToastMessage("You can select up to 4 cars to submit bids together.");
        setTimeout(() => setToastMessage(null), 3500);
        return;
      }
      setSelectedChassis([...selectedChassis, chassis]);
    }
  };

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

  const [allCars, setAllCars] = useState<HeiwaVehicle[]>(() => getAllVehicles().filter(isCarVehicle));

  const refreshVehicles = () => {
    setAllCars(getAllVehicles().filter(isCarVehicle));
  };

  useEffect(() => {
    refreshWishlistCriteria();
    refreshWatchlist();
    refreshVehicles();
    const handler = () => {
      refreshWishlistCriteria();
      refreshWatchlist();
      refreshVehicles();
    };
    window.addEventListener("autohub_dealer_store_change", handler);
    return () => window.removeEventListener("autohub_dealer_store_change", handler);
  }, []);

  useEffect(() => {
    const filter = searchParams.get("filter");
    const tab = searchParams.get("tab");
    if (filter === "all" || tab === "all") {
      setActiveScope("all");
    } else {
      setActiveScope("wishlist");
    }
    const cond = searchParams.get("condition");
    if (cond) {
      setSelectedCondition(cond);
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

  // Vehicles matching active Wishlist criteria
  const matchedWishlistVehicles = useMemo(() => {
    return matchVehiclesAgainstWishlist(allCars, wishlistCriteria);
  }, [allCars, wishlistCriteria]);

  // Selected vehicles for batch bidding (up to 4 cars)
  const selectedVehiclesObjects = useMemo(() => {
    return allCars.filter((v) => selectedChassis.includes(v.chassis));
  }, [allCars, selectedChassis]);

  // Primary criteria representation for summary strip
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
      if (selectedListingType !== "all") {
        const type = getVehicleListingType(v);
        if (type !== selectedListingType) return false;
      }
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
      if (selectedCondition !== "all") {
        const minCond = parseInt(selectedCondition);
        const score = getVehicleConditionScore(v);
        if (score < minCond) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesText =
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.chassis.toLowerCase().includes(q) ||
          v.stockId.toLowerCase().includes(q) ||
          v.year.toString().includes(q);
        if (!matchesText) return false;
      }
      return true;
    });
  }, [allCars, matchedWishlistVehicles, activeScope, selectedListingType, selectedMake, selectedModel, selectedYear, selectedFuel, selectedCondition, searchQuery]);

  // Count of Reserve vs Auction stock in current scope
  const { reserveCount, auctionCount } = useMemo(() => {
    const pool = activeScope === "wishlist" ? matchedWishlistVehicles : allCars;
    let r = 0;
    let a = 0;
    pool.forEach((v) => {
      if (getVehicleListingType(v) === "reserve") r++;
      else a++;
    });
    return { reserveCount: r, auctionCount: a };
  }, [activeScope, matchedWishlistVehicles, allCars]);

  // Sorting
  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    if (sortBy === "best_match") {
      const wishlistChassisSet = new Set(matchedWishlistVehicles.map((v) => v.chassis));
      return list.sort((a, b) => {
        const aWishlist = wishlistChassisSet.has(a.chassis) ? 10000 : 0;
        const bWishlist = wishlistChassisSet.has(b.chassis) ? 10000 : 0;
        const aMargin = getEstimatedNZRetailPrice(a).grossMargin || 0;
        const bMargin = getEstimatedNZRetailPrice(b).grossMargin || 0;
        const aGrade = parseFloat(a.grade) || 3.5;
        const bGrade = parseFloat(b.grade) || 3.5;
        const aScore = aWishlist + aMargin + (aGrade * 500) + ((a.year - 2010) * 100) - (a.kms / 200);
        const bScore = bWishlist + bMargin + (bGrade * 500) + ((b.year - 2010) * 100) - (b.kms / 200);
        return bScore - aScore;
      });
    }
    if (sortBy === "condition_desc") {
      return list.sort((a, b) => getVehicleConditionScore(b) - getVehicleConditionScore(a));
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
    if (sortBy === "year_asc") {
      return list.sort((a, b) => a.year - b.year);
    }
    if (sortBy === "kms_asc") {
      return list.sort((a, b) => a.kms - b.kms);
    }
    if (sortBy === "stockid") {
      return list.sort((a, b) => a.stockId.localeCompare(b.stockId, undefined, { numeric: true }));
    }
    return list;
  }, [filteredVehicles, sortBy, matchedWishlistVehicles]);

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
    setSelectedListingType("all");
    setSelectedMake("all");
    setSelectedModel("all");
    setSelectedYear("all");
    setSelectedFuel("all");
    setSelectedCondition("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ─── Page Title & Subtitle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111C2D] tracking-tight flex items-center gap-3">
            <span>
              {activeScope === "wishlist"
                ? `${matchedWishlistVehicles.length} Matching Vehicles`
                : "Find Vehicles at Auction"}
            </span>
            {activeScope === "wishlist" && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#E11D48] border border-rose-200 shadow-2xs">
                Wishlist Matches
              </span>
            )}
          </h1>
        </div>

        {/* Top Scope Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => {
              setActiveScope("wishlist");
              setCurrentPage(1);
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.set("tab", "wishlist");
                window.history.replaceState({}, "", url.toString());
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeScope === "wishlist"
              ? "bg-[#E11D48] text-white border-[#E11D48] shadow-sm shadow-rose-950/20"
              : "bg-white text-[#111827] border-[#CBD5E1] hover:text-[#111C2D] hover:bg-rose-50/50"
              }`}
          >
            <Heart size={15} className={activeScope === "wishlist" ? "fill-white" : "text-[#E11D48]"} />
            <span>Matching Vehicles ({matchedWishlistVehicles.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveScope("all");
              setCurrentPage(1);
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.set("tab", "all");
                window.history.replaceState({}, "", url.toString());
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeScope === "all"
              ? "bg-[#E11D48] hover:bg-[#BE123C] text-white border-[#E11D48] shadow-md shadow-rose-950/40 transition-all flex items-center gap-2"
              : "bg-white text-[#64748B] border-[#CBD5E1] hover:text-[#111C2D] hover:bg-[#F8FAFC]"
              }`}
          >
            <Car size={15} />
            <span>All Auction Stock ({allCars.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Active Wishlist Requirements Strip (Shown under Matching Vehicles tab) ─── */}
      {activeScope === "wishlist" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E11D48] border border-rose-100 flex items-center justify-center shrink-0">
              <Heart size={20} className="fill-[#E11D48]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E11D48]">
                  Active Wishlist Requirements
                </span>
                <span className="text-[11px] text-[#64748B]">
                  · Live matching Japan auction inventory
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#111C2D] mt-1">
                <span>
                  <strong className="text-[#64748B] font-normal">Make:</strong>{" "}
                  {primaryCriteria?.make || "Toyota"}
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span>
                  <strong className="text-[#64748B] font-normal">Model:</strong>{" "}
                  {primaryCriteria?.model || "Aqua / C-HR"}
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span>
                  <strong className="text-[#64748B] font-normal">Year:</strong>{" "}
                  {primaryCriteria?.yearFrom && primaryCriteria.yearFrom > 2013
                    ? `${primaryCriteria.yearFrom} or newer`
                    : "2014 or newer"}
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span>
                  <strong className="text-[#64748B] font-normal">Kilometres:</strong>{" "}
                  {primaryCriteria?.maxKms && primaryCriteria.maxKms < 100000
                    ? `Under ${primaryCriteria.maxKms.toLocaleString("en-US")} km`
                    : "Under 90,000 km"}
                </span>
                <span className="text-[#CBD5E1]">•</span>
                <span>
                  <strong className="text-[#64748B] font-normal">Budget:</strong>{" "}
                  {primaryCriteria?.maxBudget
                    ? `Up to NZ$${primaryCriteria.maxBudget.toLocaleString("en-US")}`
                    : "Up to NZ$25,000"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWishlistModalOpen(true)}
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#111C2D] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-[#94A3B8] shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Edit Wishlist</span>
          </button>
        </div>
      )}

      {/* ─── Filter Bar (Included in both All Stock and Wishlist modes) ─── */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
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

          {/* Condition (1-10) */}
          <div>
            <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
              Condition
            </label>
            <div className="relative">
              <select
                value={selectedCondition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] appearance-none pr-8 cursor-pointer"
              >
                <option value="all">Any Condition</option>
                <option value="10">10 / 10 (Pristine / Mint)</option>
                <option value="9">9+ / 10 (Excellent)</option>
                <option value="8">8+ / 10 (Very Good)</option>
                <option value="7">7+ / 10 (Good)</option>
                <option value="6">6+ / 10 (Fair)</option>
                <option value="5">5+ / 10 (Average)</option>
                <option value="4">4+ / 10 (Moderate)</option>
                <option value="3">3+ / 10 (Needs Work)</option>
                <option value="2">2+ / 10 (Rough)</option>
                <option value="1">1+ / 10 (Project)</option>
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
              <span>{activeScope === "wishlist" ? "Filter Matches" : "Search Stock"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* ─── Results Header & Sorter Bar ─── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-[15px] font-bold text-[#111C2D]">
              {activeScope === "wishlist"
                ? `${totalItems} Matching Vehicles`
                : `${totalItems} Vehicles Available`}
            </span>
            {(selectedListingType !== "all" || selectedMake !== "all" || selectedModel !== "all" || selectedYear !== "all" || selectedFuel !== "all" || selectedCondition !== "all" || searchQuery) && (
              <button
                onClick={resetFilters}
                className="ml-3 text-xs text-[#E11D48] hover:underline font-semibold cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Quick Listing Type Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSelectedListingType("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedListingType === "all"
                ? "bg-white text-[#111C2D] shadow-xs"
                : "text-[#64748B] hover:text-[#111C2D]"
                }`}
            >
              All ({activeScope === "wishlist" ? matchedWishlistVehicles.length : allCars.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedListingType("reserve");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedListingType === "reserve"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 hover:text-emerald-900"
                }`}
            >
              <Clock size={12} />
              <span> Reserve ({reserveCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedListingType("auction");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedListingType === "auction"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-700 hover:text-blue-900"
                }`}
            >
              <Gavel size={12} />
              <span>Auction ({auctionCount})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="font-medium hidden sm:inline">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#111C2D] outline-none focus:border-[#E11D48] pr-7 cursor-pointer shadow-2xs"
              >
                <option value="best_match">Best Match</option>
                <option value="condition_desc">Condition: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Year: Newest First</option>
                <option value="year_asc">Year: Oldest First</option>
                <option value="kms_asc">Lowest Mileage</option>
                <option value="stockid">Stockid</option>
              </select>

            </div>
          </div>

          {/* View Toggles (Grid / List) */}
          <div className="flex items-center p-1 bg-white border border-[#CBD5E1] rounded-xl shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid"
                ? "bg-[#0F1B2E] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#111C2D]"
                }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "list"
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
            const isSelected = selectedChassis.includes(vehicle.chassis);
            const uniqueId = encodeURIComponent(vehicle.chassis);
            const listingType = getVehicleListingType(vehicle);
            const isReserve = listingType === "reserve";

            return (
              <div
                key={vehicle.chassis + vehicle.stockId + index}
                className={`bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group border relative ${isSelected
                  ? "border-[#E11D48] ring-2 ring-[#E11D48]/30 shadow-md shadow-rose-950/10"
                  : "border-slate-200/90"
                  }`}
              >
                {/* ─── Clean Image Container ─── */}
                <div className="relative aspect-[16/10] w-full bg-[#F1F5F9] overflow-hidden">
                  <Link href={`/vehicles/${uniqueId}?type=${listingType}`} className="block w-full h-full">
                    <img
                      src={photoUrl}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </Link>

                  {/* Batch Bid Select Checkbox (Top Left - Up to 4 cars) */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSelectVehicle(e, vehicle.chassis)}
                    className={`absolute top-3 left-3 z-10 h-8 px-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md backdrop-blur-md ${isSelected
                      ? "bg-[#E11D48] text-white ring-2 ring-white scale-102"
                      : "bg-black/50 text-white/90 hover:text-white hover:bg-black/70 border border-white/20"
                      }`}
                    title={
                      isSelected
                        ? "Selected for batch bidding (click to remove)"
                        : selectedChassis.length >= 4
                          ? "Maximum 4 vehicles can be selected for batch bid"
                          : "Select to place bid together (up to 4 cars)"
                    }
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${isSelected ? "bg-white text-[#E11D48] border-white" : "border-white/70"
                        }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3.5} />}
                    </div>
                    <span className="text-[11px] font-bold">
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </button>

                  {/* Differentiated Type Pill on Image */}
                  <div className="absolute top-3 right-12 z-10">
                    {isReserve ? (
                      <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold bg-emerald-600/95 text-white backdrop-blur-md shadow-sm border border-emerald-400/40 flex items-center gap-1">
                        <Clock size={11} />
                        <span>Reserve</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold bg-blue-600/95 text-white backdrop-blur-md shadow-sm border border-blue-400/40 flex items-center gap-1">
                        <Gavel size={11} />
                        <span>Auction</span>
                      </span>
                    )}
                  </div>

                  {/* Minimal Watchlist Button (Top Right) */}
                  <button
                    onClick={(e) => handleToggleWatchlist(e, vehicle)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-[#64748B] hover:text-[#E11D48] transition-colors z-10 cursor-pointer"
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
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#94A3B8] font-mono font-semibold">
                          Stockid #{vehicle.stockId}
                        </span>
                        {/* Differentiated Card Type Badge */}
                        {isReserve ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Clock size={10} className="text-emerald-600" />
                            Enquire / Reserve
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                            <Gavel size={10} className="text-blue-600" />
                            Auction / Bid
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        Condition {getVehicleConditionScore(vehicle)}/10
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/vehicles/${uniqueId}?type=${listingType}`} className="hover:text-[#E11D48] transition-colors block">
                      <h3 className="text-[16px] font-bold text-[#111C2D] truncate hover:text-[#E11D48]">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                    </Link>

                    {/* Single Clean Specs Line */}
                    <p className="text-xs text-[#64748B] mt-1.5 font-medium truncate">
                      {formatSpecsLine(vehicle)}
                    </p>
                  </div>

                  {/* Neutral Pricing: Landed Cost & NZ Market Indicator */}
                  <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-[#8899A6] font-semibold uppercase tracking-wider flex items-center gap-1">
                        <span>Landed Cost</span>
                        <span className="text-[10px] font-mono text-slate-400">({isReserve ? "Fixed" : "Guide"})</span>
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

                  {/* Action Button: Single CTA [ View Details ] in brand color */}
                  <div className="mt-3.5">
                    <Link
                      href={`/vehicles/${uniqueId}?type=${listingType}`}
                      className="w-full py-2.5 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 text-center cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View — Simplified */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden divide-y divide-[#F1F5F9]">
          {currentVehicles.map((vehicle, index) => {
            const photoUrl = getVehiclePhoto(vehicle);
            const landed = calculateLandedCost(vehicle.priceFob);
            const estimatedNz = getEstimatedNZRetailPrice(vehicle);
            const isWatchlisted = watchlistIds.includes(vehicle.chassis);
            const isSelected = selectedChassis.includes(vehicle.chassis);
            const uniqueId = encodeURIComponent(vehicle.chassis);
            const listingType = getVehicleListingType(vehicle);
            const isReserve = listingType === "reserve";

            return (
              <div
                key={vehicle.chassis + vehicle.stockId + index}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isSelected ? "bg-rose-50/40" : "hover:bg-[#F8FAFC]"
                  }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSelectVehicle(e, vehicle.chassis)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${isSelected
                      ? "bg-[#E11D48] text-white border-[#E11D48] shadow-xs"
                      : "bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 border-slate-200"
                      }`}
                    title={
                      isSelected
                        ? "Selected for batch bidding"
                        : selectedChassis.length >= 4
                          ? "Maximum 4 vehicles can be selected"
                          : "Select to bid with batch (up to 4 cars)"
                    }
                  >
                    {isSelected ? <Check size={15} strokeWidth={3} /> : <div className="w-3.5 h-3.5 rounded-xs border-2 border-slate-400" />}
                  </button>

                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={photoUrl}
                      alt={vehicle.model}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      {isReserve ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-600/90 text-white backdrop-blur-xs flex items-center gap-0.5">
                          <Clock size={8} /> Reserve
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-600/90 text-white backdrop-blur-xs flex items-center gap-0.5">
                          <Gavel size={8} /> Auction
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link href={`/vehicles/${uniqueId}?type=${listingType}`} className="hover:text-[#E11D48]">
                        <h3 className="text-base font-bold text-[#111C2D] truncate hover:text-[#E11D48]">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                      </Link>
                      {isReserve ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          <Clock size={10} className="text-emerald-600" />
                          Reserve
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                          <Gavel size={10} className="text-blue-600" />
                          Auction
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 font-medium">
                      {formatSpecsLine(vehicle)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#94A3B8] font-mono">
                        Stockid #{vehicle.stockId}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Condition {getVehicleConditionScore(vehicle)}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F1F5F9]">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-[#8899A6] font-semibold uppercase">Landed Cost ({isReserve ? "Fixed" : "Guide"})</div>
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
                      className="p-2 border border-[#CBD5E1] rounded-xl hover:bg-slate-50 text-[#64748B] transition-colors cursor-pointer"
                      title="Watchlist"
                    >
                      <Heart
                        size={16}
                        className={isWatchlisted ? "fill-[#E11D48] text-[#E11D48]" : ""}
                      />
                    </button>
                    <Link
                      href={`/vehicles/${uniqueId}?type=${listingType}`}
                      className="px-4 py-2 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 shrink-0"
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
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${isActive
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
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === totalPages
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

      {/* ─── Floating Toast Notification ─── */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0A1322] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Floating Multi-Car Batch Bidding Action Dock (Up to 4 Cars) ─── */}
      {selectedChassis.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#0A1322]/95 backdrop-blur-md border border-[#1B2A42] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-8 duration-300 ring-1 ring-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex -space-x-2.5 overflow-hidden shrink-0">
              {selectedVehiclesObjects.filter(Boolean).map((sv) => (
                <img
                  key={sv.chassis}
                  src={getVehiclePhoto(sv)}
                  alt={sv.model}
                  className="inline-block w-10 h-10 rounded-xl ring-2 ring-[#0A1322] object-cover bg-slate-800"
                  title={`${sv.year} ${sv.make} ${sv.model}`}
                />
              ))}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  {selectedChassis.length} of 4 Cars Selected
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Bid
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 truncate">
                Submit auction proxy bids together to USS & Heiwa Japan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedChassis([])}
              className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setBatchModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <Gavel size={15} />
              <span>Place Batch Bids ({selectedChassis.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Batch Bidding Modal (Up to 4 Cars Together) ─── */}
      <BatchBiddingModal
        isOpen={batchModalOpen}
        vehicles={selectedVehiclesObjects}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={() => {
          setSelectedChassis([]);
        }}
      />

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

      {/* ─── Enquire / Reserve Vehicle Modal ─── */}
      {enquiryVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase text-[#E11D48] tracking-widest">
                    Direct Heiwa Japan Allocation
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-[#111827] mt-0.5">
                  Enquire / Reserve Vehicle
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Lock in a 24-hour auction reservation or request inspector verification.
                </p>
              </div>
              <button
                onClick={() => setEnquiryVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {enquirySuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={26} />
                  </div>
                  <h4 className="text-base font-extrabold text-emerald-900">
                    Reservation & Enquiry Received!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                    Your request for <strong>{enquiryVehicle.year} {enquiryVehicle.make} {enquiryVehicle.model}</strong> (Stockid #{enquiryVehicle.stockId}) has been logged. An AutoHub Japanese auction specialist will contact Auckland Auto Group within 15 minutes.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => setEnquiryVehicle(null)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Done
                    </button>
                    <Link
                      href={`/vehicles/${encodeURIComponent(enquiryVehicle.chassis)}`}
                      className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all"
                    >
                      View Vehicle Details
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Vehicle Mini Card */}
                  <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <img
                      src={getVehiclePhoto(enquiryVehicle)}
                      alt={enquiryVehicle.model}
                      className="w-16 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#111827] truncate">
                          {enquiryVehicle.year} {enquiryVehicle.make} {enquiryVehicle.model}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                          Grade {enquiryVehicle.grade || "4.0"}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono mt-0.5 flex items-center gap-2">
                        <span>Stockid #{enquiryVehicle.stockId}</span>
                        <span>·</span>
                        <span>{enquiryVehicle.chassis}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dealer Info */}
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
                        placeholder="+64 21 000 0000"
                        defaultValue="+64 21 582 9104"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notes / Target FOB Max (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={enquiryNotes}
                      onChange={(e) => setEnquiryNotes(e.target.value)}
                      placeholder="e.g. Please confirm hybrid battery SOH or reserve for auction session tomorrow"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#E11D48] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEnquiryVehicle(null)}
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

      {/* ─── Single Vehicle Auction Quick Bid Modal ─── */}
      {bidVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-blue-50/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 tracking-widest">
                    Live Japan Auction Proxy Bidding
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-[#111827] mt-0.5">
                  Submit Auction Proxy Bid
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  USS Tokyo Japan · Enter your maximum target FOB bid.
                </p>
              </div>
              <button
                onClick={() => setBidVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {bidSuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={26} />
                  </div>
                  <h4 className="text-base font-extrabold text-emerald-900">
                    Auction Proxy Bid Submitted!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                    Your proxy bid of <strong>¥{bidAmountJpy.toLocaleString("en-US")}</strong> for <strong>{bidVehicle.year} {bidVehicle.make} {bidVehicle.model}</strong> (Stockid #{bidVehicle.stockId}) has been registered for USS Tokyo. You can monitor it under &quot;My Bids&quot;.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => setBidVehicle(null)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Done
                    </button>
                    <Link
                      href={`/vehicles/${encodeURIComponent(bidVehicle.chassis)}?type=auction`}
                      className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all"
                    >
                      View Vehicle Details
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Vehicle Mini Card */}
                  <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <img
                      src={getVehiclePhoto(bidVehicle)}
                      alt={bidVehicle.model}
                      className="w-16 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#111827] truncate">
                          {bidVehicle.year} {bidVehicle.make} {bidVehicle.model}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                          Grade {bidVehicle.grade || "4.0"}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono mt-0.5 flex items-center gap-2">
                        <span>Stockid #{bidVehicle.stockId}</span>
                        <span>·</span>
                        <span>{bidVehicle.chassis}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations */}
                  {(() => {
                    const currentLanded = calculateLandedCost(bidAmountJpy);
                    const est = getEstimatedNZRetailPrice(bidVehicle);
                    const margin = est.retailPrice - currentLanded.totalLanded;
                    const marginPct = Math.round((margin / est.retailPrice) * 100);
                    return (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Auction Guide FOB:</span>
                          <span className="font-bold font-mono text-slate-800">¥{bidVehicle.priceFob.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Calculated Landed Cost (at this bid):</span>
                          <span className="font-bold text-[#E11D48] font-mono">NZ${currentLanded.totalLanded.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-500">Projected Margin vs NZ Market:</span>
                          <span className="font-bold text-emerald-700 font-mono">+NZ${margin.toLocaleString()} ({marginPct}%)</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bid Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Maximum Target Proxy Bid (JPY)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">¥</span>
                      <input
                        type="number"
                        step={10000}
                        value={bidAmountJpy}
                        onChange={(e) => setBidAmountJpy(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-base text-[#111827] focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  {/* Increment quick buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBidAmountJpy((p) => Math.max(100000, p - 20000))}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      -¥20,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidAmountJpy(bidVehicle.priceFob)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidAmountJpy((p) => p + 20000)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      +¥20,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setBidAmountJpy((p) => p + 50000)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      +¥50,000
                    </button>
                  </div>

                  {/* Submit */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBidVehicle(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        placeDealerBid(bidVehicle, bidAmountJpy);
                        setBidSuccess(true);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Gavel size={14} />
                      <span>Submit Proxy Bid</span>
                    </button>
                  </div>
                </>
              )}
            </div>
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
