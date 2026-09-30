"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  FileCheck,
  CheckCircle2,
  Save,
  Clock,
  Car,
} from "lucide-react";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [dealerName, setDealerName] = useState("Auckland Auto Group");
  const [principalName, setPrincipalName] = useState("David Miller");
  const [email, setEmail] = useState("david.miller@aucklandautogroup.co.nz");
  const [phone, setPhone] = useState("+64 9 525 8899");
  const [yardAddress, setYardAddress] = useState("458 Great South Road, Penrose, Auckland 1061");
  const [registeredTraderNo, setRegisteredTraderNo] = useState("M189402");
  const [nzbn, setNzbn] = useState("9429041234567");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-16 font-sans max-w-4xl">
        {/* ─── Page Title ─── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Dealership Profile
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Registered Motor Trader license credentials, import broker link, and primary yard details.
          </p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Profile details successfully updated and synchronized with AutoHub DIP.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* ─── Dealership Identity Card ─── */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Dealership Identification
                </h3>
                <p className="text-xs text-[#64748B]">
                  Official registered motor vehicle trader details on file with NZTA.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Dealership Legal Trade Name
                </label>
                <input
                  type="text"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  NZTA RMVT License Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={registeredTraderNo}
                    onChange={(e) => setRegisteredTraderNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white pr-9"
                  />
                  <ShieldCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  NZBN (Business Number)
                </label>
                <input
                  type="text"
                  value={nzbn}
                  onChange={(e) => setNzbn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Dealer Principal / Managing Director
                </label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ─── Contact & Yard Logistics Card ─── */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Delivery Yard & Logistics Contact
                </h3>
                <p className="text-xs text-[#64748B]">
                  AutoHub delivery transporters use this address for port-to-yard haulage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Primary Vehicle Yard Address
                </label>
                <input
                  type="text"
                  value={yardAddress}
                  onChange={(e) => setYardAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Logistics Contact Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Dispatch Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ─── AutoHub Direct Import Account Settings ─── */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  AutoHub Import & FX Facility
                </h3>
                <p className="text-xs text-[#64748B]">
                  Currency settlement account with Heiwa Auto Japan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] block">Settlement Currency</span>
                <span className="font-bold text-[#111827] text-sm mt-0.5 block">JPY / NZD Spot</span>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] block">Pre-Approved Proxy Limit</span>
                <span className="font-bold text-[#111827] text-sm mt-0.5 block">¥50,000,000 JPY</span>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <span className="text-[#64748B] block">Primary Destination Port</span>
                <span className="font-bold text-[#111827] text-sm mt-0.5 block">Ports of Auckland</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#162C48] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Save size={15} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
