export interface TopModelDemand {
  id: string;
  name: string;
  fullName: string;
  make: string;
  segment: 'SUV' | 'Compact' | 'Sedan/Wagon' | 'Hybrid';
  fuel: string;
  demandCount: number;
  dealersCount: number;
  turnDays: number;
  avgMarginNzd: number;
  color: string;
}

export interface SupplyGapItem {
  id: string;
  model: string;
  make: string;
  segment: 'SUV' | 'Compact' | 'Sedan/Wagon' | 'Hybrid';
  badge: string;
  image: string;
  demandUnits: number;
  currentStockUnits: number;
  coveragePct: number;
  avgDaysToSell: number;
  avgDealerMarginNzd: number;
  avgDealerMarginJpy: number;
  recommendation: 'Source more' | 'Balanced' | 'Oversupplied';
  immediateSeller: boolean;
  unmetGap: number;
}

export interface MatchedDealerInfo {
  dealerId: number;
  name: string;
  region: string;
  matchScore: number;
  wishlistCriteria: string;
  targetBudgetNzd: number;
  lastActive: string;
  avatarBg: string;
}

export interface AuctionMatchVehicle {
  id: string;
  model: string;
  year: number;
  badge: string;
  km: number;
  grade: string;
  interiorGrade: string;
  auctionHouse: string;
  lotNumber: string;
  auctionDate: string;
  timeLeft: string;
  fobPriceNzd: number;
  fobPriceJpy: number;
  estLandedNzd: number;
  image: string;
  matchedDealersCount: number;
  matchedDealers: MatchedDealerInfo[];
}

export interface RegionDemand {
  region: string;
  units: number;
  pct: number;
  activeDealers: number;
  topSegment: string;
  segments: {
    hybrid: number;
    suv: number;
    compact: number;
    sedan: number;
  };
}

export interface SparklinePoint {
  val: number;
}

export interface TrendModel {
  name: string;
  pctChange: number;
  direction: 'up' | 'down';
  sparkline: number[];
  driver: string;
  driverJp: string;
  segment: string;
}

// Top 10 Most Wanted Models
export const TOP_WANTED_MODELS: TopModelDemand[] = [
  {
    id: 'aqua',
    name: 'Aqua',
    fullName: 'Toyota Aqua',
    make: 'Toyota',
    segment: 'Compact',
    fuel: 'Hybrid',
    demandCount: 184,
    dealersCount: 68,
    turnDays: 12,
    avgMarginNzd: 4000,
    color: '#0284c7'
  },
  {
    id: 'chr',
    name: 'C-HR',
    fullName: 'Toyota C-HR',
    make: 'Toyota',
    segment: 'SUV',
    fuel: 'Hybrid',
    demandCount: 162,
    dealersCount: 61,
    turnDays: 14,
    avgMarginNzd: 4100,
    color: '#E11D48'
  },
  {
    id: 'prius',
    name: 'Prius',
    fullName: 'Toyota Prius',
    make: 'Toyota',
    segment: 'Sedan/Wagon',
    fuel: 'Hybrid',
    demandCount: 148,
    dealersCount: 54,
    turnDays: 22,
    avgMarginNzd: 3400,
    color: '#0d9488'
  },
  {
    id: 'vezel',
    name: 'Vezel',
    fullName: 'Honda Vezel',
    make: 'Honda',
    segment: 'SUV',
    fuel: 'Hybrid',
    demandCount: 139,
    dealersCount: 49,
    turnDays: 15,
    avgMarginNzd: 3850,
    color: '#6366f1'
  },
  {
    id: 'fit',
    name: 'Fit Hybrid',
    fullName: 'Honda Fit Hybrid',
    make: 'Honda',
    segment: 'Compact',
    fuel: 'Hybrid',
    demandCount: 125,
    dealersCount: 44,
    turnDays: 21,
    avgMarginNzd: 3200,
    color: '#8b5cf6'
  },
  {
    id: 'cx5',
    name: 'CX-5',
    fullName: 'Mazda CX-5',
    make: 'Mazda',
    segment: 'SUV',
    fuel: 'Petrol/Diesel',
    demandCount: 112,
    dealersCount: 38,
    turnDays: 19,
    avgMarginNzd: 3600,
    color: '#d97706'
  },
  {
    id: 'note',
    name: 'Note e-Power',
    fullName: 'Nissan Note e-Power',
    make: 'Nissan',
    segment: 'Compact',
    fuel: 'Hybrid',
    demandCount: 98,
    dealersCount: 35,
    turnDays: 18,
    avgMarginNzd: 3100,
    color: '#0891b2'
  },
  {
    id: 'fielder',
    name: 'Corolla Fielder',
    fullName: 'Toyota Corolla Fielder',
    make: 'Toyota',
    segment: 'Sedan/Wagon',
    fuel: 'Hybrid',
    demandCount: 86,
    dealersCount: 31,
    turnDays: 31,
    avgMarginNzd: 2450,
    color: '#475569'
  },
  {
    id: 'swift',
    name: 'Swift',
    fullName: 'Suzuki Swift',
    make: 'Suzuki',
    segment: 'Compact',
    fuel: 'Petrol',
    demandCount: 79,
    dealersCount: 28,
    turnDays: 25,
    avgMarginNzd: 2700,
    color: '#ec4899'
  },
  {
    id: 'axela',
    name: 'Axela',
    fullName: 'Mazda Axela',
    make: 'Mazda',
    segment: 'Sedan/Wagon',
    fuel: 'Petrol',
    demandCount: 65,
    dealersCount: 24,
    turnDays: 39,
    avgMarginNzd: 2100,
    color: '#64748b'
  }
];

