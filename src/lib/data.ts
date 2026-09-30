export interface Vehicle {
  id: number;
  make: string;
  model: string;
  badge: string;
  year: number;
  km: number;
  grade: string;
  interiorGrade: string;
  auctionHouse: string;
  lotNumber: string;
  auctionDate: string;
  timeLeft: string;
  fobJpy: number;
  landedNzd: number;
  estRetailNzd: number;
  maxBidNzd: number;
  targetMarginNzd: number;
  score: number;
  status: 'Priority' | 'Consider' | 'Review';
  fuel: string;
  engine: string;
  transmission: string;
  color: string;
  vin: string;
  dealer: string;
  image: string;
  gallery: string[];
  aiAnalysis: {
    summary: string;
    highlights: string[];
    confidence: number;
    grossMarginPotential: number;
    arbitrageSpread?: number;
  };
  nzComparables: {
    source: string;
    year: number;
    km: number;
    price: number;
    daysListed: number;
    url?: string;
  }[];
  costBreakdown: {
    fobConvertedNzd: number;
    freightNzd: number;
    complianceNzd: number;
    gstAndFeesNzd: number;
    totalLandedNzd: number;
    targetMarginNzd: number;
    maxBidNzd: number;
  };
}

export const VEHICLES: Vehicle[] = [
  {
    id: 1,
    make: "Toyota",
    model: "Aqua",
    badge: "S Hybrid Package",
    year: 2019,
    km: 58200,
    grade: "4.5",
    interiorGrade: "A",
    auctionHouse: "USS Tokyo",
    lotNumber: "40822",
    auctionDate: "Tomorrow, 10:45 AM JST",
    timeLeft: "02h 45m",
    fobJpy: 1420000,
    landedNzd: 19000,
    estRetailNzd: 24500,
    maxBidNzd: 20500,
    targetMarginNzd: 4000,
    score: 94,
    status: "Priority",
    fuel: "Hybrid",
    engine: "1.5L 1NZ-FXE",
    transmission: "e-CVT Automatic",
    color: "Pearl White",
    vin: "NHP10-2184910",
    dealer: "Auckland Auto Group",
    image: "/vehicles/aqua.jpg",
    gallery: [
      "/vehicles/aqua.jpg",
      "/vehicles/prius-5d.jpg",
      "/vehicles/c-hr.jpg",
    ],
    aiAnalysis: {
      summary: "Prime dealer opportunity. Grade 4.5 auction report shows pristine battery health, genuine 58k km, and zero structural remarks. NZ demand in Auckland metro has median turn rate of under 18 days.",
      highlights: [
        "NZ$4,000+ projected gross margin at current FOB exchange rate",
        "Grade 4.5 exterior rating with verified Japanese ODO certificate",
        "Qualifies for zero Clean Car penalties and low compliance turnaround",
        "High retail velocity: 82% of similar Aqua listings sold in < 25 days"
      ],
      confidence: 96,
      grossMarginPotential: 4000
    },
    nzComparables: [
      { source: "Trade Me Motors", year: 2019, km: 61000, price: 23990, daysListed: 14 },
      { source: "Turners Penrose", year: 2019, km: 55000, price: 24500, daysListed: 9 },
      { source: "AutoTrader NZ", year: 2019, km: 64200, price: 23450, daysListed: 21 },
      { source: "Giltrap Group", year: 2018, km: 68000, price: 22800, daysListed: 32 }
    ],
    costBreakdown: {
      fobConvertedNzd: 15550,
      freightNzd: 2200,
      complianceNzd: 1100,
      gstAndFeesNzd: 1150,
      totalLandedNzd: 19000,
      targetMarginNzd: 4000,
      maxBidNzd: 20500
    }
  },
  {
    id: 2,
    make: "Honda",
    model: "Fit",
    badge: "e:HEV Home Edition",
    year: 2020,
    km: 45100,
    grade: "4.0",
    interiorGrade: "B",
    auctionHouse: "USS Yokohama",
    lotNumber: "18940",
    auctionDate: "Tomorrow, 01:15 PM JST",
    timeLeft: "05h 15m",
    fobJpy: 1350000,
    landedNzd: 17800,
    estRetailNzd: 22800,
    maxBidNzd: 19200,
    targetMarginNzd: 3600,
    score: 89,
    status: "Priority",
    fuel: "Hybrid",
    engine: "1.5L e:HEV Dual Motor",
    transmission: "Automatic e-CVT",
    color: "Platinum Silver",
    vin: "GR3-1029482",
    dealer: "Hamilton Motors",
    image: "/vehicles/aqua.jpg",
    gallery: [
      "/vehicles/aqua.jpg",
      "/vehicles/c-hr.jpg"
    ],
    aiAnalysis: {
      summary: "Modern 4th-generation Fit with dual-motor e:HEV powertrain. Exceptional fuel economy and Honda SENSING safety suite. Consistently sells at high retail retention.",
      highlights: [
        "Contemporary 2020 GR3 shape with digital cockpit & Apple CarPlay",
        "Low mileage at 45k km with full dealer service history stamps",
        "Clean Car rebate eligible profile with 85g/km low emission rating"
      ],
      confidence: 93,
      grossMarginPotential: 3600
    },
    nzComparables: [
      { source: "Trade Me Motors", year: 2020, km: 48000, price: 22990, daysListed: 12 },
      { source: "Turners Botany", year: 2020, km: 44000, price: 23400, daysListed: 18 },
      { source: "AutoTrader NZ", year: 2020, km: 52000, price: 22500, daysListed: 26 }
    ],
    costBreakdown: {
      fobConvertedNzd: 14780,
      freightNzd: 2200,
      complianceNzd: 1050,
      gstAndFeesNzd: 970,
      totalLandedNzd: 17800,
      targetMarginNzd: 3600,
      maxBidNzd: 19200
    }
  },
  {
    id: 3,
    make: "Toyota",
    model: "C-HR",
    badge: "G LED Hybrid Edition",
    year: 2019,
    km: 62400,
    grade: "4.5",
    interiorGrade: "A",
    auctionHouse: "CAA Chubu",
    lotNumber: "77215",
    auctionDate: "Tomorrow, 03:30 PM JST",
    timeLeft: "07h 30m",
    fobJpy: 1680000,
    landedNzd: 22100,
    estRetailNzd: 27900,
    maxBidNzd: 23800,
    targetMarginNzd: 4100,
    score: 92,
    status: "Priority",
    fuel: "Hybrid",
    engine: "1.8L 2ZR-FXE Hybrid",
    transmission: "CVT",
    color: "Two-Tone Black / Pearl",
    vin: "ZYX10-2098411",
    dealer: "Auckland Auto Group",
    image: "/vehicles/c-hr.jpg",
    gallery: [
      "/vehicles/c-hr.jpg",
      "/vehicles/aqua.jpg",
      "/vehicles/prius-5d.jpg"
    ],
    aiAnalysis: {
      summary: "High-demand compact crossover. Desirable two-tone roof package with genuine LED headlights and leather-trimmed cabin. Highly liquid inventory.",
      highlights: [
        "Estimated retail turnaround under 16 days across North Island yards",
        "NZ$4,100 gross margin potential above target benchmark",
        "Grade 4.5 condition sheet with spotless undercarriage report"
      ],
      confidence: 95,
      grossMarginPotential: 4100
    },
    nzComparables: [
      { source: "Trade Me Motors", year: 2019, km: 65000, price: 27990, daysListed: 15 },
      { source: "Turners Manukau", year: 2019, km: 59000, price: 28500, daysListed: 11 },
      { source: "AutoTrader NZ", year: 2019, km: 68000, price: 26990, daysListed: 29 }
    ],
    costBreakdown: {
      fobConvertedNzd: 18400,
      freightNzd: 2300,
      complianceNzd: 1150,
      gstAndFeesNzd: 1250,
      totalLandedNzd: 22100,
      targetMarginNzd: 4100,
      maxBidNzd: 23800
    }
  },
  {
    id: 4,
    make: "Mazda",
    model: "Axela / Mazda 3",
    badge: "20S Proactive Touring",
    year: 2019,
    km: 51200,
    grade: "4.0",
    interiorGrade: "B",
    auctionHouse: "HAA Kobe",
    lotNumber: "31049",
    auctionDate: "In 2 days, 11:00 AM JST",
    timeLeft: "1d 03h",
    fobJpy: 1280000,
    landedNzd: 17200,
    estRetailNzd: 21500,
    maxBidNzd: 18500,
    targetMarginNzd: 3000,
    score: 78,
    status: "Consider",
    fuel: "Petrol",
    engine: "2.0L SkyActiv-G",
    transmission: "6-Speed Sport Automatic",
    color: "Soul Red Crystal",
    vin: "BP5P-1049821",
    dealer: "Auckland Auto Group",
    image: "/vehicles/mazda3.jpg",
    gallery: [
      "/vehicles/mazda3.jpg",
      "/vehicles/demio.jpg"
    ],
    aiAnalysis: {
      summary: "Next-gen BP chassis with award-winning Soul Red Crystal paintwork. Premium cabin materials, heads-up display, and Bose sound package.",
      highlights: [
        "Strong buyer appeal for modern BP generation design",
        "Consistent steady margin around NZ$3,000 target",
        "Minor stone chips noted on bumper, easily groomed prior to yard display"
      ],
      confidence: 88,
      grossMarginPotential: 3000
    },
    nzComparables: [
      { source: "Trade Me Motors", year: 2019, km: 54000, price: 21990, daysListed: 22 },
      { source: "Turners Tauranga", year: 2019, km: 49000, price: 22400, daysListed: 19 }
    ],
    costBreakdown: {
      fobConvertedNzd: 14000,
      freightNzd: 2200,
      complianceNzd: 1100,
      gstAndFeesNzd: 900,
      totalLandedNzd: 17200,
      targetMarginNzd: 3000,
      maxBidNzd: 18500
    }
  },
  {
    id: 5,
    make: "Nissan",
    model: "Note",
    badge: "e-POWER X Package",
    year: 2020,
    km: 68400,
    grade: "3.5",
    interiorGrade: "C",
    auctionHouse: "USS Nagoya",
    lotNumber: "55120",
    auctionDate: "In 2 days, 02:00 PM JST",
    timeLeft: "1d 06h",
    fobJpy: 980000,
    landedNzd: 13900,
    estRetailNzd: 16900,
    maxBidNzd: 14600,
    targetMarginNzd: 2300,
    score: 62,
    status: "Review",
    fuel: "Hybrid (Series)",
    engine: "1.2L HR12DE e-Power",
    transmission: "Single-Speed Reduction",
    color: "Gun Metallic Grey",
    vin: "HE12-384910",
    dealer: "Christchurch Cars",
    image: "/vehicles/note.jpg",
    gallery: [
      "/vehicles/note.jpg",
      "/vehicles/aqua.jpg"
    ],
    aiAnalysis: {
      summary: "Budget-conscious city commuter with electric drive feel. Lower auction grade (3.5) reflects interior wear and slight scratch on rear passenger arch.",
      highlights: [
        "Entry-level landed cost under NZ$14,000",
        "Requires reconditioning budget of ~$650 NZD for yard readiness",
        "Margin spread is tighter at $2,300 based on historical market trends"
      ],
      confidence: 79,
      grossMarginPotential: 2300
    },
    nzComparables: [
      { source: "Trade Me Motors", year: 2020, km: 72000, price: 16990, daysListed: 38 },
      { source: "Turners Christchurch", year: 2019, km: 65000, price: 17200, daysListed: 41 }
    ],
    costBreakdown: {
      fobConvertedNzd: 10750,
      freightNzd: 2200,
      complianceNzd: 1050,
      gstAndFeesNzd: 700,
      totalLandedNzd: 13900,
      targetMarginNzd: 2300,
      maxBidNzd: 14600
    }
  },
  {
    id: 6,
    make: "Lexus",
    model: "NX300h",
    badge: "F-Sport AWD",
    year: 2019,
    km: 42100,
    grade: "4.5",
    interiorGrade: "A",
    auctionHouse: "USS Tokyo",
    lotNumber: "91204",
    auctionDate: "Tomorrow, 04:45 PM JST",
    timeLeft: "08h 45m",
    fobJpy: 2650000,
    landedNzd: 34500,
    estRetailNzd: 42900,
    maxBidNzd: 37500,
    targetMarginNzd: 5400,
    score: 95,
    status: "Priority",
    fuel: "Hybrid",
    engine: "2.5L 2AR-FXE Luxury Hybrid",
    transmission: "E-Four e-CVT",
    color: "Titanium Silver Metallic",
    vin: "AYZ15-1049281",
    dealer: "Auckland Auto Group",
    image: "/vehicles/lexus_nx.jpg",
    gallery: [
      "/vehicles/lexus_nx.jpg",
      "/vehicles/lexus_rx.jpg"
    ],
    aiAnalysis: {
      summary: "Luxury segment flagship opportunity. F-Sport grade with genuine low kms, sunroof, red leather accents, and Mark Levinson surround audio.",
      highlights: [
        "Superb profit margin: +NZ$5,400 projected gross margin",
        "High retail appetite among suburban luxury buyers in Remuera/Takapuna",
        "Grade 4.5 pristine provenance with official Lexus Tokyo service records"
      ],
      confidence: 97,
      grossMarginPotential: 5400
    },
    nzComparables: [
      { source: "Trade Me Motors", year: 2019, km: 45000, price: 43990, daysListed: 16 },
      { source: "Giltrap Lexus", year: 2019, km: 39000, price: 45900, daysListed: 8 },
      { source: "AutoTrader NZ", year: 2019, km: 48000, price: 42450, daysListed: 24 }
    ],
    costBreakdown: {
      fobConvertedNzd: 29000,
      freightNzd: 2400,
      complianceNzd: 1300,
      gstAndFeesNzd: 1800,
      totalLandedNzd: 34500,
      targetMarginNzd: 5400,
      maxBidNzd: 37500
    }
  }
];

