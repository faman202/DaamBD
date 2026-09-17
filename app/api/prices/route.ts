import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMODITY_API =
  "https://moa-services.com/agri-service/common-dropdowns";

type AnyObject = Record<string, any>;

function getNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const number = Number(value.replace(/,/g, "").trim());

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return 0;
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function getPreviousDate(
  dateString: string,
  daysBack: number
): string {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const d = new Date(
    Date.UTC(year, month - 1, day)
  );

  d.setUTCDate(d.getUTCDate() - daysBack);

  return d.toISOString().split("T")[0];
}

/*
 * ============================================================
 * GENERIC LIST EXTRACTOR
 * ============================================================
 */

function extractList(
  data: AnyObject,
  keys: string[]
): AnyObject[] {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    if (Array.isArray(data?.data?.[key])) {
      return data.data[key];
    }

    if (Array.isArray(data?.result?.[key])) {
      return data.result[key];
    }

    if (Array.isArray(data?.data?.data?.[key])) {
      return data.data.data[key];
    }
  }

  return [];
}

/*
 * ============================================================
 * OFFICIAL COMMON DROPDOWN DATA
 * ============================================================
 */

async function fetchOfficialDropdowns(): Promise<AnyObject> {
  const response = await fetch(COMMODITY_API, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `DAM common dropdown API returned ${response.status}`
    );
  }

  return response.json();
}

/*
 * ============================================================
 * LOCATION LIST FINDER
 * ============================================================
 */

function findLocationList(
  data: AnyObject,
  type: "upazila" | "market"
): AnyObject[] {
  const candidates =
    type === "upazila"
      ? [
          "upazilaList",
          "upazillaList",
          "upazila_list",
          "upazilla_list",
          "upazilas",
          "upazillas",
          "upazila",
          "upazilla",
        ]
      : [
          "marketList",
          "market_list",
          "markets",
          "marketDirectoryList",
          "marketDirectory",
          "market_list_data",
          "marketData",
        ];

  return extractList(data, candidates);
}

/*
 * ============================================================
 * PARENT ID RESOLVER
 * ============================================================
 */

function getParentId(
  item: AnyObject,
  type: "division" | "district" | "upazila"
): number {
  if (type === "division") {
    return getNumber(
      item?.division_id,
      item?.divisionId,
      item?.parent_division_id,
      item?.parentDivisionId
    );
  }

  if (type === "district") {
    return getNumber(
      item?.district_id,
      item?.districtId,
      item?.parent_district_id,
      item?.parentDistrictId
    );
  }

  return getNumber(
    item?.upazila_id,
    item?.upazilla_id,
    item?.upazilaId,
    item?.upazillaId,
    item?.parent_upazila_id,
    item?.parentUpazilaId,
    item?.parent_upazilla_id,
    item?.parentUpazillaId
  );
}

/*
 * ============================================================
 * LOCATION ID RESOLVER
 * ============================================================
 */

function getItemId(
  item: AnyObject,
  type: "upazila" | "market"
): number {
  if (type === "upazila") {
    return getNumber(
      item?.value,
      item?.id,
      item?.upazila_id,
      item?.upazilla_id,
      item?.upazilaId,
      item?.upazillaId
    );
  }

  return getNumber(
    item?.value,
    item?.id,
    item?.market_id,
    item?.marketId
  );
}

/*
 * ============================================================
 * LOCATION RESOLVER
 *
 * If upazila/market is explicitly supplied, use it.
 * Otherwise resolve from official dropdown data.
 * ============================================================
 */

function resolveLocation(
  data: AnyObject,
  district: number,
  requestedUpazila: number,
  requestedMarket: number
) {
  const upazilaList = findLocationList(
    data,
    "upazila"
  );

  const marketList = findLocationList(
    data,
    "market"
  );

  let resolvedUpazila =
    requestedUpazila;

  let resolvedMarket =
    requestedMarket;

  /*
   * ----------------------------------------------------------
   * Resolve upazila from district
   * ----------------------------------------------------------
   */

  if (resolvedUpazila <= 0) {
    const districtUpazilas =
      upazilaList.filter(
        (item) =>
          getParentId(
            item,
            "district"
          ) === district
      );

    if (districtUpazilas.length > 0) {
      resolvedUpazila =
        getItemId(
          districtUpazilas[0],
          "upazila"
        );
    }
  }

  /*
   * ----------------------------------------------------------
   * Resolve market from upazila
   * ----------------------------------------------------------
   */

  if (
    resolvedMarket <= 0 &&
    resolvedUpazila > 0
  ) {
    const upazilaMarkets =
      marketList.filter(
        (item) =>
          getParentId(
            item,
            "upazila"
          ) === resolvedUpazila
      );

    if (upazilaMarkets.length > 0) {
      resolvedMarket =
        getItemId(
          upazilaMarkets[0],
          "market"
        );
    }
  }

  return {
    upazila: resolvedUpazila,
    market: resolvedMarket,
  };
}

