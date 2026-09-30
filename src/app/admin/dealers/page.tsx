"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";
import {
  Users,
  Building2,
  MapPin,
  Phone,
  Mail,
  Heart,
  Car,
  Search,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2,
  Send,
  Zap,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { DEALERS, Dealer } from "@/lib/data";
import {
  HEIWA_VEHICLES,
  HeiwaVehicle,
  calculateLandedCost,
} from "@/lib/heiwaData";
import {
  getStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
  getStoredBids,
  getStoredPurchases,
  WishListCriteria,
  DealerBid,
  DealerPurchase,
} from "@/lib/dealerStore";
import { useSyncStore } from "@/lib/syncStore";

export default function AdminDealersPage() {
  const { notifyDealersFromAdmin } = useSyncStore();
  const [dealers, setDealers] = useState<Dealer[]>(DEALERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [liveWishlists, setLiveWishlists] = useState<WishListCriteria[]>([]);
  const [bids, setBids] = useState<DealerBid[]>([]);
  const [purchases, setPurchases] = useState<DealerPurchase[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [notifiedMsg, setNotifiedMsg] = useState<string | null>(null);

  useEffect(() => {
    setLiveWishlists(getStoredWishlistCriteria());
    setBids(getStoredBids());
    setPurchases(getStoredPurchases());

    const handleStoreChange = () => {
      setLiveWishlists(getStoredWishlistCriteria());
      setBids(getStoredBids());
      setPurchases(getStoredPurchases());
    };

    window.addEventListener("autohub_dealer_store_change", handleStoreChange);
    return () => window.removeEventListener("autohub_dealer_store_change", handleStoreChange);
  }, []);

  // Filter dealers
  const filteredDealers = dealers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier =
      selectedTier === "all" || d.tier.toLowerCase().includes(selectedTier.toLowerCase());
    return matchesSearch && matchesTier;
  });

  // Calculate matches for a specific dealer
  const getDealerMatches = (dealerId: number): HeiwaVehicle[] => {
    if (dealerId === 1) {
      // Auckland Auto Group uses live wishlist criteria
      return matchVehiclesAgainstWishlist(HEIWA_VEHICLES, liveWishlists);
    }
    const d = DEALERS.find((item) => item.id === dealerId);
    if (!d) return [];
    const crit: WishListCriteria[] = [
      {
        id: `crit-dealer-${d.id}`,
        make: d.preferences.makes[0] || "",
        model: d.preferences.models.join(" / "),
        yearFrom: 2014,
        yearTo: 2024,
        maxKms: d.preferences.maxKm || 100000,
        maxBudget: 35000,
      },
    ];
    return matchVehiclesAgainstWishlist(HEIWA_VEHICLES, crit);
  };

  const handleQuickNotify = (dealerName: string) => {
    notifyDealersFromAdmin("priority-alert", "Priority Japan Auction Match", 1);
    setNotifiedMsg(`Dispatched priority match alert to ${dealerName}`);
    setTimeout(() => setNotifiedMsg(null), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-16 font-sans">
        {/* ─── Page Title & Action Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Dealers Network & Sourcing Profiles
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              "What are dealers looking for?" — Monitor active NZ motor trader profiles, criteria targets, and inventory matches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/wishlists"
              className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#1E3A5F] hover:bg-slate-50 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <Heart size={14} className="text-[#E11D48]" />
              <span>All Wish Lists ({liveWishlists.length + 2})</span>
            </Link>
          </div>
        </div>

        {/* ─── Notification Alert Toast ─── */}
        {notifiedMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{notifiedMsg}</span>
          </div>
        )}

        {/* ─── Filters & Search ─── */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dealership, location, or contact..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap pl-1">
              Tier:
            </span>
            {["all", "platinum", "gold"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  selectedTier === tier
                    ? "bg-[#1E3A5F] text-white shadow-xs"
                    : "bg-slate-100 text-[#475569] hover:bg-slate-200"
                }`}
              >
                {tier === "all" ? "All Dealers" : `${tier} Tier`}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Dealer Cards Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredDealers.map((d) => {
            const matches = getDealerMatches(d.id);
            const isAucklandAuto = d.id === 1;

            return (
              <div
                key={d.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden ${
                  isAucklandAuto
                    ? "border-[#E11D48]/40 ring-2 ring-[#E11D48]/10"
                    : "border-[#E2E8F0] hover:border-[#1E3A5F]/40"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-[#F1F5F9] bg-gradient-to-b from-slate-50/50 to-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-[#111827]">
                            {d.name}
                          </h2>
                          {isAucklandAuto && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#E11D48] text-white">
                              ACTIVE SESSION
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1">
                          <MapPin size={13} className="text-[#94A3B8]" />
                          <span>{d.location}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-[#1E3A5F] border border-blue-200 shrink-0">
                        {d.tier}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="mt-3 pt-3 border-t border-[#F1F5F9] text-xs text-[#475569] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Primary Contact:</span>
                        <span className="font-semibold text-[#111827]">{d.contactName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Email:</span>
                        <span className="font-mono text-[#1E3A5F]">{d.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Phone:</span>
                        <span className="font-mono text-[#111827]">{d.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sourcing Profile & Targets */}
                  <div className="p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                        Target Sourcing Criteria
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {d.preferences.makes.map((make) => (
                          <span
                            key={make}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#111827] text-xs font-bold"
                          >
                            {make}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-[#64748B] mt-2">
                        <strong>Models:</strong> {d.preferences.models.join(", ")}
                      </div>
                    </div>

                    {/* Volume & Margin Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#F1F5F9]">
                      <div className="p-2.5 rounded-xl bg-slate-50">
                        <span className="text-[10px] text-[#64748B] block font-medium">Monthly Target</span>
                        <span className="text-sm font-extrabold text-[#111827] block mt-0.5">
                          {d.monthlyImportsTarget} units
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900">
                        <span className="text-[10px] text-emerald-700 block font-medium">Target Margin</span>
                        <span className="text-sm font-extrabold text-emerald-800 block mt-0.5">
                          NZ${d.avgMargin.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Live Matched Inventory Badge */}
                    <div className="p-3.5 rounded-xl bg-[#0F1B2E] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-[#E11D48]" />
                        <div>
                          <div className="text-xs font-bold">
                            {matches.length} Heiwa Lots Matched
                          </div>
                          <div className="text-[10px] text-[#9AB9D5]">
                            Ready for broker bid outreach
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/admin/vehicles`}
                        className="px-2.5 py-1 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-[11px] font-bold text-white transition-all shrink-0"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedDealer(d)}
                    className="text-xs font-bold text-[#1E3A5F] hover:text-[#152740] flex items-center gap-1"
                  >
                    <span>View Full Profile</span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => handleQuickNotify(d.name)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#1E3A5F] text-[#1E3A5F] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send size={12} className="text-[#E11D48]" />
                    <span>Send Matches</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Detail Modal / Drawer ─── */}
        {selectedDealer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#1E3A5F] px-2.5 py-1 rounded-full border border-blue-200">
                    {selectedDealer.tier}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#111827] mt-2">
                    {selectedDealer.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {selectedDealer.location} · Member since 2024
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDealer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-[#111827]">Contact & Representative</div>
                  <div className="text-[#475569]">
                    Contact: {selectedDealer.contactName} ({selectedDealer.email})
                  </div>
                  <div className="text-[#475569]">Direct Line: {selectedDealer.phone}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-[#111827]">Sourcing Envelope</div>
                  <div className="grid grid-cols-2 gap-2 text-[#475569]">
                    <div>Makes: {selectedDealer.preferences.makes.join(", ")}</div>
                    <div>Year Range: {selectedDealer.preferences.yearRange}</div>
                    <div>Max Kms: {selectedDealer.preferences.maxKm.toLocaleString()} km</div>
                    <div>Target Retail: {selectedDealer.preferences.targetRetail}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedDealer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  href="/admin/wishlists"
                  className="px-4 py-2 rounded-xl bg-[#E11D48] text-xs font-bold text-white hover:bg-[#BE123C]"
                >
                  Manage Wish Lists
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