export interface Dealer {
  id: number;
  name: string;
  location: string;
  tier: string;
  activeOpportunities: number;
  priorityBuys: number;
  monthlyImportsTarget: number;
  avgMargin: number;
  contactName: string;
  email: string;
  phone: string;
  preferences: {
    makes: string[];
    models: string[];
    yearRange: string;
    maxKm: number;
    fuelTypes: string[];
    targetRetail: string;
    targetMargin: string;
  };
}

export const DEALERS: Dealer[] = [
  {
    id: 1,
    name: "Auckland Auto Group",
    location: "Penrose, Auckland",
    tier: "Platinum Commercial",
    activeOpportunities: 32,
    priorityBuys: 6,
    monthlyImportsTarget: 25,
    avgMargin: 4250,
    contactName: "David Miller",
    email: "david@aucklandauto.co.nz",
    phone: "+64 9 525 8890",
    preferences: {
      makes: ["Toyota", "Honda", "Mazda", "Lexus"],
      models: ["Aqua", "Fit", "C-HR", "Axela", "NX300h", "Prius"],
      yearRange: "2018 – 2023",
      maxKm: 75000,
      fuelTypes: ["Hybrid", "Petrol"],
      targetRetail: "NZ$18,000 – NZ$35,000",
      targetMargin: "NZ$3,500+"
    }
  },
  {
    id: 2,
    name: "Hamilton Motors",
    location: "Te Rapa, Hamilton",
    tier: "Gold Dealer",
    activeOpportunities: 18,
    priorityBuys: 3,
    monthlyImportsTarget: 14,
    avgMargin: 3600,
    contactName: "Sarah Jenkins",
    email: "sarah@hamiltonmotors.co.nz",
    phone: "+64 7 849 2200",
    preferences: {
      makes: ["Honda", "Toyota", "Subaru"],
      models: ["Fit", "Aqua", "Vezel", "Impreza"],
      yearRange: "2017 – 2022",
      maxKm: 85000,
      fuelTypes: ["Hybrid", "Petrol"],
      targetRetail: "NZ$16,000 – NZ$26,000",
      targetMargin: "NZ$3,000+"
    }
  },
  {
    id: 3,
    name: "Christchurch Cars",
    location: "Moorhouse Ave, Christchurch",
    tier: "Silver Dealer",
    activeOpportunities: 14,
    priorityBuys: 2,
    monthlyImportsTarget: 10,
    avgMargin: 2900,
    contactName: "Marcus Vance",
    email: "marcus@chchcars.co.nz",
    phone: "+64 3 379 1144",
    preferences: {
      makes: ["Toyota", "Nissan", "Mazda"],
      models: ["Aqua", "Note", "Demio", "Axela"],
      yearRange: "2016 – 2021",
      maxKm: 90000,
      fuelTypes: ["Hybrid", "Petrol"],
      targetRetail: "NZ$14,000 – NZ$22,000",
      targetMargin: "NZ$2,500+"
    }
  }
];

export const GLOBAL_SETTINGS = {
  fxRateJpyNzd: 91.24,
  fxLastUpdated: "12 mins ago (Live Bank Feed)",
  freightPerUnitNzd: 2200,
  compliancePerUnitNzd: 1100,
  gstRate: 0.15,
  defaultTargetMarginNzd: 3500,
  auctionPortFeeNzd: 280,
  cleanCarNeutralThreshold: 112, // g/km
};
