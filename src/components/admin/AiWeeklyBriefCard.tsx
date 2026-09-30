"use client";

import React, { useState } from 'react';
import { Sparkles, Download, Share2, Globe2, Check, ArrowRight, ShieldCheck, Clock, Zap } from 'lucide-react';
import { AI_WEEKLY_BRIEF } from '@/lib/demandIntelligenceData';

interface AiWeeklyBriefCardProps {
  onNotifyToast: (message: string) => void;
}

export default function AiWeeklyBriefCard({ onNotifyToast }: AiWeeklyBriefCardProps) {
  const [lang, setLang] = useState<'en' | 'jp'>('en');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const brief = AI_WEEKLY_BRIEF[lang];

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      onNotifyToast(
        lang === 'en' 
          ? "PDF Executive Brief downloaded for Heiwa Sourcing Board"
          : "平和オート仕入れ役員会向けPDFブリーフをダウンロードしました"
      );
    }, 600);
  };

  const handleShare = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
      onNotifyToast(
        lang === 'en'
          ? "Dispatched to Heiwa Auto Japan procurement team (Tokyo & Yokohama offices)"
          : "平和オート東京本社・横浜調達チームへ即時共有されました"
      );
    }, 600);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#182C48] via-[#14243B] to-[#101C2E] text-white p-6 sm:p-8 border border-[#1E3A5F]/60 shadow-xl overflow-hidden group">
      {/* Subtle background glow effect */}
      <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-gradient-to-bl from-[#E11D48]/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1E3259]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E11D48] to-rose-600 text-white flex items-center justify-center shadow-lg shadow-[#E11D48]/40 shrink-0 border border-white/20">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-blue-200 border border-white/15">
                {brief.badge}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                <Zap size={11} /> {brief.confidenceText}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {brief.title}
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5 max-w-2xl">
              {brief.subtitle}
            </p>
          </div>
        </div>

        {/* Language Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          {/* Japanese / English Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0E1B2C]/70 border border-[#1E3A5F]/60 text-xs font-bold shadow-inner">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                lang === 'en'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 size={13} />
              <span>EN</span>
            </button>
            <button
              onClick={() => setLang('jp')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                lang === 'jp'
                  ? 'bg-[#E11D48] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="font-japanese">日本語</span>
              {lang === 'jp' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
            </button>
          </div>

          {/* Download PDF button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
            title="Download executive PDF briefing document"
          >
            <Download size={14} className={isDownloading ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline">
              {lang === 'en' ? 'Download brief (PDF)' : 'PDFダウンロード'}
            </span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Share with Japan team button */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-lg shadow-rose-950/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Send real-time alert to Heiwa Auto Japan procurement team"
          >
            <Share2 size={14} className={isSharing ? 'animate-spin' : ''} />
            <span>
              {lang === 'en' ? 'Share with Japan team' : '日本チームへ送信'}
            </span>
          </button>
        </div>
      </div>

      {/* Main AI Body Text */}
      <div className="relative z-10 py-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-300">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping"></span>
            <span>{lang === 'en' ? 'AUTONOMOUS SOURCING RECOMMENDATION' : 'AI自律仕入れ推奨'}</span>
          </div>
          <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
            "{brief.body}"
          </p>
        </div>
      </div>

      {/* Sourcing Targets breakdown pills */}
      <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            {lang === 'en' ? 'Actionable Targets:' : '調達推奨ターゲット:'}
          </span>
          {brief.targets.map((target, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111C30] border border-[#233863] text-slate-200"
            >
              <span className="font-bold text-white">{target.model}</span>
              <span className="px-1.5 py-0.5 rounded font-black text-[11px] bg-[#E11D48]/30 text-rose-200 border border-[#E11D48]/50">
                {target.recommendation}
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline">
                ({target.house})
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
          <Clock size={12} />
          <span>{brief.timestamp}</span>
        </div>
      </div>
    </div>
  );
}
