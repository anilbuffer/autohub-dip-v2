"use client";

import React, { useState } from 'react';
import { UPCOMING_AUCTION_MATCHES, AuctionMatchVehicle } from '@/lib/demandIntelligenceData';
import { Users, Send, CheckCircle2, Clock, MapPin, ChevronRight, Sparkles, Building2, BellRing } from 'lucide-react';
import MatchedDealersDrawer from './MatchedDealersDrawer';
import { useSyncStore } from '@/lib/syncStore';

interface UpcomingAuctionMatchSectionProps {
  onNotifyToast: (msg: string) => void;
}

export default function UpcomingAuctionMatchSection({ onNotifyToast }: UpcomingAuctionMatchSectionProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<AuctionMatchVehicle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [animatingLot, setAnimatingLot] = useState<string | null>(null);

  const { state: syncState, notifyDealersFromAdmin } = useSyncStore();

  const handleOpenDrawer = (vehicle: AuctionMatchVehicle) => {
    setSelectedVehicle(vehicle);
    setDrawerOpen(true);
  };

  const handleNotifyMatched = (vehicle: AuctionMatchVehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimatingLot(vehicle.id);

    setTimeout(() => {
      setAnimatingLot(null);
      notifyDealersFromAdmin(vehicle.id, `${vehicle.year} ${vehicle.model}`, vehicle.matchedDealersCount);
      onNotifyToast(`${vehicle.matchedDealersCount} dealers notified for ${vehicle.year} ${vehicle.model}`);
    }, 450);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-7">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Auction Dispatch
            </span>
            <span className="text-xs text-slate-400 font-medium">Next USS & CAA Auctions</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Upcoming Auction: Dealer Match & Instant Notification
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Vehicles rolling onto Japanese auction blocks tomorrow with pre-qualified NZ dealer demand.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock size={13} className="text-[#E11D48]" /> Next Auction in 02h 45m
          </span>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {UPCOMING_AUCTION_MATCHES.map((vehicle) => {
          const isNotified = syncState.notifiedAuctionLotIds.includes(vehicle.id);
          const isAnimating = animatingLot === vehicle.id;

          return (
            <div
              key={vehicle.id}
              className="group rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Image & Badges */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Auction House & Lot Tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900/85 text-white backdrop-blur-xs border border-white/20">
                    {vehicle.auctionHouse}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs border border-slate-200 shadow-2xs">
                    Stockid #{vehicle.lotNumber}
                  </span>
                </div>

                {/* Grade Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-emerald-500 text-white shadow-xs">
                    Grade {vehicle.grade}
                  </span>
                </div>

                {/* Time Left Pill */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-red-300 flex items-center gap-1 backdrop-blur-xs">
                    <Clock size={10} /> {vehicle.timeLeft}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-slate-900 text-sm leading-snug">
                      {vehicle.year} {vehicle.model}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {vehicle.badge} · {vehicle.km.toLocaleString('en-US')} km
                  </p>

                  {/* Pricing Dual Currency */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">FOB PRICE</span>
                      <span className="font-black text-slate-900 text-sm">
                        NZ${vehicle.fobPriceNzd.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">YEN (JPY)</span>
                      <span className="font-bold text-slate-700 text-xs">
                        ¥{vehicle.fobPriceJpy.toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Matched Dealers Clickable Area */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div 
                    onClick={() => handleOpenDrawer(vehicle)}
                    className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-100 cursor-pointer transition-colors group/match"
                    title="Click to view detailed list of matched dealers"
                  >
                    <div className="flex items-center gap-2">
                      {/* Avatar stack */}
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">AA</span>
                        <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">HM</span>
                        <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center">CC</span>
                      </div>
                      <span className="text-xs font-black text-blue-900">
                        Matched dealers: {vehicle.matchedDealersCount}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-blue-500 group-hover/match:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Notify Button */}
                  <div className="mt-2.5">
                    <button
                      onClick={(e) => handleNotifyMatched(vehicle, e)}
                      disabled={isNotified || isAnimating}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isNotified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#1E3A5F] hover:bg-[#162C48] text-white shadow-xs'
                      }`}
                    >
                      {isNotified ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>{vehicle.matchedDealersCount} Dealers Notified</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} className={isAnimating ? 'animate-bounce' : ''} />
                          <span>Notify matched dealers</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over Drawer for Matched Dealers */}
      <MatchedDealersDrawer
        vehicle={selectedVehicle}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNotifyToast={onNotifyToast}
      />
    </div>
  );
}
