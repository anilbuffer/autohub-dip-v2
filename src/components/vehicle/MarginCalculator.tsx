"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, RotateCcw, TrendingUp, CheckCircle, Percent } from "lucide-react";

interface MarginCalculatorProps {
  landedCost: number;
  nzMarketAverage: number;
  vehicleTitle: string;
}

export default function MarginCalculator({
  landedCost,
  nzMarketAverage,
  vehicleTitle,
}: MarginCalculatorProps) {
  // State for user inputs
  const [targetRetail, setTargetRetail] = useState<number>(nzMarketAverage);
  const [groomingCost, setGroomingCost] = useState<number>(450);
  const [localTransport, setLocalTransport] = useState<number>(250);
  const [prepBuffer, setPrepBuffer] = useState<number>(300);

  // Financial calculations
  const totalPrepFees = groomingCost + localTransport + prepBuffer;
  const totalInvestment = landedCost + totalPrepFees;
  const grossProfit = targetRetail - totalInvestment;
  const marginPercent = targetRetail > 0 ? Math.round((grossProfit / targetRetail) * 100) : 0;
  const markupOnCost = totalInvestment > 0 ? Math.round((grossProfit / totalInvestment) * 100) : 0;
  const isProfitable = grossProfit > 0;

  const resetDefaults = () => {
    setTargetRetail(nzMarketAverage);
    setGroomingCost(450);
    setLocalTransport(250);
    setPrepBuffer(300);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
            <Calculator size={16} className="text-[#E11D48]" />
            <span>Optional Margin Calculator</span>
          </h3>
          <p className="text-xs text-[#536471] mt-0.5">
            Test target retail price scenarios and prep allowances against your calculated AutoHub landed cost.
          </p>
        </div>

        <button
          onClick={resetDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#111C2D] bg-[#F8FAFC] border border-[#CBD5E1] hover:bg-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RotateCcw size={12} />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target Retail Price */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#111C2D]">
                Your Planned NZ Retail Asking Price
              </label>
              <span className="text-[11px] font-semibold text-[#64748B]">
                Market Benchmark: NZ${nzMarketAverage.toLocaleString("en-US")}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#8899A6]">
                NZ$
              </span>
              <input
                type="number"
                step={250}
                value={targetRetail}
                onChange={(e) => setTargetRetail(parseInt(e.target.value) || 0)}
                className="w-full pl-12 pr-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono font-bold text-base text-[#111C2D] outline-none focus:border-[#E11D48] focus:bg-white focus:ring-1 focus:ring-[#E11D48] transition-all"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setTargetRetail((prev) => Math.max(1000, prev - 1000))}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg text-[#475569] transition-colors"
              >
                -NZ$1,000
              </button>
              <button
                type="button"
                onClick={() => setTargetRetail(nzMarketAverage)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-[#E11D48] rounded-lg transition-colors border border-rose-200"
              >
                NZ Market Indicator (NZ${nzMarketAverage.toLocaleString("en-US")})
              </button>
              <button
                type="button"
                onClick={() => setTargetRetail((prev) => prev + 1000)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg text-[#475569] transition-colors"
              >
                +NZ$1,000
              </button>
              <button
                type="button"
                onClick={() => setTargetRetail(totalInvestment)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg text-[#475569] transition-colors"
              >
                Breakeven (NZ${totalInvestment.toLocaleString("en-US")})
              </button>
            </div>
          </div>

          {/* Prep & Grooming Sliders */}
          <div className="pt-2 border-t border-[#F1F5F9] space-y-3">
            <span className="text-[11px] font-bold text-[#8899A6] uppercase tracking-wider block">
              Dealer Prep & Reconditioning Allowances
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Grooming */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Yard Grooming
                </label>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#111C2D]">
                  <span>NZ$</span>
                  <input
                    type="number"
                    step={50}
                    value={groomingCost}
                    onChange={(e) => setGroomingCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent outline-none border-b border-[#CBD5E1] focus:border-[#E11D48] text-right font-mono"
                  />
                </div>
              </div>

              {/* Transport */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  Port to Yard Freight
                </label>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#111C2D]">
                  <span>NZ$</span>
                  <input
                    type="number"
                    step={50}
                    value={localTransport}
                    onChange={(e) => setLocalTransport(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent outline-none border-b border-[#CBD5E1] focus:border-[#E11D48] text-right font-mono"
                  />
                </div>
              </div>

              {/* Buffer */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                  WOF & Fuel Buffer
                </label>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#111C2D]">
                  <span>NZ$</span>
                  <input
                    type="number"
                    step={50}
                    value={prepBuffer}
                    onChange={(e) => setPrepBuffer(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent outline-none border-b border-[#CBD5E1] focus:border-[#E11D48] text-right font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Financial Scenario Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F1B2E] via-[#0C1728] to-[#08101E] text-white p-5 rounded-2xl flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Scenario Result
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Calculation
              </span>
            </div>

            {/* Big Margin Display */}
            <div className="pt-4 pb-3">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Estimated Gross Margin
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                    isProfitable ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isProfitable ? "+" : ""}NZ${grossProfit.toLocaleString("en-US")}
                </span>
                <span className="text-xs font-bold font-mono text-slate-300">
                  ({marginPercent}% margin)
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-white/10 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Retail:</span>
                <span>NZ${targetRetail.toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AutoHub Landed Cost:</span>
                <span>-NZ${landedCost.toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prep & Yard Allowance:</span>
                <span>-NZ${totalPrepFees.toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 text-white font-bold">
                <span>Total All-In Investment:</span>
                <span>NZ${totalInvestment.toLocaleString("en-US")}</span>
              </div>
            </div>
          </div>

          {/* Breakeven Footer */}
          <div className="pt-4 mt-4 border-t border-white/10 text-[11px] flex items-center justify-between text-slate-400">
            <span>Breakeven Asking Price:</span>
            <span className="font-bold text-white font-mono">
              NZ${totalInvestment.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
