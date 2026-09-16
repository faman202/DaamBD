import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMODITY_API =
  "https://moa-services.com/agri-service/common-dropdowns";

type AnyObject = Record<string, any>;

type HistoryPoint = {
  date: string;
  avgPrice: number;
};

type PriceChangeType =
  | "increase"
  | "decrease"
  | "unchanged"
  | "no_data";

/* =========================================================
   BASIC HELPERS
   ========================================================= */

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
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

/* =========================================================
   DATE HELPER
   ========================================================= */

function getPreviousDate(
  dateString: string,
  daysBack: number
): string {
  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() - daysBack
  );

  return date
    .toISOString()
    .split("T")[0];
}

/* =========================================================
   FETCH OFFICIAL DAM PRICE ROWS
   ========================================================= */

async function fetchPriceRows(
  reportDate: string,
  division: number,
  district: number,
  upazila: number,
  market: number
): Promise<AnyObject[]> {
  try {
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
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        `DAM API failed for ${reportDate}:`,
        response.status
      );

      return [];
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
  } catch (error) {
    console.error(
      `DAM price fetch error for ${reportDate}:`,
      error
    );

    return [];
  }
}

/* =========================================================
   GET RETAIL AVERAGE
   ========================================================= */

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
    0
  );
}

/* =========================================================
   GET COMMODITY ID
   ========================================================= */

function getCommodityId(
  row: AnyObject
): number {
  return getNumber(
    row?.commodity_id,
    row?.commodityId,
    row?.commodityID,
    row?.commodity?.id,
    row?.commodity_name_id,
    row?.commodityNameId,
    0
  );
}

/* =========================================================
   CATEGORY MAPPER
   ========================================================= */

function getCategory(
  nameBn: string,
  nameEn: string
): {
  slug: string;
  bn: string;
  en: string;
} {
  const text =
    `${nameBn} ${nameEn}`.toLowerCase();

  if (
    /rice|চাল|ধান|paddy|boro|aman|aus/.test(text)
  ) {
    return {
      slug: "rice",
      bn: "চাল",
      en: "Rice",
    };
  }

  if (
    /lentil|pulse|dal|মসুর|ডাল|মুগ|মাষ|ছোলা|বুট|খেসারি|অড়হর|মটর/.test(
      text
    )
  ) {
    return {
      slug: "pulses",
      bn: "ডাল",
      en: "Pulses",
    };
  }

  if (
    /oil|তেল|soybean|সয়াবিন|mustard|সরিষা|palm|পাম/.test(
      text
    )
  ) {
    return {
      slug: "oil",
      bn: "তেল",
      en: "Oil",
    };
  }

  if (
    /potato|আলু|onion|পেঁয়াজ|garlic|রসুন|ginger|আদা|chili|pepper|মরিচ|tomato|টমেটো|brinjal|eggplant|বেগুন|cabbage|বাঁধাকপি|cauliflower|ফুলকপি|carrot|গাজর|cucumber|শসা|okra|ঢেঁড়স|bean|শিম|bottle gourd|লাউ|pumpkin|কুমড়া|pointed gourd|পটল|ridge gourd|ঝিঙা|bitter gourd|করলা|vegetable|সবজি/.test(
      text
    )
  ) {
    return {
      slug: "vegetables",
      bn: "সবজি",
      en: "Vegetables",
    };
  }

  if (
    /fish|মাছ|ilish|ইলিশ|rui|রুই|katla|কাতলা|pangas|পাঙ্গাস|tilapia|তেলাপিয়া|boal|বোয়াল|shrimp|চিংড়ি|prawn|crab|কাঁকড়া/.test(
      text
    )
  ) {
    return {
      slug: "fish",
      bn: "মাছ",
      en: "Fish",
    };
  }

  if (
    /egg|ডিম|hen egg|chicken egg/.test(text)
  ) {
    return {
      slug: "eggs",
      bn: "ডিম",
      en: "Eggs",
    };
  }

  if (
    /beef|গরুর মাংস|cow|mutton|খাসির মাংস|goat|lamb|meat|মাংস|chicken|মুরগি|broiler|সোনালি|sonali/.test(
      text
    )
  ) {
    return {
      slug: "meat",
      bn: "মাংস",
      en: "Meat",
    };
  }

  if (
    /fruit|ফল|banana|কলা|mango|আম|orange|কমলা|lemon|লেবু|papaya|পেঁপে|guava|পেয়ারা|pineapple|আনারস|watermelon|তরমুজ|jackfruit|কাঁঠাল|apple|আপেল|grape|আঙুর|pomegranate|ডালিম/.test(
      text
    )
  ) {
    return {
      slug: "fruits",
      bn: "ফল",
      en: "Fruits",
    };
  }

  return {
    slug: "other",
    bn: "অন্যান্য",
    en: "Other",
  };
}

