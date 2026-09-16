import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMODITY_API =
  "https://moa-services.com/agri-service/common-dropdowns";

type AnyObject = Record<string, any>;

function getNumber(...values: unknown[]): number {
  for (const value of values) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      const number = Number(
        value.replace(/,/g, "").trim()
      );

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return 0;
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
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
    throw new Error(
      `DAM price API returned ${response.status}`
    );
  }

  const data = await response.json();

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

  if (Array.isArray(data?.data?.content)) {
    return data.data.content;
  }

  if (Array.isArray(data?.data?.result)) {
    return data.data.result;
  }

  return [];
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
    0
  );
}

function getCommodityId(row: AnyObject): number {
  return getNumber(
    row?.commodity_id,
    row?.commodityId,
    row?.commodityID,
    row?.commodity,
    row?.commodity_id_value,
    0
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
    row?.rUnitId,
    0
  );
}

function getCategory(row: AnyObject): string {
  const text = [
    getText(
      row?.commodity_name_bn,
      row?.commodityNameBn,
      row?.commodity_name,
      row?.commodityName,
      row?.text_bn,
      row?.text
    ),
    getText(
      row?.commodity_group_name_bn,
      row?.commodityGroupNameBn,
      row?.commodity_group_name,
      row?.commodityGroupName
    ),
    getText(
      row?.commodity_sub_group_name_bn,
      row?.commoditySubGroupNameBn,
      row?.commodity_sub_group_name,
      row?.commoditySubGroupName
    ),
  ]
    .join(" ")
    .toLowerCase();

  if (
    text.includes("চাল") ||
    text.includes("rice")
  ) {
    return "চাল";
  }

  if (
    text.includes("ডাল") ||
    text.includes("lentil") ||
    text.includes("pulse") ||
    text.includes("gram") ||
    text.includes("peas")
  ) {
    return "ডাল";
  }

  if (
    text.includes("তেল") ||
    text.includes("oil")
  ) {
    return "তেল";
  }

  if (
    text.includes("আলু") ||
    text.includes("potato")
  ) {
    return "আলু";
  }

  if (
    text.includes("পেঁয়াজ") ||
    text.includes("পেঁয়াজ") ||
    text.includes("onion")
  ) {
    return "পেঁয়াজ";
  }

  if (
    text.includes("রসুন") ||
    text.includes("garlic")
  ) {
    return "রসুন";
  }

  if (
    text.includes("আদা") ||
    text.includes("ginger")
  ) {
    return "আদা";
  }

  if (
    text.includes("মরিচ") ||
    text.includes("chilli") ||
    text.includes("chili")
  ) {
    return "মরিচ";
  }

  if (
    text.includes("বেগুন") ||
    text.includes("eggplant") ||
    text.includes("brinjal")
  ) {
    return "সবজি";
  }

  if (
    text.includes("টমেটো") ||
    text.includes("tomato")
  ) {
    return "সবজি";
  }

  if (
    text.includes("সবজি") ||
    text.includes("vegetable")
  ) {
    return "সবজি";
  }

  if (
    text.includes("মাছ") ||
    text.includes("fish")
  ) {
    return "মাছ";
  }

  if (
    text.includes("ডিম") ||
    text.includes("egg")
  ) {
    return "ডিম";
  }

  if (
    text.includes("মাংস") ||
    text.includes("meat") ||
    text.includes("beef") ||
    text.includes("mutton") ||
    text.includes("chicken")
  ) {
    return "মাংস";
  }

  return "অন্যান্য";
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

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const division = getNumber(
      searchParams.get("division"),
      6
    );

    const district = getNumber(
      searchParams.get("district"),
      46
    );

    const upazila = getNumber(
      searchParams.get("upazila"),
      360
    );

    const market = getNumber(
      searchParams.get("market"),
      109
    );

    const date =
      searchParams.get("date") ||
      new Date()
        .toISOString()
        .split("T")[0];

    /*
     * --------------------------------------------------
     * 1. OFFICIAL COMMODITY + UNIT DATA
     * --------------------------------------------------
     */

    const commodityResponse = await fetch(
      COMMODITY_API,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!commodityResponse.ok) {
      throw new Error(
        `DAM commodity API returned ${commodityResponse.status}`
      );
    }

    const commodityData =
      await commodityResponse.json();

    const commodityList =
      Array.isArray(
        commodityData?.commodityNameList
      )
        ? commodityData.commodityNameList
        : [];

    const measurementUnitList =
      Array.isArray(
        commodityData?.measurementUnitList
      )
        ? commodityData.measurementUnitList
        : [];

    /*
     * --------------------------------------------------
     * 2. BUILD OFFICIAL COMMODITY MAP
     * --------------------------------------------------
     */

    const commodityMap =
      new Map<number, AnyObject>();

    for (const commodity of commodityList) {
      const id = getNumber(
        commodity?.value,
        commodity?.id
      );

      if (id > 0) {
        commodityMap.set(id, commodity);
      }
    }

    /*
     * --------------------------------------------------
     * 3. CURRENT OFFICIAL PRICE DATA
     * --------------------------------------------------
     */

    const priceRows = await fetchPriceRows(
      date,
      division,
      district,
      upazila,
      market
    );

    /*
     * --------------------------------------------------
     * 4. FETCH 30 CALENDAR DAYS
     *
     * Today + previous 29 days.
     *
     * Batch size = 5
     * --------------------------------------------------
     */

    const historyRequests: {
      date: string;
      promise: Promise<AnyObject[]>;
    }[] = [];

    for (let index = 0; index < 30; index++) {
      const historyDate =
        getPreviousDate(date, index);

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

    /*
     * --------------------------------------------------
     * 5. BUILD COMMODITY-WISE HISTORY
     *
     * Map.forEach() is intentionally used here.
     * This avoids TypeScript downlevelIteration
     * problems on Vercel.
     * --------------------------------------------------
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
            if (prices.length === 0) {
              return;
            }

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
              avgPrice: Number(
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

    /*
     * --------------------------------------------------
     * 6. SORT + DEDUPE HISTORY
     * --------------------------------------------------
     */

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

    /*
     * --------------------------------------------------
     * 7. FIND PREVIOUS AVAILABLE DAM DATE
     *
     * Search previous 7 calendar days.
     * First date having official data wins.
     * --------------------------------------------------
     */

    let previousDate:
      | string
      | null = null;

    for (let daysBack = 1; daysBack <= 7; daysBack++) {
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

    /*
     * --------------------------------------------------
     * 8. PREVIOUS PRICE MAP
     * --------------------------------------------------
     */

    const previousPriceMap =
      new Map<number, number>();

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
          groupedPrevious.get(
            commodityId
          ) || [];

        values.push(retailAvg);

        groupedPrevious.set(
          commodityId,
          values
        );
      }

      groupedPrevious.forEach(
        (values, commodityId) => {
          if (values.length === 0) {
            return;
          }

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

    /*
     * --------------------------------------------------
     * 9. BUILD CURRENT PRODUCTS
     * --------------------------------------------------
     */

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
          officialCommodity?.name_bn,
          officialCommodity?.text,
          row?.commodity_name_bn,
          row?.commodityNameBn,
          row?.commodity_name
        ) ||
        `পণ্য ${commodityId}`;

      const commodityName =
        getText(
          officialCommodity?.text_en,
          officialCommodity?.commodity_name,
          officialCommodity?.name_en,
          officialCommodity?.text,
          row?.commodity_name,
          row?.commodityName
        ) ||
        commodityNameBn;

      /*
       * Official unit:
       *
       * unit_retail from commodityNameList
       * has priority.
       */

      const officialRetailUnitId =
        getNumber(
          officialCommodity?.unit_retail
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
        getNumber(
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

      const retailHigh =
        getNumber(
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

      const wholesaleAvg =
        getNumber(
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

      const wholesaleLow =
        getNumber(
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

      const wholesaleHigh =
        getNumber(
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

      /*
       * ------------------------------------------------
       * ACTUAL PREVIOUS PRICE
       * ------------------------------------------------
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
       * ------------------------------------------------
       * 30 DAY HISTORY
       * ------------------------------------------------
       */

      const history30Days =
        historyMap.get(
          commodityId
        ) || [];

      products.push({
        id: commodityId,

        commodityId,

        name: commodityNameBn,

        nameBn: commodityNameBn,

        nameEn: commodityName,

        commodityNameBn,

        commodityName,

        category: getCategory({
          ...row,
          commodity_name_bn:
            commodityNameBn,
          commodity_name:
            commodityName,
        }),

        price: retailAvg,

        retailAvg,

        retailLow,

        retailHigh,

        wholesaleAvg:
          wholesaleAvg || null,

        wholesaleLow:
          wholesaleLow || null,

        wholesaleHigh:
          wholesaleHigh || null,

        unitId,

        unitBn:
          unitInfo.unitBn,

        unitEn:
          unitInfo.unitEn,

        previousAvgPrice:
          previousAvgPrice || null,

        previousPriceDate:
          previousDate,

        priceChange,

        priceChangePercent,

        priceChangeType,

        history30Days,

        source:
          "Ministry of Agriculture / DAM",

        verified: true,

        reportDate: date,
      });
    }

    /*
     * --------------------------------------------------
     * 10. REMOVE DUPLICATE PRODUCTS
     * --------------------------------------------------
     */

    const uniqueProducts =
      new Map<number, AnyObject>();

    for (const product of products) {
      const existing =
        uniqueProducts.get(
          product.commodityId
        );

      if (!existing) {
        uniqueProducts.set(
          product.commodityId,
          product
        );
      }
    }

    const items =
      Array.from(
        uniqueProducts.values()
      );

    /*
     * --------------------------------------------------
     * 11. CATEGORY COUNTS
     * --------------------------------------------------
     */

    const categoryCounts: Record<
      string,
      number
    > = {};

    for (const item of items) {
      const category =
        item.category ||
        "অন্যান্য";

      categoryCounts[category] =
        (categoryCounts[category] ||
          0) + 1;
    }

    /*
     * --------------------------------------------------
     * 12. PRICE CHANGE COUNTS
     * --------------------------------------------------
     */

    const priceChangeCounts = {
      increase: 0,
      decrease: 0,
      unchanged: 0,
      no_data: 0,
    };

    for (const item of items) {
      const type =
        item.priceChangeType;

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
     * --------------------------------------------------
     * 13. FINAL RESPONSE
     * --------------------------------------------------
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

      reportDate: date,

      previousPriceDate:
        previousDate,

      total: items.length,

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
      "DaamBD API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch DAM price data",

        source:
          "Ministry of Agriculture / DAM",

        timestamp:
          new Date().toISOString(),
      },
      {
        status: 500,
      }
    );
  }
}