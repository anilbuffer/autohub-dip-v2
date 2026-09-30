// Real Heiwa Auction Data — extracted from CSV screenshots
// Each record represents a vehicle lot from Heiwa Auto Japan

export type ListingType = "reserve" | "auction";

export interface HeiwaVehicle {
  stockId: string;
  make: string;
  model: string;
  grade: string;
  chassis: string;
  year: number;
  march?: number | null;
  kms: number;
  color: string;
  colorDesc?: string;
  cc: number;
  trans: string;
  fuelType: string;
  condition?: string;
  ac?: string;
  equip: string;
  priceFob: number; // JPY FOB price
  photoUrl?: string;
  auctionDate?: string;
  listingType?: ListingType;
  auctionHouse?: string;
  auctionTimeLeft?: string;
}

// Helper: Determine if vehicle is Direct Enquire/Reserve or Japan Auction/Bid
export function getVehicleListingType(v: { chassis?: string; stockId?: string; listingType?: ListingType }): ListingType {
  if (v.listingType) return v.listingType;
  if (v.stockId && v.stockId.toUpperCase().startsWith("R")) return "reserve";
  const idStr = v.stockId || v.chassis || "";
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 2 === 0 ? "auction" : "reserve";
}


export const HEIWA_VEHICLES: HeiwaVehicle[] = [
  { stockId: "R45735", make: "Toyota", model: "Prius 5d", grade: "L", chassis: "ZVW30-1812701", year: 2015, march: null, kms: 43000, color: "black", colorDesc: "black", cc: 1800, trans: "AT", fuelType: "H", condition: "", ac: "4 AAC", equip: "ps, pw, nav", priceFob: 685000 },
  { stockId: "R45735", make: "Toyota", model: "Prius Alpha", grade: "S", chassis: "ZVW41W-3353272", year: 2015, march: null, kms: 110000, color: "black", colorDesc: "black", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "3.5 AC", equip: "ps, pw", priceFob: 573000 },
  { stockId: "322771", make: "Toyota", model: "Aqua", grade: "G", chassis: "NHP10-6223017", year: 2013, march: null, kms: 47000, color: "silver", colorDesc: "silver", cc: 1500, trans: "FAT", fuelType: "H", condition: "", ac: "3.5 AC", equip: "ps, pw", priceFob: 365000 },
  { stockId: "1173386", make: "Toyota", model: "C-hr", grade: "S", chassis: "ZYX10-2079113", year: 2017, march: null, kms: 53000, color: "silver", colorDesc: "silver", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "4 AAC", equip: "ps, pw, abs", priceFob: 1280000 },
  { stockId: "322716", make: "Toyota", model: "Aqua", grade: "S", chassis: "NHP10-6902363", year: 2017, march: null, kms: 58000, color: "blue", colorDesc: "blue", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "4 AAC", equip: "ps, pw, abs", priceFob: 689000 },
  { stockId: "1173019", make: "Toyota", model: "Aqua", grade: "X", chassis: "MXPK11-2624436", year: 2021, march: null, kms: 112000, color: "pearl", colorDesc: "pearl", cc: 1500, trans: "FAT", fuelType: "", condition: "", ac: "4 AAC", equip: "", priceFob: 890000 },
  { stockId: "322931", make: "Honda", model: "Accord", grade: "ハイブリ EX", chassis: "CV3-1003042", year: 2020, march: 0, kms: 102000, color: "black", colorDesc: "black", cc: 2000, trans: "FAT", fuelType: "P", condition: "", ac: "4 AAC", equip: "abs, ps, pw, sr, simfix", priceFob: 1895000 },
  { stockId: "1172773", make: "Toyota", model: "Rav4", grade: "アドベンチャー 4WD", chassis: "MXAA54-5016684", year: 2020, march: null, kms: 57000, color: "green", colorDesc: "green", cc: 2000, trans: "FAT", fuelType: "P", condition: "", ac: "3", equip: "abs, ps, pw, ps, tv, Nc", priceFob: 2100000 },
  { stockId: "322927", make: "Toyota", model: "Sienta", grade: "G", chassis: "NSP170G-7630019", year: 2018, march: null, kms: 26000, color: "red", colorDesc: "red", cc: 1500, trans: "AT", fuelType: "P", condition: "", ac: "3.5 AC", equip: "", priceFob: 755000 },
  { stockId: "1172820", make: "Toyota", model: "Corolla Cross", grade: "Hybrid S", chassis: "ZVG11-1054701", year: 2022, march: null, kms: 24000, color: "silver", colorDesc: "silver", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "3.5 AAC", equip: "ps, pw, abs", priceFob: 2155000 },
  { stockId: "1172917", make: "Toyota", model: "Corolla Touring", grade: "Hybrid G-X", chassis: "ZWE211W-6091796", year: 2021, march: null, kms: 96000, color: "white", colorDesc: "white", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "3.5 AAC", equip: "ps, pw, abs", priceFob: 1275000 },
  { stockId: "322610", make: "Nissan", model: "NV350 Caravan Van", grade: "Long VX", chassis: "VW6E26-121185", year: 2017, march: null, kms: 114000, color: "grey", colorDesc: "grey", cc: 2500, trans: "FAT", fuelType: "D", condition: "", ac: "3.5", equip: "", priceFob: 1425000 },
  { stockId: "1172584", make: "Nissan", model: "Cube", grade: "15X V Smart", chassis: "Z12-371336", year: 2018, march: null, kms: 77000, color: "blue", colorDesc: "blue", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "3.5 AC", equip: "ps, pw, abs", priceFob: 275000 },
  { stockId: "1172551", make: "Honda", model: "Jade", grade: "HYBRID", chassis: "FR4-1003628", year: 2015, march: null, kms: 86000, color: "black", colorDesc: "black", cc: 1500, trans: "FAT", fuelType: "H", condition: "", ac: "3.5 AC", equip: "ps, pw", priceFob: 550000 },
  { stockId: "1172517", make: "Toyota", model: "Note 4d", grade: "F", chassis: "NCP141-0135326", year: 2014, march: null, kms: 44000, color: "silver", colorDesc: "silver", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "4 AAC", equip: "ps, pw", priceFob: 330000 },
  { stockId: "1172410", make: "Subaru", model: "Levorg 4wd", grade: "1.6GT EYESIGHT PF", chassis: "VM4-006017", year: 2016, march: null, kms: 69000, color: "black", colorDesc: "black", cc: 1600, trans: "FAT", fuelType: "P", condition: "", ac: "4 AAC", equip: "ps, pw", priceFob: 530000 },
  { stockId: "1172314", make: "Toyota", model: "Aqua", grade: "G", chassis: "NHP10-3212468", year: 2014, march: null, kms: 75000, color: "pearl", colorDesc: "pearl", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 320000 },
  { stockId: "1171646", make: "Toyota", model: "C-hr", grade: "G", chassis: "ZYX10-2026570", year: 2017, march: null, kms: 37000, color: "red", colorDesc: "red", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "4 AAC", equip: "ps, pw, abs", priceFob: 1270000 },
  { stockId: "322293", make: "Toyota", model: "Prius", grade: "S TouringSelection", chassis: "ZVW51-6108888", year: 2019, march: null, kms: 24000, color: "blue", colorDesc: "blue", cc: 1800, trans: "FAT", fuelType: "H", condition: "", ac: "3", equip: "", priceFob: 1350000 },
  { stockId: "322312", make: "Subaru", model: "XV", grade: "2.0i ハイブリッド 4W", chassis: "GPF7-102721", year: 2015, march: null, kms: 45000, color: "orange", colorDesc: "orange", cc: 2000, trans: "FAT", fuelType: "", condition: "", ac: "3.5", equip: "", priceFob: 562000 },
  { stockId: "1172013", make: "Toyota", model: "Aqua", grade: "CROSSOVER", chassis: "NHP10H-6882518", year: 2017, march: null, kms: 38000, color: "blue", colorDesc: "blue", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 580000 },
  { stockId: "1171904", make: "Toyota", model: "C-hr", grade: "G", chassis: "ZYX10-2098296", year: 2017, march: null, kms: 95000, color: "pearl", colorDesc: "pearl", cc: 1800, trans: "FAT", fuelType: "", condition: "", ac: "3.5", equip: "", priceFob: 1050000 },
  { stockId: "1171883", make: "Suzuki", model: "Swift", grade: "RS", chassis: "ZC73S-304340", year: 2013, march: null, kms: 83000, color: "black", colorDesc: "black", cc: 1200, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 195000 },
  { stockId: "322290", make: "Subaru", model: "WRX", grade: "1.6GT", chassis: "VMG-011064", year: 2018, march: null, kms: 132000, color: "red", colorDesc: "red", cc: 1600, trans: "FAT", fuelType: "", condition: "", ac: "4", equip: "", priceFob: 421000 },
  { stockId: "322301", make: "Toyota", model: "Vitz", grade: "1.0L", chassis: "2GE31G-0165868", year: 2015, march: null, kms: 113000, color: "red", colorDesc: "red", cc: 1000, trans: "FAT", fuelType: "", condition: "", ac: "3.5", equip: "", priceFob: 145000 },
  { stockId: "1171999", make: "Toyota", model: "C-hr", grade: "S", chassis: "ZYX10-2022718", year: 2017, march: null, kms: 57000, color: "pearl", colorDesc: "pearl", cc: 1500, trans: "FAT", fuelType: "AT", condition: "", ac: "4", equip: "", priceFob: 1210000 },
  { stockId: "322167", make: "Toyota", model: "Aqua", grade: "S", chassis: "NHP10-5581085", year: 2017, march: null, kms: 25000, color: "blue", colorDesc: "blue", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 654000 },
  { stockId: "1171591", make: "Mazda", model: "Cx-3", grade: "25S BLACK TONE E", chassis: "KGSP-254918", year: 2021, march: null, kms: 115000, color: "black", colorDesc: "black", cc: 2500, trans: "FAT", fuelType: "P", condition: "A2", ac: "", equip: "", priceFob: 1490000 },
  { stockId: "1171610", make: "Toyota", model: "C-hr", grade: "G", chassis: "ZYX10-2013971", year: 2017, march: null, kms: 43000, color: "green", colorDesc: "green", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "3 AAC", equip: "ps, pw, abs", priceFob: 1120000 },
  { stockId: "1171129", make: "Toyota", model: "Aqua", grade: "Z", chassis: "MXPK11-2038817", year: 2022, march: null, kms: 88000, color: "black", colorDesc: "black", cc: 1500, trans: "FAT", fuelType: "", condition: "", ac: "3", equip: "", priceFob: 1585000 },
  { stockId: "1171137", make: "Toyota", model: "Harrier Hybrid", grade: "S", chassis: "AXUH80-0086573", year: 2023, march: null, kms: 68000, color: "beige", colorDesc: "beige", cc: 2500, trans: "FAT", fuelType: "H", condition: "", ac: "3", equip: "", priceFob: 2100000 },
  { stockId: "1171136", make: "Toyota", model: "Avensis wagon", grade: "XI", chassis: "ZRT272W-3036457", year: 2013, march: null, kms: 46000, color: "black", colorDesc: "black", cc: 2000, trans: "FAT", fuelType: "", condition: "", ac: "3.5 AAC", equip: "ps, pw, abs", priceFob: 530000 },
  { stockId: "322068", make: "Nissan", model: "NV200", grade: "DX 5 seats", chassis: "VM20-107719", year: 2021, march: null, kms: 95000, color: "white", colorDesc: "white", cc: 1600, trans: "AT", fuelType: "P", condition: "", ac: "4 AC", equip: "ps, pw, ps", priceFob: 795000 },
  { stockId: "1167986", make: "Honda", model: "Civic", grade: "Hybrid EX", chassis: "FFC5-1003803", year: 2019, march: 3, kms: 108000, color: "desk blue", colorDesc: "desk blue", cc: 2000, trans: "DAT", fuelType: "H", condition: "", ac: "", equip: "", priceFob: 1690000 },
  { stockId: "321957", make: "Toyota", model: "Chr", grade: "S LED EDITION", chassis: "ZYX10-2157182", year: 2019, march: null, kms: 36000, color: "black", colorDesc: "black", cc: 1800, trans: "FAT", fuelType: "H", condition: "", ac: "4", equip: "abs, aw, ps, pw, sr, sr", priceFob: 1495000 },
  { stockId: "321855", make: "Toyota", model: "C-hr", grade: "S LED PACKAGE", chassis: "ZYX10-2188588", year: 2018, march: null, kms: 106000, color: "pearl-white", colorDesc: "pearl-white", cc: 1800, trans: "FAT", fuelType: "H", condition: "", ac: "4", equip: "", priceFob: 525000 },
  { stockId: "321973", make: "Mazda", model: "Demio", grade: "13S", chassis: "DJ3FS-142717", year: 2018, march: null, kms: 38000, color: "meteor grey", colorDesc: "meteor grey", cc: 1300, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 325000 },
  { stockId: "1170830", make: "Lexus", model: "Rx", grade: "RX200t Version L", chassis: "AGL20W-0004800", year: 2017, march: null, kms: 84000, color: "pearl", colorDesc: "pearl", cc: 2000, trans: "FAT", fuelType: "P", condition: "", ac: "", equip: "", priceFob: 2260000 },
  { stockId: "1170832", make: "Toyota", model: "Aqua", grade: "S", chassis: "NHP10-2428612", year: 2015, march: null, kms: 51000, color: "purple", colorDesc: "purple", cc: 1500, trans: "FAT", fuelType: "", condition: "", ac: "3.5 AAC", equip: "ps, pw", priceFob: 290000 },
  { stockId: "1170863", make: "Nissan", model: "Note", grade: "", chassis: "E12-203345", year: 2014, march: null, kms: 52000, color: "silver", colorDesc: "silver", cc: 1200, trans: "FAT", fuelType: "E", condition: "", ac: "4.5", equip: "", priceFob: 2930000 },
  { stockId: "1170743", make: "Tesla", model: "Model3", grade: "Long Range 4WD", chassis: "LRWXF7EK4MC311", year: 2021, march: null, kms: 37000, color: "white", colorDesc: "white", cc: 0, trans: "CAT", fuelType: "E", condition: "", ac: "4.5", equip: "", priceFob: 2930000 },
  { stockId: "1170745", make: "Lexus", model: "Nx", grade: "NX300h I Package", chassis: "AYZ10-1004382", year: 2018, march: null, kms: 96000, color: "pearl", colorDesc: "pearl", cc: 2500, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 1830000 },
  // Page 2 data
  { stockId: "1170822", make: "Honda", model: "Crv", grade: "EXTRA EX", chassis: "RT5-1900513", year: 2018, march: null, kms: 114000, color: "pearl-white", colorDesc: "pearl-white", cc: 2000, trans: "DAT", fuelType: "P", condition: "", ac: "4", equip: "", priceFob: 1850000 },
  { stockId: "321785", make: "Mazda", model: "Demio", grade: "15C", chassis: "DLJFS-638613", year: 2019, march: null, kms: 43000, color: "white", colorDesc: "white", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 582000 },
  { stockId: "1170082", make: "Toyota", model: "Prius Alpha", grade: "S", chassis: "ZVW41W-0634018", year: 2016, march: null, kms: 88000, color: "black", colorDesc: "black", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 470000 },
  { stockId: "1170158", make: "Toyota", model: "Aqua", grade: "S", chassis: "NHP10-6081461", year: 2017, march: null, kms: 80000, color: "grey", colorDesc: "grey", cc: 1500, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 460000 },
  { stockId: "1169905", make: "Toyota", model: "Aqua", grade: "S", chassis: "NHP10-2593769", year: 2013, march: null, kms: 77000, color: "yellow", colorDesc: "yellow", cc: 1500, trans: "FAT", fuelType: "", condition: "", ac: "3.5", equip: "", priceFob: 340000 },
  { stockId: "321596", make: "Toyota", model: "C-hr", grade: "G LED Edition", chassis: "ZYX10-2119232", year: 2018, march: null, kms: 97000, color: "red", colorDesc: "red", cc: 1800, trans: "FAT", fuelType: "H", condition: "", ac: "4", equip: "", priceFob: 1270000 },
  { stockId: "1163512", make: "Toyota", model: "Hiace Van", grade: "Long DX GL Package", chassis: "GDH201V-1110528", year: 2025, march: null, kms: 17000, color: "white", colorDesc: "white", cc: 2800, trans: "FAT", fuelType: "D", condition: "", ac: "4", equip: "", priceFob: 2755000 },
  { stockId: "1168558", make: "Toyota", model: "Aqua", grade: "G クロスオーバー", chassis: "NHP10-5832475", year: 2017, march: null, kms: 86000, color: "blue", colorDesc: "blue", cc: 1500, trans: "FAT", fuelType: "", condition: "", ac: "4 AAC", equip: "ps, pw, ntr", priceFob: 730000 },
  { stockId: "321130", make: "Nissan", model: "March", grade: "S", chassis: "K13-064514", year: 2021, march: null, kms: 7000, color: "silver k23", colorDesc: "silver k23", cc: 1200, trans: "FAT", fuelType: "", condition: "", ac: "4.5", equip: "", priceFob: 980000 },
  { stockId: "1169975", make: "Toyota", model: "Corolla Sports", grade: "Hybrid G", chassis: "ZWE211H-1012018", year: 2019, march: null, kms: 87000, color: "black", colorDesc: "black", cc: 1800, trans: "FAT", fuelType: "H", condition: "", ac: "4", equip: "", priceFob: 1220000 },
  { stockId: "1168978", make: "Toyota", model: "Yarithe Hybrid", grade: "X 4WD", chassis: "KXHA51D03320", year: 2019, march: null, kms: 93000, color: "black", colorDesc: "black", cc: 2500, trans: "FAT", fuelType: "H", condition: "", ac: "3.5", equip: "", priceFob: 1450000 },
  { stockId: "1168877", make: "Toyota", model: "Corolla Touring", grade: "Hybrid G 4WD", chassis: "ZWE214W-3038640", year: 2023, march: null, kms: 31000, color: "white", colorDesc: "white", cc: 1800, trans: "FAT", fuelType: "H", condition: "", ac: "3.5", equip: "", priceFob: 2000000 },
  { stockId: "320837", make: "Nissan", model: "Nv350 Vanette Van", grade: "DX", chassis: "VM20-183597", year: 2022, march: null, kms: 31000, color: "white", colorDesc: "white", cc: 1600, trans: "AT", fuelType: "P", condition: "", ac: "3.5", equip: "", priceFob: 350000 },
  { stockId: "1168735", make: "Suzuki", model: "Ignis", grade: "HYBRID MX", chassis: "FF21S-124616", year: 2016, march: null, kms: 74000, color: "orange", colorDesc: "orange", cc: 1200, trans: "FAT", fuelType: "", condition: "", ac: "", equip: "", priceFob: 350000 },
  { stockId: "1185000", make: "Subaru", model: "Forester", grade: "XT 4WD", chassis: "SKE-016912", year: 2019, march: null, kms: 53000, color: "silver", colorDesc: "silver", cc: 2000, trans: "FAT", fuelType: "", condition: "", ac: "4 AAC", equip: "ps, pw", priceFob: 1320000 },
  { stockId: "1184312", make: "Mazda", model: "Demio", grade: "13-Skyactive", chassis: "DEJFS-136281", year: 2013, march: null, kms: 52000, color: "brown", colorDesc: "brown", cc: 1200, trans: "FAT", fuelType: "AT", condition: "", ac: "", equip: "", priceFob: 185000 },
  { stockId: "1183311", make: "Toyota", model: "C-hr", grade: "G", chassis: "ZYX10-2018806", year: 2017, march: null, kms: 51000, color: "silver", colorDesc: "silver", cc: 1800, trans: "FAT", fuelType: "", condition: "", ac: "4.5", equip: "", priceFob: 1380000 },
  { stockId: "1182088", make: "Nissan", model: "X-trail", grade: "X e-4ORCE", chassis: "SNT33-004784", year: 2022, march: null, kms: 84000, color: "grey", colorDesc: "grey", cc: 0, trans: "FAT", fuelType: "P", condition: "", ac: "", equip: "", priceFob: 2100000 },
  { stockId: "318545", make: "Mazda", model: "Mazda3", grade: "20S L Package", chassis: "BPFP-111802", year: 2021, march: null, kms: 30000, color: "silver", colorDesc: "silver", cc: 2000, trans: "FAT", fuelType: "P", condition: "", ac: "4.5 AAC", equip: "abs, aw, ps, pw, sr", priceFob: 1450000 },
  { stockId: "314549", make: "Toyota", model: "C-hr", grade: "G Mode Nero Safety", chassis: "ZYX11-2040207", year: 2021, march: 3, kms: 51000, color: "black", colorDesc: "black", cc: 1800, trans: "FAT", fuelType: "P", condition: "", ac: "4 AAC", equip: "abs, aw, ps, pw, sr, ps", priceFob: 1860000 },
  { stockId: "318423", make: "BMW", model: "5 Series", grade: "523i M Sports", chassis: "WBA4A-1200BF195", year: 2020, march: null, kms: 47000, color: "black", colorDesc: "black", cc: 2000, trans: "AT", fuelType: "", condition: "", ac: "4.5 AAC", equip: "abs, ps, pw", priceFob: 1350000 },
  { stockId: "318421", make: "BMW", model: "3 Series", grade: "320i M Sport", chassis: "WBA4A-6165SUNJ75", year: 2021, march: null, kms: 64000, color: "silver", colorDesc: "silver", cc: 2000, trans: "FAT", fuelType: "P", condition: "", ac: "3.5", equip: "abs, aw, ps, pw, nav", priceFob: 1560000 },
  { stockId: "317214", make: "Toyota", model: "Alphard Hybrid", grade: "X 4WD", chassis: "AYH30W-0134845", year: 2021, march: null, kms: 54000, color: "black", colorDesc: "black", cc: 2500, trans: "FAT", fuelType: "H", condition: "", ac: "3.5 AAC", equip: "ps, pw, abs", priceFob: 2690000 },
  { stockId: "316928", make: "Toyota", model: "Harrier", grade: "Hybrid Z", chassis: "AXUH85-0043266", year: 2022, march: null, kms: 58000, color: "black", colorDesc: "black", cc: 2500, trans: "FAT", fuelType: "H", condition: "", ac: "4", equip: "", priceFob: 2850000 },
  { stockId: "1153771", make: "Honda", model: "CBR650R", grade: "UNKNOWN", chassis: "RH03-1201", year: 2023, march: null, kms: 20000, color: "white", colorDesc: "white", cc: 650, trans: "MT", fuelType: "G", condition: "", ac: "5 UNKNOWN", equip: "", priceFob: 922000 },
  { stockId: "1153105", make: "Honda", model: "CBR250R", grade: "UNKNOWN", chassis: "RH63C-200214", year: 2023, march: null, kms: 1000, color: "black", colorDesc: "black", cc: 250, trans: "MT", fuelType: "G", condition: "", ac: "5 UNKNOWN", equip: "", priceFob: 489000 },
  { stockId: "1153185", make: "BMW", model: "NINE T SCRAMBLER UNKNOWN", grade: "", chassis: "WB10L-1100091573", year: 2019, march: null, kms: 10000, color: "grey", colorDesc: "grey", cc: 1170, trans: "MT", fuelType: "G", condition: "", ac: "5 UNKNOWN", equip: "", priceFob: 1110000 },
  { stockId: "1150845", make: "HONDA", model: "REBEL 250", grade: "S", chassis: "MC49-1414548", year: 2024, march: null, kms: 36000, color: "MATTE BLACK", colorDesc: "MATTE BLACK", cc: 250, trans: "MT", fuelType: "G", condition: "", ac: "5 UNKNOWN", equip: "", priceFob: 450000 },
  { stockId: "1150833", make: "DUCATI", model: "STREETFIGHTER", grade: "V4S", chassis: "ZDM1RQEAN0B002", year: 2021, march: null, kms: 16000, color: "RED", colorDesc: "RED", cc: 1100, trans: "MT", fuelType: "G", condition: "", ac: "5 UNKNOWN", equip: "", priceFob: 1522000 },
  { stockId: "315020", make: "Toyota", model: "Harrier Hybrid 4wd", grade: "ELEGANCE", chassis: "AVU65W-0036177", year: 2017, march: null, kms: 94000, color: "silver", colorDesc: "silver", cc: 2500, trans: "FAT", fuelType: "H", condition: "", ac: "", equip: "", priceFob: 1442000 },
];