/*
 * ============================================================
 * FETCH OFFICIAL PRICE ROWS
 * ============================================================
 */

async function fetchPriceRows(
  reportDate: string,
  division: number,
  district: number,
  upazila: number,
  market: number
): Promise<AnyObject[]> {
  const payload = {
    division_id: [division],
    district_id: [district],
    upazila_id: [upazila],
    market_id: [market],
    price_type_id: ["Retail"],
    price_date: reportDate,
    select_type: "Daily",
    month_id: 0,
    year_id: 0,
    week_id: 0,
  };

  const response = await fetch(
    PRICE_API,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Accept:
          "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `DAM price API returned ${response.status}`
    );
  }

  const data =
    await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (
    Array.isArray(
      data?.data?.content
    )
  ) {
    return data.data.content;
  }

  if (
    Array.isArray(
      data?.data?.result
    )
  ) {
    return data.data.result;
  }

  if (
    Array.isArray(
      data?.data?.data
    )
  ) {
    return data.data.data;
  }

  return [];
}

/*
 * ============================================================
 * COMMODITY ID
 * ============================================================
 */

function getCommodityId(
  row: AnyObject
): number {
  return getNumber(
    row?.commodity_id,
    row?.commodityId,
    row?.commodityID,
    row?.commodity,
    row?.commodity_id_value,
    0
  );
}

/*
 * ============================================================
 * RETAIL AVERAGE
 * ============================================================
 */

function getRetailAverage(
  row: AnyObject
): number {
  return getNumber(
    row?.r_avgPriceAvg,
    row?.retail_avg,
    row?.retailAvg,
    row?.retail_average,
    row?.retailAverage,
    row?.retail_avg_price,
    row?.retailAvgPrice,
    row?.avg_retail_price,
    row?.average_retail_price,
    row?.r_avg_price,
    row?.rAveragePrice,
    row?.retail_price_avg,
    row?.retailPriceAvg,
    row?.avgPrice,
    row?.averagePrice,
    row?.price,
    0
  );
}

/*
 * ============================================================
 * RETAIL LOW
 * ============================================================
 */

function getRetailLow(
  row: AnyObject
): number {
  return getNumber(
    row?.r_avgPriceMin,
    row?.retail_low,
    row?.retailLow,
    row?.retail_min,
    row?.retailMin,
    row?.r_min_price,
    row?.rMinPrice,
    row?.retail_price_min,
    row?.retailPriceMin,
    0
  );
}

/*
 * ============================================================
 * RETAIL HIGH
 * ============================================================
 */

function getRetailHigh(
  row: AnyObject
): number {
  return getNumber(
    row?.r_avgPriceMax,
    row?.retail_high,
    row?.retailHigh,
    row?.retail_max,
    row?.retailMax,
    row?.r_max_price,
    row?.rMaxPrice,
    row?.retail_price_max,
    row?.retailPriceMax,
    0
  );
}

/*
 * ============================================================
 * WHOLESALE AVERAGE
 * ============================================================
 */

function getWholesaleAverage(
  row: AnyObject
): number {
  return getNumber(
    row?.w_avgPriceAvg,
    row?.wholesale_avg,
    row?.wholesaleAvg,
    row?.wholesale_average,
    row?.wholesaleAverage,
    row?.wholesale_avg_price,
    row?.wholesaleAvgPrice,
    row?.avg_wholesale_price,
    row?.average_wholesale_price,
    row?.w_avg_price,
    row?.wAveragePrice,
    row?.wholesale_price_avg,
    row?.wholesalePriceAvg,
    0
  );
}

