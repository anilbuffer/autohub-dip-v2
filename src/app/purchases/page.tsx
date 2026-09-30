"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  PackageCheck,
  Ship,
  Anchor,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  FileText,
  MapPin,
  ArrowRight,
  ExternalLink,
  Calendar,
} from "lucide-react";
import {
  DealerPurchase,
  getStoredPurchases,
  getVehiclePhoto,
} from "@/lib/dealerStore";
import { HEIWA_VEHICLES } from "@/lib/heiwaData";

const STAGES = [
  { step: 1, title: "Auction Won", subtitle: "Japan payment cleared" },
  { step: 2, title: "De-reg & JEVIC", subtitle: "Pre-shipment inspection" },
  { step: 3, title: "Ocean Shipping", subtitle: "RoRo vessel transit" },
  { step: 4, title: "Customs & MAF", subtitle: "Ports of Auckland" },
  { step: 5, title: "Yard Ready", subtitle: "Entry compliance certified" },
];

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<DealerPurchase[]>([]);

  useEffect(() => {
    setPurchases(getStoredPurchases());
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 pb-16">
        {/* ─── Hero Header ─── */}
        <div className="bg-[#0F1419] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 border border-white/10">
                <PackageCheck size={13} className="text-emerald-400" />
                <span>AutoHub Import Pipeline Tracking</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Purchases & Logistics
              </h1>
              <p className="text-sm text-white/70 max-w-xl mt-1.5 leading-relaxed">
                Live status of your won vehicles from Japan auction hammer to your Auckland yard. JEVIC certs, customs EDI, and vessel tracking.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white/[0.04] p-3 sm:p-4 rounded-xl border border-white/[0.08]">
              <div className="text-left px-3 border-r border-white/10">
                <div className="text-xs text-white/50">Purchased Units</div>
                <div className="text-xl font-bold text-white font-mono">{purchases.length} Vehicles</div>
              </div>
              <div className="text-left px-3 border-r border-white/10">
                <div className="text-xs text-blue-300">In Transit</div>
                <div className="text-xl font-bold text-blue-400 font-mono">1 At Sea</div>
              </div>
              <div className="text-left px-3">
                <div className="text-xs text-emerald-400">At Port</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">1 In Clearing</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Purchases Pipeline List ─── */}
        <div className="space-y-5">
          {purchases.map((purchase) => {
            const matchingCar = HEIWA_VEHICLES.find(
              (v) => v.chassis === purchase.vehicleChassis
            );
            const photoUrl = matchingCar
              ? getVehiclePhoto(matchingCar)
              : "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={purchase.id}
                className="bg-white rounded-2xl border border-[#E8ECF0] shadow-subtle p-6 space-y-6"
              >
                {/* Vehicle Header & Quick Badges */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8ECF0]">
                  <div className="flex items-center gap-4">
                    <img
                      src={photoUrl}
                      alt=""
                      className="w-16 h-12 rounded-xl object-cover border border-[#E8ECF0]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#0F1419]">
                          {purchase.year} {purchase.make} {purchase.model}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Order #{purchase.id}
                        </span>
                      </div>
                      <div className="text-xs text-[#536471] font-mono mt-0.5">
                        Chassis: {purchase.vehicleChassis} · {purchase.kms.toLocaleString()} km · {purchase.color}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                        Total Landed Cost
                      </div>
                      <div className="text-lg font-extrabold text-[#C8102E] font-mono">
                        ${purchase.totalLandedNzd.toLocaleString()} NZD
                      </div>
                    </div>
                    <div className="border-l border-[#E8ECF0] pl-4 text-left">
                      <div className="text-[10px] font-bold text-[#8899A6] uppercase tracking-wider">
                        Vessel / ETA
                      </div>
                      <div className="text-xs font-bold text-[#0F1419] flex items-center gap-1">
                        <Ship size={13} className="text-blue-600" />
                        {purchase.etaDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Step Progress Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-5 gap-2 relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-[#E8ECF0] -z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${((purchase.currentStage - 1) / (STAGES.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {STAGES.map((stage) => {
                      const isCompleted = stage.step < purchase.currentStage;
                      const isCurrent = stage.step === purchase.currentStage;

                      return (
                        <div key={stage.step} className="text-center relative z-10 flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCompleted
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : isCurrent
                                ? "bg-[#C8102E] text-white ring-4 ring-red-100 shadow-md"
                                : "bg-[#F0F2F5] text-[#8899A6]"
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 size={16} /> : stage.step}
                          </div>
                          <div className="text-xs font-bold text-[#0F1419] mt-2">
                            {stage.title}
                          </div>
                          <div className="text-[10px] text-[#8899A6] hidden sm:block mt-0.5">
                            {stage.subtitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Logistics Detail Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#F7F9FA] rounded-xl border border-[#E8ECF0] text-xs">
                  <div>
                    <span className="text-[#8899A6] block text-[10px] font-bold uppercase">
                      Current Logistics Stage
                    </span>
                    <span className="font-semibold text-[#0F1419] mt-0.5 block flex items-center gap-1.5">
                      <Clock size={12} className="text-blue-600" />
                      {purchase.stageStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8899A6] block text-[10px] font-bold uppercase">
                      Vessel & Ports
                    </span>
                    <span className="font-semibold text-[#0F1419] mt-0.5 block">
                      {purchase.vesselName} ({purchase.departurePort} → {purchase.destinationPort})
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8899A6] block text-[10px] font-bold uppercase">
                      NZ Compliance Certificate
                    </span>
                    <span className="font-mono font-semibold text-emerald-700 mt-0.5 block">
                      {purchase.vinComplianceNumber || "Pending Port Arrival"}
                    </span>
                  </div>
                </div>

                {/* Document Downloads */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8ECF0] hover:bg-[#F0F2F5] text-xs font-semibold text-[#536471]">
                      <FileText size={13} /> Landed Invoice (PDF)
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8ECF0] hover:bg-[#F0F2F5] text-xs font-semibold text-[#536471]">
                      <ShieldCheck size={13} /> JEVIC Odometer Cert
                    </button>
                  </div>

                  <Link
                    href={`/vehicles/${encodeURIComponent(purchase.vehicleChassis)}`}
                    className="text-xs font-bold text-[#C8102E] hover:underline flex items-center gap-1"
                  >
                    View Original Japan Auction Lot <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
