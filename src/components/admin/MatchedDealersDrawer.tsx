"use client";

import React, { useState } from 'react';
import { X, Users, CheckCircle2, Send, Building2, MapPin, Sparkles, DollarSign, Shield } from 'lucide-react';
import { AuctionMatchVehicle, MatchedDealerInfo } from '@/lib/demandIntelligenceData';
import { useSyncStore } from '@/lib/syncStore';

interface MatchedDealersDrawerProps {
  vehicle: AuctionMatchVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onNotifyToast: (msg: string) => void;
}

export default function MatchedDealersDrawer({
  vehicle,
  isOpen,
  onClose,
  onNotifyToast
}: MatchedDealersDrawerProps) {
  const [notifiedDealers, setNotifiedDealers] = useState<number[]>([]);
  const [isNotifyingAll, setIsNotifyingAll] = useState(false);
  
  const { notifyDealersFromAdmin } = useSyncStore();

  if (!isOpen || !vehicle) return null;

  const handleNotifySingle = (dealer: MatchedDealerInfo) => {
    if (!notifiedDealers.includes(dealer.dealerId)) {
      setNotifiedDealers(prev => [...prev, dealer.dealerId]);
      notifyDealersFromAdmin(vehicle.id, vehicle.model, 1);
      onNotifyToast(`Notification sent to ${dealer.name} (${dealer.region})`);
    }
  };

  const handleNotifyAll = () => {
    setIsNotifyingAll(true);
    setTimeout(() => {
      setIsNotifyingAll(false);
      setNotifiedDealers(vehicle.matchedDealers.map(d => d.dealerId));
      notifyDealersFromAdmin(vehicle.id, vehicle.model, vehicle.matchedDealersCount);
      onNotifyToast(`${vehicle.matchedDealersCount} dealers notified via SMS & Portal for ${vehicle.model}`);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E11D48] text-white">
                  Buyer Matching Engine
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {vehicle.auctionHouse} · Stockid #{vehicle.lotNumber}
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {vehicle.year} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {vehicle.matchedDealersCount} NZ dealers actively seeking this vehicle profile
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Vehicle Snapshot Strip */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3.5">
            <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 relative">
              <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {vehicle.km.toLocaleString('en-US')} km · Grade {vehicle.grade}/{vehicle.interiorGrade}
                </span>
                <span className="font-black text-[#E11D48]">
                  NZ${vehicle.fobPriceNzd.toLocaleString('en-US')} FOB
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 mt-1 text-[11px]">
                <span>Auction: {vehicle.auctionDate}</span>
                <span>¥{vehicle.fobPriceJpy.toLocaleString('en-US')} JPY</span>
              </div>
            </div>
          </div>

          {/* Dealer Match List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Qualified Dealership Matches
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Sorted by AI Match Score
              </span>
            </div>

            {vehicle.matchedDealers.map((dealer) => {
              const isNotified = notifiedDealers.includes(dealer.dealerId);

              return (
                <div
                  key={dealer.dealerId}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${dealer.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                        {dealer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">
                          {dealer.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" />
                            {dealer.region}
                          </span>
                          <span>·</span>
                          <span>Active {dealer.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {dealer.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Criteria Matched */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                      Wish List Criteria:
                    </span>
                    <p className="text-slate-700 font-medium">
                      "{dealer.wishlistCriteria}"
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Max Landed Budget: <strong>NZ${dealer.targetBudgetNzd.toLocaleString('en-US')}</strong></span>
                      <span className="text-emerald-600 font-bold">Within Budget Ceiling</span>
                    </div>
                  </div>

                  {/* Individual Notify Action */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleNotifySingle(dealer)}
                      disabled={isNotified}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isNotified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-slate-100 hover:bg-[#1B2A4A] hover:text-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isNotified ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Notified</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Send Priority Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Sends SMS & In-App vehicle reservation prompt.
            </span>
            <button
              onClick={handleNotifyAll}
              disabled={isNotifyingAll}
              className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/20 transition-all flex items-center gap-2"
            >
              <Send size={14} className={isNotifyingAll ? 'animate-bounce' : ''} />
              <span>Notify All {vehicle.matchedDealersCount} Dealers</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