/*
 * ============================================================
 * WHOLESALE LOW
 * ============================================================
 */

function getWholesaleLow(
  row: AnyObject
): number {
  return getNumber(
    row?.w_avgPriceMin,
    row?.wholesale_low,
    row?.wholesaleLow,
    row?.wholesale_min,
    row?.wholesaleMin,
    row?.w_min_price,
    row?.wMinPrice,
    row?.wholesale_price_min,
    row?.wholesalePriceMin,
    0
  );
}

/*
 * ============================================================
 * WHOLESALE HIGH
 * ============================================================
 */

function getWholesaleHigh(
  row: AnyObject
): number {
  return getNumber(
    row?.w_avgPriceMax,
    row?.wholesale_high,
    row?.wholesaleHigh,
    row?.wholesale_max,
    row?.wholesaleMax,
    row?.w_max_price,
    row?.wMaxPrice,
    row?.wholesale_price_max,
    row?.wholesalePriceMax,
    0
  );
}

/*
 * ============================================================
 * UNIT ID
 * ============================================================
 */

function getUnitId(
  row: AnyObject
): number {
  return getNumber(
    row?.unit_id,
    row?.unitId,
    row?.measurement_unit_id,
    row?.measurementUnitId,
    row?.retail_unit_id,
    row?.retailUnitId,
    row?.r_unit_id,
    row?.rUnitId,
    0
  );
}

/*
 * ============================================================
 * CATEGORY
 * ============================================================
 */