// Helper: Get unique makes from the dataset (cars only, exclude motorcycles)
export function getUniqueMakes(): string[] {
  const carMakes = HEIWA_VEHICLES
    .filter(v => !['CBR650R', 'CBR250R', 'REBEL 250', 'STREETFIGHTER', 'NINE T SCRAMBLER UNKNOWN'].includes(v.model))
    .map(v => v.make);
  return [...new Set(carMakes)].sort();
}

// Helper: Get unique models for a given make
export function getModelsForMake(make: string): string[] {
  const models = HEIWA_VEHICLES
    .filter(v => v.make.toLowerCase() === make.toLowerCase())
    .filter(v => !['CBR650R', 'CBR250R', 'REBEL 250', 'STREETFIGHTER', 'NINE T SCRAMBLER UNKNOWN'].includes(v.model))
    .map(v => v.model);
  return [...new Set(models)].sort();
}

// Helper: Get year range
export function getYearRange(): { min: number; max: number } {
  const years = HEIWA_VEHICLES.map(v => v.year);
  return { min: Math.min(...years), max: Math.max(...years) };
}

// Landed cost calculation constants
export const LANDED_COST_CONSTANTS = {
  fxRate: 91.24, // JPY to NZD
  freightNzd: 2200,
  complianceNzd: 1100,
  gstRate: 0.15,
  portFees: 280,
};

