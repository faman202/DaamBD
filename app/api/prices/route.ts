import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMON_DROPDOWN_API =
  "https://moa-services.com/agri-service/common-dropdowns";

type AnyObject = Record<string, any>;

function getNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string" && value.trim() !== "") {
      const number = Number(value.replace(/,/g, "").trim());
      if (Number.isFinite(number)) return number;
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

function getPreviousDate(dateString: string, daysBack: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));

  d.setUTCDate(d.getUTCDate() - daysBack);

  return d.toISOString().split("T")[0];
}

function extractList(data: AnyObject, keys: string[]): AnyObject[] {
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
    if (Array.isArray(data?.result?.[key])) return data.result[key];
    if (Array.isArray(data?.data?.data?.[key])) return data.data.data[key];
  }

  return [];
}

async function fetchCommonDropdowns(): Promise<AnyObject> {
  const response = await fetch(COMMON_DROPDOWN_API, {
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

function getMarketId(item: AnyObject): number {
  return getNumber(
    item?.value,
    item?.id,
    item?.market_id,
    item?.marketId
  );
}

function getMarketDivisionId(item: AnyObject): number {
  return getNumber(
    item?.division_id,
    item?.divisionId,
    item?.region_id,
    item?.regionId
  );
}

function getMarketDistrictId(item: AnyObject): number {
  return getNumber(
    item?.district_id,
    item?.districtId,
    item?.zone_id,
    item?.zoneId
  );
}

function getMarketUpazilaId(item: AnyObject): number {
  return getNumber(
    item?.upazilla_id,
    item?.upazila_id,
    item?.upazillaId,
    item?.upazilaId,
    item?.unit_id,
    item?.unitId
  );
}

function resolveMarket(
  marketList: AnyObject[],
  division: number,
  district: number,
  requestedUpazila: number,
  requestedMarket: number
) {
  const validMarkets = marketList.filter((item) => {
    return (
      getMarketDivisionId(item) === division &&
      getMarketDistrictId(item) === district
    );
  });

  if (validMarkets.length === 0) {
    return {
      upazila: 0,
      market: 0,
      error: `No official DAM market found for division ${division}, district ${district}.`,
    };
  }

  if (requestedMarket > 0) {
    const selectedMarket = validMarkets.find(
      (item) => getMarketId(item) === requestedMarket
    );

    if (!selectedMarket) {
      return {
        upazila: 0,
        market: 0,
        error: `The selected DAM market ${requestedMarket} does not belong to district ${district}.`,
      };
    }

    const marketUpazila = getMarketUpazilaId(selectedMarket);

    if (
      requestedUpazila > 0 &&
      marketUpazila > 0 &&
      marketUpazila !== requestedUpazila
    ) {
      return {
        upazila: 0,
        market: 0,
        error: `The selected DAM market ${requestedMarket} does not belong to upazila ${requestedUpazila}.`,
      };
    }

    return {
      upazila:
        requestedUpazila > 0
          ? requestedUpazila
          : marketUpazila,
      market: requestedMarket,
      error: null,
    };
  }

  if (requestedUpazila > 0) {
    const upazilaMarkets = validMarkets.filter(
      (item) => getMarketUpazilaId(item) === requestedUpazila
    );

    if (upazilaMarkets.length === 0) {
      return {
        upazila: 0,
        market: 0,
        error: `No official DAM market found for upazila ${requestedUpazila}.`,
      };
    }

    return {
      upazila: requestedUpazila,
      market: getMarketId(upazilaMarkets[0]),
      error: null,
    };
  }

  const firstMarket = validMarkets[0];

  return {
    upazila: getMarketUpazilaId(firstMarket),
    market: getMarketId(firstMarket),
    error: null,
  };
}

function extractPriceRows(data: AnyObject): AnyObject[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.data?.result)) return data.data.result;
  if (Array.isArray(data?.data?.data)) return data.data.data;

  return [];
}

async function fetchPriceRows(
  reportDate: string,
  division: number,
  district: number,
  upazila: number,
  market: number
): Promise<AnyObject[]> {
  const date = new Date(`${reportDate}T00:00:00Z`);

  const monthId = date.getUTCMonth() + 1;
  const yearId = date.getUTCFullYear();

  const firstDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1
    )
  );

  const weekId =
    Math.floor(
      (date.getUTCDate() +
        firstDay.getUTCDay() -
        1) /
        7
    ) + 1;

  const payload = {
    division_id: [division],
    district_id: [district],
    upazila_id: [upazila],
    market_id: [market],
    price_type_id: ["Retail"],
    price_date: reportDate,
    select_type: "Daily",
    month_id: monthId,
    year_id: yearId,
    week_id: weekId,
  };

  const response = await fetch(PRICE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DAM price API returned ${response.status}`);
  }

  const data = await response.json();

  return extractPriceRows(data);
}

function getCommodityId(row: AnyObject): number {
  return getNumber(
    row?.commodity_id,
    row?.commodityId,
    row?.commodityID,
    row?.commodity,
    row?.commodity_id_value
  );
}

function getRetailAverage(row: AnyObject): number {
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
    row?.price
  );
}

function getRetailLow(row: AnyObject): number {
  return getNumber(
    row?.r_avgPriceMin,
    row?.retail_low,
    row?.retailLow,
    row?.retail_min,
    row?.retailMin,
    row?.r_min_price,
    row?.rMinPrice,
    row?.retail_price_min,
    row?.retailPriceMin
  );
}

function getRetailHigh(row: AnyObject): number {
  return getNumber(
    row?.r_avgPriceMax,
    row?.retail_high,
    row?.retailHigh,
    row?.retail_max,
    row?.retailMax,
    row?.r_max_price,
    row?.rMaxPrice,
    row?.retail_price_max,
    row?.retailPriceMax
  );
}

function getWholesaleAverage(row: AnyObject): number {
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
    row?.wholesalePriceAvg
  );
}

function getWholesaleLow(row: AnyObject): number {
  return getNumber(
    row?.w_avgPriceMin,
    row?.wholesale_low,
    row?.wholesaleLow,
    row?.wholesale_min,
    row?.wholesaleMin,
    row?.w_min_price,
    row?.wMinPrice,
    row?.wholesale_price_min,
    row?.wholesalePriceMin
  );
}

function getWholesaleHigh(row: AnyObject): number {
  return getNumber(
    row?.w_avgPriceMax,
    row?.wholesale_high,
    row?.wholesaleHigh,
    row?.wholesale_max,
    row?.wholesaleMax,
    row?.w_max_price,
    row?.wMaxPrice,
    row?.wholesale_price_max,
    row?.wholesalePriceMax
  );
}

function getUnitId(row: AnyObject): number {
  return getNumber(
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

function getCategory(row: AnyObject): string {
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

  const text = `${bn} ${en}`;

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
    text.includes("কার্প") ||
    text.includes("ইলিশ") ||
    text.includes("চিংড়ি") ||
    text.includes("চিংড়ি") ||
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
    text.includes("শাক") ||
    text.includes("সবজি") ||
    text.includes("vegetable")
  ) {
    return "শাকসবজি";
  }

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

  return "নিত্যপণ্য";
}

function getUnitInfo(
  unitId: number,
  measurementUnitList: AnyObject[]
) {
  const unit = measurementUnitList.find(
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const division = getNumber(searchParams.get("division"));
    const district = getNumber(searchParams.get("district"));
    const requestedUpazila = getNumber(
      searchParams.get("upazila")
    );
    const requestedMarket = getNumber(
      searchParams.get("market")
    );

    const date =
      searchParams.get("date") ||
      new Date().toISOString().split("T")[0];

    if (division <= 0 || district <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid official DAM division and district IDs are required.",
        },
        { status: 400 }
      );
    }

    const commonDropdownData =
      await fetchCommonDropdowns();

    const marketList = extractList(
      commonDropdownData,
      [
        "hatsList",
        "hatList",
        "marketList",
        "market_list",
        "markets",
      ]
    );

    if (marketList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Official DAM market list is empty.",
          source: "Ministry of Agriculture / DAM",
        },
        { status: 502 }
      );
    }

    const resolved = resolveMarket(
      marketList,
      division,
      district,
      requestedUpazila,
      requestedMarket
    );

    if (resolved.error) {
      return NextResponse.json(
        {
          success: false,
          error: resolved.error,
          location: {
            division,
            district,
            upazila: requestedUpazila,
            market: requestedMarket,
          },
          source: "Ministry of Agriculture / DAM",
        },
        { status: 400 }
      );
    }

    const upazila = resolved.upazila;
    const market = resolved.market;

    const commodityList = extractList(
      commonDropdownData,
      [
        "commodityNameList",
        "commodity_name_list",
        "commodities",
      ]
    );

    const measurementUnitList = extractList(
      commonDropdownData,
      [
        "measurementUnitList",
        "measurement_unit_list",
        "unitList",
        "units",
      ]
    );

    const commodityMap =
      new Map<number, AnyObject>();

    for (const commodity of commodityList) {
      const id = getNumber(
        commodity?.value,
        commodity?.id,
        commodity?.commodity_id,
        commodity?.commodityId
      );

      if (id > 0) {
        commodityMap.set(id, commodity);
      }
    }

    const priceRows = await fetchPriceRows(
      date,
      division,
      district,
      upazila,
      market
    );

    const historyRequests: {
      date: string;
      promise: Promise<AnyObject[]>;
    }[] = [];

    for (let index = 0; index < 30; index++) {
      const historyDate = getPreviousDate(
        date,
        index
      );

      historyRequests.push({
        date: historyDate,
        promise:
          index === 0
            ? Promise.resolve(priceRows)
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
      new Map<string, AnyObject[]>();

    const BATCH_SIZE = 5;

    for (
      let i = 0;
      i < historyRequests.length;
      i += BATCH_SIZE
    ) {
      const batch = historyRequests.slice(
        i,
        i + BATCH_SIZE
      );

      const results = await Promise.all(
        batch.map(
          async ({
            date: historyDate,
            promise,
          }) => {
            try {
              const rows = await promise;

              return {
                date: historyDate,
                rows: Array.isArray(rows)
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

      for (const result of results) {
        historyRowsByDate.set(
          result.date,
          result.rows
        );
      }
    }

    const historyMap =
      new Map<
        number,
        {
          date: string;
          avgPrice: number;
        }[]
      >();

    historyRowsByDate.forEach(
      (rows, historyDate) => {
        const dailyCommodityPrices =
          new Map<number, number[]>();

        for (const row of rows) {
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

          existing.push(retailAvg);

          dailyCommodityPrices.set(
            commodityId,
            existing
          );
        }

        dailyCommodityPrices.forEach(
          (prices, commodityId) => {
            const averagePrice =
              prices.reduce(
                (sum, price) =>
                  sum + price,
                0
              ) / prices.length;

            const existingHistory =
              historyMap.get(
                commodityId
              ) || [];

            existingHistory.push({
              date: historyDate,
              avgPrice:
                Number(
                  averagePrice.toFixed(2)
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

    historyMap.forEach(
      (history, commodityId) => {
        const uniqueByDate =
          new Map<
            string,
            {
              date: string;
              avgPrice: number;
            }
          >();

        for (const point of history) {
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

      if (candidateRows.length > 0) {
        previousDate =
          candidateDate;
        break;
      }
    }

    const previousPriceMap =
      new Map<number, number>();

    if (previousDate) {
      const previousRows =
        historyRowsByDate.get(
          previousDate
        ) || [];

      const grouped =
        new Map<number, number[]>();

      for (const row of previousRows) {
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
          grouped.get(
            commodityId
          ) || [];

        values.push(retailAvg);

        grouped.set(
          commodityId,
          values
        );
      }

      grouped.forEach(
        (values, commodityId) => {
          const average =
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / values.length;

          previousPriceMap.set(
            commodityId,
            Number(
              average.toFixed(2)
            )
          );
        }
      );
    }

    const products: AnyObject[] = [];

    for (const row of priceRows) {
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
        );

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
        );

      if (!commodityNameBn && !commodityName) {
        continue;
      }

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

      const retailLow =
        getRetailLow(row);

      const retailHigh =
        getRetailHigh(row);

      const wholesaleAvg =
        getWholesaleAverage(row);

      const wholesaleLow =
        getWholesaleLow(row);

      const wholesaleHigh =
        getWholesaleHigh(row);

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

      if (previousAvgPrice > 0) {
        priceChange = Number(
          (
            retailAvg -
            previousAvgPrice
          ).toFixed(2)
        );

        priceChangePercent =
          Number(
            (
              ((retailAvg -
                previousAvgPrice) /
                previousAvgPrice) *
              100
            ).toFixed(2)
          );

        if (priceChange > 0) {
          priceChangeType =
            "increase";
        } else if (priceChange < 0) {
          priceChangeType =
            "decrease";
        } else {
          priceChangeType =
            "unchanged";
        }
      }

      products.push({
        id: commodityId,
        commodityId,
        name:
          commodityNameBn ||
          commodityName,
        nameBn:
          commodityNameBn ||
          commodityName,
        nameEn:
          commodityName ||
          commodityNameBn,
        commodityNameBn:
          commodityNameBn ||
          commodityName,
        commodityName:
          commodityName ||
          commodityNameBn,
        category: getCategory({
          ...officialCommodity,
          ...row,
          commodity_name_bn:
            commodityNameBn,
          commodity_name:
            commodityName,
        }),
        price: retailAvg,
        avgPrice: retailAvg,
        averagePrice: retailAvg,
        retailPrice: retailAvg,
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
        history30Days:
          historyMap.get(
            commodityId
          ) || [],
        source:
          "Ministry of Agriculture / DAM",
        reportDate: date,
      });
    }

    const uniqueProducts =
      new Map<number, AnyObject>();

    for (const product of products) {
      uniqueProducts.set(
        product.commodityId,
        product
      );
    }

    const finalProducts =
      Array.from(
        uniqueProducts.values()
      );

    const categoryCounts:
      Record<string, number> = {};

    for (const product of finalProducts) {
      const category =
        product.category ||
        "নিত্যপণ্য";

      categoryCounts[category] =
        (categoryCounts[category] || 0) + 1;
    }

    const priceChangeCounts = {
      increase: 0,
      decrease: 0,
      unchanged: 0,
      no_data: 0,
    };

    for (const product of finalProducts) {
      priceChangeCounts[
        product.priceChangeType
      ]++;
    }

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
      { status: 500 }
    );
  }
}