/* =========================================================
   UNIT HELPERS
   ========================================================= */

function getUnitId(
  row: AnyObject,
  commodity?: AnyObject
): number {
  return getNumber(
    row?.unit_id,
    row?.unitId,
    row?.measurement_unit_id,
    row?.measurementUnitId,
    commodity?.unit_retail,
    commodity?.unit_id,
    0
  );
}

function getUnitInfo(
  unitId: number,
  measurementUnits: AnyObject[]
): {
  id: number;
  bn: string;
  en: string;
  shortBn: string;
  shortEn: string;
} {
  const unit = measurementUnits.find(
    (item) =>
      getNumber(
        item?.value,
        item?.id
      ) === unitId
  );

  const bn = getText(
    unit?.text_bn,
    unit?.name_bn,
    unit?.unit_name_bn,
    unit?.text,
    "কেজি"
  );

  const en = getText(
    unit?.text_en,
    unit?.name_en,
    unit?.unit_name,
    unit?.text,
    "Kilogram"
  );

  let shortBn = bn;
  let shortEn = en;

  if (
    /kilogram/i.test(en) ||
    /কিলোগ্রাম/.test(bn)
  ) {
    shortBn = "কেজি";
    shortEn = "kg";
  } else if (
    /quintal/i.test(en) ||
    /কুইন্টাল/.test(bn)
  ) {
    shortBn = "কুইন্টাল";
    shortEn = "quintal";
  } else if (
    /gram/i.test(en) ||
    /গ্রাম/.test(bn)
  ) {
    shortBn = "গ্রাম";
    shortEn = "g";
  } else if (
    /liter|litre/i.test(en) ||
    /লিটার/.test(bn)
  ) {
    shortBn = "লিটার";
    shortEn = "L";
  }

  return {
    id: unitId,
    bn,
    en,
    shortBn,
    shortEn,
  };
}

