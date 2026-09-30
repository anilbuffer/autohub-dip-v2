"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
  HelpCircle,
  FileQuestion,
  Calculator,
  Ship,
  Gavel,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Car,
} from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does proxy bidding on Japan auctions work via AutoHub DIP?",
      a: "When you submit a proxy bid, our Heiwa Auto bidding engine automatically executes bids in real-time up to your designated maximum FOB JPY limit at USS, TAA, CAA, and JU auction sessions in Japan. If the hammer falls below your ceiling, you purchase at the lower price.",
    },
    {
      q: "How is the landed NZD price calculated?",
      a: "The landed cost includes FOB purchase price converted at live JPY/NZD rate, Japanese deregistration & export customs, JEVIC pre-shipment bio-security and odometer verification, ocean RoRo freight to New Zealand, NZ Customs import tariff, port handling, and 15% NZ GST.",
    },
    {
      q: "What is the typical shipping timeline from Japan hammer to Auckland yard?",
      a: "From auction win to delivery at your Auckland yard takes approximately 21 to 28 days: 3–5 days for inland Japan transport & JEVIC inspection, 14–16 days ocean transit on Armacup / Toyofuji RoRo vessels, and 2–3 days for NZ Customs clearance & compliance.",
    },
    {
      q: "Can I inspect the original Japanese auction sheet?",
      a: "Yes. Click 'View Details' on any vehicle to view the digitized auction sheet, grade ratings, inspector notes, and high-resolution multi-angle photography.",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 pb-16 font-sans max-w-4xl">
        {/* ─── Page Title ─── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Help & Documentation
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Dealer guide to Japan auction bidding, landed cost formulas, and logistics support.
          </p>
        </div>

        {/* ─── Fast Support Channels ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold mb-3">
              <Phone size={18} />
            </div>
            <h4 className="text-sm font-bold text-[#111827]">Auction Desk Hotline</h4>
            <p className="text-xs text-[#64748B] mt-1">Direct priority line to our Tokyo and Nagoya bidding desks.</p>
            <div className="text-xs font-bold text-[#1E3A5F] font-mono mt-3">0800 288 6482</div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold mb-3">
              <Mail size={18} />
            </div>
            <h4 className="text-sm font-bold text-[#111827]">Dealer Support Email</h4>
            <p className="text-xs text-[#64748B] mt-1">Questions regarding customs paperwork, bills of lading, or JEVIC.</p>
            <div className="text-xs font-bold text-[#1E3A5F] font-mono mt-3">support@autohub.co.nz</div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold mb-3">
              <Ship size={18} />
            </div>
            <h4 className="text-sm font-bold text-[#111827]">Port Logistics Track</h4>
            <p className="text-xs text-[#64748B] mt-1">Live RoRo vessel ETA schedules for Ports of Auckland & Lyttelton.</p>
            <div className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> All Berths On-Time
            </div>
          </div>
        </div>

        {/* ─── Frequently Asked Questions ─── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
            <HelpCircle size={18} className="text-[#1E3A5F]" />
            <h3 className="text-base font-bold text-[#111827]">
              Dealer Operations FAQ
            </h3>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {faqs.map((faq, i) => (
              <div key={i} className="py-4 space-y-1.5 first:pt-2">
                <h4 className="text-xs font-bold text-[#111827] flex items-center gap-2">
                  <span className="text-[#1E3A5F]">Q:</span> {faq.q}
                </h4>
                <p className="text-xs text-[#475569] pl-5 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Quick Jump to Catalog ─── */}
        <div className="p-6 bg-gradient-to-r from-[#1E3A5F] to-[#162C48] rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-base font-bold text-white">Ready to inspect available stock?</h4>
            <p className="text-xs text-white/70 mt-0.5">Explore over 120 verified vehicles available across active Japan auction houses.</p>
          </div>
          <Link
            href="/browse-vehicles"
            className="px-5 py-2.5 bg-white text-[#1E3A5F] hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
          >
            Browse Auction Catalog
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