// 12-Week Demand Trend for Top 5 Models
export const WEEKS_LABELS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];

export const TREND_TOP_5 = [
  {
    id: 'aqua',
    name: 'Toyota Aqua',
    color: '#0284c7',
    values: [120, 126, 134, 142, 148, 155, 160, 166, 172, 175, 180, 184]
  },
  {
    id: 'chr',
    name: 'Toyota C-HR',
    color: '#E11D48',
    values: [88, 94, 102, 110, 118, 125, 134, 140, 148, 153, 158, 162]
  },
  {
    id: 'prius',
    name: 'Toyota Prius',
    color: '#0d9488',
    values: [130, 132, 135, 138, 140, 142, 144, 145, 146, 147, 147, 148]
  },
  {
    id: 'vezel',
    name: 'Honda Vezel',
    color: '#6366f1',
    values: [62, 68, 72, 80, 89, 97, 105, 114, 122, 128, 134, 139]
  },
  {
    id: 'cx5',
    name: 'Mazda CX-5',
    color: '#d97706',
    values: [75, 78, 82, 86, 89, 93, 98, 101, 105, 108, 110, 112]
  }
];

// Rising and Cooling Models
export const RISING_MODELS: TrendModel[] = [
  {
    name: 'Honda Vezel',
    pctChange: 40,
    direction: 'up',
    sparkline: [25, 29, 34, 42, 50, 62, 75, 88, 100],
    driver: 'Search surge +40% this month; prime suburban family demand',
    driverJp: '今月検索数+40%急増。郊外ファミリー層の需要が極めて旺盛',
    segment: 'Hybrid SUV'
  },
  {
    name: 'Nissan Note e-Power',
    pctChange: 22,
    direction: 'up',
    sparkline: [38, 42, 45, 52, 60, 66, 74, 82, 94],
    driver: 'Urban rideshare & commuter fuel-efficiency preference',
    driverJp: '都市部通勤およびライドシェア需要による燃費重視の引き合い',
    segment: 'Compact Hybrid'
  },
  {
    name: 'Mazda CX-5',
    pctChange: 15,
    direction: 'up',
    sparkline: [52, 55, 58, 63, 69, 75, 81, 87, 95],
    driver: 'High winter AWD interest across Waikato and Canterbury',
    driverJp: 'ワイカトおよびカンタベリー地域でのAWD仕様への関心増加',
    segment: 'Mid SUV'
  }
];

