"use client";

import React, { useState } from 'react';
import { TOP_WANTED_MODELS, TopModelDemand } from '@/lib/demandIntelligenceData';
import { Users, TrendingUp, Sparkles, Filter } from 'lucide-react';

interface MostWantedChartProps {
  segmentFilter?: string;
}

export default function MostWantedChart({ segmentFilter = 'All' }: MostWantedChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredModels = TOP_WANTED_MODELS.filter(item => {
    if (segmentFilter === 'All') return true;
    if (segmentFilter === 'Hybrid') return item.fuel.includes('Hybrid');
    return item.segment === segmentFilter;
  });

  const maxDemand = Math.max(...TOP_WANTED_MODELS.map(m => m.demandCount), 1);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              Demand Leaderboard
            </span>
            <span className="text-xs text-slate-400 font-medium">Top 10 NZ Dealer Preferences</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Most-Wanted Vehicle Models
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Aggregated units wanted across active wish lists and reservation requests.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Users size={14} className="text-blue-600" />
            <span>142 Dealers Polled</span>
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart List */}
      <div className="pt-5 space-y-3.5">
        {filteredModels.map((model, idx) => {
          const widthPct = Math.round((model.demandCount / maxDemand) * 100);
          const isHovered = hoveredId === model.id;

          return (
            <div
              key={model.id}
              onMouseEnter={() => setHoveredId(model.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer border ${
                isHovered
                  ? 'bg-slate-50/90 border-slate-300 shadow-sm'
                  : 'bg-white border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Rank Badge */}
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 ${
                    idx === 0 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : idx === 1 
                      ? 'bg-slate-200 text-slate-700' 
                      : idx === 2 
                      ? 'bg-amber-50 text-amber-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>

                  <span className="font-bold text-slate-900 text-sm truncate">
                    {model.fullName}
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {model.fuel}
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
                    {model.segment}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="hidden sm:block">
                    <span className="text-xs text-slate-400 font-medium">Dealers: </span>
                    <span className="font-bold text-slate-700">{model.dealersCount}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium sm:hidden">Demand: </span>
                    <span className="font-black text-slate-900 text-sm">{model.demandCount}</span>
                    <span className="text-[11px] text-slate-500 font-medium ml-1">units</span>
                  </div>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: model.color,
                  }}
                />
              </div>

              {/* Micro telemetry on hover */}
              {isHovered && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <span>
                      <strong className="text-slate-900">Avg Days to Sell:</strong> {model.turnDays} days (Trade Me)
                    </span>
                    <span>
                      <strong className="text-slate-900">Avg Dealer Margin:</strong> NZ${model.avgMarginNzd.toLocaleString('en-US')}
                    </span>
                  </div>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    High Retail Liquidity
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
