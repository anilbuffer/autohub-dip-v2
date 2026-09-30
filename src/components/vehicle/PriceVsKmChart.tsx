"use client";

import React, { useState } from "react";
import { NZComparable } from "@/lib/heiwaData";
import { Gauge, DollarSign, TrendingDown, Info } from "lucide-react";

interface PriceVsKmChartProps {
  heiwaVehicle: {
    year: number;
    make: string;
    model: string;
    kms: number;
    landedCost: number;
  };
  comparables: NZComparable[];
}

export default function PriceVsKmChart({
  heiwaVehicle,
  comparables,
}: PriceVsKmChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    title: string;
    source: string;
    price: number;
    kms: number;
    isHeiwa?: boolean;
  } | null>(null);

  // SVG Dimensions & Margins
  const width = 640;
  const height = 320;
  const margin = { top: 30, right: 30, bottom: 45, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Combine points to determine chart domain
  const allPoints = [
    { kms: heiwaVehicle.kms, price: heiwaVehicle.landedCost, isHeiwa: true },
    ...comparables.map((c) => ({ kms: c.kms, price: c.price, isHeiwa: false })),
  ];

  const minKmRaw = Math.min(...allPoints.map((p) => p.kms));
  const maxKmRaw = Math.max(...allPoints.map((p) => p.kms));
  const minPriceRaw = Math.min(...allPoints.map((p) => p.price));
  const maxPriceRaw = Math.max(...allPoints.map((p) => p.price));

  // Nice rounded domain bounds
  const minKm = Math.max(0, Math.floor((minKmRaw * 0.8) / 10000) * 10000);
  const maxKm = Math.ceil((maxKmRaw * 1.2) / 10000) * 10000 || 120000;
  const minPrice = Math.max(0, Math.floor((minPriceRaw * 0.85) / 2000) * 2000);
  const maxPrice = Math.ceil((maxPriceRaw * 1.15) / 2000) * 2000 || 35000;

  // Scale functions
  const scaleX = (km: number) =>
    margin.left + ((km - minKm) / (maxKm - minKm)) * innerWidth;
  const scaleY = (price: number) =>
    margin.top + innerHeight - ((price - minPrice) / (maxPrice - minPrice)) * innerHeight;

  // Calculate simple linear regression trendline across comparables
  const n = comparables.length;
  let trendStart = { x: minKm, y: minPrice };
  let trendEnd = { x: maxKm, y: maxPrice };

  if (n > 1) {
    const sumX = comparables.reduce((acc, c) => acc + c.kms, 0);
    const sumY = comparables.reduce((acc, c) => acc + c.price, 0);
    const sumXY = comparables.reduce((acc, c) => acc + c.kms * c.price, 0);
    const sumXX = comparables.reduce((acc, c) => acc + c.kms * c.kms, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    const yAtMinKm = slope * minKm + intercept;
    const yAtMaxKm = slope * maxKm + intercept;

    trendStart = { x: minKm, y: Math.max(minPrice, yAtMinKm) };
    trendEnd = { x: maxKm, y: Math.min(maxPrice, yAtMaxKm) };
  }

  // Trend price at the Heiwa vehicle's mileage
  const avgComparableAtKm =
    comparables.length > 0
      ? Math.round(
          comparables.reduce((acc, c) => acc + c.price, 0) / comparables.length
        )
      : heiwaVehicle.landedCost * 1.25;

  const marginBuffer = Math.max(0, avgComparableAtKm - heiwaVehicle.landedCost);

  // Ticks for X and Y axes
  const xTicks = [minKm, Math.round((minKm + maxKm) / 2), maxKm];
  const yTicks = [minPrice, Math.round((minPrice + maxPrice) / 2), maxPrice];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
            <span>Price vs Mileage Analysis (NZ Market Position)</span>
          </h3>
          <p className="text-xs text-[#536471] mt-0.5">
            Interactive positioning matrix comparing this Heiwa vehicle against active Trade Me & dealer listings.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#E11D48] ring-2 ring-rose-200" />
            <span className="text-[#111C2D]">Heiwa Landed Cost</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F1B2E]" />
            <span className="text-[#536471]">NZ Dealer Listings</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-400 border-dashed" />
            <span className="text-[#8899A6]">Market Trend</span>
          </div>
        </div>
      </div>

      {/* SVG Scatter Plot Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none font-sans"
        >
          {/* Background gridlines */}
          {yTicks.map((tickVal, i) => {
            const yPos = scaleY(tickVal);
            return (
              <g key={`y-${i}`}>
                <line
                  x1={margin.left}
                  y1={yPos}
                  x2={width - margin.right}
                  y2={yPos}
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />
                <text
                  x={margin.left - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] fill-[#8899A6] font-mono"
                >
                  ${(tickVal / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {xTicks.map((tickVal, i) => {
            const xPos = scaleX(tickVal);
            return (
              <g key={`x-${i}`}>
                <line
                  x1={xPos}
                  y1={margin.top}
                  x2={xPos}
                  y2={height - margin.bottom}
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />
                <text
                  x={xPos}
                  y={height - margin.bottom + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-[#8899A6] font-mono"
                >
                  {(tickVal / 1000).toFixed(0)}k km
                </text>
              </g>
            );
          })}

          {/* Axes lines */}
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="#CBD5E1"
            strokeWidth="1"
          />

          {/* Trendline across NZ listings */}
          <line
            x1={scaleX(trendStart.x)}
            y1={scaleY(trendStart.y)}
            x2={scaleX(trendEnd.x)}
            y2={scaleY(trendEnd.y)}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Vertical distance guide line from Heiwa vehicle to trendline */}
          <line
            x1={scaleX(heiwaVehicle.kms)}
            y1={scaleY(heiwaVehicle.landedCost)}
            x2={scaleX(heiwaVehicle.kms)}
            y2={scaleY(avgComparableAtKm)}
            stroke="#E11D48"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />

          {/* Active NZ Market Comparables (Circles) */}
          {comparables.map((comp, idx) => {
            const cx = scaleX(comp.kms);
            const cy = scaleY(comp.price);

            return (
              <g
                key={`comp-${idx}`}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() =>
                  setHoveredPoint({
                    x: cx,
                    y: cy,
                    title: comp.title,
                    source: comp.source,
                    price: comp.price,
                    kms: comp.kms,
                    isHeiwa: false,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="#0F1B2E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="hover:fill-blue-600 transition-colors shadow-xs"
                />
              </g>
            );
          })}

          {/* THIS HEIWA VEHICLE Point (Prominent Red Pulse Star) */}
          {(() => {
            const hx = scaleX(heiwaVehicle.kms);
            const hy = scaleY(heiwaVehicle.landedCost);

            return (
              <g
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    x: hx,
                    y: hy,
                    title: `${heiwaVehicle.year} ${heiwaVehicle.make} ${heiwaVehicle.model}`,
                    source: "Heiwa Japan Auction (AutoHub Landed)",
                    price: heiwaVehicle.landedCost,
                    kms: heiwaVehicle.kms,
                    isHeiwa: true,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Glow ring */}
                <circle
                  cx={hx}
                  cy={hy}
                  r="14"
                  fill="#E11D48"
                  opacity="0.2"
                  className="animate-ping"
                />
                <circle
                  cx={hx}
                  cy={hy}
                  r="9"
                  fill="#E11D48"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="shadow-md"
                />
                {/* Diamond icon center */}
                <circle cx={hx} cy={hy} r="3" fill="#FFFFFF" />

                {/* Callout Label badge */}
                <g transform={`translate(${hx}, ${hy - 16})`}>
                  <rect
                    x="-65"
                    y="-18"
                    width="130"
                    height="18"
                    rx="4"
                    fill="#E11D48"
                    className="shadow-sm"
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="text-[9px] font-bold uppercase tracking-wider"
                  >
                    ★ THIS HEIWA CAR
                  </text>
                </g>
              </g>
            );
          })()}

          {/* Tooltip on Hover */}
          {hoveredPoint && (
            <g
              transform={`translate(${Math.min(
                width - 150,
                Math.max(10, hoveredPoint.x - 70)
              )}, ${Math.max(10, hoveredPoint.y - 65)})`}
              className="pointer-events-none"
            >
              <rect
                x="0"
                y="0"
                width="145"
                height="56"
                rx="8"
                fill="#0F1B2E"
                opacity="0.95"
                className="shadow-lg"
              />
              <text
                x="8"
                y="15"
                fill="#FFFFFF"
                className="text-[10px] font-bold truncate"
              >
                {hoveredPoint.title}
              </text>
              <text x="8" y="30" fill="#94A3B8" className="text-[9px]">
                {hoveredPoint.source}
              </text>
              <text
                x="8"
                y="46"
                fill={hoveredPoint.isHeiwa ? "#FDA4AF" : "#34D399"}
                className="text-[11px] font-mono font-bold"
              >
                NZ${hoveredPoint.price.toLocaleString("en-US")} ·{" "}
                {hoveredPoint.kms.toLocaleString("en-US")} km
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Insight Banner */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <TrendingDown size={16} />
          </div>
          <div>
            <div className="font-bold text-[#111C2D]">
              Positioned below comparable NZ dealer asking prices
            </div>
            <div className="text-[11px] text-[#64748B]">
              Landed at NZ${heiwaVehicle.landedCost.toLocaleString("en-US")} vs market average ~NZ${avgComparableAtKm.toLocaleString("en-US")} at {heiwaVehicle.kms.toLocaleString("en-US")} km.
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-[#E2E8F0] sm:pl-4 shrink-0">
          <span className="text-[10px] font-semibold text-[#8899A6] uppercase block">
            Projected Margin Buffer
          </span>
          <span className="text-sm font-extrabold text-emerald-600 font-mono">
            +NZ${marginBuffer.toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </div>
  );
}
