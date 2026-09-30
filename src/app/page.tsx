"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  ChevronDown,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Car,
  Calendar,
  Gauge,
  DollarSign,
  Zap,
} from "lucide-react";
import { getUniqueMakes, getModelsForMake, getYearRange, HEIWA_VEHICLES } from "@/lib/heiwaData";

export interface WishListItem {
  id: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  maxKms: number;
  maxBudget: number;
}

const DEFAULT_ITEM: () => WishListItem = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  make: "",
  model: "",
  yearFrom: 2015,
  yearTo: 2025,
  maxKms: 100000,
  maxBudget: 25000,
});

export default function WishListPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishListItem[]>([DEFAULT_ITEM()]);
  const [isSearching, setIsSearching] = useState(false);

  const makes = getUniqueMakes();
  const yearRange = getYearRange();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("autohub_wishlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
      } catch { /* ignore */ }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("autohub_wishlist", JSON.stringify(items));
  }, [items]);

  const updateItem = (id: string, field: keyof WishListItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      // If make changed, reset model
      if (field === "make") updated.model = "";
      return updated;
    }));
  };

  const addItem = () => {
    if (items.length >= 5) return;
    setItems(prev => [...prev, DEFAULT_ITEM()]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSearch = () => {
    setIsSearching(true);
    // Save to localStorage so the matches page can read it
    localStorage.setItem("autohub_wishlist", JSON.stringify(items));
    setTimeout(() => {
      router.push("/matches");
    }, 600);
  };

  const hasValidItem = items.some(item => item.make !== "");
  
  // Count how many Heiwa vehicles could roughly match
  const estimateMatches = () => {
    let count = 0;
    for (const item of items) {
      if (!item.make) continue;
      count += HEIWA_VEHICLES.filter(v => {
        const makeMatch = v.make.toLowerCase() === item.make.toLowerCase();
        const modelMatch = !item.model || v.model.toLowerCase().includes(item.model.toLowerCase());
        const yearMatch = v.year >= item.yearFrom && v.year <= item.yearTo;
        const kmsMatch = v.kms <= item.maxKms;
        return makeMatch && modelMatch && yearMatch && kmsMatch;
      }).length;
    }
    return count;
  };

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">

        {/* ─── Hero Section ─── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F1419] via-[#1C252D] to-[#2C3640] rounded-2xl p-8 sm:p-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C8102E]/[0.08] blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-[#C8102E]/[0.05] blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#C8102E] flex items-center justify-center shadow-lg shadow-red-900/40">
                <Heart size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  My Wish List
                </h1>
                <p className="text-sm text-white/50 mt-0.5">
                  Define your ideal vehicles • We&apos;ll find the best auction matches
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── How It Works — Horizontal Steps ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: 1, icon: Heart, title: "Set Your Criteria", desc: "Make, model, year range, kms, and budget", active: true },
            { step: 2, icon: Search, title: "View Matches", desc: "See matching Heiwa auction vehicles" },
            { step: 3, icon: DollarSign, title: "Compare NZ Market", desc: "See how each vehicle stacks up in NZ" },
          ].map((s) => (
            <div
              key={s.step}
              className={`relative p-5 rounded-2xl border-2 transition-all ${s.active
                ? 'bg-white border-[#C8102E]/20 shadow-elevated'
                : 'bg-[#F7F9FA] border-[#E8ECF0] hover:border-[#D1D5DB]'
              }`}
            >
              {/* Connector line for non-last items */}
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${s.active
                  ? 'bg-[#C8102E] text-white shadow-md shadow-red-900/30'
                  : 'bg-[#E8ECF0] text-[#8899A6]'
                }`}>
                  {s.step}
                </div>
                <div>
                  <div className={`text-[14px] font-bold ${s.active ? 'text-[#0F1419]' : 'text-[#8899A6]'}`}>
                    {s.title}
                  </div>
                  <div className={`text-[12px] mt-0.5 ${s.active ? 'text-[#536471]' : 'text-[#AAB8C2]'}`}>
                    {s.desc}
                  </div>
                </div>
              </div>
              {/* Active indicator dot */}
              {s.active && (
                <div className="absolute top-3 right-3">
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8102E]/40"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C8102E]"></span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── Wish List Items ─── */}
        <div className="space-y-5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E8ECF0] p-6 sm:p-7 shadow-card card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Item Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C8102E]/10 to-[#C8102E]/5 flex items-center justify-center border border-[#C8102E]/10">
                    <Car size={16} className="text-[#C8102E]" />
                  </div>
                  <div>
                    <span className="text-[15px] font-bold text-[#0F1419]">
                      Vehicle {index + 1}
                    </span>
                    {item.make && (
                      <span className="block text-[12px] text-[#536471] mt-0.5">
                        {item.make} {item.model}
                      </span>
                    )}
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-[#AAB8C2] hover:text-[#C8102E] hover:bg-[#FFF0F1] rounded-xl transition-all"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {/* Make */}
                <div>
                  <label className="text-[11px] font-bold text-[#536471] uppercase tracking-wider block mb-2">
                    Make
                  </label>
                  <div className="relative">
                    <select
                      value={item.make}
                      onChange={(e) => updateItem(item.id, "make", e.target.value)}
                      className="w-full appearance-none bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl px-4 py-3 text-[14px] text-[#0F1419] font-medium outline-none focus:bg-white focus:border-[#C8102E]/40 focus:ring-2 focus:ring-[#C8102E]/10 transition-all cursor-pointer hover:border-[#D1D5DB]"
                    >
                      <option value="">Select Make</option>
                      {makes.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB8C2] pointer-events-none" />
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="text-[11px] font-bold text-[#536471] uppercase tracking-wider block mb-2">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      value={item.model}
                      onChange={(e) => updateItem(item.id, "model", e.target.value)}
                      disabled={!item.make}
                      className="w-full appearance-none bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl px-4 py-3 text-[14px] text-[#0F1419] font-medium outline-none focus:bg-white focus:border-[#C8102E]/40 focus:ring-2 focus:ring-[#C8102E]/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D1D5DB]"
                    >
                      <option value="">Any Model</option>
                      {item.make && getModelsForMake(item.make).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB8C2] pointer-events-none" />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="text-[11px] font-bold text-[#536471] uppercase tracking-wider block mb-2">
                    <Calendar size={10} className="inline mr-1 -mt-0.5" />
                    Year Range
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.yearFrom}
                      onChange={(e) => updateItem(item.id, "yearFrom", parseInt(e.target.value))}
                      className="flex-1 appearance-none bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl px-3 py-3 text-[14px] text-[#0F1419] font-medium outline-none focus:bg-white focus:border-[#C8102E]/40 focus:ring-2 focus:ring-[#C8102E]/10 transition-all"
                    >
                      {Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.min + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-[#AAB8C2] text-xs font-medium">to</span>
                    <select
                      value={item.yearTo}
                      onChange={(e) => updateItem(item.id, "yearTo", parseInt(e.target.value))}
                      className="flex-1 appearance-none bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl px-3 py-3 text-[14px] text-[#0F1419] font-medium outline-none focus:bg-white focus:border-[#C8102E]/40 focus:ring-2 focus:ring-[#C8102E]/10 transition-all"
                    >
                      {Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.min + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Max Kilometres */}
                <div>
                  <label className="text-[11px] font-bold text-[#536471] uppercase tracking-wider block mb-2">
                    <Gauge size={10} className="inline mr-1 -mt-0.5" />
                    Max Kilometres
                  </label>
                  <div className="relative">
                    <select
                      value={item.maxKms}
                      onChange={(e) => updateItem(item.id, "maxKms", parseInt(e.target.value))}
                      className="w-full appearance-none bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl px-4 py-3 text-[14px] text-[#0F1419] font-medium outline-none focus:bg-white focus:border-[#C8102E]/40 focus:ring-2 focus:ring-[#C8102E]/10 transition-all"
                    >
                      <option value={30000}>Under 30,000 km</option>
                      <option value={50000}>Under 50,000 km</option>
                      <option value={75000}>Under 75,000 km</option>
                      <option value={100000}>Under 100,000 km</option>
                      <option value={150000}>Under 150,000 km</option>
                      <option value={999999}>Any Kilometres</option>
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB8C2] pointer-events-none" />
                  </div>
                </div>

                {/* Max Budget */}
                <div>
                  <label className="text-[11px] font-bold text-[#536471] uppercase tracking-wider block mb-2">
                    <DollarSign size={10} className="inline mr-1 -mt-0.5" />
                    Max Budget (NZD)
                  </label>
                  <div className="relative">
                    <select
                      value={item.maxBudget}
                      onChange={(e) => updateItem(item.id, "maxBudget", parseInt(e.target.value))}
                      className="w-full appearance-none bg-[#F7F9FA] border border-[#E8ECF0] rounded-xl px-4 py-3 text-[14px] text-[#0F1419] font-medium outline-none focus:bg-white focus:border-[#C8102E]/40 focus:ring-2 focus:ring-[#C8102E]/10 transition-all"
                    >
                      <option value={10000}>Up to NZ$10,000</option>
                      <option value={15000}>Up to NZ$15,000</option>
                      <option value={20000}>Up to NZ$20,000</option>
                      <option value={25000}>Up to NZ$25,000</option>
                      <option value={30000}>Up to NZ$30,000</option>
                      <option value={40000}>Up to NZ$40,000</option>
                      <option value={50000}>Up to NZ$50,000</option>
                      <option value={999999}>No Limit</option>
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB8C2] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Add Another + Search Actions ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <button
            onClick={addItem}
            disabled={items.length >= 5}
            className="flex items-center gap-2.5 px-5 py-3 text-[14px] font-semibold text-[#536471] hover:text-[#0F1419] bg-white hover:bg-[#F7F9FA] border-2 border-dashed border-[#D1D5DB] hover:border-[#AAB8C2] rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add Another Vehicle
            <span className="text-[11px] text-[#AAB8C2] font-medium ml-0.5">({items.length}/5)</span>
          </button>

          <button
            onClick={handleSearch}
            disabled={!hasValidItem || isSearching}
            className="group flex items-center gap-3 px-8 py-3.5 bg-[#C8102E] hover:bg-[#A30D24] disabled:bg-[#D1D5DB] text-white font-bold text-[15px] rounded-2xl transition-all shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching Heiwa Inventory…
              </>
            ) : (
              <>
                <Search size={18} />
                Find Matching Vehicles
                {hasValidItem && (
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                    ~{estimateMatches()} matches
                  </span>
                )}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* ─── Info Footer ─── */}
        <div className="bg-gradient-to-r from-[#FFF0F1] to-[#FFF7E6] rounded-2xl border border-[#FFE0E3] p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#C8102E]/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-[#C8102E]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#0F1419]">How matching works</p>
            <p className="text-[13px] text-[#536471] mt-1 leading-relaxed">
              Your wish list is matched against <strong className="text-[#0F1419]">{HEIWA_VEHICLES.filter(v => !['CBR650R', 'CBR250R', 'REBEL 250', 'STREETFIGHTER', 'NINE T SCRAMBLER UNKNOWN'].includes(v.model)).length} vehicles</strong> currently
              listed on Heiwa Auto Japan auction platform. We calculate estimated landed costs including FOB, freight, compliance, and GST,
              then compare against live NZ retail pricing so you can see the full picture before making a sourcing decision.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
