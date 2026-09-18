import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMON_DROPDOWN_API =
  "https://moa-services.com/agri-service/common-dropdowns";

type AnyObject = Record<string, any>;

type PriceChangeType =
  | "increase"
  | "decrease"
  | "unchanged"
  | "no_data";

/* =========================================================
   DISTRICT MAPPING TABLE (37 LOCATIONS)
========================================================= */

const DISTRICT_MAP: Record<string, { district_id: number; division_id: number }> = {
  dhaka: { district_id: 47, division_id: 6 },
  manikganj: { district_id: 46, division_id: 6 },
  gazipur: { district_id: 41, division_id: 6 },
  narayanganj: { district_id: 43, division_id: 6 },
  savar: { district_id: 47, division_id: 6 },
  tangail: { district_id: 44, division_id: 6 },
  munshiganj: { district_id: 48, division_id: 6 },
  narsingdi: { district_id: 40, division_id: 6 },
  faridpur: { district_id: 52, division_id: 6 },
  chattogram: { district_id: 8, division_id: 1 },
  chittagong: { district_id: 8, division_id: 1 },
  cumilla: { district_id: 1, division_id: 1 },
  comilla: { district_id: 1, division_id: 1 },
  coxsbazar: { district_id: 9, division_id: 1 },
  feni: { district_id: 2, division_id: 1 },
  noakhali: { district_id: 5, division_id: 1 },
  brahmanbaria: { district_id: 3, division_id: 1 },
  rajshahi: { district_id: 15, division_id: 2 },
  bogura: { district_id: 14, division_id: 2 },
  bogra: { district_id: 14, division_id: 2 },
  pabna: { district_id: 13, division_id: 2 },
  naogaon: { district_id: 19, division_id: 2 },
  sirajganj: { district_id: 12, division_id: 2 },
  khulna: { district_id: 27, division_id: 3 },
  jashore: { district_id: 20, division_id: 3 },
  jessore: { district_id: 20, division_id: 3 },
  kushtia: { district_id: 25, division_id: 3 },
  satkhira: { district_id: 21, division_id: 3 },
  sylhet: { district_id: 36, division_id: 5 },
  moulvibazar: { district_id: 37, division_id: 5 },
  habiganj: { district_id: 38, division_id: 5 },
  sunamganj: { district_id: 39, division_id: 5 },
  barishal: { district_id: 33, division_id: 4 },
  barisal: { district_id: 33, division_id: 4 },
  bhola: { district_id: 34, division_id: 4 },
  patuakhali: { district_id: 31, division_id: 4 },
  rangpur: { district_id: 59, division_id: 7 },
  dinajpur: { district_id: 54, division_id: 7 },
  kurigram: { district_id: 60, division_id: 7 },
  mymensingh: { district_id: 62, division_id: 8 },
  jamalpur: { district_id: 63, division_id: 8 },
  netrokona: { district_id: 64, division_id: 8 },
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function toNumber(value: any): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function resolveDistrictInfo(param: string | null): { districtId: number; divisionId: number } {
  if (!param) return { districtId: 46, divisionId: 6 }; // Default Manikganj / 46

  const numeric = toNumber(param);
  if (numeric > 0) {
    return { districtId: numeric, divisionId: 6 };
  }

  const normalized = param.trim().toLowerCase();
  if (DISTRICT_MAP[normalized]) {
    const item = DISTRICT_MAP[normalized];
    return { districtId: item.district_id, divisionId: item.division_id };
  }

  // Substring search
  for (const [key, val] of Object.entries(DISTRICT_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { districtId: val.district_id, divisionId: val.division_id };
    }
  }

  return { districtId: 46, divisionId: 6 };
}

function getCategory(name: string): string {
  const n = String(name || "").toLowerCase();
  if (/চাল|ধান|গম|আটা|ময়দা|ময়দা|rice|wheat|flour|grain/.test(n)) return "চাল ও খাদ্যশস্য";
  if (/মাংস|ডিম|মুরগি|মুরগী|গরু|খাসি|হাঁস|মোরগ|কোয়েল|meat|beef|mutton|chicken|egg|broiler/.test(n) && !n.includes("চামড়া") && !n.includes("চামড়া")) return "মাংস ও ডিম";
  if (/মাছ|ইলিশ|রুই|কাতলা|মৃগেল|পাঙ্গাস|তেলাপিয়া|তেলাপিয়া|কৈ|শিং|মাগুর|মগুর|চিংড়ি|মাাছ|fish|carp|prawn|shrimp/.test(n)) return "মাছ";
  if (/তেল|তৈল|ওয়েল|ওয়েল|সোয়াবিন|সয়াবিন|সরিষা|পাম|\boil\b|\boils\b|soyabean|soyabin|soybean|mustard|sunflower/.test(n) && !n.includes("তেলাপিয়া") && !n.includes("তেলাপিয়া")) return "ভোজ্যতেল";
  if (/ডাল|শিম|মশুরি|মুগ|ছোলা|মটর|lenti|pulse|gram|\bbean\b|\bbeans\b/.test(n)) return "ডাল ও শিম";
  if (/শাক|সবজি|টমেটো|আলু|পটল|বেগুন|পেঁপে|কাঁচামরিচ|কাঁচা মরিচ|কচু|ফুলকপি|বাঁধাকপি|লাউ|কঁাকরোল|ঝিঙ্গা|চিচিংগা|উচ্ছে|করলা|গাজর|শসা|গাাজর|ভেণ্ডি|ঢেঁড়শ|ঢেঁড়স|vege|cabbage|cauliflower|tomato|potato|brinjal|gourd/.test(n)) return "শাকসবজি";
  if (/মসলা|মশলা|পিঁয়াজ|পেঁয়াজ|রসুন|আদা|হলুদ|মরিচ|জিরা|এলাচ|দারুচিনি|লবঙ্গ|ধনিয়া|ধনিয়া|তেজপাতা|spice|onion|garlic|ginger|turmeric|chilli|coriander/.test(n)) return "মসলা";
  return "নিত্যপণ্য";
}

function getWholesaleToRetailRatio(wId: number, rId: number): number {
  if (wId === 1) {
    if (rId === 2 || rId === 18 || rId === 1) return 100; // 1 Quintal (100kg) -> 1 Kg
  }
  if (wId === 15) return 50; // 50kg bag -> 1 kg
  if (wId === 13) {
    if (rId === 3) return 100; // 100 Liters -> 1 Liter
    if (rId === 20) return 20;  // 100 Liters -> 5 Liters
  }
  if (wId === 12 && rId === 11) return 6; // 12 kg -> 2 kg
  if (wId === 8) {
    if (rId === 4) return 100; // 100 pcs -> 1 pc
    if (rId === 5) return 25;  // 100 pcs -> 4 pcs (halia)
  }
  if (wId === 6 && rId === 4) return 48; // 48 pcs -> 1 pc
  if (wId === 9) {
    if (rId === 4) return 1000;
    if (rId === 8) return 10;
  }
  if (wId === 7 && rId === 5) return 20; // 80 pcs -> 4 pcs
  if (wId === 16 && rId === 17) return 80;

  return 1;
}

let cachedDropdowns: any = null;

async function getDropdowns(): Promise<any> {
  if (cachedDropdowns) return cachedDropdowns;

  // 1. Try local disk cache
  try {
    const localPath = path.join(process.cwd(), "common-dropdowns.json");
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, "utf8");
      const json = JSON.parse(content);
      if (json?.data) {
        cachedDropdowns = json.data;
        return cachedDropdowns;
      }
    }
  } catch (e) {
    console.warn("Local dropdown read failed:", e);
  }

  // 2. Network fetch fallback
  try {
    const response = await fetch(COMMON_DROPDOWN_API, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (response.ok) {
      const json = await response.json();
      cachedDropdowns = json?.data || json;
      return cachedDropdowns;
    }
  } catch (e) {
    console.warn("Network dropdown fetch failed:", e);
  }

  return {};
}

