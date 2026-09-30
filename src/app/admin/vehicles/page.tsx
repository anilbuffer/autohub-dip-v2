"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";
import {
  Car,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Heart,
  Sparkles,
  ExternalLink,
  Zap,
  Check,
  Send,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
  Trash2,
  Gauge,
  Fuel,
  ShieldCheck,
  Info,
  Image as ImageIcon,
  Upload,
  Camera,
} from "lucide-react";
import {
  HeiwaVehicle,
  calculateLandedCost,
  LANDED_COST_CONSTANTS,
  getUniqueMakes,
} from "@/lib/heiwaData";
import {
  getAllVehicles,
  addAdminVehicle,
  deleteAdminVehicle,
  getStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
  getVehiclePhoto,
  isCarVehicle,
  getEstimatedNZRetailPrice,
  WishListCriteria,
} from "@/lib/dealerStore";
import { useSyncStore } from "@/lib/syncStore";

export default function AdminVehiclesPage() {
  const { notifyDealersFromAdmin } = useSyncStore();
  const [vehicles, setVehicles] = useState<HeiwaVehicle[]>([]);
  const [wishlists, setWishlists] = useState<WishListCriteria[]>([]);
  const [matchedVehicleKeys, setMatchedVehicleKeys] = useState<Set<string>>(new Set());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState("all");
  const [demandFilter, setDemandFilter] = useState<"all" | "matched" | "high_margin">("all");
  const [notifiedLots, setNotifiedLots] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Add Vehicle Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Photo Modal for existing vehicles
  const [photoEditVehicle, setPhotoEditVehicle] = useState<HeiwaVehicle | null>(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const initialForm = {
    make: "Toyota",
    model: "",
    year: 2020,
    kms: 42000,
    grade: "4.5",
    chassis: "",
    priceFob: 980000,
    cc: 1500,
    fuelType: "H",
    trans: "FAT",
    color: "Pearl White",
    equip: "PS, PW, ABS, Push Start, Reverse Cam, Alloys",
    stockId: "",
    auctionHouse: "USS Tokyo",
    photoUrl: "",
  };
  const [form, setForm] = useState(initialForm);

  const loadVehiclesData = () => {
    const all = getAllVehicles().filter(isCarVehicle);
    setVehicles(all);

    const wl = getStoredWishlistCriteria();
    setWishlists(wl);

    const matches = matchVehiclesAgainstWishlist(all, wl);
    const keySet = new Set(matches.map((v) => `${v.stockId}-${v.chassis}`));
    setMatchedVehicleKeys(keySet);
  };

  useEffect(() => {
    loadVehiclesData();

    const handleStoreChange = () => {
      loadVehiclesData();
    };

    window.addEventListener("autohub_dealer_store_change", handleStoreChange);
    return () => window.removeEventListener("autohub_dealer_store_change", handleStoreChange);
  }, []);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const vKey = `${v.stockId}-${v.chassis}`;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (v.make || "").toLowerCase().includes(q) ||
      (v.model || "").toLowerCase().includes(q) ||
      (v.chassis || "").toLowerCase().includes(q) ||
      (v.stockId || "").toLowerCase().includes(q);

    const matchesMake =
      selectedMake === "all" ||
      (v.make || "").toLowerCase() === selectedMake.toLowerCase();

    const isMatchedDemand = matchedVehicleKeys.has(vKey);
    const { grossMargin } = getEstimatedNZRetailPrice(v);

    if (demandFilter === "matched" && !isMatchedDemand) return false;
    if (demandFilter === "high_margin" && grossMargin < 3500) return false;

    return matchesSearch && matchesMake;
  });

  const totalItems = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const allMakes = ["all", ...getUniqueMakes()];

  const handleNotify = (stockId: string, model: string) => {
    notifyDealersFromAdmin(stockId, model);
    setNotifiedLots((prev) => [...prev, stockId]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert("Image size should be less than 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        if (isEditMode) {
          setEditPhotoUrl(base64);
        } else {
          setForm((prev) => ({ ...prev, photoUrl: base64 }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEditPhoto = (v: HeiwaVehicle) => {
    setPhotoEditVehicle(v);
    setEditPhotoUrl(v.photoUrl || "");
  };

  const handleSaveEditedPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoEditVehicle) return;
    const updatedVehicle: HeiwaVehicle = {
      ...photoEditVehicle,
      photoUrl: editPhotoUrl.trim() || undefined,
    };
    addAdminVehicle(updatedVehicle);
    setSuccessMessage(`Updated photo for ${photoEditVehicle.year} ${photoEditVehicle.make} ${photoEditVehicle.model}!`);
    setPhotoEditVehicle(null);
    loadVehiclesData();
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteVehicle = (stockId: string, chassis: string, makeModel: string) => {
    if (confirm(`Are you sure you want to remove Stockid #${stockId} (${makeModel})?`)) {
      deleteAdminVehicle(stockId, chassis);
      setSuccessMessage(`Stockid #${stockId} successfully deleted.`);
      loadVehiclesData();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim()) {
      alert("Please enter Make and Model");
      return;
    }

    const generatedStockId = form.stockId.trim() || `117${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedChassis = form.chassis.trim() || `${form.model.toUpperCase().slice(0, 4)}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newVehicle: HeiwaVehicle = {
      stockId: generatedStockId,
      chassis: generatedChassis,
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year) || 2020,
      kms: Number(form.kms) || 0,
      grade: form.grade.trim() || "4.0",
      priceFob: Number(form.priceFob) || 800000,
      cc: Number(form.cc) || 1500,
      fuelType: form.fuelType,
      trans: form.trans,
      color: form.color.trim() || "White",
      equip: form.equip.trim(),
      auctionDate: "Active Live Auction Stockid",
      photoUrl: form.photoUrl.trim() || undefined,
    };

    addAdminVehicle(newVehicle);
    setSuccessMessage(`Stockid #${newVehicle.stockId} (${newVehicle.year} ${newVehicle.make} ${newVehicle.model}) successfully added!`);
    setAddModalOpen(false);
    setForm(initialForm);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  // Auto-calculated preview photo based on form state
  const autoMatchedPhoto = getVehiclePhoto({
    stockId: form.stockId || "temp",
    chassis: form.chassis || "temp",
    make: form.make,
    model: form.model || "Aqua",
    year: form.year,
    kms: form.kms,
    grade: form.grade,
    priceFob: form.priceFob,
    cc: form.cc,
    fuelType: form.fuelType,
    trans: form.trans,
    color: form.color,
    equip: form.equip,
  });
  const activePreviewPhoto = form.photoUrl || autoMatchedPhoto;

  // Real-time calculation for modal preview
  const previewLanded = calculateLandedCost(form.priceFob || 500000);
  const previewRetail = Math.round((previewLanded.totalLanded * 1.25) / 100) * 100;
  const previewMargin = previewRetail - previewLanded.totalLanded;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-16 font-sans">
        {/* ─── Page Title & Header Actions ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight flex items-center gap-3">
              <span>Heiwa Auction Vehicles Inventory</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#1E3A5F] border border-blue-200">
                {vehicles.length} Car Lots
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Admin vehicle lot manager & live Heiwa auction synchronization engine.
            </p>
          </div>

          {/* Add Vehicle Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New Vehicle Lot</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ─── Filter & Search Bar ─── */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-soft space-y-4 hover:shadow-soft-md transition-shadow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search make, model, chassis or stock ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#E11D48] focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Quick Segment Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => {
                  setDemandFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${demandFilter === "all"
                  ? "bg-[#1E3A5F] text-white shadow-xs"
                  : "bg-slate-100 text-[#475569] hover:bg-slate-200"
                  }`}
              >
                All Lots ({vehicles.length})
              </button>

              <button
                onClick={() => {
                  setDemandFilter("matched");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${demandFilter === "matched"
                  ? "bg-[#E11D48] text-white shadow-xs"
                  : "bg-rose-50 text-[#E11D48] hover:bg-rose-100"
                  }`}
              >
                <Sparkles size={12} />
                <span>Matched Demand ({matchedVehicleKeys.size})</span>
              </button>

              <button
                onClick={() => {
                  setDemandFilter("high_margin");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${demandFilter === "high_margin"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
              >
                <TrendingUp size={12} />
                <span>High Margin (NZ$3,500+)</span>
              </button>
            </div>
          </div>

          {/* Secondary Make Filter Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9] overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-[#64748B] uppercase tracking-wider shrink-0 pl-1">
              Make:
            </span>
            {allMakes.map((make) => (
              <button
                key={make}
                onClick={() => {
                  setSelectedMake(make);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${selectedMake === make
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-[#475569] hover:bg-slate-200"
                  }`}
              >
                {make === "all" ? "All Makes" : make}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Vehicles Table View ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden hover:shadow-soft-md transition-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vehicle / Details</th>
                  <th className="py-3.5 px-3">Specs / Grade</th>
                  <th className="py-3.5 px-3">FOB (JPY)</th>
                  <th className="py-3.5 px-3">Landed (NZD)</th>
                  <th className="py-3.5 px-3">Est NZ Retail</th>
                  <th className="py-3.5 px-3">Gross Margin</th>
                  <th className="py-3.5 px-4 text-center">Demand Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <Car size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700 text-sm">No vehicles match your search criteria</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your make or search keyword filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedVehicles.map((v) => {
                  const vKey = `${v.stockId}-${v.chassis}`;
                  const isMatched = matchedVehicleKeys.has(vKey);
                  const landed = calculateLandedCost(v.priceFob || 500000);
                  const { retailPrice, grossMargin } = getEstimatedNZRetailPrice(v);
                  const isNotified = notifiedLots.includes(v.stockId);

                  const fuel =
                    v.fuelType === "H"
                      ? "Hybrid"
                      : v.fuelType === "D"
                        ? "Diesel"
                        : v.fuelType === "E"
                          ? "Electric"
                          : "Petrol";

                  return (
                    <tr
                      key={vKey}
                      className={`hover:bg-slate-50/70 transition-colors ${isMatched ? "bg-rose-50/20" : ""
                        }`}
                    >
                      {/* Vehicle & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative group shrink-0">
                            <img
                              src={getVehiclePhoto(v)}
                              alt={`${v.make} ${v.model}`}
                              className="w-14 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleOpenEditPhoto(v)}
                              className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer shadow-xs"
                              title="Edit / Replace Vehicle Photo"
                            >
                              <Camera size={16} />
                            </button>
                            {v.photoUrl && (
                              <span
                                className="absolute -top-1 -right-1 w-4 h-4 bg-[#E11D48] text-white rounded-full flex items-center justify-center text-[9px] font-extrabold shadow-xs border border-white"
                                title="Custom Photo Uploaded"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/vehicles/${v.stockId}-${v.chassis}`}
                              className="font-extrabold text-[#111827] hover:text-[#E11D48] transition-colors block truncate max-w-[200px]"
                            >
                              {v.year} {v.make} {v.model}
                            </Link>
                            <div className="text-[11px] text-[#64748B] font-mono mt-0.5 flex items-center gap-1.5">
                              <span>{v.chassis}</span>
                              <span>·</span>
                              <span>Stockid #{v.stockId}</span>
                              {v.photoUrl && (
                                <span className="text-[10px] text-[#E11D48] font-bold">
                                  · Custom Photo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="py-3.5 px-3 text-[#475569]">
                        <div>
                          <span className="font-semibold text-[#111827]">
                            {(v.kms || 0).toLocaleString()} km
                          </span>
                          <span className="mx-1 text-[#94A3B8]">·</span>
                          <span>Grade {v.grade || "4.0"}</span>
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5 capitalize">
                          {v.color || "white"} · {v.cc > 0 ? `${v.cc}cc` : "EV"} · {fuel}
                        </div>
                      </td>

                      {/* FOB Price JPY */}
                      <td className="py-3.5 px-3 font-mono font-bold text-[#475569]">
                        ¥{(v.priceFob || 0).toLocaleString()}
                      </td>

                      {/* Landed Cost NZD */}
                      <td className="py-3.5 px-3 font-mono font-extrabold text-[#111827]">
                        NZ${(landed.totalLanded || 0).toLocaleString()}
                      </td>

                      {/* Est Retail NZD */}
                      <td className="py-3.5 px-3 font-mono text-[#475569]">
                        NZ${(retailPrice || 0).toLocaleString()}
                      </td>

                      {/* Projected Margin */}
                      <td className="py-3.5 px-3 font-mono font-extrabold text-emerald-700">
                        +NZ${(grossMargin || 0).toLocaleString()}
                      </td>

                      {/* Demand Status Match */}
                      <td className="py-3.5 px-4 text-center">
                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-[#E11D48] border border-rose-200">
                            <Sparkles size={11} />
                            <span>Matches Auckland Auto</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] font-medium">
                            General Auction
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditPhoto(v)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#E11D48] hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Edit Vehicle Photo"
                          >
                            <Camera size={15} />
                          </button>

                          <button
                            onClick={() => handleNotify(v.stockId, `${v.year} ${v.make} ${v.model}`)}
                            disabled={isNotified}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${isNotified
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "hover:bg-slate-100 text-[#1E3A5F]"
                              }`}
                            title="Dispatch match notification to dealers"
                          >
                            {isNotified ? <Check size={16} /> : <Zap size={16} className="text-[#E11D48]" />}
                          </button>

                          <Link
                            href={`/vehicles/${v.stockId}-${v.chassis}`}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors"
                            title="Open Vehicle Details"
                          >
                            <ExternalLink size={16} />
                          </Link>

                          <button
                            onClick={() => handleDeleteVehicle(v.stockId, v.chassis, `${v.year} ${v.make} ${v.model}`)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Vehicle Lot"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>

          {/* ─── Bottom Pagination & Info Bar ─── */}
          <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div className="flex flex-wrap items-center gap-2 font-medium">
              <span>
                Showing <strong className="text-slate-900 font-bold">{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of{" "}
                <strong className="text-slate-900 font-bold">{totalItems}</strong> car auction lots
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span>
                Page <strong className="text-slate-900 font-bold">{safeCurrentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong> (Max 10 / page)
              </span>
              <span className="text-slate-300 hidden md:inline">|</span>
              <span className="text-[11px] text-slate-400 hidden md:inline">
                FX Rate: ¥{LANDED_COST_CONSTANTS.fxRate} / NZD
              </span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft size={15} />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Numbered Page Buttons with Smart Range */}
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (safeCurrentPage > 3) pages.push("...");
                    const start = Math.max(2, safeCurrentPage - 1);
                    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
                    for (let i = start; i <= end; i++) {
                      if (!pages.includes(i)) pages.push(i);
                    }
                    if (safeCurrentPage < totalPages - 2) pages.push("...");
                    if (!pages.includes(totalPages)) pages.push(totalPages);
                  }

                  return pages.map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold select-none text-[11px]">
                          …
                        </span>
                      );
                    }
                    const isCurrent = safeCurrentPage === page;
                    return (
                      <button
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isCurrent
                            ? "bg-[#E11D48] text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={15} />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── ADD VEHICLE MODAL (ADMIN ROLE) ─── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header (Fixed) */}
            <div className="flex items-start justify-between p-6 sm:px-7 sm:py-5 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse"></span>
                  <span className="text-[10.5px] font-extrabold uppercase text-[#E11D48] tracking-widest">
                    Admin Inventory Ingestion
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#111827] mt-0.5">
                  Add New Heiwa Auction Vehicle Lot
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Input Japanese auction inspection data & photo to make it live across dealer sourcing feeds.
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Form with Scrollable Body */}
            <form onSubmit={handleCreateVehicle} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Make */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Make <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={form.make}
                      onChange={(e) => setForm({ ...form, make: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none"
                      required
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Subaru">Subaru</option>
                      <option value="Lexus">Lexus</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Audi">Audi</option>
                      <option value="Tesla">Tesla</option>
                    </select>
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Model Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aqua, Prius, C-HR, Vezel"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none"
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registration Year
                    </label>
                    <input
                      type="number"
                      min={2005}
                      max={2026}
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2020 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none font-mono"
                    />
                  </div>

                  {/* Mileage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Odometer (km)
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={form.kms}
                      onChange={(e) => setForm({ ...form, kms: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none font-mono"
                    />
                  </div>

                  {/* Auction FOB Price (JPY) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      FOB Auction Price (JPY ¥) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step={10000}
                      value={form.priceFob}
                      onChange={(e) => setForm({ ...form, priceFob: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#E11D48] focus:bg-white focus:border-[#E11D48] outline-none font-mono"
                      required
                    />
                  </div>

                  {/* Auction Grade */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Auction Inspection Grade
                    </label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none"
                    >
                      <option value="5.0">5.0 (Pristine Showroom Condition)</option>
                      <option value="4.5">4.5 (Excellent Condition / High Demand)</option>
                      <option value="4.0">4.0 (Good Condition / Standard Clean)</option>
                      <option value="3.5">3.5 (Average Minor Wear)</option>
                      <option value="3.0">3.0 (Fair)</option>
                      <option value="RA">RA / R (Minor Repair History)</option>
                    </select>
                  </div>

                  {/* Chassis / VIN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chassis Code / Frame No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NHP10-2189421"
                      value={form.chassis}
                      onChange={(e) => setForm({ ...form, chassis: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none font-mono"
                    />
                  </div>

                  {/* Stock ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stockid (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={form.stockId}
                      onChange={(e) => setForm({ ...form, stockId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none font-mono"
                    />
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fuel Type
                    </label>
                    <select
                      value={form.fuelType}
                      onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none"
                    >
                      <option value="H">Hybrid (Petrol + Electric)</option>
                      <option value="G">Petrol / Gasoline</option>
                      <option value="D">Diesel</option>
                      <option value="E">100% Pure Electric (EV)</option>
                    </select>
                  </div>

                  {/* Engine CC */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Engine Displacement (cc)
                    </label>
                    <input
                      type="number"
                      step={100}
                      value={form.cc}
                      onChange={(e) => setForm({ ...form, cc: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none font-mono"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Exterior Color
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pearl White, Silver, Black"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none"
                    />
                  </div>

                  {/* Auction House */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Japanese Auction House
                    </label>
                    <select
                      value={form.auctionHouse}
                      onChange={(e) => setForm({ ...form, auctionHouse: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none"
                    >
                      <option value="USS Tokyo">USS Tokyo (Main Block)</option>
                      <option value="USS Yokohama">USS Yokohama</option>
                      <option value="HAA Kobe">HAA Kobe</option>
                      <option value="CAA Chubu">CAA Chubu</option>
                      <option value="TAA Yokohama">TAA Yokohama (Toyota Auction)</option>
                      <option value="MIRIVE">MIRIVE Saitama</option>
                    </select>
                  </div>
                </div>

                {/* ─── Simplified Vehicle Photo Upload Dropzone ─── */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Auction Photo (Optional)
                  </label>
                  {form.photoUrl ? (
                    <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <img
                        src={form.photoUrl}
                        alt="Vehicle preview"
                        className="w-20 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">Custom Photo Attached</div>
                        <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Ready for live lot display</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, photoUrl: "" })}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#E11D48] bg-slate-50/50 hover:bg-rose-50/20 rounded-2xl cursor-pointer transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-rose-200 flex items-center justify-center text-slate-400 group-hover:text-[#E11D48] transition-colors mb-2 shadow-2xs">
                        <Upload size={18} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-[#E11D48] transition-colors">
                        Choose image file from computer
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG, WEBP (auto-matched by model if empty)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Features & Equipment Notes
                  </label>
                  <input
                    type="text"
                    value={form.equip}
                    onChange={(e) => setForm({ ...form, equip: e.target.value })}
                    placeholder="e.g. PS, PW, ABS, Push Start, Reverse Cam, Alloys"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#E11D48] outline-none"
                  />
                </div>

                {/* Real-time Calculation Summary Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Info size={13} className="text-[#E11D48]" />
                    <span>Auto-Calculated Financial Engine Preview</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">AutoHub Landed</span>
                      <span className="font-mono font-extrabold text-sm text-[#E11D48]">
                        NZ${previewLanded.totalLanded.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Est NZ Retail</span>
                      <span className="font-mono font-extrabold text-sm text-slate-900">
                        NZ${previewRetail.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
                      <span className="text-[10px] text-emerald-800 font-bold block uppercase">Est Dealer Margin</span>
                      <span className="font-mono font-extrabold text-sm text-emerald-700">
                        +NZ${previewMargin.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Fixed) */}
              <div className="flex items-center justify-end gap-3 p-4 sm:px-7 sm:py-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Save & Publish Auction Lot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT VEHICLE PHOTO MODAL ─── */}
      {photoEditVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header (Fixed) */}
            <div className="flex items-start justify-between p-5 sm:px-6 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#E11D48] tracking-wider block">
                  Media Asset Manager
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  Update Vehicle Lot Photo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {photoEditVehicle.year} {photoEditVehicle.make} {photoEditVehicle.model} ({photoEditVehicle.chassis})
                </p>
              </div>
              <button
                onClick={() => setPhotoEditVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form with Scrollable Body */}
            <form onSubmit={handleSaveEditedPhoto} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* Active preview */}
                <div className="space-y-1.5">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
                    <img
                      src={editPhotoUrl.trim() || getVehiclePhoto(photoEditVehicle)}
                      alt="Vehicle"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-xs font-mono font-bold">
                        Stockid #{photoEditVehicle.stockId}
                      </span>
                      {editPhotoUrl ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#E11D48] text-white text-[10px] font-bold">
                          New Photo Selected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                          Current Photo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simple Upload Dropzone */}
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-[#E11D48] bg-slate-50/50 hover:bg-rose-50/20 rounded-2xl cursor-pointer transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-rose-200 flex items-center justify-center text-slate-400 group-hover:text-[#E11D48] transition-colors mb-2 shadow-2xs">
                    <Upload size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#E11D48] transition-colors">
                    Choose photo from computer
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG, WEBP (stored locally)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Modal Footer (Fixed) */}
              <div className="flex items-center justify-between p-4 sm:px-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditPhotoUrl("")}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Clear Custom Photo
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoEditVehicle(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all cursor-pointer"
                  >
                    Save Photo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
