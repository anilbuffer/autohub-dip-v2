"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ChevronRight,
  Calculator,
  Car,
  TrendingUp,
  FileText,
  Ship,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Sliders,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Info
} from "lucide-react";
import { VEHICLES, GLOBAL_SETTINGS, Vehicle } from "@/lib/data";
import { useSyncStore } from "@/lib/syncStore";

// Web Audio API soft sound generator
function playChime(type: "send" | "receive" = "receive") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "send") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  type?: "text" | "calculator" | "vehicles" | "sheet_glossary" | "shipping";
  vehiclesData?: Vehicle[];
  calcParams?: {
    fobJpy: number;
    fxRate: number;
  };
  suggestedPrompts?: string[];
}

interface DealerChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function triggerHeiwaCopilot(prompt?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-heiwa-copilot", { detail: { prompt } }));
  }
}

export default function DealerChatAssistant({
  isOpen,
  onClose,
}: DealerChatAssistantProps) {
  const pathname = usePathname();
  const { state: syncState } = useSyncStore();

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Vehicle Context from URL (e.g. /vehicles/1)
  const activeVehicleId = pathname?.startsWith("/vehicles/") 
    ? parseInt(pathname.replace("/vehicles/", "")) 
    : null;
  const activeVehicle = activeVehicleId 
    ? VEHICLES.find((v) => v.id === activeVehicleId) 
    : null;

  // Initial welcome message
  const initialMessages: ChatMessage[] = [
    {
      id: "msg-welcome-1",
      sender: "bot",
      text: `**Konnichiwa David!** 👋\n\nI am your **Heiwa Japanese Auction Copilot**. I monitor **140+ Japanese auction houses** (USS Tokyo, USS Yokohama, CAA, TAA) and calculate real-time NZ landed costs with live **¥${syncState.fxRateJpyNzd} / NZD** foreign exchange.\n\nHow can I help Auckland Auto Group optimize your bidding strategy today?`,
      timestamp: "Just now",
      suggestedPrompts: [
        "💎 Top Margin Opportunities Today",
        "🧮 Calculate Landed Cost",
        "📋 Explain Sheet Codes (W2, A1, U2)",
        "🎯 Auckland Demand & TradeMe Comps",
        "🚢 Yokohama Shipping Schedule"
      ]
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("autoheiwa_chat_history");
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return initialMessages;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Custom event listener to receive prompts from anywhere in the app
  useEffect(() => {
    const handleCustomTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      }
    };
    window.addEventListener("open-heiwa-copilot", handleCustomTrigger);
    return () => window.removeEventListener("open-heiwa-copilot", handleCustomTrigger);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Persist to session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("autoheiwa_chat_history", JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  // Keyboard shortcut Ctrl+J or Cmd+J to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages(initialMessages);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("autoheiwa_chat_history");
    }
  };

  // Bot response generator based on dealer query
  const generateBotReply = (query: string): ChatMessage => {
    const q = query.toLowerCase().trim();
    const fx = syncState.fxRateJpyNzd;

    // Check if query is about a specific car in the database
    if (q.includes("aqua") || (activeVehicle && activeVehicle.model.toLowerCase().includes("aqua") && (q.includes("this") || q.includes("bid") || q.includes("margin") || q.includes("cost")))) {
      const aqua = VEHICLES.find((v) => v.model === "Aqua") || VEHICLES[0];
      const fobNzd = Math.round(aqua.fobJpy / fx);
      const landed = Math.round((fobNzd + syncState.freightPerUnitNzd + syncState.compliancePerUnitNzd + 280) * 1.15);
      const margin = aqua.estRetailNzd - landed;

      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🚗 2019 Toyota Aqua S Hybrid (Stockid #${aqua.lotNumber})\n**Auction House:** ${aqua.auctionHouse} | **Grade:** ${aqua.grade} (Interior ${aqua.interiorGrade})\n\n**Current Live Landed Breakdown (¥${fx} FX):**\n- **FOB Bid:** ¥${aqua.fobJpy.toLocaleString("en-US")} (≈ NZ$${fobNzd.toLocaleString("en-US")})\n- **RoRo Sea Freight:** NZ$${syncState.freightPerUnitNzd.toLocaleString("en-US")}\n- **NZ Compliance & Bio-Security:** NZ$${syncState.compliancePerUnitNzd.toLocaleString("en-US")}\n- **GST (15%) & Port Doc:** NZ$${Math.round(landed - fobNzd - syncState.freightPerUnitNzd - syncState.compliancePerUnitNzd).toLocaleString("en-US")}\n- **Total Landed Cost:** **NZ$${landed.toLocaleString("en-US")}**\n- **Auckland Est. Retail:** NZ$${aqua.estRetailNzd.toLocaleString("en-US")}\n- **Projected Net Margin:** <span class="text-emerald-700 font-extrabold">+NZ$${margin.toLocaleString("en-US")} (${Math.round((margin/landed)*100)}% ROI)</span>\n\n**Auction Sheet Intelligence:**\nInspection sheet shows pristine hybrid battery health (SOH > 92%), 0 structural remarks, and minor A1 scratch on rear quarter. Highly liquid Auckland turn time (avg 14 days).`,
        timestamp: "Just now",
        type: "vehicles",
        vehiclesData: [aqua],
        suggestedPrompts: [
          "NZ Market Pricing for Aqua",
          "Explain Grade 4.5 USS Sheet",
          "Compare Aqua vs Honda Fit"
        ]
      };
    }

    if (q.includes("fit") || (activeVehicle && activeVehicle.model.toLowerCase().includes("fit") && (q.includes("this") || q.includes("cost")))) {
      const fit = VEHICLES.find((v) => v.model === "Fit") || VEHICLES[1];
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🚗 2020 Honda Fit e:HEV Home (Stockid #${fit.lotNumber})\n**Auction House:** ${fit.auctionHouse} | **Grade:** ${fit.grade} (Interior ${fit.interiorGrade})\n\n**Key Highlights for NZ Market:**\n- **Dual-motor e:HEV powertrain:** High fuel efficiency (85g/km CO2, neutral Clean Car).\n- **FOB JPY:** ¥${fit.fobJpy.toLocaleString("en-US")} (≈ NZ$${Math.round(fit.fobJpy/fx).toLocaleString("en-US")})\n- **Total Landed:** **NZ$${fit.landedNzd.toLocaleString("en-US")}**\n- **Projected Margin:** **+NZ$${fit.targetMarginNzd.toLocaleString("en-US")}**\n- Low mileage: 45,100 km with full Japanese dealer service booklet.`,
        timestamp: "Just now",
        type: "vehicles",
        vehiclesData: [fit],
        suggestedPrompts: [
          "Calculate Landed Cost at ¥1.25M",
          "Next Shipping Vessel from Yokohama",
          "Top Margin Opportunities Today"
        ]
      };
    }

    if (q.includes("c-hr") || q.includes("chr") || (activeVehicle && activeVehicle.model.toLowerCase().includes("c-hr"))) {
      const chr = VEHICLES.find((v) => v.model === "C-HR") || VEHICLES[2];
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🚗 2019 Toyota C-HR G LED Hybrid (Stockid #${chr.lotNumber})\n**Auction House:** ${chr.auctionHouse} | **Grade:** ${chr.grade}\n\n- **FOB:** ¥${chr.fobJpy.toLocaleString("en-US")} | **Landed NZD:** **NZ$${chr.landedNzd.toLocaleString("en-US")}**\n- **Est. Retail:** NZ$${chr.estRetailNzd.toLocaleString("en-US")} | **Margin:** <span class="text-emerald-700 font-extrabold">+NZ$${chr.targetMarginNzd.toLocaleString("en-US")}</span>\n- **Market Analysis:** Compact crossovers command premium retail velocity in Auckland & Hamilton. 2-tone black/pearl roof is the highest-spec variant.`,
        timestamp: "Just now",
        type: "vehicles",
        vehiclesData: [chr],
        suggestedPrompts: [
          "NZ Market Pricing for C-HR",
          "Calculate Landed Cost",
          "Shipping Schedule to Auckland"
        ]
      };
    }

    // Top sourcing opportunities & deals
    if (q.includes("margin") || q.includes("top") || q.includes("sourcing") || q.includes("best") || q.includes("deal") || q.includes("picks") || q.includes("priority")) {
      const topVehicles = VEHICLES.filter((v) => v.status === "Priority").slice(0, 3);
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🏆 Top Sourcing Opportunities Today\nHere are the **top 3 vehicles** in tomorrow's Tokyo and Nagoya sessions matching Auckland Auto Group's criteria with an estimated **NZ$3,500+ gross margin spread** based on NZ market comparables:`,
        timestamp: "Just now",
        type: "vehicles",
        vehiclesData: topVehicles,
        suggestedPrompts: [
          "🧮 Interactive Landed Cost Calculator",
          "📋 Japanese Auction Sheet Codes",
          "⚡ NZ Market Pricing Benchmarks"
        ]
      };
    }

    // Under 20k
    if (q.includes("under 20") || q.includes("under $20k") || q.includes("under 20k") || q.includes("budget") || q.includes("cheap")) {
      const affordable = VEHICLES.filter((v) => v.landedNzd <= 20000).slice(0, 3);
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🎯 High-Volume Opportunities Under NZ$20,000 Landed\nWe found **${affordable.length} vehicles** that land under NZ$20,000 all-inclusive, ideal for fast retail turnover in the Auckland metro yard:`,
        timestamp: "Just now",
        type: "vehicles",
        vehiclesData: affordable,
        suggestedPrompts: [
          "Calculate FOB to Landed Conversion",
          "What is my target margin on these?",
          "Next Shipping Vessel from Yokohama"
        ]
      };
    }

    // Calculator request
    if (q.includes("calculator") || q.includes("calculate") || q.includes("formula") || q.includes("fob") || q.includes("landed cost") || q.includes("math") || q.includes("breakdown")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🧮 Live Landed Cost Simulator\nAdjust the **FOB Price in Japanese Yen (JPY)** below to simulate the exact all-inclusive landed cost at Ports of Auckland, including sea freight, compliance, Heiwa documentation, and 15% GST:`,
        timestamp: "Just now",
        type: "calculator",
        calcParams: {
          fobJpy: activeVehicle ? activeVehicle.fobJpy : 1420000,
          fxRate: fx
        },
        suggestedPrompts: [
          "What is the GST calculation formula?",
          "How does JPY fluctuation affect margin?",
          "Top Sourcing Opportunities Today"
        ]
      };
    }

    // Auction sheet codes / grading glossary
    if (q.includes("sheet") || q.includes("grade") || q.includes("w2") || q.includes("a1") || q.includes("u2") || q.includes("inspection") || q.includes("defect") || q.includes("code") || q.includes("marks")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 📋 Japanese Auction Sheet Inspection Decoder\nJapanese auction sheets (USS, CAA, TAA, HAA) use standardized alphanumeric codes for exterior blemishes and structural grading:`,
        timestamp: "Just now",
        type: "sheet_glossary",
        suggestedPrompts: [
          "Is Grade 4.5 safe for NZ compliance?",
          "What does W2 mean on auction sheet?",
          "Calculate Landed Cost"
        ]
      };
    }

    // Shipping & logistics
    if (q.includes("ship") || q.includes("vessel") || q.includes("freight") || q.includes("transit") || q.includes("yokohama") || q.includes("port") || q.includes("armacup") || q.includes("toyofuji")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🚢 Heiwa Japan ⇄ New Zealand Vessel Schedule\nHeiwa Auto reserves dedicated vehicle space on dedicated RoRo car carriers from **Yokohama, Nagoya, and Kobe** to **Ports of Auckland, Tauranga, and Lyttelton**:`,
        timestamp: "Just now",
        type: "shipping",
        suggestedPrompts: [
          "How long does bio-security wash take?",
          "Calculate Landed Cost with Freight",
          "Top Sourcing Opportunities Today"
        ]
      };
    }

    // Clean Car Standard / Emissions
    if (q.includes("clean car") || q.includes("emission") || q.includes("rebate") || q.includes("fee") || q.includes("battery") || q.includes("hybrid")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### ⚡ NZ Clean Car Standard & Battery Intelligence\n\n**Current Regulatory Benchmark:**\n- **Target Threshold:** 112 g CO2/km (WLTP3).\n- **Toyota Aqua (1NZ-FXE):** Approx 82 g/km → **Neutral (Zero Clean Car Fee)**.\n- **Honda Fit e:HEV:** Approx 85 g/km → **Neutral (Zero Clean Car Fee)**.\n- **Toyota C-HR Hybrid:** Approx 95 g/km → **Neutral (Zero Clean Car Fee)**.\n- **Pure Petrol 2.0L+ SUVs:** May incur modest NZ$300 – $800 importer penalties at entry compliance.\n\n**Battery SOH (State of Health) Protocol:**\nHeiwa Tokyo technicians perform OBD-II battery cell impedance tests on all Grade 4+ hybrids prior to export documentation. Verified SOH > 85% on all shortlisted vehicles.`,
        timestamp: "Just now",
        suggestedPrompts: [
          "Calculate Landed Cost for Aqua",
          "Top Margin Opportunities Today",
          "Japanese Sheet Inspection Codes"
        ]
      };
    }

    // TradeMe / NZ Demand
    if (q.includes("trademe") || q.includes("demand") || q.includes("retail") || q.includes("auckland") || q.includes("velocity") || q.includes("margin") || q.includes("price")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 📈 Auckland Metro Demand & Trade Me Comps\n\n**Market Velocity Highlights:**\n- **Sub-NZ$25k Hybrids:** 78% of Trade Me Motors listings sell within **18 calendar days** in the Auckland region.\n- **Toyota Aqua 2018–2020:** Active Trade Me listings: 142 units. Median listed price: **NZ$24,200**. Inventory turnover: **14 days**.\n- **Honda Fit e:HEV 2020+:** Active Trade Me listings: 48 units. Median listed price: **NZ$22,900**. High buyer interest due to modern Apple CarPlay interior.\n- **Market Indicator:** Historical listings indicate a median gross margin spread of **NZ$3,500** between landed cost and retail asking.`,
        timestamp: "Just now",
        suggestedPrompts: [
          "Show Top Margin Opportunities",
          "🧮 Calculate Landed Cost",
          "Calculate Landed Cost for Aqua"
        ]
      };
    }

    // Landed Cost & Retail Margin Formula
    if (q.includes("max bid") || q.includes("strategy") || q.includes("how much to bid") || q.includes("target")) {
      return {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `### 🎯 Landed Cost & Margin Indicator Formula\n\nTo evaluate target dealer gross margin against expected retail:\n\n$$\\text{Target Landed} = \\text{Est. Retail} - \\text{Target Margin}$$\n$$\\text{Target FOB NZD} = \\frac{\\text{Target Landed}}{1.15} - (\\text{Freight} + \\text{Compliance} + \\text{Port})$$\n$$\\text{Target Auction JPY} = \\text{Target FOB NZD} \\times ${fx}$$\n\n**Example for 2019 Toyota Aqua (Trade Me Market Average NZ$24,500):**\n- Target Landed Ceiling: **NZ$20,500**\n- Target FOB JPY Ceiling: **¥1,510,000 JPY**\n- Current Auction Guide: **¥1,420,000 JPY**\n- Market Indicator: ✅ **Positive margin potential based on NZ retail comparables.**`,
        timestamp: "Just now",
        suggestedPrompts: [
          "Open Landed Cost Calculator",
          "Inspect Toyota Aqua Sheet",
          "Top Margin Opportunities Today"
        ]
      };
    }

    // Default intelligent response
    return {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: `### 🤖 Japanese Auction Intelligence Analysis\n\nRegarding your inquiry: *"**${query}**"*\n\nBased on live data across **USS Tokyo, Yokohama & CAA Chubu** at current FX benchmark **¥${fx} / NZD**:\n\n- **Inventory Status:** 32 priority lots match Auckland Auto Group's criteria (Toyota, Honda, Mazda, Lexus).\n- **Landed Cost Index:** Freight benchmark is steady at NZ$${syncState.freightPerUnitNzd}, Compliance at NZ$${syncState.compliancePerUnitNzd}.\n- **Market Margin Potential:** Median spread between Japan FOB + landed costs and NZ Trade Me retail is **+NZ$3,850**.\n\nWould you like me to calculate a specific landed cost, decode auction sheet markings, or pull up vehicle matches?`,
      timestamp: "Just now",
      suggestedPrompts: [
        "💎 Top Margin Opportunities",
        "🧮 Interactive Landed Cost Calculator",
        "📋 Japanese Sheet Defect Codes",
        "🚢 Yokohama Shipping Schedule"
      ]
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (soundEnabled) playChime("send");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Realistic typing delay
    setTimeout(() => {
      const botReply = generateBotReply(text);
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
      if (soundEnabled) playChime("receive");
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Absolute Backdrop overlaying the page */}
      <div 
        className="fixed inset-0 bg-slate-950/20 backdrop-blur-[1.5px] z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Close Assistant Backdrop"
      />

      {/* Flyout Chatbot Assistant - Positioned ABSOLUTE / FIXED OVER the pages on the right side */}
      <aside
        aria-label="Heiwa AI Assistant Flyout"
        className={`fixed inset-y-0 right-0 z-50 ${
          isExpanded ? "w-[580px]" : "w-[440px]"
        } max-w-[94vw] bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.22)] border-l border-slate-200/90 flex flex-col animate-in slide-in-from-right duration-300`}
      >
        {/* Top Header — Light Navy Theme */}
        <div className="p-4 bg-gradient-to-r from-[#182C48] via-[#14243B] to-[#101C2E] text-white shrink-0 border-b border-[#1E3A5F]/60 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E11D48] flex items-center justify-center font-bold text-white shadow-md shadow-[#E11D48]/30 shrink-0">
                <span className="text-base font-black">和</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wide text-white">AutoHub DIP Copilot</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Auction Intelligence · ¥{syncState.fxRateJpyNzd} FX
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                title={soundEnabled ? "Mute Chat Audio" : "Enable Chat Audio"}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-400" />}
              </button>

              {/* Clear Chat */}
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                title="Reset Conversation"
              >
                <RotateCcw size={15} />
              </button>

              {/* Expand Width Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                title={isExpanded ? "Standard Width (440px)" : "Expand Width (580px)"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 hover:text-white hover:bg-red-600/30 rounded-lg transition-colors text-slate-300 ml-1"
                title="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

        {/* Active Context Bar */}
        {activeVehicle && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 truncate text-slate-200">
              <Car size={13} className="text-[#e56168] shrink-0" />
              <span className="font-semibold truncate">
                Context: {activeVehicle.year} {activeVehicle.model} (Stockid #{activeVehicle.lotNumber})
              </span>
            </div>
            <button
              onClick={() => handleSendMessage(`Analyze landed margin and auction sheet for ${activeVehicle.year} ${activeVehicle.model}`)}
              className="text-[#e56168] hover:text-white font-bold text-[10px] shrink-0 ml-2 underline"
            >
              Ask about this car
            </button>
          </div>
        )}
      </div>

      {/* Chat Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            {/* Sender badge & timestamp */}
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 font-medium">
              {msg.sender === "bot" ? (
                <>
                  <span className="w-4 h-4 rounded bg-[#E11D48] text-white flex items-center justify-center text-[9px] font-bold">和</span>
                  <span className="font-bold text-slate-700">AutoHub DIP</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-slate-700">David Miller (You)</span>
                  <User size={12} className="text-slate-500" />
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`group relative max-w-[92%] p-3.5 rounded-2xl text-xs leading-relaxed transition-all shadow-xs ${
                msg.sender === "user"
                  ? "bg-[#1E3A5F] text-white rounded-tr-none font-medium border border-[#2B4E7D]"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-sm"
              }`}
            >
              {/* Copy Button */}
              <button
                onClick={() => handleCopyMessage(msg.id, msg.text)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-opacity"
                title="Copy text"
              >
                {copiedId === msg.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              </button>

              {/* Message Content */}
              <div className="space-y-2 whitespace-pre-line prose-xs">
                {msg.text.split("\n\n").map((paragraph, idx) => {
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h4 key={idx} className="font-bold text-slate-900 text-sm border-b pb-1 border-slate-100">
                        {paragraph.replace("### ", "")}
                      </h4>
                    );
                  }
                  return (
                    <p 
                      key={idx} 
                      dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">$1</code>')
                      }} 
                    />
                  );
                })}
              </div>

              {/* Interactive Landed Cost Calculator Widget */}
              {msg.type === "calculator" && (
                <InteractiveCalcWidget
                  defaultFob={msg.calcParams?.fobJpy || 1420000}
                  fxRate={syncState.fxRateJpyNzd}
                  freight={syncState.freightPerUnitNzd}
                  compliance={syncState.compliancePerUnitNzd}
                />
              )}

              {/* Interactive Vehicle Preview Cards */}
              {msg.type === "vehicles" && msg.vehiclesData && msg.vehiclesData.length > 0 && (
                <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-100">
                  {msg.vehiclesData.map((v) => (
                    <VehicleChatCard key={v.id} vehicle={v} />
                  ))}
                </div>
              )}

              {/* Japanese Sheet Glossary Widget */}
              {msg.type === "sheet_glossary" && (
                <SheetGlossaryWidget />
              )}

              {/* Shipping Schedule Widget */}
              {msg.type === "shipping" && (
                <ShippingScheduleWidget />
              )}

              {/* Suggested Follow-up Chips */}
              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {msg.suggestedPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-[#E11D48] hover:border-[#E11D48]/30 border border-slate-200 text-[11px] font-semibold text-slate-600 transition-colors flex items-center gap-1"
                    >
                      <span>{prompt}</span>
                      <ChevronRight size={10} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-1">
            <div className="w-5 h-5 rounded-lg bg-[#E11D48] text-white flex items-center justify-center text-[10px] font-bold">
              和
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-medium text-slate-500 ml-1">Analyzing Japanese auction data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Bar */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles size={11} className="text-[#E11D48]" /> Prompts:
        </span>
        <button
          onClick={() => handleSendMessage("Top Margin Opportunities Today")}
          className="shrink-0 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
        >
          💎 Top Deals
        </button>
        <button
          onClick={() => handleSendMessage("Calculate Landed Cost for Toyota Aqua")}
          className="shrink-0 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
        >
          🧮 Landed Calc
        </button>
        <button
          onClick={() => handleSendMessage("Explain Sheet Codes (W2, A1, U2)")}
          className="shrink-0 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
        >
          📋 Sheet Marks
        </button>
        <button
          onClick={() => handleSendMessage("Yokohama to Auckland Shipping Schedule")}
          className="shrink-0 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
        >
          🚢 Vessels
        </button>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200/90 shrink-0">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about lots, margins, sheet marks, shipping..."
            className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/20 outline-none transition-all text-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="absolute right-1.5 p-2 rounded-lg bg-[#E11D48] text-white hover:bg-[#BE123C] disabled:opacity-30 disabled:hover:bg-[#E11D48] transition-colors shadow-xs"
            title="Send Message"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
          <span>Press Enter to send · Press ⌘J to focus</span>
          <span className="font-semibold text-slate-500">AutoHub DIP v2.4</span>
        </div>
      </div>
    </aside>
  </>
);
}

// -------------------------------------------------------------
// Sub-component 1: Interactive Landed Cost Calculator Widget
// -------------------------------------------------------------
function InteractiveCalcWidget({
  defaultFob,
  fxRate,
  freight,
  compliance,
}: {
  defaultFob: number;
  fxRate: number;
  freight: number;
  compliance: number;
}) {
  const [fobJpy, setFobJpy] = useState(defaultFob);
  const [targetRetail, setTargetRetail] = useState(25000);

  const fobNzd = Math.round(fobJpy / fxRate);
  const portDocFee = 280;
  const landedBeforeGst = fobNzd + freight + compliance + portDocFee;
  const gst = Math.round(landedBeforeGst * 0.15);
  const totalLandedCost = landedBeforeGst + gst;
  const estMargin = targetRetail - totalLandedCost;

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
          <Calculator size={13} className="text-[#E11D48]" /> Landed Cost Calculator (Live)
        </span>
        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
          1 NZD = {fxRate} JPY
        </span>
      </div>

      {/* Quick FOB Presets */}
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          FOB Price (JPY)
        </label>
        <div className="flex items-center gap-1.5 mb-1.5">
          {[1200000, 1420000, 1680000, 2100000].map((preset) => (
            <button
              key={preset}
              onClick={() => setFobJpy(preset)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                fobJpy === preset
                  ? "bg-[#E11D48] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              ¥{(preset / 10000).toFixed(0)}万
            </button>
          ))}
        </div>
        <input
          type="range"
          min="800000"
          max="3500000"
          step="20000"
          value={fobJpy}
          onChange={(e) => setFobJpy(parseInt(e.target.value))}
          className="w-full accent-[#E11D48] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono font-bold text-slate-800 mt-1">
          <span>¥{fobJpy.toLocaleString("en-US")}</span>
          <span>≈ NZ${fobNzd.toLocaleString("en-US")}</span>
        </div>
      </div>

      {/* Line Item Breakdown */}
      <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
        <div className="flex justify-between text-slate-600">
          <span>FOB Converted:</span>
          <span>NZ${fobNzd.toLocaleString("en-US")}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>RoRo Sea Freight:</span>
          <span>NZ${freight.toLocaleString("en-US")}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>NZ Compliance & MAF:</span>
          <span>NZ${compliance.toLocaleString("en-US")}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>NZ GST (15%):</span>
          <span>NZ${gst.toLocaleString("en-US")}</span>
        </div>
        <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-xs">
          <span>Total Landed (NZD):</span>
          <span className="text-[#E11D48]">NZ${totalLandedCost.toLocaleString("en-US")}</span>
        </div>
      </div>

      {/* Target Retail & Margin Calculation */}
      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">At NZ$25k Retail:</span>
          <span className="font-bold text-emerald-900 text-sm">
            +NZ${estMargin.toLocaleString("en-US")} Margin
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold text-emerald-700 block">NZ Market Indicator Ceiling</span>
          <span className="font-mono font-bold text-emerald-800">
            NZ${(targetRetail - 3500).toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-component 2: Vehicle Preview Card inside Chat
// -------------------------------------------------------------
function VehicleChatCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-3">
      <img
        src={vehicle.image}
        alt={vehicle.model}
        className="w-16 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h5 className="font-bold text-slate-900 text-xs truncate">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h5>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#E11D48]/10 text-[#E11D48] shrink-0">
            Grade {vehicle.grade}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 truncate">
          {vehicle.auctionHouse} · Stockid #{vehicle.lotNumber} · {vehicle.km.toLocaleString("en-US")} km
        </p>
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span className="font-bold text-slate-900">
            Landed: NZ${vehicle.landedNzd.toLocaleString("en-US")}
          </span>
          <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded">
            +NZ${vehicle.targetMarginNzd.toLocaleString("en-US")} Margin
          </span>
        </div>
      </div>
      <Link
        href={`/vehicles/${vehicle.id}`}
        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-[#E11D48] hover:text-[#E11D48] text-slate-600 transition-colors shrink-0 shadow-2xs"
        title="View Full Vehicle Intelligence"
      >
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-component 3: Japanese Auction Sheet Glossary Widget
// -------------------------------------------------------------
function SheetGlossaryWidget() {
  const [activeTab, setActiveTab] = useState<"marks" | "grades">("marks");

  const marks = [
    { code: "A1 / A2 / A3", desc: "Scratch: Minor hairline (A1) to deep through primer (A3)" },
    { code: "U1 / U2 / U3", desc: "Dent: Minor door ping (U1) to deep crease (U3)" },
    { code: "W1 / W2 / W3", desc: "Wave / Repaint: W2 is noticeable under angle; common & acceptable" },
    { code: "XX", desc: "Replaced panel (usually front fender; doesn't affect chassis)" },
    { code: "S1 / S2", desc: "Rust: S1 is surface underbody; S2 is visible corrosion" },
    { code: "X", desc: "Damaged panel requiring replacement before registration" },
  ];

  const grades = [
    { grade: "Grade 5", desc: "As new, pristine condition, under 50k km, no resprayed panels." },
    { grade: "Grade 4.5", desc: "Excellent condition (Most popular for Auckland dealers), minor blemishes." },
    { grade: "Grade 4.0", desc: "Good condition, normal wear for age, clean chassis." },
    { grade: "Grade 3.5", desc: "Average condition, noticeable dents/scratches, wheel scuffs." },
    { grade: "Grade R", desc: "Accident repaired history; verified structural replacement." },
  ];

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("marks")}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
            activeTab === "marks" ? "bg-[#1E3A5F] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Inspection Marks (A1, W2, U1)
        </button>
        <button
          onClick={() => setActiveTab("grades")}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
            activeTab === "grades" ? "bg-[#1E3A5F] text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Auction Grades (5, 4.5, 4.0, R)
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {activeTab === "marks" ? (
          marks.map((m, idx) => (
            <div key={idx} className="p-1.5 bg-white rounded border border-slate-200 flex items-start gap-2">
              <span className="font-mono font-bold text-[#E11D48] text-[11px] shrink-0 bg-rose-50 px-1 rounded">
                {m.code}
              </span>
              <span className="text-[11px] text-slate-700">{m.desc}</span>
            </div>
          ))
        ) : (
          grades.map((g, idx) => (
            <div key={idx} className="p-1.5 bg-white rounded border border-slate-200 flex items-start gap-2">
              <span className="font-bold text-slate-900 text-[11px] shrink-0 bg-slate-100 px-1 rounded">
                {g.grade}
              </span>
              <span className="text-[11px] text-slate-700">{g.desc}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-component 4: Shipping Schedule Widget
// -------------------------------------------------------------
function ShippingScheduleWidget() {
  const sailings = [
    { vessel: "MV Trans Future 7 (Toyofuji)", port: "Yokohama → Auckland", departure: "28 Sep", arrival: "16 Oct", transit: "18 days" },
    { vessel: "MV Sepang Express (Armacup)", port: "Nagoya → Auckland / Lyttelton", departure: "03 Oct", arrival: "22 Oct", transit: "19 days" },
    { vessel: "MV Positive Star (Eastern Car)", port: "Kobe → Tauranga", departure: "08 Oct", arrival: "28 Oct", transit: "20 days" },
  ];

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-800 text-[11px]">
        <span className="flex items-center gap-1.5">
          <Ship size={13} className="text-blue-600" /> Confirmed Heiwa RoRo Sailings
        </span>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          Reserved Space
        </span>
      </div>

      <div className="space-y-1.5">
        {sailings.map((s, idx) => (
          <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>{s.vessel}</span>
              <span className="text-blue-700 font-mono text-[10px]">{s.transit}</span>
            </div>
            <p className="text-slate-500 text-[10px]">{s.port}</p>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-600 font-semibold">
              <span>ETD: {s.departure}</span>
              <span className="text-emerald-700">ETA Ports of Auckland: {s.arrival}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