async function fetchDAMData(date: string, districtId?: number): Promise<AnyObject[]> {
  const body: any = { date };
  if (districtId && districtId > 0) {
    body.district_id = [districtId];
  }

  try {
    const response = await fetch(PRICE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "https://moa-services.com",
        Referer: "https://moa-services.com/",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) return [];

    const json = await response.json();
    if (json?.success === false) return [];

    return Array.isArray(json?.data) ? json.data : (Array.isArray(json?.result) ? json.result : []);
  } catch (e) {
    console.error("DAM API post error:", e);
    return [];
  }
}

/* =========================================================
   HISTORY BATCH FETCH
   Fetches past 30 days of data in parallel chunks (6 days at a time)
   and builds a commodity-keyed map of price history.
========================================================= */

async function fetchHistory30Days(
  baseDate: string,
  districtId: number | undefined,
  commodityMap: Map<number, AnyObject>,
  unitMap: Map<number, AnyObject>
): Promise<Map<number, Array<{ date: string; avgPrice: number; minPrice: number; maxPrice: number }>>> {
  // Build list of dates: past 30 days (oldest first)
  const dates: string[] = [];
  for (let i = 30; i >= 1; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Split into 5 parallel batches of 6 dates each
  const BATCH_SIZE = 6;
  const batches: string[][] = [];
  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    batches.push(dates.slice(i, i + BATCH_SIZE));
  }

  // historyMap: commodityId -> array of daily price points
  const historyMap = new Map<number, Array<{ date: string; avgPrice: number; minPrice: number; maxPrice: number }>>();

  // Fetch each batch in parallel
  await Promise.all(
    batches.map(async (batchDates) => {
      await Promise.all(
        batchDates.map(async (dateStr) => {
          try {
            const rows = await fetchDAMData(dateStr, districtId);
            for (const row of rows) {
              const id = toNumber(row?.commodity_id);
              if (id <= 0) continue;

              const comm = commodityMap.get(id) || {};
              const uRetailId = toNumber(row?.unit_retail || comm?.unit_retail || 2);
              const uWholesaleId = toNumber(row?.unit_wholesale || comm?.unit_whole_sale || 1);
              const ratio = getWholesaleToRetailRatio(uWholesaleId, uRetailId);

              const rLow = toNumber(row?.r_lowestPrice);
              const rHigh = toNumber(row?.r_highestPrice);
              let rAvg = (rLow > 0 && rHigh > 0) ? Number(((rLow + rHigh) / 2).toFixed(2)) : (rLow || rHigh);

              const wLow = toNumber(row?.w_lowestPrice);
              const wHigh = toNumber(row?.w_highestPrice);
              const wAvg = (wLow > 0 && wHigh > 0) ? Number(((wLow + wHigh) / 2).toFixed(2)) : (wLow || wHigh);

              if (rAvg === 0 && wAvg > 0) {
                rAvg = Number((wAvg / ratio).toFixed(2));
              }

              if (rAvg <= 0) continue;

              const point = {
                date: dateStr,
                avgPrice: rAvg,
                minPrice: rLow > 0 ? rLow : rAvg,
                maxPrice: rHigh > 0 ? rHigh : rAvg,
              };

              if (!historyMap.has(id)) {
                historyMap.set(id, []);
              }
              historyMap.get(id)!.push(point);
            }
          } catch {
            // Silently skip dates that fail — partial history is better than none
          }
        })
      );
    })
  );

  // Sort each commodity's history by date ascending
  for (const [, points] of historyMap) {
    points.sort((a, b) => a.date.localeCompare(b.date));
  }

  return historyMap;
}

