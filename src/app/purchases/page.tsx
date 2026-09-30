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
  Plus,
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
      <div className="space-y-6 pb-16 font-sans">
        {/* ─── Page Title & Action Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Purchases
            </h1>
          </div>

          <Link
            href="/browse-vehicles"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Browse More Vehicles</span>
          </Link>
        </div>

        {/* ─── Quick Metric Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
            <span className="text-xs font-semibold text-[#64748B]">Purchased Vehicles</span>
            <div className="text-2xl font-extrabold text-[#111827] mt-1 font-mono">
              {purchases.length}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
            <span className="text-xs font-semibold text-blue-600">On RoRo Vessel</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1 font-mono">
              1 In Transit
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow">
            <span className="text-xs font-semibold text-emerald-600">Port of Auckland</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
              1 In Clearing
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
                className="bg-white rounded-2xl border border-slate-200/90 shadow-soft hover:shadow-soft-md transition-shadow p-6 sm:p-7 space-y-6"
              >
                {/* Vehicle Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-4">
                    <img
                      src={photoUrl}
                      alt=""
                      className="w-20 h-14 rounded-xl object-cover border border-[#E5E7EB]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#111827]">
                          {purchase.year} {purchase.make} {purchase.model}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569]">
                          Order #{purchase.id}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] font-mono mt-0.5">
                        Chassis: {purchase.vehicleChassis} · {purchase.kms.toLocaleString("en-US")} km
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                        Total Landed Cost
                      </div>
                      <div className="text-lg font-extrabold text-[#111827] font-mono">
                        NZ${purchase.totalLandedNzd.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="border-l border-[#E5E7EB] pl-6 text-left">
                      <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                        Vessel / ETA
                      </div>
                      <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5 mt-0.5">
                        <Ship size={14} className="text-[#1E3A5F]" />
                        {purchase.etaDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Step Progress Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-5 gap-2 relative">
                    {STAGES.map((s) => {
                      const isComplete = s.step < purchase.currentStage;
                      const isCurrent = s.step === purchase.currentStage;

                      return (
                        <div key={s.step} className="flex flex-col items-center text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${isComplete
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                  ? "bg-[#E11D48] text-white ring-4 ring-[#E11D48]/15"
                                  : "bg-slate-100 text-[#94A3B8] border border-slate-200"
                              }`}
                          >
                            {isComplete ? <CheckCircle2 size={16} /> : s.step}
                          </div>
                          <span
                            className={`text-xs font-bold mt-2 ${isCurrent
                                ? "text-[#E11D48]"
                                : isComplete
                                  ? "text-[#111827]"
                                  : "text-[#94A3B8]"
                              }`}
                          >
                            {s.title}
                          </span>
                          <span className="text-[10px] text-[#64748B] mt-0.5 hidden sm:block">
                            {s.subtitle}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Details Bar */}
                <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Anchor size={13} className="text-[#1E3A5F]" /> Ports of Auckland
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" /> JEVIC Pre-Inspected
                    </span>
                  </div>

                  <Link
                    href={`/vehicles/${encodeURIComponent(purchase.vehicleChassis)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E11D48] hover:underline"
                  >
                    View Vehicle Record <ArrowRight size={13} />
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