function getCategory(
  row: AnyObject
): string {
  const bn = getText(
    row?.commodity_name_bn,
    row?.commodityNameBn,
    row?.text_bn,
    row?.text,
    row?.name_bn,
    row?.nameBn
  ).toLowerCase();

  const en = getText(
    row?.commodity_name,
    row?.commodityName,
    row?.text_en,
    row?.name_en,
    row?.nameEn
  ).toLowerCase();

  const text =
    `${bn} ${en}`;

  /*
   * ==========================================================
   * 1. মাছ
   * ==========================================================
   */

  if (
    text.includes("রুই") ||
    text.includes("রোহিত") ||
    text.includes("কাতল") ||
    text.includes("পাংগাস") ||
    text.includes("পাঙ্গাস") ||
    text.includes("শিং") ||
    text.includes("মাগুর") ||
    text.includes("তেলাপিয়া") ||
    text.includes("তেলাপিয়া") ||
    text.includes("সিলভার কার্প") ||
    text.includes("কার্প") ||
    text.includes("ইলিশ") ||
    text.includes("বোয়ালি") ||
    text.includes("বোয়ালি") ||
    text.includes("চিংড়ি") ||
    text.includes("চিংড়ি") ||
    text.includes("কৈ") ||
    text.includes("তাকি") ||
    text.includes("বাটা") ||
    text.includes("fish") ||
    text.includes("rui") ||
    text.includes("rohu") ||
    text.includes("katla") ||
    text.includes("pangash") ||
    text.includes("pangas") ||
    text.includes("tilapia") ||
    text.includes("silver carp") ||
    text.includes("shrimp") ||
    text.includes("hilsa")
  ) {
    return "মাছ";
  }

  /*
   * ==========================================================
   * 2. মাংস ও ডিম
   * ==========================================================
   */

  if (
    text.includes("ডিম") ||
    text.includes("egg") ||
    text.includes("মুরগি") ||
    text.includes("মুরগী") ||
    text.includes("ব্রয়লার") ||
    text.includes("ব্রয়লার") ||
    text.includes("গরুর মাংস") ||
    text.includes("গরু") ||
    text.includes("খাসি") ||
    text.includes("খাসী") ||
    text.includes("ছাগল") ||
    text.includes("বকরি") ||
    text.includes("বকরী") ||
    text.includes("মাংস") ||
    text.includes("beef") ||
    text.includes("mutton") ||
    text.includes("chicken") ||
    text.includes("broiler") ||
    text.includes("meat")
  ) {
    return "মাংস ও ডিম";
  }

  /*
   * ==========================================================
   * 3. ভোজ্যতেল
   * ==========================================================
   */

  if (
    text.includes("তেল") ||
    text.includes("তৈল") ||
    text.includes("সরিষা") ||
    text.includes("সয়াবিন") ||
    text.includes("সয়াবিন") ||
    text.includes("পাম") ||
    text.includes("sunflower") ||
    text.includes("soybean") ||
    text.includes("mustard oil") ||
    text.includes("oil")
  ) {
    return "ভোজ্যতেল";
  }

  /*
   * ==========================================================
   * 4. ডাল ও শিম
   * ==========================================================
   */

  if (
    text.includes("ডাল") ||
    text.includes("মশুর") ||
    text.includes("মসুর") ||
    text.includes("মুগ") ||
    text.includes("মাষ") ||
    text.includes("মাশ") ||
    text.includes("কালাই") ||
    text.includes("ছোলা") ||
    text.includes("বুট") ||
    text.includes("খেসারি") ||
    text.includes("মটর") ||
    text.includes("মটরশুঁটি") ||
    text.includes("শুঁটি") ||
    text.includes("lentil") ||
    text.includes("pulse") ||
    text.includes("mung") ||
    text.includes("black gram") ||
    text.includes("gram") ||
    text.includes("peas")
  ) {
    return "ডাল ও শিম";
  }

  /*
   * ==========================================================
   * 5. মসলা
   * ==========================================================
   */

  if (
    text.includes("পেঁয়াজ") ||
    text.includes("পেঁয়াজ") ||
    text.includes("onion") ||
    text.includes("রসুন") ||
    text.includes("garlic") ||
    text.includes("আদা") ||
    text.includes("ginger") ||
    text.includes("মরিচ") ||
    text.includes("লংকা") ||
    text.includes("chilli") ||
    text.includes("chili") ||
    text.includes("হলুদ") ||
    text.includes("turmeric") ||
    text.includes("জিরা") ||
    text.includes("cumin") ||
    text.includes("ধনে") ||
    text.includes("coriander") ||
    text.includes("দারুচিনি") ||
    text.includes("cinnamon") ||
    text.includes("এলাচ") ||
    text.includes("cardamom") ||
    text.includes("লবঙ্গ") ||
    text.includes("clove")
  ) {
    return "মসলা";
  }

  /*
   * ==========================================================
   * 6. শাকসবজি
   * ==========================================================
   */

  if (
    text.includes("আলু") ||
    text.includes("potato") ||
    text.includes("বেগুন") ||
    text.includes("eggplant") ||
    text.includes("brinjal") ||
    text.includes("টমেটো") ||
    text.includes("tomato") ||
    text.includes("পটল") ||
    text.includes("লাউ") ||
    text.includes("চালকুমড়া") ||
    text.includes("চালকুমড়া") ||
    text.includes("কুমড়া") ||
    text.includes("কুমড়া") ||
    text.includes("pumpkin") ||
    text.includes("করলা") ||
    text.includes("করল্লা") ||
    text.includes("bitter gourd") ||
    text.includes("শসা") ||
    text.includes("cucumber") ||
    text.includes("শিম") ||
    text.includes("bean") ||
    text.includes("বরবটি") ||
    text.includes("ঢেঁড়স") ||
    text.includes("ঢেঁড়স") ||
    text.includes("okra") ||
    text.includes("ফুলকপি") ||
    text.includes("cauliflower") ||
    text.includes("বাঁধাকপি") ||
    text.includes("cabbage") ||
    text.includes("গাজর") ||
    text.includes("carrot") ||
    text.includes("মূলা") ||
    text.includes("মুলা") ||
    text.includes("radish") ||
    text.includes("পেঁপে") ||
    text.includes("papaya") ||
    text.includes("কাঁচা কলা") ||
    text.includes("কলাই শাক") ||
    text.includes("শাক") ||
    text.includes("সবজি") ||
    text.includes("vegetable")
  ) {
    return "শাকসবজি";
  }

  /*
   * ==========================================================
   * 7. চাল ও খাদ্যশস্য
   * ==========================================================
   */

  if (
    text.includes("চাল") ||
    text.includes("rice") ||
    text.includes("ধান") ||
    text.includes("গম") ||
    text.includes("wheat") ||
    text.includes("আটা") ||
    text.includes("ময়দা") ||
    text.includes("ময়দা") ||
    text.includes("flour")
  ) {
    return "চাল ও খাদ্যশস্য";
  }

  /*
   * ==========================================================
   * 8. নিত্যপণ্য
   * ==========================================================
   */

  if (
    text.includes("চিনি") ||
    text.includes("sugar") ||
    text.includes("লবণ") ||
    text.includes("salt") ||
    text.includes("সাবান") ||
    text.includes("soap")
  ) {
    return "নিত্যপণ্য";
  }

  return "নিত্যপণ্য";
}