export const COOLING_MODELS: TrendModel[] = [
  {
    name: 'Mazda Axela',
    pctChange: -18,
    direction: 'down',
    sparkline: [98, 92, 85, 78, 70, 64, 56, 48, 40],
    driver: 'Yard inventory aging; dealer demand pivoting to hybrid compacts',
    driverJp: '店頭在庫の長期化。ディーラー需要がハイブリッド小型車へ完全移行',
    segment: 'Sedan/Hatch'
  },
  {
    name: 'Toyota Corolla Fielder',
    pctChange: -9,
    direction: 'down',
    sparkline: [88, 86, 84, 80, 76, 74, 71, 68, 62],
    driver: 'Ample local yard inventory in Waikato and Bay of Plenty',
    driverJp: 'ワイカトおよびベイオブプレンティでの既存在庫充足による軟化',
    segment: 'Hybrid Wagon'
  },
  {
    name: 'Toyota Noah / Voxy',
    pctChange: -6,
    direction: 'down',
    sparkline: [80, 78, 76, 73, 71, 69, 68, 66, 64],
    driver: 'Seasonal lull in commercial 8-seater van demand',
    driverJp: '商用8人乗りミニバンの季節的需要端境期',
    segment: 'Minivan'
  }
];

// Supply vs Demand Gap Table (Primary Table)
export const SUPPLY_DEMAND_GAP: SupplyGapItem[] = [
  {
    id: 'chr',
    model: 'Toyota C-HR',
    make: 'Toyota',
    segment: 'SUV',
    badge: '1.8L G LED Hybrid',
    image: '/vehicles/c-hr.jpg',
    demandUnits: 162,
    currentStockUnits: 57,
    coveragePct: 35,
    avgDaysToSell: 14,
    avgDealerMarginNzd: 4100,
    avgDealerMarginJpy: 374084,
    recommendation: 'Source more',
    immediateSeller: true,
    unmetGap: 105
  },
  {
    id: 'vezel',
    model: 'Honda Vezel',
    make: 'Honda',
    segment: 'SUV',
    badge: '1.5L e:HEV / Hybrid Z',
    image: '/vehicles/c-hr.jpg',
    demandUnits: 139,
    currentStockUnits: 42,
    coveragePct: 30,
    avgDaysToSell: 15,
    avgDealerMarginNzd: 3850,
    avgDealerMarginJpy: 351274,
    recommendation: 'Source more',
    immediateSeller: true,
    unmetGap: 97
  },
  {
    id: 'aqua',
    model: 'Toyota Aqua',
    make: 'Toyota',
    segment: 'Compact',
    badge: '1.5L S / G Package',
    image: '/vehicles/aqua.jpg',
    demandUnits: 184,
    currentStockUnits: 88,
    coveragePct: 48,
    avgDaysToSell: 12,
    avgDealerMarginNzd: 4000,
    avgDealerMarginJpy: 364960,
    recommendation: 'Source more',
    immediateSeller: true,
    unmetGap: 96
  },
  {
    id: 'cx5',
    model: 'Mazda CX-5',
    make: 'Mazda',
    segment: 'SUV',
    badge: '2.5L / 2.2D L-Package AWD',
    image: '/vehicles/cx3.jpg',
    demandUnits: 112,
    currentStockUnits: 45,
    coveragePct: 40,
    avgDaysToSell: 19,
    avgDealerMarginNzd: 3600,
    avgDealerMarginJpy: 328464,
    recommendation: 'Source more',
    immediateSeller: true,
    unmetGap: 67
  },
  {
    id: 'note',
    model: 'Nissan Note',
    make: 'Nissan',
    segment: 'Compact',
    badge: '1.2L e-POWER X / Medalist',
    image: '/vehicles/note.jpg',
    demandUnits: 98,
    currentStockUnits: 34,
    coveragePct: 35,
    avgDaysToSell: 18,
    avgDealerMarginNzd: 3100,
    avgDealerMarginJpy: 282844,
    recommendation: 'Source more',
    immediateSeller: true,
    unmetGap: 64
  },
  {
    id: 'prius',
    model: 'Toyota Prius',
    make: 'Toyota',
    segment: 'Sedan/Wagon',
    badge: '1.8L S Touring / A Premium',
    image: '/vehicles/prius-5d.jpg',
    demandUnits: 148,
    currentStockUnits: 102,
    coveragePct: 69,
    avgDaysToSell: 22,
    avgDealerMarginNzd: 3400,
    avgDealerMarginJpy: 310216,
    recommendation: 'Balanced',
    immediateSeller: false,
    unmetGap: 46
  },
  {
    id: 'fit',
    model: 'Honda Fit Hybrid',
    make: 'Honda',
    segment: 'Compact',
    badge: '1.5L e:HEV Home / Ness',
    image: '/vehicles/aqua.jpg',
    demandUnits: 125,
    currentStockUnits: 94,
    coveragePct: 75,
    avgDaysToSell: 21,
    avgDealerMarginNzd: 3200,
    avgDealerMarginJpy: 291968,
    recommendation: 'Balanced',
    immediateSeller: false,
    unmetGap: 31
  },
  {
    id: 'swift',
    model: 'Suzuki Swift',
    make: 'Suzuki',
    segment: 'Compact',
    badge: '1.2L DualJet / Hybrid RS',
    image: '/vehicles/swift.jpg',
    demandUnits: 79,
    currentStockUnits: 62,
    coveragePct: 78,
    avgDaysToSell: 25,
    avgDealerMarginNzd: 2700,
    avgDealerMarginJpy: 246348,
    recommendation: 'Balanced',
    immediateSeller: false,
    unmetGap: 17
  },
  {
    id: 'fielder',
    model: 'Toyota Corolla Fielder',
    make: 'Toyota',
    segment: 'Sedan/Wagon',
    badge: '1.5L Hybrid G Edition',
    image: '/vehicles/corolla-touring.jpg',
    demandUnits: 86,
    currentStockUnits: 92,
    coveragePct: 107,
    avgDaysToSell: 31,
    avgDealerMarginNzd: 2450,
    avgDealerMarginJpy: 223538,
    recommendation: 'Balanced',
    immediateSeller: false,
    unmetGap: -6
  },
  {
    id: 'axela',
    model: 'Mazda Axela',
    make: 'Mazda',
    segment: 'Sedan/Wagon',
    badge: '20S Proactive Touring',
    image: '/vehicles/mazda3.jpg',
    demandUnits: 65,
    currentStockUnits: 88,
    coveragePct: 135,
    avgDaysToSell: 39,
    avgDealerMarginNzd: 2100,
    avgDealerMarginJpy: 191604,
    recommendation: 'Oversupplied',
    immediateSeller: false,
    unmetGap: -23
  }
];

