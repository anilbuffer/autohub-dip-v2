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
  UserPlus,
  Plus,
  Copy,
  X,
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
  getStoredDealers,
  addStoredDealer,
  WishListCriteria,
  DealerBid,
  DealerPurchase,
} from "@/lib/dealerStore";
import { useSyncStore } from "@/lib/syncStore";

const POPULAR_MAKES = [
  "Toyota",
  "Honda",
  "Mazda",
  "Nissan",
  "Subaru",
  "Lexus",
  "Mitsubishi",
  "Suzuki",
  "European",
];

export default function AdminDealersPage() {
  const { notifyDealersFromAdmin } = useSyncStore();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveWishlists, setLiveWishlists] = useState<WishListCriteria[]>([]);
  const [bids, setBids] = useState<DealerBid[]>([]);
  const [purchases, setPurchases] = useState<DealerPurchase[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [notifiedMsg, setNotifiedMsg] = useState<string | null>(null);

  // Add / Invite Dealer Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formTargetVolume, setFormTargetVolume] = useState<number>(15);
  const [formAvgMargin, setFormAvgMargin] = useState<number>(3500);
  const [formMakes, setFormMakes] = useState<string[]>(["Toyota", "Honda"]);
  const [formModels, setFormModels] = useState("Aqua, Fit, Vezel, C-HR");
  const [formSendInvite, setFormSendInvite] = useState(true);

  useEffect(() => {
    setDealers(getStoredDealers());
    setLiveWishlists(getStoredWishlistCriteria());
    setBids(getStoredBids());
    setPurchases(getStoredPurchases());

    const handleStoreChange = () => {
      setDealers(getStoredDealers());
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
    return matchesSearch;
  });

  // Calculate matches for a specific dealer
  const getDealerMatches = (dealerId: number): HeiwaVehicle[] => {
    if (dealerId === 1) {
      // Auckland Auto Group uses live wishlist criteria
      return matchVehiclesAgainstWishlist(HEIWA_VEHICLES, liveWishlists);
    }
    const d = dealers.find((item) => item.id === dealerId);
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

  const toggleMakeSelection = (make: string) => {
    setFormMakes((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]
    );
  };

  const handleCreateDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formContactName.trim()) {
      alert("Please fill in Dealership Name, Contact Name, and Email.");
      return;
    }

    const modelsList = formModels
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const newDealer = addStoredDealer({
      name: formName.trim(),
      location: formLocation.trim() || "Auckland, NZ",
      contactName: formContactName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || "+64 9 000 0000",
      monthlyImportsTarget: Number(formTargetVolume) || 12,
      avgMargin: Number(formAvgMargin) || 3500,
      activeOpportunities: 18,
      priorityBuys: 3,
      preferences: {
        makes: formMakes.length > 0 ? formMakes : ["Toyota", "Honda"],
        models: modelsList.length > 0 ? modelsList : ["Aqua", "Fit"],
        yearRange: "2016 – 2024",
        maxKm: 90000,
        fuelTypes: ["Hybrid", "Petrol"],
        targetRetail: "NZ$16,000 – NZ$32,000",
        targetMargin: `NZ$${(Number(formAvgMargin) || 3500).toLocaleString()}+`,
      },
    });

    setIsInviteModalOpen(false);
    setNotifiedMsg(
      formSendInvite
        ? `Invitation dispatched to ${newDealer.email} with AutoHub DIP credentials & Heiwa feed link`
        : `Successfully added ${newDealer.name} to registered dealer network`
    );
    setTimeout(() => setNotifiedMsg(null), 4000);

    // Reset form
    setFormName("");
    setFormLocation("");
    setFormContactName("");
    setFormEmail("");
    setFormPhone("");
    setFormMakes(["Toyota", "Honda"]);
    setFormModels("Aqua, Fit, Vezel, C-HR");
  };

  const handleCopyInviteLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `https://autohub.co.nz/invite/dealer?ref=dip_admin_${Date.now()}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white text-xs font-bold shadow-md shadow-rose-950/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Invite Dealer</span>
            </button>
          </div>
        </div>

        {/* ─── Notification Alert Toast ─── */}
        {notifiedMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{notifiedMsg}</span>
          </div>
        )}

        {/* ─── Filters & Search ─── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dealership, location, or contact..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#111827] placeholder:text-[#94A3B8] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
            />
          </div>

          <div className="text-xs font-bold text-[#64748B] flex items-center gap-1.5 self-start sm:self-auto">
            <span>Showing</span>
            <span className="text-[#111827]">{filteredDealers.length}</span>
            <span>of</span>
            <span className="text-[#111827]">{dealers.length}</span>
            <span>Dealers</span>
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
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden ${
                  isAucklandAuto
                    ? "border-[#E11D48]/50 ring-2 ring-[#E11D48]/15"
                    : "border-slate-200/90 hover:border-[#1E3A5F]/40"
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
                    className="text-xs font-bold text-[#1E3A5F] hover:text-[#152740] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full Profile</span>
                    <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => handleQuickNotify(d.name)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#1E3A5F] text-[#1E3A5F] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-[#111827]">
                    {selectedDealer.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {selectedDealer.location} · Registered NZ Motor Trader
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDealer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
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
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
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

        {/* ─── Add / Invite Dealer Modal ─── */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden">
              {/* Fixed Header */}
              <div className="flex items-start justify-between border-b border-[#F1F5F9] p-6 sm:px-8 sm:py-5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] text-white flex items-center justify-center font-bold shadow-md shadow-rose-950/20">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#111827]">
                      Invite New Motor Trader
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Register dealership profile and dispatch DIP platform access credentials
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateDealer} className="flex flex-col flex-1 min-h-0">
                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:px-8 space-y-5">
                {/* Dealership Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1.5">
                      Dealership Legal Trade Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Wellington City Motors"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111827] mb-1.5">
                        Location / Yard Region *
                      </label>
                      <input
                        type="text"
                        required
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="e.g. Lower Hutt, Wellington"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111827] mb-1.5">
                        Primary Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={formContactName}
                        onChange={(e) => setFormContactName(e.target.value)}
                        placeholder="e.g. James Anderson"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#111827] mb-1.5">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="e.g. james@wellingtonmotors.co.nz"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111827] mb-1.5">
                        Phone / Direct Line
                      </label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="e.g. +64 4 568 2200"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Sourcing Preferences */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-2">
                      Target Japanese Auction Makes
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_MAKES.map((make) => {
                        const isSelected = formMakes.includes(make);
                        return (
                          <button
                            type="button"
                            key={make}
                            onClick={() => toggleMakeSelection(make)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#1E3A5F] text-white shadow-xs"
                                : "bg-white border border-slate-200 text-[#475569] hover:bg-slate-100"
                            }`}
                          >
                            {isSelected ? `✓ ${make}` : `+ ${make}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#111827] mb-1.5">
                      Target Models (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formModels}
                      onChange={(e) => setFormModels(e.target.value)}
                      placeholder="e.g. Aqua, Fit, Vezel, C-HR, CX-5"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                        Monthly Target Units
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formTargetVolume}
                        onChange={(e) => setFormTargetVolume(Number(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-[#111827] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                        Target Margin / Unit (NZD)
                      </label>
                      <input
                        type="number"
                        step={250}
                        value={formAvgMargin}
                        onChange={(e) => setFormAvgMargin(Number(e.target.value) || 2500)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-[#111827] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dispatch & Quick Link Options */}
                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-[#334155] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSendInvite}
                      onChange={(e) => setFormSendInvite(e.target.checked)}
                      className="w-4 h-4 rounded text-[#E11D48] accent-[#E11D48] focus:ring-[#E11D48]"
                    />
                    <span>
                      Automatically dispatch email invite with portal access credentials
                    </span>
                  </label>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    <div className="truncate mr-2">
                      <span className="text-[10px] font-bold uppercase text-[#64748B] block">
                        Direct Dealer Invitation Link
                      </span>
                      <span className="font-mono text-[#1E3A5F] text-[11px] truncate block">
                        https://autohub.co.nz/invite/dealer?ref=dip_onboard
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-[#111827] transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                    >
                      {copiedLink ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                </div>

                {/* Form Buttons (Fixed Footer) */}
                <div className="flex items-center justify-end gap-3 p-4 sm:px-8 bg-slate-50 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#475569] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white text-xs font-bold shadow-md shadow-rose-950/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Save & Send Invite</span>
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