/* =========================================================
   GET ROUTE HANDLER
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const districtParam = params.get("district") || params.get("district_id") || "46";
    const requestedDate = params.get("date") || new Date().toISOString().slice(0, 10);

    const { districtId, divisionId } = resolveDistrictInfo(districtParam);

    // Load master dropdowns
    const dropdowns = await getDropdowns();
    const commoditiesList: AnyObject[] = dropdowns.commodityNameList || [];
    const unitsList: AnyObject[] = dropdowns.measurementUnitList || [];

    const commodityMap = new Map<number, AnyObject>();
    for (const item of commoditiesList) {
      const id = toNumber(item?.value || item?.id || item?.commodity_id);
      if (id > 0) commodityMap.set(id, item);
    }

    const unitMap = new Map<number, AnyObject>();
    for (const item of unitsList) {
      const id = toNumber(item?.value || item?.id || item?.unit_id);
      if (id > 0) unitMap.set(id, item);
    }

    // 1. Try specified district for date
    let rows: AnyObject[] = [];
    let actualDataDate = requestedDate;
    let isNationalFallback = false;

    if (districtId > 0) {
      rows = await fetchDAMData(requestedDate, districtId);

      // Search past 7 days if empty
      if (rows.length === 0) {
        for (let daysBack = 1; daysBack <= 7; daysBack++) {
          const d = new Date(requestedDate);
          d.setDate(d.getDate() - daysBack);
          const checkDate = d.toISOString().slice(0, 10);
          const pastRows = await fetchDAMData(checkDate, districtId);
          if (pastRows.length > 0) {
            rows = pastRows;
            actualDataDate = checkDate;
            break;
          }
        }
      }
    }

    // 2. Fallback to national report if district has no entries
    if (rows.length === 0) {
      isNationalFallback = true;
      rows = await fetchDAMData(requestedDate);

      if (rows.length === 0) {
        for (let daysBack = 1; daysBack <= 7; daysBack++) {
          const d = new Date(requestedDate);
          d.setDate(d.getDate() - daysBack);
          const checkDate = d.toISOString().slice(0, 10);
          const pastRows = await fetchDAMData(checkDate);
          if (pastRows.length > 0) {
            rows = pastRows;
            actualDataDate = checkDate;
            break;
          }
        }
      }
    }

    // 3. Fetch previous day data for price change calculations
    const prevDateObj = new Date(actualDataDate);
    prevDateObj.setDate(prevDateObj.getDate() - 1);
    const prevDateStr = prevDateObj.toISOString().slice(0, 10);

    const prevRows = await fetchDAMData(prevDateStr, isNationalFallback ? undefined : districtId);
    const prevPriceMap = new Map<number, number>();

    for (const r of prevRows) {
      const cId = toNumber(r.commodity_id);
      const comm = commodityMap.get(cId) || {};
      const uRId = toNumber(r.unit_retail || comm.unit_retail || 2);
      const uWId = toNumber(r.unit_wholesale || comm.unit_whole_sale || 1);
      const ratio = getWholesaleToRetailRatio(uWId, uRId);

      const rLow = toNumber(r.r_lowestPrice);
      const rHigh = toNumber(r.r_highestPrice);
      let rAvg = (rLow > 0 && rHigh > 0) ? (rLow + rHigh) / 2 : (rLow || rHigh);

      const wLow = toNumber(r.w_lowestPrice);
      const wHigh = toNumber(r.w_highestPrice);
      const wAvg = (wLow > 0 && wHigh > 0) ? (wLow + wHigh) / 2 : (wLow || wHigh);

      if (rAvg === 0 && wAvg > 0) {
        rAvg = Number((wAvg / ratio).toFixed(2));
      }

      if (cId > 0 && rAvg > 0) {
        prevPriceMap.set(cId, rAvg);
      }
    }

    // 4. Map price items
    const uniqueProducts = new Map<number, AnyObject>();

    for (const row of rows) {
      const id = toNumber(row?.commodity_id);
      if (id <= 0 || uniqueProducts.has(id)) continue;

      const comm = commodityMap.get(id) || {};

      const uRetailId = toNumber(row?.unit_retail || comm?.unit_retail || 2);
      const uWholesaleId = toNumber(row?.unit_wholesale || comm?.unit_whole_sale || 1);
      const ratio = getWholesaleToRetailRatio(uWholesaleId, uRetailId);

      const unitRetailObj = unitMap.get(uRetailId) || { text_bn: "কিলোগ্রাম", text_en: "Kilogram" };
      const unitWholesaleObj = unitMap.get(uWholesaleId) || { text_bn: "কুইন্টাল", text_en: "Quintal" };

      const nameBn = String(comm?.text_bn || comm?.name_bn || comm?.text || `পণ্য #${id}`).trim();
      const nameEn = String(comm?.text_en || comm?.name_en || comm?.text || `Product #${id}`).trim();

      const rLow = toNumber(row?.r_lowestPrice);
      const rHigh = toNumber(row?.r_highestPrice);
      let rAvg = (rLow > 0 && rHigh > 0) ? Number(((rLow + rHigh) / 2).toFixed(2)) : (rLow || rHigh);

      const wLow = toNumber(row?.w_lowestPrice);
      const wHigh = toNumber(row?.w_highestPrice);
      let wAvg = (wLow > 0 && wHigh > 0) ? Number(((wLow + wHigh) / 2).toFixed(2)) : (wLow || wHigh);

      let retailAvg = rAvg;
      let retailLow = rLow;
      let retailHigh = rHigh;

      if (retailAvg === 0 && wAvg > 0) {
        retailAvg = Number((wAvg / ratio).toFixed(2));
        retailLow = wLow > 0 ? Number((wLow / ratio).toFixed(2)) : retailAvg;
        retailHigh = wHigh > 0 ? Number((wHigh / ratio).toFixed(2)) : retailAvg;
      }

      let wholesaleAvg = wAvg;
      let wholesaleLow = wLow;
      let wholesaleHigh = wHigh;

      if (wholesaleAvg === 0 && retailAvg > 0) {
        wholesaleAvg = Number((retailAvg * ratio).toFixed(2));
        wholesaleLow = retailLow > 0 ? Number((retailLow * ratio).toFixed(2)) : wholesaleAvg;
        wholesaleHigh = retailHigh > 0 ? Number((retailHigh * ratio).toFixed(2)) : wholesaleAvg;
      }

      const price = retailAvg || wholesaleAvg;
      if (price <= 0) continue;

      const unitBn = String(unitRetailObj?.text_bn || "কিলোগ্রাম").trim();
      const unitEn = String(unitRetailObj?.text_en || "Kilogram").trim();
      const wholesaleUnitBn = String(unitWholesaleObj?.text_bn || "কুইন্টাল").trim();
      const wholesaleUnitEn = String(unitWholesaleObj?.text_en || "Quintal").trim();

      const previousPrice = prevPriceMap.get(id) || 0;
      let priceChange = 0;
      let pctChange = 0;
      let priceChangeType: PriceChangeType = "no_data";

      if (previousPrice > 0 && retailAvg > 0) {
        priceChange = Number((retailAvg - previousPrice).toFixed(2));
        pctChange = Number(((priceChange / previousPrice) * 100).toFixed(2));

        if (priceChange > 0) priceChangeType = "increase";
        else if (priceChange < 0) priceChangeType = "decrease";
        else priceChangeType = "unchanged";
      }

      const category = getCategory(`${nameBn} ${nameEn}`);

      uniqueProducts.set(id, {
        id,
        commodityId: id,
        name: nameBn,
        nameBn,
        nameEn,
        commodityNameBn: nameBn,
        commodityNameEn: nameEn,
        category,
        price: retailAvg,
        avgPrice: retailAvg,
        averagePrice: retailAvg,
        retailPrice: retailAvg,
        retailAvg,
        retailLow,
        retailHigh,
        wholesaleAvg: wholesaleAvg || null,
        wholesaleLow: wholesaleLow || null,
        wholesaleHigh: wholesaleHigh || null,
        unitId: uRetailId,
        unitBn,
        unitEn,
        wholesaleUnitBn,
        wholesaleUnitEn,
        previousAvgPrice: previousPrice || null,
        previousPrice: previousPrice || null,
        previousPriceDate: prevDateStr,
        priceChange,
        pctChange,
        priceChangePercent: pctChange,
        priceChangeType,
        movement:
          priceChangeType === "increase"
            ? "up"
            : priceChangeType === "decrease"
            ? "down"
            : "stable",
        source: "Ministry of Agriculture / DAM",
        reportDate: actualDataDate,
        // history30Days will be populated below after batch fetch
        history30Days: [],
      });
    }

    const items = Array.from(uniqueProducts.values());

    // 5a. Fetch 30-day price history for all items in parallel batches
    const historyMap = await fetchHistory30Days(
      actualDataDate,
      isNationalFallback ? undefined : districtId,
      commodityMap,
      unitMap
    );

    // 5b. Inject history into each item + add today's price as last point
    for (const item of items) {
      const cId = toNumber(item.commodityId);
      const existing = historyMap.get(cId) || [];

      // Append today's price as the final point
      const todayPoint = {
        date: actualDataDate,
        avgPrice: toNumber(item.retailAvg),
        minPrice: toNumber(item.retailLow) || toNumber(item.retailAvg),
        maxPrice: toNumber(item.retailHigh) || toNumber(item.retailAvg),
      };

      // Avoid duplicate for today if already fetched
      const alreadyHasToday = existing.some((p) => p.date === actualDataDate);
      item.history30Days = alreadyHasToday ? existing : [...existing, todayPoint];
    }

    // 5. Category and Price Change statistics
    const categoryCounts: Record<string, number> = {};
    for (const item of items) {
      const cat = item.category || "নিত্যপণ্য";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const priceChangeCounts = {
      increase: 0,
      decrease: 0,
      unchanged: 0,
      no_data: 0,
    };

    for (const item of items) {
      const type = item.priceChangeType as PriceChangeType;
      if (type === "increase") priceChangeCounts.increase++;
      else if (type === "decrease") priceChangeCounts.decrease++;
      else if (type === "unchanged") priceChangeCounts.unchanged++;
      else priceChangeCounts.no_data++;
    }

    return NextResponse.json({
      success: true,
      location: {
        division: divisionId,
        district: districtId,
        districtParam,
        isNationalFallback,
      },
      district: districtId,
      date: requestedDate,
      actualDataDate,
      previousPriceDate: prevDateStr,
      total: items.length,
      items,
      categoryCounts,
      priceChangeCounts,
      source: "Ministry of Agriculture / DAM",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("DaamBD PRICE API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "Ministry of Agriculture / DAM",
      },
      { status: 500 }
    );
  }
}