// Upcoming Auction Vehicles: Dealer Match & Notify
export const UPCOMING_AUCTION_MATCHES: AuctionMatchVehicle[] = [
  {
    id: 'auc-1',
    model: 'Toyota C-HR G LED Hybrid',
    year: 2020,
    badge: '2WD · Sensing · Two-Tone',
    km: 48200,
    grade: '4.5',
    interiorGrade: 'A',
    auctionHouse: 'USS Tokyo',
    lotNumber: '48201',
    auctionDate: 'Tomorrow, 11:20 AM JST',
    timeLeft: '03h 15m',
    fobPriceNzd: 18400,
    fobPriceJpy: 1680000,
    estLandedNzd: 22350,
    image: '/vehicles/c-hr.jpg',
    matchedDealersCount: 14,
    matchedDealers: [
      {
        dealerId: 1,
        name: 'Auckland Auto Group',
        region: 'Auckland',
        matchScore: 98,
        wishlistCriteria: 'Toyota C-HR 2019+, <55k km, Hybrid, Black roof preferred',
        targetBudgetNzd: 23500,
        lastActive: '12m ago',
        avatarBg: 'bg-blue-600'
      },
      {
        dealerId: 2,
        name: 'Hamilton Motors',
        region: 'Waikato',
        matchScore: 94,
        wishlistCriteria: 'Compact SUV Hybrid, Grade 4.5+, Target retail under $28k',
        targetBudgetNzd: 22800,
        lastActive: '35m ago',
        avatarBg: 'bg-emerald-600'
      },
      {
        dealerId: 4,
        name: 'North Shore Hybrid Centre',
        region: 'Auckland',
        matchScore: 92,
        wishlistCriteria: 'Grade 4.5 C-HR or Vezel, <60,000 km, Pearl White',
        targetBudgetNzd: 24000,
        lastActive: '1h ago',
        avatarBg: 'bg-purple-600'
      },
      {
        dealerId: 5,
        name: 'Wellington City Direct',
        region: 'Wellington',
        matchScore: 89,
        wishlistCriteria: 'Fuel efficient hybrid SUV, max budget $23,000 landed',
        targetBudgetNzd: 23000,
        lastActive: '2h ago',
        avatarBg: 'bg-amber-600'
      },
      {
        dealerId: 3,
        name: 'Christchurch Cars',
        region: 'Canterbury',
        matchScore: 86,
        wishlistCriteria: 'Toyota Hybrid 2018+, Grade 4.0+, retail margin $3.5k+',
        targetBudgetNzd: 22000,
        lastActive: '4h ago',
        avatarBg: 'bg-slate-700'
      }
    ]
  },
  {
    id: 'auc-2',
    model: 'Honda Vezel Hybrid Z Sensing',
    year: 2019,
    badge: 'e:HEV Tech · Honda Sensing',
    km: 52100,
    grade: '4.5',
    interiorGrade: 'B',
    auctionHouse: 'USS Yokohama',
    lotNumber: '29114',
    auctionDate: 'Tomorrow, 01:45 PM JST',
    timeLeft: '05h 40m',
    fobPriceNzd: 16800,
    fobPriceJpy: 1530000,
    estLandedNzd: 20600,
    image: '/vehicles/c-hr.jpg',
    matchedDealersCount: 12,
    matchedDealers: [
      {
        dealerId: 2,
        name: 'Hamilton Motors',
        region: 'Waikato',
        matchScore: 97,
        wishlistCriteria: 'Honda Vezel Hybrid 2018+, <60k km, Sensing Package',
        targetBudgetNzd: 21500,
        lastActive: '35m ago',
        avatarBg: 'bg-emerald-600'
      },
      {
        dealerId: 1,
        name: 'Auckland Auto Group',
        region: 'Auckland',
        matchScore: 93,
        wishlistCriteria: 'Honda / Toyota SUV, high retail turnover < 20 days',
        targetBudgetNzd: 21000,
        lastActive: '12m ago',
        avatarBg: 'bg-blue-600'
      },
      {
        dealerId: 6,
        name: 'Tauranga Car Hub',
        region: 'Bay of Plenty',
        matchScore: 90,
        wishlistCriteria: 'Vezel Hybrid, Grade 4.0+, under $21,000 landed',
        targetBudgetNzd: 20800,
        lastActive: '55m ago',
        avatarBg: 'bg-indigo-600'
      }
    ]
  },
  {
    id: 'auc-3',
    model: 'Toyota Aqua S Hybrid',
    year: 2020,
    badge: '1.5L · Safety Sense · Smart Key',
    km: 44000,
    grade: '4.5',
    interiorGrade: 'A',
    auctionHouse: 'CAA Chubu',
    lotNumber: '61830',
    auctionDate: 'Tomorrow, 03:00 PM JST',
    timeLeft: '07h 00m',
    fobPriceNzd: 14200,
    fobPriceJpy: 1295000,
    estLandedNzd: 17750,
    image: '/vehicles/aqua.jpg',
    matchedDealersCount: 18,
    matchedDealers: [
      {
        dealerId: 1,
        name: 'Auckland Auto Group',
        region: 'Auckland',
        matchScore: 99,
        wishlistCriteria: 'Toyota Aqua 2019-2021, Grade 4.5, Pearl/Silver, <50k km',
        targetBudgetNzd: 18500,
        lastActive: '12m ago',
        avatarBg: 'bg-blue-600'
      },
      {
        dealerId: 3,
        name: 'Christchurch Cars',
        region: 'Canterbury',
        matchScore: 95,
        wishlistCriteria: 'High volume Aqua batch order, margin target $3,500',
        targetBudgetNzd: 18000,
        lastActive: '4h ago',
        avatarBg: 'bg-slate-700'
      },
      {
        dealerId: 7,
        name: 'Dunedin Metro Autos',
        region: 'Otago',
        matchScore: 91,
        wishlistCriteria: 'Aqua Hybrid with Safety Sense, Low km reliable inventory',
        targetBudgetNzd: 18200,
        lastActive: '1d ago',
        avatarBg: 'bg-teal-600'
      }
    ]
  },
  {
    id: 'auc-4',
    model: 'Mazda CX-5 25S L-Package AWD',
    year: 2019,
    badge: 'AWD · Leather · Sunroof · Bose',
    km: 59000,
    grade: '4.0',
    interiorGrade: 'B',
    auctionHouse: 'HAA Kobe',
    lotNumber: '10492',
    auctionDate: 'In 2 days, 10:30 AM JST',
    timeLeft: '1d 02h',
    fobPriceNzd: 19500,
    fobPriceJpy: 1780000,
    estLandedNzd: 23800,
    image: '/vehicles/cx3.jpg',
    matchedDealersCount: 9,
    matchedDealers: [
      {
        dealerId: 3,
        name: 'Christchurch Cars',
        region: 'Canterbury',
        matchScore: 94,
        wishlistCriteria: 'Mazda CX-5 AWD, Leather interior, Grade 4.0+, retail $29k',
        targetBudgetNzd: 24500,
        lastActive: '4h ago',
        avatarBg: 'bg-slate-700'
      },
      {
        dealerId: 2,
        name: 'Hamilton Motors',
        region: 'Waikato',
        matchScore: 89,
        wishlistCriteria: 'Mid SUV AWD, SkyActiv Petrol, premium package',
        targetBudgetNzd: 24000,
        lastActive: '35m ago',
        avatarBg: 'bg-emerald-600'
      }
    ]
  },
  {
    id: 'auc-5',
    model: 'Nissan Note e-POWER Medalist',
    year: 2020,
    badge: 'Series Hybrid · Surround View',
    km: 39500,
    grade: '4.5',
    interiorGrade: 'B',
    auctionHouse: 'USS Nagoya',
    lotNumber: '33841',
    auctionDate: 'In 2 days, 02:15 PM JST',
    timeLeft: '1d 06h',
    fobPriceNzd: 12900,
    fobPriceJpy: 1180000,
    estLandedNzd: 16100,
    image: '/vehicles/note.jpg',
    matchedDealersCount: 11,
    matchedDealers: [
      {
        dealerId: 1,
        name: 'Auckland Auto Group',
        region: 'Auckland',
        matchScore: 96,
        wishlistCriteria: 'Nissan Note e-Power 2019+, Medalist trim, <45k km',
        targetBudgetNzd: 16800,
        lastActive: '12m ago',
        avatarBg: 'bg-blue-600'
      },
      {
        dealerId: 5,
        name: 'Wellington City Direct',
        region: 'Wellington',
        matchScore: 91,
        wishlistCriteria: 'Sub-compact electric feel commuter, budget $16,500',
        targetBudgetNzd: 16500,
        lastActive: '2h ago',
        avatarBg: 'bg-amber-600'
      }
    ]
  },
  {
    id: 'auc-6',
    model: 'Lexus NX300h F-Sport AWD',
    year: 2019,
    badge: 'Luxury Hybrid · Mark Levinson',
    km: 42100,
    grade: '4.5',
    interiorGrade: 'A',
    auctionHouse: 'USS Tokyo',
    lotNumber: '91204',
    auctionDate: 'Tomorrow, 04:45 PM JST',
    timeLeft: '08h 45m',
    fobPriceNzd: 34500,
    fobPriceJpy: 3150000,
    estLandedNzd: 41200,
    image: '/vehicles/lexus_nx.jpg',
    matchedDealersCount: 7,
    matchedDealers: [
      {
        dealerId: 1,
        name: 'Auckland Auto Group',
        region: 'Auckland',
        matchScore: 97,
        wishlistCriteria: 'Lexus NX300h F-Sport, <50k km, Grade 4.5, Target margin $5k+',
        targetBudgetNzd: 42500,
        lastActive: '12m ago',
        avatarBg: 'bg-blue-600'
      },
      {
        dealerId: 4,
        name: 'North Shore Hybrid Centre',
        region: 'Auckland',
        matchScore: 93,
        wishlistCriteria: 'Premium Japanese luxury SUV, suburban Takapuna market',
        targetBudgetNzd: 43000,
        lastActive: '1h ago',
        avatarBg: 'bg-purple-600'
      }
    ]
  }
];

