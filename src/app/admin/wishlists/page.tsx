"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";
import {
  Heart,
  Car,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  Send,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Filter,
} from "lucide-react";
import { DEALERS } from "@/lib/data";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
} from "@/lib/heiwaData";
import {
  getStoredWishlistCriteria,
  saveStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
  getVehiclePhoto,
  getEstimatedNZRetailPrice,
  WishListCriteria,
} from "@/lib/dealerStore";
import { useSyncStore } from "@/lib/syncStore";

interface ExpandedWishlist extends WishListCriteria {
  dealerId: number;
  dealerName: string;
  dealerLocation: string;
  isLiveSynced?: boolean;
}

export default function AdminWishlistsPage() {
  const { notifyDealersFromAdmin } = useSyncStore();
  const [liveAucklandCriteria, setLiveAucklandCriteria] = useState<WishListCriteria[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [notifiedMap, setNotifiedMap] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("all");

  // New criteria modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDealerId, setNewDealerId] = useState(1);
  const [newMake, setNewMake] = useState("Toyota");
  const [newModel, setNewModel] = useState("Aqua / Prius");
  const [newYearFrom, setNewYearFrom] = useState(2015);
  const [newYearTo, setNewYearTo] = useState(2024);
  const [newMaxKms, setNewMaxKms] = useState(90000);
  const [newMaxBudget, setNewMaxBudget] = useState(24000);

  useEffect(() => {
    setLiveAucklandCriteria(getStoredWishlistCriteria());

    const handleStoreChange = () => {
      setLiveAucklandCriteria(getStoredWishlistCriteria());
    };

    window.addEventListener("autohub_dealer_store_change", handleStoreChange);
    return () => window.removeEventListener("autohub_dealer_store_change", handleStoreChange);
  }, []);

  // Aggregate all wishlists across registered dealers
  const allWishlists: ExpandedWishlist[] = [
    // Auckland Auto Group criteria (live from Dealer store)
    ...liveAucklandCriteria.map((c) => ({
      ...c,
      dealerId: 1,
      dealerName: "Auckland Auto Group",
      dealerLocation: "Penrose, Auckland",
      isLiveSynced: true,
    })),
    // Hamilton Motors criteria
    {
      id: "hamilton-crit-1",
      dealerId: 2,
      dealerName: "Hamilton Motors",
      dealerLocation: "Te Rapa, Hamilton",
      make: "Honda",
      model: "Fit / Vezel / Accord",
      yearFrom: 2016,
      yearTo: 2024,
      maxKms: 85000,
      maxBudget: 28000,
    },
    // Christchurch Prestige criteria
    {
      id: "chch-crit-1",
      dealerId: 3,
      dealerName: "Christchurch Prestige Cars",
      dealerLocation: "Moorhouse Ave, Christchurch",
      make: "Lexus",
      model: "NX / RX / Harrier",
      yearFrom: 2017,
      yearTo: 2024,
      maxKms: 95000,
      maxBudget: 38000,
    },
  ];

  // Filter wishlists
  const filteredWishlists = allWishlists.filter((w) => {
    const matchesSearch =
      w.make.toLowerCase().includes(searchFilter.toLowerCase()) ||
      w.model.toLowerCase().includes(searchFilter.toLowerCase()) ||
      w.dealerName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesDealer =
      dealerFilter === "all" || w.dealerId.toString() === dealerFilter;
    return matchesSearch && matchesDealer;
  });

  const handleNotifyWishlist = (critId: string, dealerName: string, model: string) => {
    notifyDealersFromAdmin(critId, model);
    setNotifiedMap((prev) => ({ ...prev, [critId]: true }));
    setTimeout(() => {
      setNotifiedMap((prev) => ({ ...prev, [critId]: false }));
    }, 4000);
  };

  const handleCreateCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDealerId === 1) {
      // Add directly to Auckland Auto Group live store
      const newCrit: WishListCriteria = {
        id: `crit-${Date.now()}`,
        make: newMake,
        model: newModel,
        yearFrom: Number(newYearFrom),
        yearTo: Number(newYearTo),
        maxKms: Number(newMaxKms),
        maxBudget: Number(newMaxBudget),
      };
      const updated = [...liveAucklandCriteria, newCrit];
      saveStoredWishlistCriteria(updated);
      setLiveAucklandCriteria(updated);
    }
    setAddModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-16 font-sans">
        {/* ─── Page Title & Header Actions ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight flex items-center gap-3">
              <span>Dealer Wish Lists & Live Demand</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-[#E11D48] border border-rose-200">
                {allWishlists.length} Criteria Active
              </span>
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              "What are dealers looking for?" — Aggregated purchasing criteria matched dynamically against live Heiwa Japanese auction inventory.
            </p>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md shadow-rose-950/30 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Sourcing Wishlist</span>
          </button>
        </div>

        {/* ─── Filter Bar ─── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search make, model, or dealer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider pl-1">
              Dealer:
            </span>
            <select
              value={dealerFilter}
              onChange={(e) => setDealerFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#E11D48]"
            >
              <option value="all">All Dealers ({allWishlists.length})</option>
              <option value="1">Auckland Auto Group (Live Sync)</option>
              <option value="2">Hamilton Motors</option>
              <option value="3">Christchurch Prestige</option>
            </select>
          </div>
        </div>

        {/* ─── Wishlists Cards & Live Match Accordion ─── */}
        <div className="space-y-4">
          {filteredWishlists.map((w) => {
            const matches = matchVehiclesAgainstWishlist(HEIWA_VEHICLES, [w]);
            const isExpanded = expandedRow === w.id;
            const isNotified = notifiedMap[w.id];

            return (
              <div
                key={w.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-soft hover:shadow-soft-md overflow-hidden ${
                  isExpanded ? "border-[#1E3A5F] ring-2 ring-[#1E3A5F]/10" : "border-slate-200/90 hover:border-[#CBD5E1]"
                }`}
              >
                {/* Main Summary Header */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-extrabold text-base text-[#111827]">
                        {w.make} {w.model}
                      </span>
                      {w.isLiveSynced && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#E11D48] text-white">
                          LIVE DEALER SYNC
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-[#475569] flex items-center gap-1">
                        <Building2 size={12} className="text-[#1E3A5F]" />
                        {w.dealerName}
                      </span>
                    </div>

                    {/* Criteria Chips */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                      <span>
                        Years: <strong className="text-[#111827]">{w.yearFrom} – {w.yearTo}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Max ODO: <strong className="text-[#111827]">≤ {w.maxKms.toLocaleString()} km</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Max Landed: <strong className="text-[#111827] font-mono">≤ NZ${w.maxBudget.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right side: Matches Count & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
                        Live Matches
                      </div>
                      <div className="text-base font-extrabold text-emerald-700 font-mono">
                        {matches.length} Heiwa Lots
                      </div>
                    </div>

                    <button
                      onClick={() => handleNotifyWishlist(w.id, w.dealerName, `${w.make} ${w.model}`)}
                      disabled={isNotified || matches.length === 0}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isNotified
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : matches.length === 0
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-[#1E3A5F] hover:bg-[#152740] text-white shadow-xs"
                      }`}
                    >
                      {isNotified ? (
                        <>
                          <Check size={14} />
                          <span>Dispatched</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} className="text-amber-400" />
                          <span>Dispatch to Dealer</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedRow(isExpanded ? null : w.id)}
                      className="p-2 rounded-xl text-[#475569] hover:bg-slate-100 transition-colors"
                      title={isExpanded ? "Collapse Matches" : "Expand Matches"}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Matches Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-[#F1F5F9] p-5 space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-bold text-[#111827]">
                        Matching Heiwa Lots for {w.dealerName} ({matches.length})
                      </span>
                      <Link
                        href="/admin/vehicles"
                        className="text-[#E11D48] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Open in Vehicle Sheet</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>

                    {matches.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#64748B] bg-white rounded-xl border border-dashed border-slate-300">
                        No lots in current auction session meet this strict criteria envelope.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matches.slice(0, 6).map((v) => {
                          const landed = calculateLandedCost(v.priceFob);
                          const { grossMargin } = getEstimatedNZRetailPrice(v);

                          return (
                            <div
                              key={v.stockId}
                              className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-[#1E3A5F] transition-all"
                            >
                              <img
                                src={getVehiclePhoto(v)}
                                alt={`${v.make} ${v.model}`}
                                className="w-14 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-[#111827] truncate">
                                  {v.year} {v.make} {v.model}
                                </div>
                                <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                                  <span>{v.kms.toLocaleString()} km</span>
                                  <span>·</span>
                                  <span className="font-mono text-emerald-700 font-bold">
                                    +NZ${grossMargin.toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono font-extrabold text-[#111827]">
                                  NZ${landed.totalLanded.toLocaleString()} landed
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Add Wishlist Criteria Modal ─── */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden">
              {/* Fixed Header */}
              <div className="flex items-start justify-between p-6 sm:px-7 sm:py-5 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-xl font-extrabold text-[#111827]">
                    Add Sourcing Wishlist Criteria
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Define an auction sourcing envelope on behalf of a dealer.
                  </p>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCriteria} className="flex flex-col flex-1 min-h-0">
                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-[#111827] block mb-1">Dealership</label>
                    <select
                      value={newDealerId}
                      onChange={(e) => setNewDealerId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold outline-none focus:border-[#E11D48]"
                    >
                      {DEALERS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#111827] block mb-1">Make</label>
                      <input
                        type="text"
                        value={newMake}
                        onChange={(e) => setNewMake(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:border-[#E11D48]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#111827] block mb-1">Model / Terms</label>
                      <input
                        type="text"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        required
                        placeholder="e.g. Aqua / C-HR"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#111827] block mb-1">Year Range</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={newYearFrom}
                          onChange={(e) => setNewYearFrom(Number(e.target.value))}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono"
                        />
                        <span>to</span>
                        <input
                          type="number"
                          value={newYearTo}
                          onChange={(e) => setNewYearTo(Number(e.target.value))}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#111827] block mb-1">Max Odometer (km)</label>
                      <input
                        type="number"
                        step={5000}
                        value={newMaxKms}
                        onChange={(e) => setNewMaxKms(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#111827] block mb-1">
                      Max Landed Budget (NZD)
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={newMaxBudget}
                      onChange={(e) => setNewMaxBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="flex justify-end gap-3 p-4 sm:px-7 bg-slate-50 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#E11D48] text-xs font-bold text-white hover:bg-[#BE123C] shadow-xs cursor-pointer"
                  >
                    Save Criteria
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
