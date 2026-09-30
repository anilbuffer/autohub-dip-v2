"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  SlidersHorizontal,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Car,
  Filter,
  DollarSign,
  Gauge,
  Calendar,
} from 'lucide-react';
import {
  WishListCriteria,
  getStoredWishlistCriteria,
  saveStoredWishlistCriteria,
  matchVehiclesAgainstWishlist,
} from '@/lib/dealerStore';
import { HEIWA_VEHICLES, getUniqueMakes, getModelsForMake } from '@/lib/heiwaData';

interface WishlistHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
}

export function WishlistButton({ onClick }: { onClick: () => void }) {
  const [criteriaCount, setCriteriaCount] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);

  const refreshCounts = () => {
    const list = getStoredWishlistCriteria();
    const active = list.filter(c => c.make.trim() !== '');
    setCriteriaCount(active.length);
    const matches = matchVehiclesAgainstWishlist(HEIWA_VEHICLES, active);
    setMatchCount(matches.length);
  };

  useEffect(() => {
    refreshCounts();
    const handler = () => refreshCounts();
    window.addEventListener('autohub_dealer_store_change', handler);
    return () => window.removeEventListener('autohub_dealer_store_change', handler);
  }, []);

  return (
    <button
      id="add-update-wishlist-header-btn"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-200 border cursor-pointer select-none ${criteriaCount > 0
          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-xs'
          : 'bg-rose-50/70 text-rose-700 border-rose-200/80 hover:bg-rose-100 shadow-xs'
        }`}
      title="Add / Update Wishlist Criteria"
    >
      <div className="w-5 h-5 rounded-lg bg-[#E11D48] text-white flex items-center justify-center shadow-xs shrink-0">
        <Heart size={12} className="fill-white text-white" />
      </div>
      <span className="font-semibold text-[12px] whitespace-nowrap">Add / Update Wishlist</span>

      {criteriaCount > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E11D48] text-white ml-0.5 shrink-0">
          <span>{criteriaCount}</span>
          <span className="opacity-90 font-normal">| {matchCount} cars</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 ml-0.5 shrink-0">
          + Add
        </span>
      )}
    </button>
  );
}

export default function WishlistHeaderModal({ isOpen, onClose, onApply }: WishlistHeaderModalProps) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<WishListCriteria[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCriteria(getStoredWishlistCriteria());
      setMakes(getUniqueMakes());
    }
  }, [isOpen]);

  useEffect(() => {
    if (criteria.length > 0) {
      const active = criteria.filter(c => c.make.trim() !== '');
      const matches = matchVehiclesAgainstWishlist(HEIWA_VEHICLES, active);
      setMatchCount(matches.length);
    } else {
      setMatchCount(0);
    }
  }, [criteria]);

  if (!isOpen) return null;

  const updateCriteriaRow = (id: string, field: keyof WishListCriteria, value: any) => {
    setCriteria(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, [field]: value };
      if (field === 'make') {
        updated.model = ''; // reset model when make changes
      }
      return updated;
    }));
  };

  const addCriteriaRow = () => {
    if (criteria.length >= 6) return;
    const newRow: WishListCriteria = {
      id: `crit-${Date.now()}`,
      make: 'Toyota',
      model: '',
      yearFrom: 2016,
      yearTo: 2024,
      maxKms: 100000,
      maxBudget: 22000,
    };
    setCriteria(prev => [...prev, newRow]);
  };

  const removeCriteriaRow = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = () => {
    saveStoredWishlistCriteria(criteria);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleApplyToBrowse = () => {
    saveStoredWishlistCriteria(criteria);
    if (onApply) {
      onApply();
    }
    onClose();
    router.push('/browse-vehicles?filter=wishlist');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all animate-fadeIn">
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-[#E8ECF0] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E8ECF0] flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shadow-md shadow-rose-950/20">
              <Heart size={20} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111C2D]">My Buying Wish List</h3>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                  Step 1 of Journey
                </span>
              </div>
              <p className="text-[12px] text-[#536471] mt-0.5">
                Define your vehicle buying criteria to automatically match against Heiwa auction stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8899A6] hover:text-[#111C2D] hover:bg-[#F0F2F5] rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Match Counter Strip */}
        <div className="px-6 py-3 bg-gradient-to-r from-[#182C48] via-[#14243B] to-[#101C2E] text-white flex items-center justify-between border-y border-[#1E3A5F]/50">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-[12px] text-white/90 font-medium">Matching against Heiwa CSV Stock:</span>
            <span className="text-[12px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
              {matchCount} Vehicles Available
            </span>
          </div>
          <button
            onClick={handleApplyToBrowse}
            className="text-[11px] font-semibold text-blue-200 hover:text-white flex items-center gap-1 underline underline-offset-2 transition-colors"
          >
            View matches in Browse <ArrowRight size={12} />
          </button>
        </div>

        {/* Modal Body - Criteria List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {criteria.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-[#E8ECF0] rounded-xl p-8">
              <Car size={36} className="mx-auto text-[#AAB8C2] mb-3" />
              <h4 className="text-sm font-semibold text-[#111C2D]">No Wishlist Criteria Set</h4>
              <p className="text-xs text-[#536471] max-w-sm mx-auto mt-1 mb-4">
                Add criteria like Make, Model, Year, Mileage, and Budget to get instant matches from Japan auctions.
              </p>
              <button
                onClick={addCriteriaRow}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-xl text-xs font-semibold hover:bg-[#BE123C] transition-colors shadow-sm"
              >
                <Plus size={14} /> Add First Criteria
              </button>
            </div>
          ) : (
            criteria.map((item, idx) => {
              const availableModels = item.make ? getModelsForMake(item.make) : [];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#F7F9FA] border border-[#E8ECF0] hover:border-[#D1D5DB] transition-all relative group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-white border border-[#E8ECF0] flex items-center justify-center text-[9px] text-[#111C2D]">
                        {idx + 1}
                      </span>
                      Vehicle Target
                    </span>
                    <button
                      onClick={() => removeCriteriaRow(item.id)}
                      className="text-[#8899A6] hover:text-[#E11D48] p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove criteria"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Make */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#536471] mb-1">Make</label>
                      <select
                        value={item.make}
                        onChange={e => updateCriteriaRow(item.id, 'make', e.target.value)}
                        className="w-full bg-white border border-[#E8ECF0] rounded-lg px-2.5 py-2 text-xs font-medium text-[#111C2D] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                      >
                        <option value="">Any Make</option>
                        {makes.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Model */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#536471] mb-1">Model</label>
                      <select
                        value={item.model}
                        onChange={e => updateCriteriaRow(item.id, 'model', e.target.value)}
                        className="w-full bg-white border border-[#E8ECF0] rounded-lg px-2.5 py-2 text-xs font-medium text-[#111C2D] focus:outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]"
                        disabled={!item.make}
                      >
                        <option value="">All Models ({item.make || 'Select Make'})</option>
                        {availableModels.map(mod => (
                          <option key={mod} value={mod}>{mod}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Range */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#536471] mb-1">Year Range</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={2010}
                          max={2026}
                          value={item.yearFrom}
                          onChange={e => updateCriteriaRow(item.id, 'yearFrom', parseInt(e.target.value) || 2014)}
                          className="w-full bg-white border border-[#E8ECF0] rounded-lg px-2 py-2 text-xs font-medium text-center focus:outline-none focus:border-[#E11D48]"
                        />
                        <span className="text-xs text-[#8899A6]">-</span>
                        <input
                          type="number"
                          min={2010}
                          max={2026}
                          value={item.yearTo}
                          onChange={e => updateCriteriaRow(item.id, 'yearTo', parseInt(e.target.value) || 2024)}
                          className="w-full bg-white border border-[#E8ECF0] rounded-lg px-2 py-2 text-xs font-medium text-center focus:outline-none focus:border-[#E11D48]"
                        />
                      </div>
                    </div>

                    {/* Max Kilometres */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#536471] mb-1">Max Kilometres</label>
                      <select
                        value={item.maxKms}
                        onChange={e => updateCriteriaRow(item.id, 'maxKms', parseInt(e.target.value))}
                        className="w-full bg-white border border-[#E8ECF0] rounded-lg px-2.5 py-2 text-xs font-medium text-[#111C2D] focus:outline-none focus:border-[#E11D48]"
                      >
                        <option value={40000}>Under 40,000 km</option>
                        <option value={60000}>Under 60,000 km</option>
                        <option value={80000}>Under 80,000 km</option>
                        <option value={100000}>Under 100,000 km</option>
                        <option value={130000}>Under 130,000 km</option>
                        <option value={160000}>Under 160,000 km</option>
                      </select>
                    </div>

                    {/* Max Landed Budget (NZD) */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-[#536471]">
                          Max Landed Budget (NZD)
                        </label>
                        <span className="text-xs font-bold text-[#111C2D] font-mono">
                          ${item.maxBudget.toLocaleString("en-US")} NZD
                        </span>
                      </div>
                      <input
                        type="range"
                        min={8000}
                        max={45000}
                        step={1000}
                        value={item.maxBudget}
                        onChange={e => updateCriteriaRow(item.id, 'maxBudget', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#E8ECF0] rounded-lg appearance-none cursor-pointer accent-[#E11D48]"
                      />
                      <div className="flex justify-between text-[10px] text-[#8899A6] mt-1 font-mono">
                        <span>$8,000</span>
                        <span>$25,000</span>
                        <span>$45,000+</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {criteria.length < 6 && (
            <button
              onClick={addCriteriaRow}
              className="w-full py-2.5 border border-dashed border-[#CCD6DD] rounded-xl text-xs font-semibold text-[#536471] hover:text-[#111C2D] hover:border-[#8899A6] hover:bg-[#F7F9FA] transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Add Another Vehicle Criteria
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F7F9FA] border-t border-[#E8ECF0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCriteria([]);
                saveStoredWishlistCriteria([]);
              }}
              className="text-[12px] font-medium text-[#8899A6] hover:text-[#E11D48] transition-colors"
            >
              Clear All
            </button>
            {savedFeedback && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Saved!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111C2D] bg-white border border-[#E8ECF0] hover:bg-[#F0F2F5] transition-colors shadow-xs"
            >
              Save Criteria
            </button>
            <button
              onClick={handleApplyToBrowse}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/20"
            >
              <span>Apply & View Matches</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
