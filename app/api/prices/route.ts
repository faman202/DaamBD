import { NextRequest, NextResponse } from "next/server";

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
   BASIC HELPERS
========================================================= */

function toNumber(value: any): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(
      value.replace(/,/g, "").trim()
    );

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

function firstNumber(...values: any[]): number {
  for (const value of values) {
    const number = toNumber(value);

    if (number !== 0) {
      return number;
    }
  }

  return 0;
}

function firstText(...values: any[]): string {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function getPreviousDate(
  date: string,
  daysBack: number
): string {
  const parts = date.split("-").map(Number);

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  const result = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  result.setUTCDate(
    result.getUTCDate() - daysBack
  );

  return result
    .toISOString()
    .slice(0, 10);
}

/* =========================================================
   COMMON DROPDOWN EXTRACTION
========================================================= */

function extractList(
  data: any,
  names: string[]
): AnyObject[] {
  for (const name of names) {
    const possibilities = [
      data?.[name],
      data?.data?.[name],
      data?.result?.[name],
      data?.data?.data?.[name],
      data?.data?.result?.[name],
    ];

    for (const value of possibilities) {
      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  return [];
}

async function getCommonDropdowns(): Promise<any> {
  const response = await fetch(
    COMMON_DROPDOWN_API,
    {
      method: "GET",

      headers: {
        Accept:
          "application/json",
      },

      cache:
        "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Common dropdown API failed: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   MARKET HELPERS
========================================================= */

function marketId(
  item: AnyObject
): number {
  return firstNumber(
    item?.value,
    item?.id,
    item?.market_id,
    item?.marketId,
    item?.marketID
  );
}

function marketDivisionId(
  item: AnyObject
): number {
  return firstNumber(
    item?.division_id,
    item?.divisionId,
    item?.divisionID,
    item?.division
  );
}

function marketDistrictId(
  item: AnyObject
): number {
  return firstNumber(
    item?.district_id,
    item?.districtId,
    item?.districtID,
    item?.district
  );
}

function marketUpazilaId(
  item: AnyObject
): number {
  return firstNumber(
    item?.upazila_id,
    item?.upazilla_id,
    item?.upazilaId,
    item?.upazillaId,
    item?.upazilaID,
    item?.upazillaID,
    item?.upazila,
    item?.upazilla
  );
}

function marketName(
  item: AnyObject
): string {
  return firstText(
    item?.text_bn,
    item?.market_name_bn,
    item?.marketNameBn,
    item?.name_bn,
    item?.nameBn,

    item?.text,

    item?.text_en,
    item?.market_name,
    item?.marketName,
    item?.name_en,
    item?.nameEn,
    item?.name
  );
}

/* =========================================================
   EXACT MARKET
========================================================= */

function findExactMarket(
  markets: AnyObject[],
  division: number,
  district: number,
  requestedUpazila: number,
  requestedMarket: number
): AnyObject | null {
  if (
    requestedMarket <= 0
  ) {
    return null;
  }

  const exact =
    markets.find(
      (item) =>
        marketId(item) ===
        requestedMarket
    );

  if (!exact) {
    console.log(
      `DaamBD: market ${requestedMarket} not found in official marketList`
    );

    return null;
  }

  const officialDivision =
    marketDivisionId(exact);

  const officialDistrict =
    marketDistrictId(exact);

  const officialUpazila =
    marketUpazilaId(exact);

  /*
   * IMPORTANT:
   *
   * If official marketList gives location IDs,
   * validate them.
   *
   * Never allow another district.
   */

  if (
    officialDivision > 0 &&
    officialDivision !== division
  ) {
    console.log(
      `DaamBD: division mismatch market=${requestedMarket}`
    );

    return null;
  }

  if (
    officialDistrict > 0 &&
    officialDistrict !== district
  ) {
    console.log(
      `DaamBD: district mismatch market=${requestedMarket}`
    );

    return null;
  }

  if (
    requestedUpazila > 0 &&
    officialUpazila > 0 &&
    officialUpazila !== requestedUpazila
  ) {
    console.log(
      `DaamBD: upazila mismatch market=${requestedMarket}`
    );

    return null;
  }

  return exact;
}

/* =========================================================
   PRICE ROW EXTRACTION
========================================================= */

function extractPriceRows(
  data: any
): AnyObject[] {
  if (Array.isArray(data)) {
    return data;
  }

  const possibleArrays = [
    data?.data,
    data?.result,
    data?.content,
    data?.rows,
    data?.items,

    data?.data?.data,
    data?.data?.result,
    data?.data?.content,
    data?.data?.rows,
    data?.data?.items,

    data?.result?.data,
    data?.result?.result,
    data?.result?.content,
    data?.result?.rows,
    data?.result?.items,
  ];

  for (
    const value of
      possibleArrays
  ) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

/* =========================================================
   WEEK
========================================================= */

function getWeekIds(
  date: string
): number[] {
  const parts =
    date.split("-").map(Number);

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  const current =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  const firstDay =
    new Date(
      Date.UTC(
        year,
        month - 1,
        1
      )
    );

  const calculatedWeek =
    Math.floor(
      (
        current.getUTCDate() +
        firstDay.getUTCDay() -
        1
      ) / 7
    ) + 1;

  /*
   * DAM may return data under different
   * week IDs depending on the date.
   */

  const weeks = [
    calculatedWeek,
    1,
    2,
    3,
    4,
    5,
  ];

  return weeks.filter(
    (value, index) =>
      value >= 1 &&
      value <= 5 &&
      weeks.indexOf(value) ===
        index
  );
}

/* =========================================================
   DAM PRICE REQUEST
========================================================= */

async function requestDAM(
  date: string,
  division: number,
  district: number,
  upazila: number,
  market: number,
  weekId: number
): Promise<AnyObject[]> {
  if (
    division <= 0 ||
    district <= 0 ||
    upazila <= 0 ||
    market <= 0
  ) {
    return [];
  }

  const parts =
    date.split("-").map(Number);

  const year = parts[0];
  const month = parts[1];

  const payload = {
    division_id: [division],

    district_id: [district],

    upazila_id: [upazila],

    market_id: [market],

    price_type_id: [
      "Retail",
    ],

    price_date: date,

    select_type:
      "Daily",

    month_id:
      month,

    year_id:
      year,

    week_id:
      weekId,
  };

  console.log(
    "DaamBD DAM PAYLOAD:",
    JSON.stringify(payload)
  );

  const response =
    await fetch(
      PRICE_API,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",

          Origin:
            "https://moa-services.com",

          Referer:
            "https://moa-services.com/",
        },

        body:
          JSON.stringify(payload),

        cache:
          "no-store",
      }
    );

  const raw =
    await response.text();

  console.log(
    `DAM ${date} week=${weekId} market=${market} status=${response.status}`
  );

  if (!response.ok) {
    console.error(
      "DAM ERROR:",
      raw
    );

    return [];
  }

  if (
    !raw.trim()
  ) {
    return [];
  }

  let json: any;

  try {
    json =
      JSON.parse(raw);
  } catch {
    console.error(
      "DAM JSON parse failed:",
      raw.slice(0, 500)
    );

    return [];
  }

  /*
   * DAM explicitly says:
   *
   * success=false
   * message="Not found!"
   *
   * In that case return empty.
   */

  if (
    json?.success === false
  ) {
    return [];
  }

  const rows =
    extractPriceRows(json);

  console.log(
    `DAM rows ${date} week=${weekId} market=${market}: ${rows.length}`
  );

  if (
    rows.length > 0
  ) {
    console.log(
      "DAM FIRST ROW:",
      JSON.stringify(
        rows[0]
      )
    );
  }

  return rows;
}

/* =========================================================
   FETCH PRICE FOR EXACT MARKET
========================================================= */

async function fetchDAMPrice(
  date: string,
  division: number,
  district: number,
  upazila: number,
  market: number
): Promise<AnyObject[]> {
  if (
    division <= 0 ||
    district <= 0 ||
    upazila <= 0 ||
    market <= 0
  ) {
    return [];
  }

  const weekIds =
    getWeekIds(date);

  for (
    const weekId of
      weekIds
  ) {
    try {
      const rows =
        await requestDAM(
          date,
          division,
          district,
          upazila,
          market,
          weekId
        );

      if (
        rows.length > 0
      ) {
        return rows;
      }
    } catch (error) {
      console.error(
        "DAM request error:",
        error
      );
    }
  }

  return [];
}

/* =========================================================
   FIND MARKET WITH DATA
========================================================= */

async function findMarketWithData(
  markets: AnyObject[],
  division: number,
  district: number,
  requestedUpazila: number,
  requestedMarket: number,
  requestedDate: string
): Promise<{
  market: number;
  upazila: number;
  marketName: string;
  rows: AnyObject[];
  actualDataDate: string | null;
}> {
  /*
   * -------------------------------------------------------
   * EXACT MARKET
   * -------------------------------------------------------
   */

  const exactMarket =
    findExactMarket(
      markets,
      division,
      district,
      requestedUpazila,
      requestedMarket
    );

  /*
   * -------------------------------------------------------
   * BUILD SAFE CANDIDATES
   *
   * Priority:
   *
   * 1. selected market
   * 2. same upazila
   * 3. same district
   *
   * NEVER another district.
   * -------------------------------------------------------
   */

  const candidates:
    AnyObject[] = [];

  const addCandidate = (
    item: AnyObject
  ) => {
    const id =
      marketId(item);

    if (
      id <= 0
    ) {
      return;
    }

    if (
      candidates.some(
        (existing) =>
          marketId(existing) ===
          id
      )
    ) {
      return;
    }

    candidates.push(
      item
    );
  };

  /*
   * 1. Selected market.
   */

  if (exactMarket) {
    addCandidate(
      exactMarket
    );
  }

  /*
   * 2. Same upazila.
   *
   * Only when official marketList
   * actually provides the upazila.
   */

  if (
    requestedUpazila > 0
  ) {
    for (
      const item of markets
    ) {
      const mDivision =
        marketDivisionId(item);

      const mDistrict =
        marketDistrictId(item);

      const mUpazila =
        marketUpazilaId(item);

      /*
       * Division safety.
       */

      if (
        mDivision > 0 &&
        mDivision !== division
      ) {
        continue;
      }

      /*
       * District safety.
       */

      if (
        mDistrict > 0 &&
        mDistrict !== district
      ) {
        continue;
      }

      if (
        mUpazila > 0 &&
        mUpazila ===
          requestedUpazila
      ) {
        addCandidate(
          item
        );
      }
    }
  }

  /*
   * 3. Same district.
   *
   * Only official marketList markets
   * belonging to this district.
   */

  for (
    const item of markets
  ) {
    const mDivision =
      marketDivisionId(item);

    const mDistrict =
      marketDistrictId(item);

    /*
     * If official data contains
     * division ID, enforce it.
     */

    if (
      mDivision > 0 &&
      mDivision !== division
    ) {
      continue;
    }

    /*
     * CRITICAL:
     *
     * If market has an official district ID,
     * it MUST equal selected district.
     */

    if (
      mDistrict > 0 &&
      mDistrict !== district
    ) {
      continue;
    }

    /*
     * If district information is missing
     * completely, do NOT add it as a
     * district fallback.
     *
     * This prevents accidental
     * cross-district data.
     */

    if (
      mDistrict <= 0
    ) {
      continue;
    }

    addCandidate(
      item
    );
  }

  console.log(
    `DaamBD SAFE market candidates=${candidates.length}`
  );

  /*
   * -------------------------------------------------------
   * SEARCH DATA
   *
   * Today → previous 7 days
   * -------------------------------------------------------
   */

  for (
    const candidate of
      candidates
  ) {
    const candidateMarket =
      marketId(candidate);

    const candidateUpazila =
      marketUpazilaId(candidate) ||
      requestedUpazila;

    const candidateName =
      marketName(candidate);

    if (
      candidateMarket <= 0 ||
      candidateUpazila <= 0
    ) {
      continue;
    }

    console.log(
      `DaamBD checking market=${candidateMarket}, upazila=${candidateUpazila}, name=${candidateName}`
    );

    for (
      let daysBack = 0;
      daysBack <= 7;
      daysBack++
    ) {
      const checkDate =
        getPreviousDate(
          requestedDate,
          daysBack
        );

      const rows =
        await fetchDAMPrice(
          checkDate,
          division,
          district,
          candidateUpazila,
          candidateMarket
        );

      if (
        rows.length > 0
      ) {
        console.log(
          `DaamBD FOUND OFFICIAL DATA market=${candidateMarket} upazila=${candidateUpazila} date=${checkDate} rows=${rows.length}`
        );

        return {
          market:
            candidateMarket,

          upazila:
            candidateUpazila,

          marketName:
            candidateName,

          rows,

          actualDataDate:
            checkDate,
        };
      }
    }
  }

  /*
   * -------------------------------------------------------
   * NOTHING FOUND
   * -------------------------------------------------------
   */

  return {
    market:
      exactMarket
        ? marketId(exactMarket)
        : requestedMarket,

    upazila:
      requestedUpazila,

    marketName:
      exactMarket
        ? marketName(
            exactMarket
          )
        : "",

    rows: [],

    actualDataDate:
      null,
  };
}

/* =========================================================
   PRICE FIELDS
========================================================= */

function commodityId(
  row: AnyObject
): number {
  return firstNumber(
    row?.commodity_id,
    row?.commodityId,
    row?.commodityID
  );
}

function retailAverage(
  row: AnyObject
): number {
  return firstNumber(
    row?.r_avgPriceAvg,

    row?.retail_avg,
    row?.retailAvg,

    row?.retail_average,
    row?.retailAverage,

    row?.retail_avg_price,
    row?.retailAvgPrice,

    row?.r_avg_price,
    row?.rAveragePrice,

    row?.retail_price_avg,
    row?.retailPriceAvg,

    row?.avgPrice,
    row?.averagePrice,

    row?.price
  );
}

function retailLow(
  row: AnyObject
): number {
  return firstNumber(
    row?.r_lowestPrice,
    row?.r_avgPriceMin,

    row?.retail_low,
    row?.retailLow,

    row?.retail_min,
    row?.retailMin,

    row?.r_min_price,
    row?.rMinPrice
  );
}

function retailHigh(
  row: AnyObject
): number {
  return firstNumber(
    row?.r_highestPrice,
    row?.r_avgPriceMax,

    row?.retail_high,
    row?.retailHigh,

    row?.retail_max,
    row?.retailMax,

    row?.r_max_price,
    row?.rMaxPrice
  );
}

function wholesaleAverage(
  row: AnyObject
): number {
  return firstNumber(
    row?.w_avgPriceAvg,

    row?.wholesale_avg,
    row?.wholesaleAvg,

    row?.wholesale_average,
    row?.wholesaleAverage,

    row?.w_avg_price,
    row?.wAveragePrice
  );
}

function wholesaleLow(
  row: AnyObject
): number {
  return firstNumber(
    row?.w_lowestPrice,
    row?.w_avgPriceMin,

    row?.wholesale_low,
    row?.wholesaleLow,

    row?.wholesale_min,
    row?.wholesaleMin,

    row?.w_min_price,
    row?.wMinPrice
  );
}

function wholesaleHigh(
  row: AnyObject
): number {
  return firstNumber(
    row?.w_highestPrice,
    row?.w_avgPriceMax,

    row?.wholesale_high,
    row?.wholesaleHigh,

    row?.wholesale_max,
    row?.wholesaleMax,

    row?.w_max_price,
    row?.wMaxPrice
  );
}

function unitId(
  row: AnyObject
): number {
  return firstNumber(
    row?.unit_retail,
    row?.unit_id,
    row?.unitId,
    row?.measurement_unit_id,
    row?.measurementUnitId,
    row?.retail_unit_id,
    row?.retailUnitId,
    row?.r_unit_id,
    row?.rUnitId
  );
}

/* =========================================================
   COMMODITY NAMES
========================================================= */

function commodityBanglaName(
  commodity:
    AnyObject | undefined,
  row: AnyObject
): string {
  return firstText(
    commodity?.text_bn,
    commodity?.commodity_name_bn,
    commodity?.commodityNameBn,
    commodity?.name_bn,
    commodity?.nameBn,

    row?.commodity_name_bn,
    row?.commodityNameBn,
    row?.name_bn,
    row?.nameBn
  );
}

function commodityEnglishName(
  commodity:
    AnyObject | undefined,
  row: AnyObject
): string {
  return firstText(
    commodity?.text_en,
    commodity?.commodity_name,
    commodity?.commodityName,
    commodity?.name_en,
    commodity?.nameEn,

    row?.commodity_name,
    row?.commodityName,
    row?.name_en,
    row?.nameEn
  );
}

/* =========================================================
   UNIT
========================================================= */

function getUnitInfo(
  id: number,
  units: AnyObject[]
): {
  bn: string;
  en: string;
} {
  const found =
    units.find(
      (item) =>
        firstNumber(
          item?.value,
          item?.id,
          item?.unit_id,
          item?.unitId
        ) === id
    );

  if (!found) {
    return {
      bn: "কেজি",
      en: "kg",
    };
  }

  return {
    bn:
      firstText(
        found?.text_bn,
        found?.unit_name_bn,
        found?.unitNameBn,
        found?.name_bn,
        found?.nameBn,
        found?.text
      ) ||
      "কেজি",

    en:
      firstText(
        found?.text_en,
        found?.unit_name,
        found?.unitName,
        found?.name_en,
        found?.nameEn,
        found?.name
      ) ||
      "kg",
  };
}

/* =========================================================
   CATEGORY
========================================================= */

function getCategory(
  name: string
): string {
  const value =
    name.toLowerCase();

  if (
    /মাছ|ইলিশ|রুই|কাতল|পাঙ্গাস|পাংগাস|তেলাপিয়া|তেলাপিয়া|চিংড়ি|চিংড়ি|fish|hilsa|rohu|rui|katla|pangash|tilapia|shrimp/.test(
      value
    )
  ) {
    return "মাছ";
  }

  if (
    /ডিম|মুরগ|ব্রয়লার|ব্রয়লার|গরু|মাংস|খাসি|ছাগল|egg|chicken|broiler|beef|mutton|meat/.test(
      value
    )
  ) {
    return "মাংস ও ডিম";
  }

  if (
    /তেল|সয়াবিন|সয়াবিন|সরিষা|পাম|oil|soybean|mustard|sunflower/.test(
      value
    )
  ) {
    return "ভোজ্যতেল";
  }

  if (
    /ডাল|মসুর|মশুর|মুগ|মাষ|কালাই|ছোলা|বুট|খেসারি|মটর|lentil|pulse|mung|gram|peas/.test(
      value
    )
  ) {
    return "ডাল ও শিম";
  }

  if (
    /পেঁয়াজ|পেঁয়াজ|রসুন|আদা|মরিচ|লংকা|হলুদ|জিরা|ধনে|দারুচিনি|এলাচ|লবঙ্গ|onion|garlic|ginger|chilli|chili|turmeric|cumin|coriander|cinnamon|cardamom|clove/.test(
      value
    )
  ) {
    return "মসলা";
  }

  if (
    /আলু|বেগুন|টমেটো|পটল|লাউ|কুমড়া|কুমড়া|করলা|শসা|শিম|বরবটি|ঢেঁড়স|ঢেঁড়স|ফুলকপি|বাঁধাকপি|গাজর|মূলা|মুলা|পেঁপে|শাক|সবজি|potato|eggplant|brinjal|tomato|pumpkin|cucumber|bean|okra|cauliflower|cabbage|carrot|radish|papaya|vegetable/.test(
      value
    )
  ) {
    return "শাকসবজি";
  }

  if (
    /চাল|ধান|গম|আটা|ময়দা|ময়দা|rice|wheat|flour/.test(
      value
    )
  ) {
    return "চাল ও খাদ্যশস্য";
  }

  return "নিত্যপণ্য";
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const url =
      new URL(request.url);

    const params =
      url.searchParams;

    const division =
      toNumber(
        params.get(
          "division"
        )
      );

    const district =
      toNumber(
        params.get(
          "district"
        )
      );

    const requestedUpazila =
      toNumber(
        params.get(
          "upazila"
        )
      );

    const requestedMarket =
      toNumber(
        params.get(
          "market"
        )
      );

    const requestedDate =
      params.get("date") ||
      new Date()
        .toISOString()
        .slice(0, 10);

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      division <= 0 ||
      district <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Valid DAM division and district are required.",

          source:
            "Ministry of Agriculture / DAM",
        },
        {
          status: 400,
        }
      );
    }

    if (
      requestedUpazila <= 0 ||
      requestedMarket <= 0
    ) {
      return NextResponse.json({
        success: true,

        location: {
          division,

          district,

          upazila:
            requestedUpazila,

          market:
            requestedMarket,

          marketName: "",
        },

        district,

        upazila:
          requestedUpazila,

        market:
          requestedMarket,

        marketName: "",

        date:
          requestedDate,

        actualDataDate:
          null,

        total: 0,

        items: [],

        categoryCounts: {},

        priceChangeCounts: {
          increase: 0,
          decrease: 0,
          unchanged: 0,
          no_data: 0,
        },

        source:
          "Ministry of Agriculture / DAM",

        message:
          "A valid official DAM upazila and market are required.",
      });
    }

    /* =====================================================
       OFFICIAL DROPDOWNS
    ===================================================== */

    const dropdowns =
      await getCommonDropdowns();

    const markets =
      extractList(
        dropdowns,
        [
          "marketList",
        ]
      );

    const commodities =
      extractList(
        dropdowns,
        [
          "commodityNameList",
        ]
      );

    const units =
      extractList(
        dropdowns,
        [
          "measurementUnitList",
        ]
      );

    if (
      markets.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Official DAM marketList was empty.",

          source:
            "Ministry of Agriculture / DAM",
        },
        {
          status: 502,
        }
      );
    }

    console.log(
      `DaamBD official marketList count=${markets.length}`
    );

    /* =====================================================
       FIND OFFICIAL DATA
    ===================================================== */

    const resolved =
      await findMarketWithData(
        markets,

        division,

        district,

        requestedUpazila,

        requestedMarket,

        requestedDate
      );

    const upazila: number =
      Number(
        resolved.upazila ||
          0
      );

    const market: number =
      Number(
        resolved.market ||
          0
      );

    /* =====================================================
       NO DATA
    ===================================================== */

    if (
      resolved.rows.length ===
        0 ||
      !resolved.actualDataDate ||
      market <= 0
    ) {
      return NextResponse.json({
        success: true,

        location: {
          division,

          district,

          upazila:
            requestedUpazila,

          market:
            requestedMarket,

          marketName:
            resolved.marketName ||
            "",
        },

        district,

        upazila:
          requestedUpazila,

        market:
          requestedMarket,

        marketName:
          resolved.marketName ||
          "",

        date:
          requestedDate,

        actualDataDate:
          null,

        total: 0,

        items: [],

        categoryCounts: {},

        priceChangeCounts: {
          increase: 0,
          decrease: 0,
          unchanged: 0,
          no_data: 0,
        },

        source:
          "Ministry of Agriculture / DAM",

        message:
          "এই এলাকার জন্য বর্তমানে সরকারি DAM-এর মূল্যতথ্য পাওয়া যায়নি।",
      });
    }

    const rows =
      resolved.rows;

    const actualDataDate =
      resolved.actualDataDate;

    /* =====================================================
       COMMODITY MAP
    ===================================================== */

    const commodityMap =
      new Map<
        number,
        AnyObject
      >();

    for (
      const item of
        commodities
    ) {
      const id =
        firstNumber(
          item?.value,
          item?.id,
          item?.commodity_id,
          item?.commodityId
        );

      if (
        id > 0
      ) {
        commodityMap.set(
          id,
          item
        );
      }
    }

    /* =====================================================
       PREVIOUS DATA
    ===================================================== */

    let previousRows:
      AnyObject[] = [];

    let previousDataDate:
      string | null =
      null;

    for (
      let daysBack = 1;
      daysBack <= 7;
      daysBack++
    ) {
      const checkDate =
        getPreviousDate(
          actualDataDate,
          daysBack
        );

      const result =
        await fetchDAMPrice(
          checkDate,

          division,

          district,

          upazila,

          market
        );

      if (
        result.length > 0
      ) {
        previousRows =
          result;

        previousDataDate =
          checkDate;

        break;
      }
    }

    /* =====================================================
       PREVIOUS PRICE MAP
    ===================================================== */

    const previousPriceMap =
      new Map<
        number,
        number
      >();

    for (
      const row of
        previousRows
    ) {
      const id =
        commodityId(row);

      const price =
        retailAverage(row);

      if (
        id > 0 &&
        price > 0
      ) {
        previousPriceMap.set(
          id,
          price
        );
      }
    }

    /* =====================================================
       BUILD PRODUCTS
    ===================================================== */

    const products:
      AnyObject[] = [];

    for (
      const row of
        rows
    ) {
      const id =
        commodityId(row);

      const price =
        retailAverage(row);

      if (
        id <= 0 ||
        price <= 0
      ) {
        continue;
      }

      const commodity =
        commodityMap.get(
          id
        );

      const nameBn =
        commodityBanglaName(
          commodity,
          row
        );

      const nameEn =
        commodityEnglishName(
          commodity,
          row
        );

      if (
        !nameBn &&
        !nameEn
      ) {
        continue;
      }

      const finalNameBn =
        nameBn ||
        nameEn;

      const finalNameEn =
        nameEn ||
        nameBn;

      const finalUnitId =
        firstNumber(
          row?.unit_retail,

          unitId(row),

          commodity?.unit_retail
        );

      const unit =
        getUnitInfo(
          finalUnitId,

          units
        );

      const previousPrice =
        previousPriceMap.get(
          id
        ) || 0;

      let priceChange =
        0;

      let pctChange =
        0;

      let priceChangeType:
        PriceChangeType =
        "no_data";

      if (
        previousPrice > 0
      ) {
        priceChange =
          Number(
            (
              price -
              previousPrice
            ).toFixed(2)
          );

        pctChange =
          Number(
            (
              (
                priceChange /
                previousPrice
              ) *
              100
            ).toFixed(2)
          );

        if (
          priceChange > 0
        ) {
          priceChangeType =
            "increase";
        } else if (
          priceChange < 0
        ) {
          priceChangeType =
            "decrease";
        } else {
          priceChangeType =
            "unchanged";
        }
      }

      products.push({
        id,

        commodityId:
          id,

        name:
          finalNameBn,

        nameBn:
          finalNameBn,

        nameEn:
          finalNameEn,

        commodityNameBn:
          finalNameBn,

        commodityName:
          finalNameEn,

        category:
          getCategory(
            `${finalNameBn} ${finalNameEn}`
          ),

        price,

        avgPrice:
          price,

        averagePrice:
          price,

        retailPrice:
          price,

        retailAvg:
          price,

        retailLow:
          retailLow(row),

        retailHigh:
          retailHigh(row),

        wholesaleAvg:
          wholesaleAverage(row) ||
          null,

        wholesaleLow:
          wholesaleLow(row) ||
          null,

        wholesaleHigh:
          wholesaleHigh(row) ||
          null,

        unitId:
          finalUnitId,

        unitBn:
          unit.bn,

        unitEn:
          unit.en,

        previousAvgPrice:
          previousPrice ||
          null,

        previousPrice:
          previousPrice ||
          null,

        previousPriceDate:
          previousDataDate,

        priceChange,

        pctChange,

        priceChangePercent:
          pctChange,

        priceChangeType,

        movement:
          priceChangeType ===
          "increase"
            ? "up"
            : priceChangeType ===
              "decrease"
            ? "down"
            : "stable",

        source:
          "Ministry of Agriculture / DAM",

        reportDate:
          actualDataDate,
      });
    }

    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const uniqueProducts =
      new Map<
        number,
        AnyObject
      >();

    for (
      const product of
        products
    ) {
      uniqueProducts.set(
        Number(
          product.commodityId
        ),
        product
      );
    }

    const items =
      Array.from(
        uniqueProducts.values()
      );

    /* =====================================================
       CATEGORY COUNTS
    ===================================================== */

    const categoryCounts:
      Record<
        string,
        number
      > = {};

    for (
      const item of
        items
    ) {
      const category =
        String(
          item.category ||
          "নিত্যপণ্য"
        );

      if (
        categoryCounts[
          category
        ] === undefined
      ) {
        categoryCounts[
          category
        ] = 0;
      }

      categoryCounts[
        category
      ]++;
    }

    /* =====================================================
       PRICE CHANGE COUNTS
    ===================================================== */

    const priceChangeCounts = {
      increase: 0,

      decrease: 0,

      unchanged: 0,

      no_data: 0,
    };

    for (
      const item of
        items
    ) {
      const type =
        item.priceChangeType as
          PriceChangeType;

      if (
        type ===
        "increase"
      ) {
        priceChangeCounts.increase++;
      } else if (
        type ===
        "decrease"
      ) {
        priceChangeCounts.decrease++;
      } else if (
        type ===
        "unchanged"
      ) {
        priceChangeCounts.unchanged++;
      } else {
        priceChangeCounts.no_data++;
      }
    }

    /* =====================================================
       FINAL RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      location: {
        division,

        district,

        upazila,

        market,

        marketName:
          resolved.marketName,
      },

      district,

      upazila,

      market,

      marketName:
        resolved.marketName,

      date:
        requestedDate,

      actualDataDate,

      previousPriceDate:
        previousDataDate,

      total:
        items.length,

      items,

      categoryCounts,

      priceChangeCounts,

      source:
        "Ministry of Agriculture / DAM",

      timestamp:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "DaamBD PRICE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",

        source:
          "Ministry of Agriculture / DAM",
      },
      {
        status: 500,
      }
    );
  }
}