/* =========================================================
   GET
   ========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

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

    console.log("DaamBD API:", {
      division,
      district,
      upazila,
      market,
      date,
    });

    /* =====================================================
       1. OFFICIAL COMMODITY / UNIT DATA
       ===================================================== */

    const commodityResponse =
      await fetch(COMMODITY_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

    if (!commodityResponse.ok) {
      throw new Error(
        `Commodity API failed: ${commodityResponse.status}`
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

    /* =====================================================
       2. BUILD COMMODITY MAP
       ===================================================== */

    const commodityMap =
      new Map<number, AnyObject>();

    for (
      const commodity of commodityList
    ) {
      const id = getNumber(
        commodity?.value,
        commodity?.id
      );

      if (id > 0) {
        commodityMap.set(
          id,
          commodity
        );
      }
    }

    /* =====================================================
       3. CURRENT OFFICIAL PRICE DATA
       ===================================================== */

    const priceRows =
      await fetchPriceRows(
        date,
        division,
        district,
        upazila,
        market
      );

    console.log(
      "DaamBD current price rows:",
      priceRows.length
    );

    /* =====================================================
       4. FETCH 30 DAYS OFFICIAL HISTORY
       ===================================================== */

    const historyRequests =
      Array.from(
        { length: 30 },
        (_, index) => {
          const historyDate =
            getPreviousDate(
              date,
              index
            );

          return {
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
          };
        }
      );

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
                  rows: Array.isArray(
                    rows
                  )
                    ? rows
                    : [],
                };
              } catch (error) {
                console.error(
                  `History error ${historyDate}:`,
                  error
                );

                return {
                  date: historyDate,
                  rows: [],
                };
              }
            }
          )
        );

      for (
        const result of results
      ) {
        if (
          result.rows.length > 0
        ) {
          historyRowsByDate.set(
            result.date,
            result.rows
          );
        }
      }
    }

    console.log(
      "DaamBD available history dates:",
      historyRowsByDate.size
    );

    /* =====================================================
       5. BUILD PRODUCT-WISE HISTORY
       ===================================================== */

    const historyMap =
      new Map<
        number,
        HistoryPoint[]
      >();

    for (
      const [
        historyDate,
        rows,
      ] of historyRowsByDate
    ) {
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

        const avgPrice =
          getRetailAverage(row);

        if (
          commodityId <= 0 ||
          avgPrice <= 0
        ) {
          continue;
        }

        if (
          !dailyCommodityPrices.has(
            commodityId
          )
        ) {
          dailyCommodityPrices.set(
            commodityId,
            []
          );
        }

        dailyCommodityPrices
          .get(commodityId)!
          .push(avgPrice);
      }

      for (
        const [
          commodityId,
          prices,
        ] of dailyCommodityPrices
      ) {
        if (prices.length === 0) {
          continue;
        }

        const avg =
          prices.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / prices.length;

        if (
          !historyMap.has(
            commodityId
          )
        ) {
          historyMap.set(
            commodityId,
            []
          );
        }

        historyMap
          .get(commodityId)!
          .push({
            date: historyDate,
            avgPrice: Number(
              avg.toFixed(2)
            ),
          });
      }
    }

    /* =====================================================
       6. SORT AND DEDUPLICATE HISTORY
       ===================================================== */

    for (
      const [
        commodityId,
        history,
      ] of historyMap
    ) {
      history.sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      );

      const uniqueHistory =
        Array.from(
          new Map(
            history.map(
              (point) => [
                point.date,
                point,
              ]
            )
          ).values()
        );

      historyMap.set(
        commodityId,
        uniqueHistory
      );
    }

    /* =====================================================
       7. FIND PREVIOUS AVAILABLE DATE
       ===================================================== */

    let previousDate:
      | string
      | null = null;

    let previousRows:
      AnyObject[] = [];

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
        );

      if (
        candidateRows &&
        candidateRows.length > 0
      ) {
        previousDate =
          candidateDate;

        previousRows =
          candidateRows;

        break;
      }
    }

    console.log(
      "DaamBD previous price date:",
      previousDate
    );

    /* =====================================================
       8. BUILD PREVIOUS PRICE MAP
       ===================================================== */

    const previousPriceMap =
      new Map<
        number,
        number
      >();

    const previousTempMap =
      new Map<
        number,
        number[]
      >();

    for (
      const row of previousRows
    ) {
      const commodityId =
        getCommodityId(row);

      const avgPrice =
        getRetailAverage(row);

      if (
        commodityId <= 0 ||
        avgPrice <= 0
      ) {
        continue;
      }

      if (
        !previousTempMap.has(
          commodityId
        )
      ) {
        previousTempMap.set(
          commodityId,
          []
        );
      }

      previousTempMap
        .get(commodityId)!
        .push(avgPrice);
    }

    for (
      const [
        commodityId,
        prices,
      ] of previousTempMap
    ) {
      if (prices.length === 0) {
        continue;
      }

      const avg =
        prices.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / prices.length;

      previousPriceMap.set(
        commodityId,
        Number(avg.toFixed(2))
      );
    }

    /* =====================================================
       9. CREATE FINAL PRODUCTS
       ===================================================== */

    const items =
      priceRows
        .map((row) => {
          const commodityId =
            getCommodityId(row);

          if (
            commodityId <= 0
          ) {
            return null;
          }

          const commodity =
            commodityMap.get(
              commodityId
            );

          const nameBn = getText(
            commodity?.text_bn,
            commodity?.text,
            row?.commodity_name_bn,
            row?.commodityNameBn,
            row?.commodity_name,
            row?.commodityName
          );

          const nameEn = getText(
            commodity?.text_en,
            commodity?.text,
            row?.commodity_name,
            row?.commodityName,
            nameBn
          );

          if (
            !nameBn &&
            !nameEn
          ) {
            return null;
          }

          const category =
            getCategory(
              nameBn,
              nameEn
            );

          /* ---------------------------------------------
             UNIT
             --------------------------------------------- */

          const unitId =
            getUnitId(
              row,
              commodity
            );

          const unit =
            getUnitInfo(
              unitId,
              measurementUnitList
            );

          /* ---------------------------------------------
             RETAIL
             --------------------------------------------- */

          const retailAvg =
            getRetailAverage(row);

          const retailLow =
            getNumber(
              row?.r_avgPriceMin,
              row?.retail_low,
              row?.retailLow,
              row?.retail_min,
              row?.r_lowPrice,
              0
            );

          const retailHigh =
            getNumber(
              row?.r_avgPriceMax,
              row?.retail_high,
              row?.retailHigh,
              row?.retail_max,
              row?.r_highPrice,
              0
            );

          /* ---------------------------------------------
             WHOLESALE
             --------------------------------------------- */

          const wholesaleAvg =
            getNumber(
              row?.w_avgPriceAvg,
              row?.wholesale_avg,
              row?.wholesaleAvg,
              row?.wholesale_average,
              row?.wholesale_avg_price,
              row?.wholesaleAvgPrice,
              row?.w_avg_price,
              0
            );

          const wholesaleLow =
            getNumber(
              row?.w_avgPriceMin,
              row?.wholesale_low,
              row?.wholesaleLow,
              row?.w_lowPrice,
              0
            );

          const wholesaleHigh =
            getNumber(
              row?.w_avgPriceMax,
              row?.wholesale_high,
              row?.wholesaleHigh,
              row?.w_highPrice,
              0
            );

          /* ---------------------------------------------
             PREVIOUS PRICE
             --------------------------------------------- */

          const previousAvgPrice =
            previousPriceMap.get(
              commodityId
            ) || 0;

          let priceChange = 0;

          let priceChangePercent = 0;

          let priceChangeType:
            PriceChangeType =
              "no_data";

          if (
            retailAvg > 0 &&
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

          /* ---------------------------------------------
             30 DAY HISTORY
             --------------------------------------------- */

          const history30Days =
            historyMap.get(
              commodityId
            ) || [];

          return {
            commodityId,

            nameBn,
            nameEn,

            category:
              category.slug,

            categorySlug:
              category.slug,

            categoryBn:
              category.bn,

            categoryEn:
              category.en,

            unitId,

            unitBn:
              unit.shortBn,

            unitEn:
              unit.shortEn,

            unitNameBn:
              unit.bn,

            unitNameEn:
              unit.en,

            price:
              retailAvg,

            retailAvg,

            retailLow,

            retailHigh,

            wholesaleAvg,

            wholesaleLow,

            wholesaleHigh,

            previousAvgPrice:
              previousAvgPrice ||
              null,

            previousPriceDate:
              previousDate ||
              null,

            priceChange,

            priceChangePercent,

            priceChangeType,

            history30Days,

            source:
              "Ministry of Agriculture / DAM",

            verified: true,

            reportDate: date,
          };
        })
        .filter(
          (
            item
          ): item is NonNullable<
            typeof item
          > =>
            item !== null &&
            item.price > 0
        );

    /* =====================================================
       10. CATEGORY COUNTS
       ===================================================== */

    const categoryCounts:
      Record<string, number> = {};

    for (
      const item of items
    ) {
      const key =
        item.categorySlug ||
        "other";

      categoryCounts[key] =
        (categoryCounts[key] || 0) + 1;
    }

    /* =====================================================
       11. PRICE CHANGE COUNTS
       ===================================================== */

    const priceChangeCounts = {
      increase: 0,
      decrease: 0,
      unchanged: 0,
      no_data: 0,
    };

    for (
      const item of items
    ) {
      if (
        item.priceChangeType ===
        "increase"
      ) {
        priceChangeCounts.increase++;
      } else if (
        item.priceChangeType ===
        "decrease"
      ) {
        priceChangeCounts.decrease++;
      } else if (
        item.priceChangeType ===
        "unchanged"
      ) {
        priceChangeCounts.unchanged++;
      } else {
        priceChangeCounts.no_data++;
      }
    }

    /* =====================================================
       12. RESPONSE
       ===================================================== */

    return NextResponse.json(
      {
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
          items.length,

        items,

        categoryCounts,

        priceChangeCounts,

        source:
          "Ministry of Agriculture / DAM",

        verified: true,

        timestamp:
          new Date().toISOString(),
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "DaamBD /api/prices error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Unable to fetch official DAM price data.",

        source:
          "Ministry of Agriculture / DAM",

        verified: false,
      },
      {
        status: 500,
      }
    );
  }
}