/*
 * ============================================================
 * UNIT INFO
 * ============================================================
 */

function getUnitInfo(
  unitId: number,
  measurementUnitList: AnyObject[]
) {
  const unit =
    measurementUnitList.find(
      (item) =>
        getNumber(
          item?.value,
          item?.id,
          item?.unit_id,
          item?.unitId
        ) === unitId
    );

  if (!unit) {
    return {
      unitBn: "কেজি",
      unitEn: "kg",
    };
  }

  return {
    unitBn:
      getText(
        unit?.text_bn,
        unit?.unit_name_bn,
        unit?.unitNameBn,
        unit?.name_bn,
        unit?.text
      ) || "কেজি",

    unitEn:
      getText(
        unit?.text_en,
        unit?.unit_name,
        unit?.unitName,
        unit?.name_en,
        unit?.name
      ) || "kg",
  };
}

/*
 * ============================================================
 * GET
 * ============================================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    /*
     * ========================================================
     * 1. LOCATION INPUT
     *
     * NO HARDCODED FALLBACKS
     * ========================================================
     */

    const division =
      getNumber(
        searchParams.get("division")
      );

    const district =
      getNumber(
        searchParams.get("district")
      );

    const requestedUpazila =
      getNumber(
        searchParams.get("upazila")
      );

    const requestedMarket =
      getNumber(
        searchParams.get("market")
      );

    const date =
      searchParams.get("date") ||
      new Date()
        .toISOString()
        .split("T")[0];

    /*
     * ========================================================
     * 2. VALIDATION
     * ========================================================
     */

    if (district <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid DAM district ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Division is required by DAM price endpoint.
     *
     * If frontend doesn't send it, we cannot safely guess it.
     */

    if (division <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid DAM division ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * 3. OFFICIAL COMMON DROPDOWN DATA
     * ========================================================
     */

    const commodityData =
      await fetchOfficialDropdowns();

    /*
     * ========================================================
     * 4. RESOLVE OFFICIAL UPAZILA + MARKET
     * ========================================================
     */

    const resolvedLocation =
      resolveLocation(
        commodityData,
        district,
        requestedUpazila,
        requestedMarket
      );

    const upazila =
      resolvedLocation.upazila;

    const market =
      resolvedLocation.market;

    if (upazila <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            `No official upazila found for DAM district ${district}.`,
        },
        {
          status: 400,
        }
      );
    }

    if (market <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            `No official market found for DAM upazila ${upazila}.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * 5. OFFICIAL COMMODITY + UNIT DATA
     * ========================================================
     */

    const commodityList =
      extractList(
        commodityData,
        [
          "commodityNameList",
          "commodity_name_list",
          "commodities",
        ]
      );

    const measurementUnitList =
      extractList(
        commodityData,
        [
          "measurementUnitList",
          "measurement_unit_list",
          "units",
        ]
      );

    /*
     * ========================================================
     * 6. OFFICIAL COMMODITY MAP
     * ========================================================
     */

    const commodityMap =
      new Map<number, AnyObject>();

    for (
      const commodity
      of commodityList
    ) {
      const id =
        getNumber(
          commodity?.value,
          commodity?.id,
          commodity?.commodity_id,
          commodity?.commodityId
        );

      if (id > 0) {
        commodityMap.set(
          id,
          commodity
        );
      }
    }

    /*
     * ========================================================
     * 7. CURRENT OFFICIAL PRICE DATA
     * ========================================================
     */

    const priceRows =
      await fetchPriceRows(
        date,
        division,
        district,
        upazila,
        market
      );

    /*
     * ========================================================
     * 8. FETCH 30 CALENDAR DAYS
     * ========================================================
     */

    const historyRequests: {
      date: string;
      promise: Promise<AnyObject[]>;
    }[] = [];

    for (
      let index = 0;
      index < 30;
      index++
    ) {
      const historyDate =
        getPreviousDate(
          date,
          index
        );

      historyRequests.push({
        date: historyDate,

        promise:
          index === 0
            ? Promise.resolve(
                priceRows
              )
            : fetchPriceRows(
                historyDate,
                division,
                district,
                upazila,
                market
              ),
      });
    }

    const historyRowsByDate =
      new Map<
        string,
        AnyObject[]
      >();

    const BATCH_SIZE = 5;

    for (
      let i = 0;
      i < historyRequests.length;
      i += BATCH_SIZE
    ) {
      const batch =
        historyRequests.slice(
          i,
          i + BATCH_SIZE
        );

      const results =
        await Promise.all(
          batch.map(
            async ({
              date: historyDate,
              promise,
            }) => {
              try {
                const rows =
                  await promise;

                return {
                  date: historyDate,
                  rows:
                    Array.isArray(rows)
                      ? rows
                      : [],
                };
              } catch {
                return {
                  date: historyDate,
                  rows: [],
                };
              }
            }
          )
        );

      for (
        const result
        of results
      ) {
        historyRowsByDate.set(
          result.date,
          result.rows
        );
      }
    }

    /*
     * ========================================================
     * 9. BUILD COMMODITY-WISE HISTORY
     * ========================================================
     */

    const historyMap =
      new Map<
        number,
        {
          date: string;
          avgPrice: number;
        }[]
      >();

    historyRowsByDate.forEach(
      (
        rows,
        historyDate
      ) => {
        const dailyCommodityPrices =
          new Map<
            number,
            number[]
          >();

        for (
          const row of rows
        ) {
          const commodityId =
            getCommodityId(row);

          const retailAvg =
            getRetailAverage(row);

          if (
            commodityId <= 0 ||
            retailAvg <= 0
          ) {
            continue;
          }

          const existing =
            dailyCommodityPrices.get(
              commodityId
            ) || [];

          existing.push(
            retailAvg
          );

          dailyCommodityPrices.set(
            commodityId,
            existing
          );
        }

        dailyCommodityPrices.forEach(
          (
            prices,
            commodityId
          ) => {
            if (
              prices.length === 0
            ) {
              return;
            }

            const averagePrice =
              prices.reduce(
                (
                  sum,
                  price
                ) =>
                  sum + price,
                0
              ) /
              prices.length;

            const existingHistory =
              historyMap.get(
                commodityId
              ) || [];

            existingHistory.push({
              date: historyDate,
              avgPrice:
                Number(
                  averagePrice.toFixed(
                    2
                  )
                ),
            });

            historyMap.set(
              commodityId,
              existingHistory
            );
          }
        );
      }
    );

    /*
     * ========================================================
     * 10. SORT + DEDUPE HISTORY
     * ========================================================
     */

    historyMap.forEach(
      (
        history,
        commodityId
      ) => {
        const uniqueByDate =
          new Map<
            string,
            {
              date: string;
              avgPrice: number;
            }
          >();

        for (
          const point of history
        ) {
          uniqueByDate.set(
            point.date,
            point
          );
        }

        const sorted =
          Array.from(
            uniqueByDate.values()
          ).sort(
            (a, b) =>
              a.date.localeCompare(
                b.date
              )
          );

        historyMap.set(
          commodityId,
          sorted
        );
      }
    );

    /*
     * ========================================================
     * 11. FIND PREVIOUS AVAILABLE DATE
     * ========================================================
     */

    let previousDate:
      | string
      | null = null;

    for (
      let daysBack = 1;
      daysBack <= 7;
      daysBack++
    ) {
      const candidateDate =
        getPreviousDate(
          date,
          daysBack
        );

      const candidateRows =
        historyRowsByDate.get(
          candidateDate
        ) || [];

      if (
        candidateRows.length > 0
      ) {
        previousDate =
          candidateDate;

        break;
      }
    }

    /*
     * ========================================================
     * 12. PREVIOUS PRICE MAP
     * ========================================================
     */

    const previousPriceMap =
      new Map<
        number,
        number
      >();

    if (previousDate) {
      const previousRows =
        historyRowsByDate.get(
          previousDate
        ) || [];

      const groupedPrevious =
        new Map<
          number,
          number[]
        >();

      for (
        const row of previousRows
      ) {
        const commodityId =
          getCommodityId(row);

        const retailAvg =
          getRetailAverage(row);

        if (
          commodityId <= 0 ||
          retailAvg <= 0
        ) {
          continue;
        }

        const values =
          groupedPrevious.get(
            commodityId
          ) || [];

        values.push(
          retailAvg
        );

        groupedPrevious.set(
          commodityId,
          values
        );
      }

      groupedPrevious.forEach(
        (
          values,
          commodityId
        ) => {
          if (
            values.length === 0
          ) {
            return;
          }

          const average =
            values.reduce(
              (
                sum,
                value
              ) =>
                sum + value,
              0
            ) /
            values.length;

          previousPriceMap.set(
            commodityId,
            Number(
              average.toFixed(
                2
              )
            )
          );
        }
      );
    }

    /*
     * ========================================================
     * 13. BUILD CURRENT PRODUCTS
     * ========================================================
     */

    const products:
      AnyObject[] = [];

    for (
      const row of priceRows
    ) {
      const commodityId =
        getCommodityId(row);

      const retailAvg =
        getRetailAverage(row);

      if (
        commodityId <= 0 ||
        retailAvg <= 0
      ) {
        continue;
      }

      const officialCommodity =
        commodityMap.get(
          commodityId
        );

      /*
       * ------------------------------------------------------
       * OFFICIAL COMMODITY NAME
       * ------------------------------------------------------
       */

      const commodityNameBn =
        getText(
          officialCommodity?.text_bn,
          officialCommodity?.commodity_name_bn,
          officialCommodity?.commodityNameBn,
          officialCommodity?.name_bn,
          officialCommodity?.nameBn,
          officialCommodity?.text,

          row?.commodity_name_bn,
          row?.commodityNameBn,
          row?.commodityName,
          row?.text_bn,
          row?.text
        ) ||
        `পণ্য ${commodityId}`;

      const commodityName =
        getText(
          officialCommodity?.text_en,
          officialCommodity?.commodity_name,
          officialCommodity?.commodityName,
          officialCommodity?.name_en,
          officialCommodity?.nameEn,
          officialCommodity?.text,

          row?.commodity_name,
          row?.commodityName,
          row?.text_en,
          row?.text
        ) ||
        commodityNameBn;

      /*
       * ------------------------------------------------------
       * OFFICIAL RETAIL UNIT
       * ------------------------------------------------------
       */

      const officialRetailUnitId =
        getNumber(
          officialCommodity?.unit_retail,
          officialCommodity?.retail_unit_id,
          officialCommodity?.retailUnitId
        );

      const rowUnitId =
        getUnitId(row);

      const unitId =
        officialRetailUnitId > 0
          ? officialRetailUnitId
          : rowUnitId;

      const unitInfo =
        getUnitInfo(
          unitId,
          measurementUnitList
        );

      /*
       * ------------------------------------------------------
       * RETAIL LOW / HIGH
       * ------------------------------------------------------
       */

      const retailLow =
        getRetailLow(row);

      const retailHigh =
        getRetailHigh(row);

      /*
       * ------------------------------------------------------
       * WHOLESALE
       * ------------------------------------------------------
       */

      const wholesaleAvg =
        getWholesaleAverage(row);

      const wholesaleLow =
        getWholesaleLow(row);

      const wholesaleHigh =
        getWholesaleHigh(row);

      /*
       * ------------------------------------------------------
       * PREVIOUS PRICE
       * ------------------------------------------------------
       */

      const previousAvgPrice =
        previousPriceMap.get(
          commodityId
        ) || 0;

      let priceChange = 0;

      let priceChangePercent = 0;

      let priceChangeType:
        | "increase"
        | "decrease"
        | "unchanged"
        | "no_data" =
        "no_data";

      if (
        previousAvgPrice > 0
      ) {
        priceChange =
          Number(
            (
              retailAvg -
              previousAvgPrice
            ).toFixed(2)
          );

        priceChangePercent =
          Number(
            (
              (
                (
                  retailAvg -
                  previousAvgPrice
                ) /
                previousAvgPrice
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

      /*
       * ------------------------------------------------------
       * 30 DAY HISTORY
       * ------------------------------------------------------
       */

      const history30Days =
        historyMap.get(
          commodityId
        ) || [];

      /*
       * ------------------------------------------------------
       * FINAL PRODUCT
       * ------------------------------------------------------
       */

      products.push({
        id: commodityId,

        commodityId,

        name: commodityNameBn,

        nameBn:
          commodityNameBn,

        nameEn:
          commodityName,

        commodityNameBn,

        commodityName,

        category:
          getCategory({
            ...officialCommodity,
            ...row,

            commodity_name_bn:
              commodityNameBn,

            commodity_name:
              commodityName,

            commodity_group_name_bn:
              officialCommodity?.commodity_group_name_bn,

            commodity_group_name:
              officialCommodity?.commodity_group_name,

            commodity_sub_group_name_bn:
              officialCommodity?.commodity_sub_group_name_bn,

            commodity_sub_group_name:
              officialCommodity?.commodity_sub_group_name,
          }),

        /*
         * Keep compatible price fields
         * for existing frontend.
         */

        price:
          retailAvg,

        avgPrice:
          retailAvg,

        averagePrice:
          retailAvg,

        retailPrice:
          retailAvg,

        retailAvg:
          retailAvg,

        retailLow,

        retailHigh,

        wholesaleAvg:
          wholesaleAvg > 0
            ? wholesaleAvg
            : null,

        wholesaleLow:
          wholesaleLow > 0
            ? wholesaleLow
            : null,

        wholesaleHigh:
          wholesaleHigh > 0
            ? wholesaleHigh
            : null,

        unitId,

        unitBn:
          unitInfo.unitBn,

        unitEn:
          unitInfo.unitEn,

        previousAvgPrice:
          previousAvgPrice > 0
            ? previousAvgPrice
            : null,

        previousPriceDate:
          previousDate,

        priceChange,

        priceChangePercent,

        priceChangeType,

        history30Days,

        source:
          "Ministry of Agriculture / DAM",

        /*
         * IMPORTANT:
         *
         * Do NOT add verified: true.
         *
         * DaamBD sources the data from DAM,
         * but DaamBD itself is not DAM.
         */

        reportDate:
          date,
      });
    }

    /*
     * ========================================================
     * 14. REMOVE DUPLICATES
     * ========================================================
     */

    const uniqueProducts =
      new Map<
        number,
        AnyObject
      >();

    for (
      const product of products
    ) {
      uniqueProducts.set(
        product.commodityId,
        product
      );
    }

    const finalProducts =
      Array.from(
        uniqueProducts.values()
      );

    /*
     * ========================================================
     * 15. CATEGORY COUNTS
     * ========================================================
     */

    const categoryCounts:
      Record<string, number> =
      {};

    for (
      const product
      of finalProducts
    ) {
      const category =
        product.category ||
        "নিত্যপণ্য";

      categoryCounts[
        category
      ] =
        (
          categoryCounts[
            category
          ] || 0
        ) + 1;
    }

    /*
     * ========================================================
     * 16. PRICE CHANGE COUNTS
     * ========================================================
     */

    const priceChangeCounts: {
      increase: number;
      decrease: number;
      unchanged: number;
      no_data: number;
    } = {
      increase: 0,
      decrease: 0,
      unchanged: 0,
      no_data: 0,
    };

    for (
      const product
      of finalProducts
    ) {
      const type =
        product.priceChangeType;

      if (
        type === "increase"
      ) {
        priceChangeCounts.increase++;
      } else if (
        type === "decrease"
      ) {
        priceChangeCounts.decrease++;
      } else if (
        type === "unchanged"
      ) {
        priceChangeCounts.unchanged++;
      } else {
        priceChangeCounts.no_data++;
      }
    }

    /*
     * ========================================================
     * 17. RESPONSE
     * ========================================================
     */

    return NextResponse.json({
      success: true,

      location: {
        division,
        district,
        upazila,
        market,
      },

      district,

      upazila,

      market,

      date,

      previousPriceDate:
        previousDate,

      total:
        finalProducts.length,

      items:
        finalProducts,

      categoryCounts,

      priceChangeCounts,

      source:
        "Ministry of Agriculture / DAM",

      timestamp:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "DaamBD API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown API error",
      },
      {
        status: 500,
      }
    );
  }
}