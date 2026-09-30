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

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#DF2B44]/10 flex items-center justify-center">
              <Heart size={16} className="text-[#DF2B44]" />
            </div>
            <h1 className="text-2xl font-bold text-[#10100E] tracking-tight">
              My Wish List
            </h1>
          </div>
          <p className="text-sm text-neutral-500 ml-10">
            Tell us what vehicles you&apos;re looking for. We&apos;ll match your criteria against
            live Heiwa auction inventory and show you the best options.
          </p>
        </div>

        {/* How It Works — Horizontal Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: 1, icon: Heart, title: "Set Your Criteria", desc: "Make, model, year range, kms, and budget", active: true },
            { step: 2, icon: Search, title: "View Matches", desc: "See matching Heiwa auction vehicles" },
            { step: 3, icon: DollarSign, title: "Compare NZ Market", desc: "See how each vehicle stacks up in NZ" },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-4 rounded-xl border transition-all ${s.active
                ? 'bg-white border-[#DF2B44]/20 shadow-sm'
                : 'bg-neutral-50/50 border-neutral-200/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${s.active
                  ? 'bg-[#DF2B44] text-white'
                  : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {s.step}
                </div>
                <div>
                  <div className={`text-[13px] font-semibold ${s.active ? 'text-[#10100E]' : 'text-neutral-400'}`}>
                    {s.title}
                  </div>
                  <div className={`text-[11px] ${s.active ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {s.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wish List Items */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#DF2B44]/10 flex items-center justify-center">
                    <Car size={13} className="text-[#DF2B44]" />
                  </div>
                  <span className="text-sm font-semibold text-[#10100E]">
                    Vehicle {index + 1}
                    {item.make && (
                      <span className="text-neutral-400 font-normal ml-2">
                        — {item.make} {item.model}
                      </span>
                    )}
                  </span>
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Make */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    Make
                  </label>
                  <div className="relative">
                    <select
                      value={item.make}
                      onChange={(e) => updateItem(item.id, "make", e.target.value)}
                      className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#10100E] font-medium outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all cursor-pointer"
                    >
                      <option value="">Select Make</option>
                      {makes.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      value={item.model}
                      onChange={(e) => updateItem(item.id, "model", e.target.value)}
                      disabled={!item.make}
                      className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#10100E] font-medium outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">Any Model</option>
                      {item.make && getModelsForMake(item.make).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    <Calendar size={10} className="inline mr-1" />
                    Year Range
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={item.yearFrom}
                      onChange={(e) => updateItem(item.id, "yearFrom", parseInt(e.target.value))}
                      className="flex-1 appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-2.5 text-sm text-[#10100E] font-medium outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all"
                    >
                      {Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.min + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-neutral-300 text-xs">to</span>
                    <select
                      value={item.yearTo}
                      onChange={(e) => updateItem(item.id, "yearTo", parseInt(e.target.value))}
                      className="flex-1 appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-2.5 text-sm text-[#10100E] font-medium outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all"
                    >
                      {Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.min + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Max Kilometres */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    <Gauge size={10} className="inline mr-1" />
                    Max Kilometres
                  </label>
                  <select
                    value={item.maxKms}
                    onChange={(e) => updateItem(item.id, "maxKms", parseInt(e.target.value))}
                    className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#10100E] font-medium outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all"
                  >
                    <option value={30000}>Under 30,000 km</option>
                    <option value={50000}>Under 50,000 km</option>
                    <option value={75000}>Under 75,000 km</option>
                    <option value={100000}>Under 100,000 km</option>
                    <option value={150000}>Under 150,000 km</option>
                    <option value={999999}>Any Kilometres</option>
                  </select>
                </div>

                {/* Max Budget */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    <DollarSign size={10} className="inline mr-1" />
                    Max Budget (NZD)
                  </label>
                  <select
                    value={item.maxBudget}
                    onChange={(e) => updateItem(item.id, "maxBudget", parseInt(e.target.value))}
                    className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-[#10100E] font-medium outline-none focus:bg-white focus:border-[#DF2B44] focus:ring-2 focus:ring-[#DF2B44]/10 transition-all"
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another + Search Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={addItem}
            disabled={items.length >= 5}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-[#10100E] bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} />
            Add Another Vehicle
            <span className="text-[10px] text-neutral-400 ml-1">({items.length}/5)</span>
          </button>

          <button
            onClick={handleSearch}
            disabled={!hasValidItem || isSearching}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#DF2B44] hover:bg-[#c91f38] disabled:bg-neutral-300 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching Heiwa Inventory…
              </>
            ) : (
              <>
                <Search size={16} />
                Find Matching Vehicles
                {hasValidItem && (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ~{estimateMatches()} possible
                  </span>
                )}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Info Footer */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200/60 p-4 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#DF2B44]/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={14} className="text-[#DF2B44]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#10100E]">How matching works</p>
            <p className="text-[12px] text-neutral-500 mt-0.5 leading-relaxed">
              Your wish list is matched against <strong className="text-neutral-700">{HEIWA_VEHICLES.filter(v => !['CBR650R', 'CBR250R', 'REBEL 250', 'STREETFIGHTER', 'NINE T SCRAMBLER UNKNOWN'].includes(v.model)).length} vehicles</strong> currently
              listed on Heiwa Auto Japan auction platform. We calculate estimated landed costs including FOB, freight, compliance, and GST,
              then compare against live NZ retail pricing so you can see the full picture before making a sourcing decision.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
