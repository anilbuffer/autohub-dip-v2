"use client";

import React from 'react';
import { X, Database, Info, Search, Heart, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataSourceModal({ isOpen, onClose }: DataSourceModalProps) {
  if (!isOpen) return null;

  const dataStreams = [
    {
      title: "1. Dealer Wish Lists",
      icon: Heart,
      color: "text-rose-500 bg-rose-50 border-rose-200",
      description: "Direct buying criteria actively configured by 142 NZ dealerships. Includes target makes, models, year ranges, maximum mileage, fuel types, and landed budget ceilings.",
      metric: "318 Active Profiles"
    },
    {
      title: "2. Dealer Searches & 'Ask AI' Queries",
      icon: Search,
      color: "text-blue-500 bg-blue-50 border-blue-200",
      description: "Real-time search telemetry and natural language questions submitted to the AutoHub DIP Assistant (e.g., 'Find me 2019+ hybrid SUVs with strong margin potential').",
      metric: "4,860 Searches / Month"
    },
    {
      title: "3. Vehicles Shortlisted & Reservation Requests",
      icon: Sparkles,
      color: "text-purple-500 bg-purple-50 border-purple-200",
      description: "Pre-auction lot watchlists, proxy bid authorizations, and unfulfilled reservation requests when auction bids were outcompeted in previous 30 days.",
      metric: "1,120 Unmet Demand Units"
    },
    {
      title: "4. NZ Market Velocity & Price Trends",
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
      description: "Aggregated Trade Me Motors and independent dealer yard sales velocity (median days listed until sold) cross-referenced against realized gross retail margins.",
      metric: "14.2 Days Median Turn"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent top banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E11D48] via-[#0F1B2E] to-blue-950"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Demand Intelligence Pipeline
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Where does AutoHub DIP sourcing data come from?
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Streams */}
        <div className="py-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {dataStreams.map((stream, idx) => {
            const Icon = stream.icon;
            return (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${stream.color}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{stream.title}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {stream.metric}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-9">
                  {stream.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Synced in real-time with Heiwa Auto Japan procurement engine.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C48] text-white rounded-xl font-bold text-xs transition-colors self-end sm:self-auto"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