// Demand by NZ Region
export const DEMAND_BY_REGION: RegionDemand[] = [
  {
    region: 'Auckland',
    units: 520,
    pct: 46,
    activeDealers: 68,
    topSegment: 'Hybrid SUV (48%)',
    segments: { hybrid: 52, suv: 28, compact: 12, sedan: 8 }
  },
  {
    region: 'Waikato',
    units: 215,
    pct: 19,
    activeDealers: 31,
    topSegment: 'Compact Hybrid (45%)',
    segments: { hybrid: 45, suv: 35, compact: 12, sedan: 8 }
  },
  {
    region: 'Wellington',
    units: 168,
    pct: 15,
    activeDealers: 22,
    topSegment: 'Hybrid Compact (48%)',
    segments: { hybrid: 48, suv: 24, compact: 18, sedan: 10 }
  },
  {
    region: 'Canterbury',
    units: 145,
    pct: 13,
    activeDealers: 14,
    topSegment: 'AWD Mid SUV (42%)',
    segments: { hybrid: 38, suv: 42, compact: 12, sedan: 8 }
  },
  {
    region: 'Otago',
    units: 72,
    pct: 7,
    activeDealers: 7,
    topSegment: 'AWD SUV & Wagons (55%)',
    segments: { hybrid: 25, suv: 55, compact: 10, sedan: 10 }
  }
];

