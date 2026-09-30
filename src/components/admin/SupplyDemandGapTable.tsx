"use client";

import React, { useState, useMemo } from 'react';
import { SUPPLY_DEMAND_GAP, SupplyGapItem } from '@/lib/demandIntelligenceData';
import { 
  Zap, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Search,
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';

interface SupplyDemandGapTableProps {
  onSelectModel?: (modelName: string) => void;
}

type SortField = 'unmetGap' | 'demandUnits' | 'currentStockUnits' | 'coveragePct' | 'avgDaysToSell' | 'avgDealerMarginNzd';

export default function SupplyDemandGapTable({ onSelectModel }: SupplyDemandGapTableProps) {
  const [filterTag, setFilterTag] = useState<'All' | 'Source more' | 'Balanced' | 'Oversupplied'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('unmetGap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const processedItems = useMemo(() => {
    let items = [...SUPPLY_DEMAND_GAP];

    // Filter by recommendation tag
    if (filterTag !== 'All') {
      items = items.filter(item => item.recommendation === filterTag);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.model.toLowerCase().includes(q) || 
        item.make.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
      );
    }

    // Sort
    items.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return items;
  }, [filterTag, searchQuery, sortField, sortDirection]);

  // Coverage progress bar color helper
  const getCoverageBadge = (pct: number) => {
    if (pct < 40) {
      return {
        barColor: 'bg-rose-500',
        textColor: 'text-rose-700 bg-rose-50 border-rose-200',
        label: 'Severe Deficit'
      };
    } else if (pct <= 75) {
      return {
        barColor: 'bg-amber-500',
        textColor: 'text-amber-700 bg-amber-50 border-amber-200',
        label: 'Moderate'
      };
    } else {
      return {
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        label: 'Well Stocked'
      };
    }
  };

  // Recommendation tag badge helper
  const getRecBadge = (rec: SupplyGapItem['recommendation']) => {
    if (rec === 'Source more') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse"></span>
          Source more
        </span>
      );
    } else if (rec === 'Balanced') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Balanced
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Oversupplied
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      
      {/* Callout Banner: "5 models would sell immediately if listed at auction" */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 via-red-50/50 to-orange-50 border-b border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E11D48] to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-950/20 shrink-0">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider bg-[#E11D48] text-white">
                Opportunity Alert
              </span>
              <span className="text-xs text-slate-500 font-semibold">Immediate Sourcing Opportunity</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              5 models would sell immediately if listed at auction
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Over 429 verified dealer purchase orders are waiting without matching stock. High turnover (&lt; 19 days median turn).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <div className="px-3.5 py-2 rounded-xl bg-white/90 border border-amber-200 shadow-2xs text-xs">
            <span className="text-slate-400 font-medium block text-[10px]">UNCAPTURED DEALER GMV</span>
            <span className="font-black text-slate-900 text-sm">
              NZ$1,720,000 <span className="text-[11px] text-slate-400 font-medium">/ ¥156.9M</span>
            </span>
          </div>
        </div>
      </div>

      {/* Table Subheader & Filter Tools */}
      <div className="p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Supply vs Demand Gap Analysis
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time demand gap matrix identifying where dealer purchase requests exceed current auction stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model or trim..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#1B2A4A] outline-none w-[170px] sm:w-[200px]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            {(['All', 'Source more', 'Balanced', 'Oversupplied'] as const).map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterTag === tag
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <th className="py-3 px-5">Model</th>
              
              <th 
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('demandUnits')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Dealer Demand</span>
                  {sortField === 'demandUnits' ? (
                    sortDirection === 'desc' ? <ChevronDown size={14} className="text-[#E11D48]" /> : <ChevronUp size={14} className="text-[#E11D48]" />
                  ) : (
                    <ArrowUpDown size={12} className="text-slate-400" />
                  )}
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('currentStockUnits')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Current Heiwa Stock</span>
                  {sortField === 'currentStockUnits' ? (
                    sortDirection === 'desc' ? <ChevronDown size={14} className="text-[#E11D48]" /> : <ChevronUp size={14} className="text-[#E11D48]" />
                  ) : (
                    <ArrowUpDown size={12} className="text-slate-400" />
                  )}
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors min-w-[170px]"
                onClick={() => handleSort('coveragePct')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Coverage %</span>
                  {sortField === 'coveragePct' ? (
                    sortDirection === 'desc' ? <ChevronDown size={14} className="text-[#E11D48]" /> : <ChevronUp size={14} className="text-[#E11D48]" />
                  ) : (
                    <ArrowUpDown size={12} className="text-slate-400" />
                  )}
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('avgDaysToSell')}
              >
                <div className="flex items-center gap-1.5">
                  <span>NZ Days to Sell</span>
                  {sortField === 'avgDaysToSell' ? (
                    sortDirection === 'desc' ? <ChevronDown size={14} className="text-[#E11D48]" /> : <ChevronUp size={14} className="text-[#E11D48]" />
                  ) : (
                    <ArrowUpDown size={12} className="text-slate-400" />
                  )}
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('avgDealerMarginNzd')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Dealer Margin Potential</span>
                  {sortField === 'avgDealerMarginNzd' ? (
                    sortDirection === 'desc' ? <ChevronDown size={14} className="text-[#E11D48]" /> : <ChevronUp size={14} className="text-[#E11D48]" />
                  ) : (
                    <ArrowUpDown size={12} className="text-slate-400" />
                  )}
                </div>
              </th>

              <th className="py-3 px-5 text-right">Market Indicator</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {processedItems.map((item) => {
              const coverage = getCoverageBadge(item.coveragePct);

              return (
                <tr 
                  key={item.id}
                  className={`hover:bg-slate-50/90 transition-colors ${
                    item.immediateSeller 
                      ? 'bg-amber-50/25 border-l-4 border-l-[#E11D48]' 
                      : ''
                  }`}
                >
                  {/* Model Column */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                        <img 
                          src={item.image} 
                          alt={item.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">
                            {item.model}
                          </span>
                          {item.immediateSeller && (
                            <span className="px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider bg-rose-100 text-[#E11D48] border border-rose-200">
                              Immediate Seller
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {item.badge}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.segment}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Dealer Demand */}
                  <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                    {item.demandUnits}
                    <span className="text-[11px] text-slate-400 font-medium ml-1">units</span>
                  </td>

                  {/* Current Heiwa Stock */}
                  <td className="py-3.5 px-4 font-bold text-slate-700">
                    {item.currentStockUnits}
                    <span className="text-[11px] text-slate-400 font-normal ml-1">available</span>
                  </td>

                  {/* Coverage % with Progress Bar */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">
                          {item.coveragePct}%
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${coverage.textColor}`}>
                          {coverage.label}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${coverage.barColor}`}
                          style={{ width: `${Math.min(100, item.coveragePct)}%` }}
                        />
                      </div>
                      {item.unmetGap > 0 && (
                        <span className="text-[10px] text-rose-600 font-bold block">
                          Unmet Gap: -{item.unmetGap} units
                        </span>
                      )}
                    </div>
                  </td>

                  {/* NZ Days to Sell */}
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span>{item.avgDaysToSell} days</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {item.avgDaysToSell <= 15 ? '🚀 Fast Turnover' : item.avgDaysToSell <= 25 ? 'Steady' : 'Slower Pace'}
                    </span>
                  </td>

                  {/* Margin Potential */}
                  <td className="py-3.5 px-4">
                    <span className="font-black text-emerald-700 text-sm">
                      +NZ${item.avgDealerMarginNzd.toLocaleString('en-US')}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      ¥{item.avgDealerMarginJpy.toLocaleString('en-US')} JPY
                    </span>
                  </td>

                  {/* AI Recommendation Tag */}
                  <td className="py-3.5 px-5 text-right">
                    {getRecBadge(item.recommendation)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Showing <strong>{processedItems.length}</strong> prioritized Japanese auction model profiles.
        </span>
        <span className="text-[11px] text-slate-400">
          * Sorted by largest unmet dealer gap first to maximize auction buying conversion.
        </span>
      </div>
    </div>
  );
}