// Calculate estimated landed cost in NZD
export function calculateLandedCost(fobJpy: number): {
  fobNzd: number;
  freight: number;
  compliance: number;
  gst: number;
  portFees: number;
  totalLanded: number;
} {
  const fobNzd = Math.round(fobJpy / LANDED_COST_CONSTANTS.fxRate);
  const freight = LANDED_COST_CONSTANTS.freightNzd;
  const compliance = LANDED_COST_CONSTANTS.complianceNzd;
  const portFees = LANDED_COST_CONSTANTS.portFees;
  const subtotal = fobNzd + freight + compliance + portFees;
  const gst = Math.round(subtotal * LANDED_COST_CONSTANTS.gstRate);
  const totalLanded = subtotal + gst;
  return { fobNzd, freight, compliance, gst, portFees, totalLanded };
}

// Simulated NZ market comparable data
export interface NZComparable {
  source: string;
  title: string;
  year: number;
  kms: number;
  price: number;
  location: string;
  daysListed: number;
}

// Generate realistic NZ comparables for a given vehicle
export function getNZComparables(make: string, model: string, year: number, kms: number): NZComparable[] {
  // Generate 3-5 simulated NZ market listings based on the vehicle details
  const sources = ["Trade Me Motors", "Turners Auctions", "AutoTrader NZ", "2 Cheap Cars", "Giltrap Group"];
  const locations = ["Auckland", "Hamilton", "Wellington", "Christchurch", "Tauranga"];
  
  const basePrice = calculateLandedCost(
    HEIWA_VEHICLES.find(v => v.make === make && v.model === model)?.priceFob || 500000
  ).totalLanded;
  
  // Deterministic seeded pseudo-random number generator to prevent SSR hydration mismatches
  const seedStr = `${make}-${model}-${year}-${kms}`;
  let seed = 0;
  for (let s = 0; s < seedStr.length; s++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(s);
    seed |= 0;
  }
  const prng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.abs(seed) / 233280;
  };

  // NZ retail is typically 25-45% above landed cost
  const retailMarkup = 1.25 + prng() * 0.2;
  const baseRetail = Math.round(basePrice * retailMarkup);
  
  const count = 3 + Math.floor(prng() * 3);
  const comparables: NZComparable[] = [];
  
  for (let i = 0; i < count; i++) {
    const yearVariance = Math.floor(prng() * 3) - 1;
    const kmVariance = Math.floor(prng() * 20000) - 10000;
    const priceVariance = Math.floor((prng() - 0.5) * baseRetail * 0.15);
    
    comparables.push({
      source: sources[i % sources.length],
      title: `${year + yearVariance} ${make} ${model}`,
      year: year + yearVariance,
      kms: Math.max(5000, kms + kmVariance),
      price: Math.round((baseRetail + priceVariance) / 100) * 100,
      location: locations[i % locations.length],
      daysListed: 5 + Math.floor(prng() * 45),
    });
  }
  
  return comparables;
}

// Calculate a standardized 1-10 vehicle condition score based on auction grade and specs
export function getVehicleConditionScore(v: HeiwaVehicle): number {
  if (v.ac) {
    const parsed = parseFloat(v.ac);
    if (!isNaN(parsed)) {
      if (parsed >= 5.0) return 10;
      if (parsed >= 4.5) return 9;
      if (parsed >= 4.0) return 8;
      if (parsed >= 3.5) return 7;
      if (parsed >= 3.0) return 6;
      if (parsed >= 2.5) return 5;
      if (parsed >= 2.0) return 4;
      if (parsed >= 1.0) return 2;
    }
  }
  if (v.condition === "A2") return 7;

  let score = 7;
  if (v.year >= 2022 && v.kms < 40000) score = 9;
  else if (v.year >= 2020 && v.kms < 70000) score = 8;
  else if (v.year >= 2017 && v.kms < 95000) score = 7;
  else if (v.kms > 110000 || v.year <= 2014) score = 6;
  return Math.min(10, Math.max(1, score));
}