// AI Weekly Brief Text
export const AI_WEEKLY_BRIEF = {
  en: {
    title: 'AI Weekly Brief for Heiwa Sourcing',
    subtitle: 'Generated from 4,860 dealer search queries, 318 active wish lists, and NZ retail sales velocity telemetry.',
    badge: 'Heiwa Autonomous Sourcing Intelligence',
    confidenceText: '96% Recommendation Confidence',
    timestamp: 'Today at 07:00 JST / 11:00 NZST (Pre-Auction USS Tokyo Dispatch)',
    body: 'Demand for hybrid SUVs is rising sharply among NZ dealers. Vezel searches are up 40% this month and C-HR remains the most-requested model. Current Heiwa stock covers only 35% of C-HR demand. Sourcing an additional 60–80 C-HR and Vezel units for the next two auctions is prioritized.',
    targets: [
      { model: 'Toyota C-HR', recommendation: '+40–50 units', priority: 'Critical', house: 'USS Tokyo / Yokohama' },
      { model: 'Honda Vezel', recommendation: '+25–35 units', priority: 'High', house: 'USS Tokyo / Nagoya' },
      { model: 'Toyota Aqua', recommendation: '+30–40 units', priority: 'Sustained', house: 'CAA Chubu / HAA' }
    ]
  },
  jp: {
    title: 'Heiwa仕入れ向けAI週次ブリーフ',
    subtitle: 'NZディーラーの4,860件の検索データ、318件の希望リスト、およびNZ国内販売速度から自動生成された調達推奨レポート。',
    badge: '平和オート 自律調達インテリジェンス',
    confidenceText: 'AI推奨信頼度 96%',
    timestamp: '本日 07:00 JST / 11:00 NZST 更新（USS東京オークション直前ブリーフィング）',
    body: 'NZディーラー間においてハイブリッドSUVの需要が急増しています。今月ヴェゼルの検索数は40%増加し、C-HRは依然として最も要望の多いモデルです。現在のHeiwaの在庫はC-HR需要の35%しかカバーできていません。次回2回のオークションに向けて、C-HRおよびヴェゼルをさらに60〜80台仕入れることを強く推奨します。',
    targets: [
      { model: 'トヨタ C-HR', recommendation: '+40〜50台 追加仕入れ', priority: '最重要', house: 'USS東京 / 横浜' },
      { model: 'ホンダ ヴェゼル', recommendation: '+25〜35台 追加仕入れ', priority: '高優先', house: 'USS東京 / 名古屋' },
      { model: 'トヨタ アクア', recommendation: '+30〜40台 継続確保', priority: '高回転', house: 'CAA中部 / HAA神戸' }
    ]
  }
};
