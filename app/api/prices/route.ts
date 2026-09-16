import { NextRequest, NextResponse } from "next/server";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMODITY_API =
  "https://moa-services.com/agri-service/common-dropdowns";

type AnyObject = Record<string, any>;

function getNumber(...values: any[]): number {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

function getText(...values: any[]): string {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

/* =========================================================
   GET PRICE ROWS FROM OFFICIAL DAM API
   ========================================================= */

async function fetchPriceRows(
  reportDate: string,
  division: number,
  district: number,
  upazila: number,
  market: number
): Promise<AnyObject[]> {
  try {
    const response = await fetch(
      PRICE_API,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
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
        }),

        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(
        `DAM price API failed for ${reportDate}: ${response.status}`
      );

      return [];
    }

    const data = await response.json();

    const possibleRows = [
      data?.data,
      data?.result,
      data?.data?.data,
      data?.result?.data,
      data?.rows,
      data,
    ];

    for (const list of possibleRows) {
      if (
        Array.isArray(list) &&
        list.length > 0
      ) {
        return list;
      }
    }

    return [];
  } catch (error) {
    console.warn(
      `DAM price request failed for ${reportDate}:`,
      error
    );

    return [];
  }
}

/* =========================================================
   RETAIL AVERAGE PRICE
   ========================================================= */

function getRetailAverage(
  row: AnyObject
): number {
  return getNumber(
    row?.r_avgPriceAvg,
    row?.retail_avg,
    row?.retailAvg,
    row?.retail?.avg,
    row?.r_avg_price,
    row?.rAvgPrice,
    row?.retail_average_price,
    row?.retailAveragePrice
  );
}

/* =========================================================
   COMMODITY ID
   ========================================================= */

function getCommodityId(
  row: AnyObject
): number {
  return getNumber(
    row?.commodity_id,
    row?.commodityId,
    row?.commodityID,
    row?.product_id,
    row?.productId
  );
}

/* =========================================================
   CATEGORY MAPPER
   ========================================================= */

function getCategory(
  commodity: AnyObject | undefined,
  nameBn: string,
  nameEn: string
) {
  const bn =
    `${nameBn || ""}`.toLowerCase();

  const en =
    `${nameEn || ""}`.toLowerCase();

  const groupId = Number(
    commodity?.commodity_group_id || 0
  );

  const subGroupId = Number(
    commodity?.commodity_sub_group_id || 0
  );

  const groupBn = getText(
    commodity?.commodity_group_name_bn,
    commodity?.group_name_bn,
    commodity?.groupBn,
    commodity?.group_name
  ).toLowerCase();

  const groupEn = getText(
    commodity?.commodity_group_name,
    commodity?.commodity_group_name_en,
    commodity?.group_name,
    commodity?.groupEn
  ).toLowerCase();

  const searchText =
    `${bn} ${en} ${groupBn} ${groupEn}`.toLowerCase();

  // Keep IDs referenced so official group/subgroup
  // information remains part of the mapping logic.
  void groupId;
  void subGroupId;

  /* =======================================================
     FISH
     ======================================================= */

  if (
    searchText.includes("fish") ||
    searchText.includes("seafood") ||
    searchText.includes("মাছ") ||
    searchText.includes("ইলিশ") ||
    searchText.includes("রুই") ||
    searchText.includes("কাতলা") ||
    searchText.includes("তেলাপিয়া") ||
    searchText.includes("পাঙ্গাস") ||
    searchText.includes("চিংড়ি")
  ) {
    return {
      slug: "fish",
      nameBn: "মাছ",
      nameEn: "Fish & Seafood",
    };
  }

  /* =======================================================
     MEAT & EGGS
     ======================================================= */

  if (
    searchText.includes("chicken") ||
    searchText.includes("beef") ||
    searchText.includes("mutton") ||
    searchText.includes("meat") ||
    searchText.includes("egg") ||
    searchText.includes("poultry") ||
    searchText.includes("মুরগি") ||
    searchText.includes("গরুর মাংস") ||
    searchText.includes("গরুর") ||
    searchText.includes("খাসির") ||
    searchText.includes("মাংস") ||
    searchText.includes("ডিম") ||
    searchText.includes("হালি")
  ) {
    return {
      slug: "meat-eggs",
      nameBn: "মাংস ও ডিম",
      nameEn: "Meat & Eggs",
    };
  }

  /* =======================================================
     EDIBLE OILS
     ======================================================= */

  if (
    searchText.includes("oil") ||
    searchText.includes("soybean") ||
    searchText.includes("palm") ||
    searchText.includes("mustard oil") ||
    searchText.includes("তেল") ||
    searchText.includes("সয়াবিন") ||
    searchText.includes("সয়াবিন") ||
    searchText.includes("সরিষার তেল")
  ) {
    return {
      slug: "oils",
      nameBn: "ভোজ্যতেল",
      nameEn: "Edible Oils",
    };
  }

  /* =======================================================
     SPICES
     ======================================================= */

  if (
    searchText.includes("onion") ||
    searchText.includes("garlic") ||
    searchText.includes("ginger") ||
    searchText.includes("chili") ||
    searchText.includes("chilli") ||
    searchText.includes("turmeric") ||
    searchText.includes("cumin") ||
    searchText.includes("coriander") ||
    searchText.includes("pepper") ||
    searchText.includes("পেঁয়াজ") ||
    searchText.includes("পেঁয়াজ") ||
    searchText.includes("রসুন") ||
    searchText.includes("আদা") ||
    searchText.includes("মরিচ") ||
    searchText.includes("হলুদ") ||
    searchText.includes("জিরা") ||
    searchText.includes("ধনে")
  ) {
    return {
      slug: "spices",
      nameBn: "মসলা",
      nameEn: "Spices",
    };
  }

  /* =======================================================
     VEGETABLES
     ======================================================= */

  if (
    searchText.includes("vegetable") ||
    searchText.includes("potato") ||
    searchText.includes("tomato") ||
    searchText.includes("eggplant") ||
    searchText.includes("brinjal") ||
    searchText.includes("cabbage") ||
    searchText.includes("cauliflower") ||
    searchText.includes("okra") ||
    searchText.includes("bottle gourd") ||
    searchText.includes("pumpkin") ||
    searchText.includes("cucumber") ||
    searchText.includes("beans") ||
    searchText.includes("carrot") ||
    searchText.includes("potol") ||
    searchText.includes("আলু") ||
    searchText.includes("টমেটো") ||
    searchText.includes("বেগুন") ||
    searchText.includes("লাউ") ||
    searchText.includes("কুমড়া") ||
    searchText.includes("কুমড়া") ||
    searchText.includes("ফুলকপি") ||
    searchText.includes("বাঁধাকপি") ||
    searchText.includes("ঢেঁড়স") ||
    searchText.includes("ঢেঁড়স") ||
    searchText.includes("শসা") ||
    searchText.includes("শাকসবজি") ||
    searchText.includes("করলা")
  ) {
    return {
      slug: "vegetables",
      nameBn: "শাকসবজি",
      nameEn: "Vegetables",
    };
  }

  /* =======================================================
     PULSES / LENTILS
     ======================================================= */

  if (
    searchText.includes("lentil") ||
    searchText.includes("dal") ||
    searchText.includes("pulse") ||
    searchText.includes("mung") ||
    searchText.includes("pea") ||
    searchText.includes("gram") ||
    searchText.includes("masur") ||
    searchText.includes("মসুর") ||
    searchText.includes("মুগ") ||
    searchText.includes("ডাল") ||
    searchText.includes("ছোলা") ||
    searchText.includes("বুট") ||
    searchText.includes("শিম")
  ) {
    return {
      slug: "pulses",
      nameBn: "ডাল ও শিম",
      nameEn: "Pulses & Lentils",
    };
  }

  /* =======================================================
     GRAINS & CEREALS
     ======================================================= */

  if (
    searchText.includes("rice") ||
    searchText.includes("wheat") ||
    searchText.includes("flour") ||
    searchText.includes("atta") ||
    searchText.includes("grain") ||
    searchText.includes("cereal") ||
    searchText.includes("চাল") ||
    searchText.includes("গম") ||
    searchText.includes("আটা") ||
    searchText.includes("ময়দা") ||
    searchText.includes("ময়দা")
  ) {
    return {
      slug: "grains",
      nameBn: "চাল ও খাদ্যশস্য",
      nameEn: "Grains & Cereals",
    };
  }

  /* =======================================================
     ESSENTIALS
     ======================================================= */

  if (
    searchText.includes("sugar") ||
    searchText.includes("salt") ||
    searchText.includes("চিনি") ||
    searchText.includes("লবণ") ||
    searchText.includes("লবন")
  ) {
    return {
      slug: "essentials",
      nameBn: "নিত্যপণ্য",
      nameEn: "Essentials",
    };
  }

  /* =======================================================
     OFFICIAL GROUP FALLBACK
     ======================================================= */

  if (
    groupBn.includes("মাছ") ||
    groupEn.includes("fish")
  ) {
    return {
      slug: "fish",
      nameBn: "মাছ",
      nameEn: "Fish & Seafood",
    };
  }

  if (
    groupBn.includes("মাংস") ||
    groupBn.includes("ডিম") ||
    groupEn.includes("meat") ||
    groupEn.includes("egg")
  ) {
    return {
      slug: "meat-eggs",
      nameBn: "মাংস ও ডিম",
      nameEn: "Meat & Eggs",
    };
  }

  if (
    groupBn.includes("তেল") ||
    groupEn.includes("oil")
  ) {
    return {
      slug: "oils",
      nameBn: "ভোজ্যতেল",
      nameEn: "Edible Oils",
    };
  }

  if (
    groupBn.includes("মসলা") ||
    groupEn.includes("spice")
  ) {
    return {
      slug: "spices",
      nameBn: "মসলা",
      nameEn: "Spices",
    };
  }

  if (
    groupBn.includes("শস্য") ||
    groupBn.includes("চাল") ||
    groupEn.includes("grain") ||
    groupEn.includes("cereal")
  ) {
    return {
      slug: "grains",
      nameBn: "চাল ও খাদ্যশস্য",
      nameEn: "Grains & Cereals",
    };
  }

  if (
    groupBn.includes("ডাল") ||
    groupBn.includes("শিম") ||
    groupEn.includes("pulse") ||
    groupEn.includes("lentil")
  ) {
    return {
      slug: "pulses",
      nameBn: "ডাল ও শিম",
      nameEn: "Pulses & Lentils",
    };
  }

  if (
    groupBn.includes("সবজি") ||
    groupEn.includes("vegetable")
  ) {
    return {
      slug: "vegetables",
      nameBn: "শাকসবজি",
      nameEn: "Vegetables",
    };
  }

  // Final fallback
  return {
    slug: "essentials",
    nameBn: "নিত্যপণ্য",
    nameEn: "Essentials",
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

    const division = Number(
      searchParams.get("division") || 6
    );

    const district = Number(
      searchParams.get("district") || 46
    );

    const upazila = Number(
      searchParams.get("upazila") || 360
    );

    const market = Number(
      searchParams.get("market") || 109
    );

    /*
     * If frontend sends a date, use that.
     * Otherwise use current date.
     */
    const date =
      searchParams.get("date") ||
      new Date().toISOString().split("T")[0];

    // =========================================================
    // 1. FETCH OFFICIAL COMMON DROPDOWNS
    // =========================================================

    const commodityResponse =
      await fetch(
        COMMODITY_API,
        {
          method: "GET",

          cache: "no-store",

          headers: {
            Accept: "application/json",
          },
        }
      );

    if (!commodityResponse.ok) {
      throw new Error(
        `Commodity API failed: ${commodityResponse.status}`
      );
    }

    const commodityData =
      await commodityResponse.json();

    // =========================================================
    // 2. OFFICIAL LISTS
    // =========================================================

    const commodityList: AnyObject[] =
      Array.isArray(
        commodityData?.data?.commodityNameList
      )
        ? commodityData.data
            .commodityNameList
        : [];

    const measurementUnitList: AnyObject[] =
      Array.isArray(
        commodityData?.data?.measurementUnitList
      )
        ? commodityData.data
            .measurementUnitList
        : [];

    const commodityGroupList: AnyObject[] =
      Array.isArray(
        commodityData?.data?.commodityGroupList
      )
        ? commodityData.data
            .commodityGroupList
        : [];

    const commoditySubGroupList: AnyObject[] =
      Array.isArray(
        commodityData?.data?.commoditySubGroupList
      )
        ? commodityData.data
            .commoditySubGroupList
        : [];

    console.log(
      "DaamBD commodityNameList:",
      commodityList.length
    );

    console.log(
      "DaamBD measurementUnitList:",
      measurementUnitList.length
    );

    console.log(
      "DaamBD commodityGroupList:",
      commodityGroupList.length
    );

    console.log(
      "DaamBD commoditySubGroupList:",
      commoditySubGroupList.length
    );

    // =========================================================
    // 3. COMMODITY MAP
    // =========================================================

    const commodityMap =
      new Map<number, AnyObject>();

    for (const item of commodityList) {
      const id = Number(
        item?.value
      );

      if (
        Number.isFinite(id) &&
        id > 0
      ) {
        commodityMap.set(
          id,
          item
        );
      }
    }

    // =========================================================
    // 4. UNIT MAP
    // =========================================================

    const unitMap =
      new Map<number, AnyObject>();

    for (
      const item of measurementUnitList
    ) {
      const id = Number(
        item?.value
      );

      if (
        Number.isFinite(id) &&
        id > 0
      ) {
        unitMap.set(
          id,
          item
        );
      }
    }

    // =========================================================
    // 5. GROUP MAP
    // =========================================================

    const groupMap =
      new Map<number, AnyObject>();

    for (
      const item of commodityGroupList
    ) {
      const id = Number(
        item?.value
      );

      if (
        Number.isFinite(id) &&
        id > 0
      ) {
        groupMap.set(
          id,
          item
        );
      }
    }

    // =========================================================
    // 6. SUBGROUP MAP
    // =========================================================

    const subGroupMap =
      new Map<number, AnyObject>();

    for (
      const item of commoditySubGroupList
    ) {
      const id = Number(
        item?.value
      );

      if (
        Number.isFinite(id) &&
        id > 0
      ) {
        subGroupMap.set(
          id,
          item
        );
      }
    }

    console.log(
      "DaamBD commodity map size:",
      commodityMap.size
    );

    // =========================================================
    // 7. FETCH CURRENT OFFICIAL DAM PRICE
    // =========================================================

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

    // =========================================================
    // 8. FIND PREVIOUS AVAILABLE DAM DATE
    // =========================================================

    let previousDate = "";

    let previousRows: AnyObject[] = [];

    /*
     * Search previous 7 days.
     *
     * Example:
     *
     * Current = Sunday
     *
     * Try Saturday
     * Try Friday
     * Try Thursday
     * ...
     *
     * First date having DAM data is used.
     */

    const currentDateObj =
      new Date(
        `${date}T00:00:00`
      );

    for (
      let daysBack = 1;
      daysBack <= 7;
      daysBack++
    ) {
      const previousDateObj =
        new Date(
          currentDateObj
        );

      previousDateObj.setDate(
        previousDateObj.getDate() -
          daysBack
      );

      const candidateDate =
        previousDateObj
          .toISOString()
          .split("T")[0];

      console.log(
        `DaamBD checking previous DAM date: ${candidateDate}`
      );

      const candidateRows =
        await fetchPriceRows(
          candidateDate,
          division,
          district,
          upazila,
          market
        );

      if (
        candidateRows.length > 0
      ) {
        previousDate =
          candidateDate;

        previousRows =
          candidateRows;

        console.log(
          `DaamBD previous available date: ${previousDate}`
        );

        console.log(
          `DaamBD previous rows: ${previousRows.length}`
        );

        break;
      }
    }

    if (!previousDate) {
      console.log(
        "DaamBD: No previous DAM price data found within 7 days."
      );
    }

    // =========================================================
    // 9. PREVIOUS PRICE MAP
    // =========================================================

    const previousPriceMap =
      new Map<
        number,
        number
      >();

    for (
      const row of previousRows
    ) {
      const commodityId =
        getCommodityId(row);

      const previousAvg =
        getRetailAverage(row);

      if (
        commodityId > 0 &&
        previousAvg > 0
      ) {
        previousPriceMap.set(
          commodityId,
          previousAvg
        );
      }
    }

    console.log(
      "DaamBD previous price map size:",
      previousPriceMap.size
    );

    // =========================================================
    // 10. MAP CURRENT OFFICIAL PRICE DATA
    // =========================================================

    const items =
      priceRows
        .map(
          (
            row: AnyObject
          ) => {
            // -------------------------------------------------
            // COMMODITY ID
            // -------------------------------------------------

            const commodityId =
              getCommodityId(row);

            const commodity =
              commodityMap.get(
                commodityId
              );

            // -------------------------------------------------
            // OFFICIAL GROUP / SUBGROUP
            // -------------------------------------------------

            const groupId =
              Number(
                commodity
                  ?.commodity_group_id ||
                  0
              );

            const subGroupId =
              Number(
                commodity
                  ?.commodity_sub_group_id ||
                  0
              );

            const group =
              groupMap.get(
                groupId
              );

            const subGroup =
              subGroupMap.get(
                subGroupId
              );

            // -------------------------------------------------
            // OFFICIAL COMMODITY NAME
            // -------------------------------------------------

            const nameBn =
              getText(
                row?.commodity_name_bn,
                row?.commodityNameBn,
                row?.name_bn,
                row?.text_bn,

                commodity?.text_bn,

                commodity
                  ?.commodity_name_bn,

                commodity
                  ?.commodityNameBn,

                commodity?.name_bn,

                row?.commodity_name,

                commodity?.text,

                commodity
                  ?.commodity_name,

                `পণ্য ${commodityId}`
              );

            const nameEn =
              getText(
                row?.commodity_name,
                row?.commodityName,

                row?.name_en,
                row?.text_en,

                commodity?.text_en,

                commodity
                  ?.commodity_name,

                commodity
                  ?.commodityName,

                commodity?.name_en,

                commodity?.text,

                `Product ${commodityId}`
              );

            // -------------------------------------------------
            // CATEGORY
            // -------------------------------------------------

            const category =
              getCategory(
                {
                  ...commodity,

                  commodity_group_name_bn:
                    group?.text_bn ||
                    group?.name_bn ||
                    group
                      ?.commodity_group_name_bn,

                  commodity_group_name:
                    group?.text_en ||
                    group?.name_en ||
                    group
                      ?.commodity_group_name,

                  commodity_sub_group_name_bn:
                    subGroup?.text_bn ||
                    subGroup?.name_bn,

                  commodity_sub_group_name:
                    subGroup?.text_en ||
                    subGroup?.name_en,
                },

                nameBn,
                nameEn
              );

            // -------------------------------------------------
            // OFFICIAL UNIT IDs
            // -------------------------------------------------

            const retailUnitId =
              getNumber(
                commodity
                  ?.unit_retail,

                row?.unit_retail,
                row?.retail_unit,
                row?.retailUnitId,
                row?.retail_unit_id
              );

            const wholesaleUnitId =
              getNumber(
                commodity
                  ?.unit_whole_sale,

                row?.unit_whole_sale,
                row?.unit_wholesale,
                row?.wholesale_unit,
                row?.wholesaleUnitId,
                row?.wholesale_unit_id
              );

            const retailUnit =
              unitMap.get(
                retailUnitId
              );

            const wholesaleUnit =
              unitMap.get(
                wholesaleUnitId
              );

            // -------------------------------------------------
            // RETAIL UNIT
            // -------------------------------------------------

            const unitBn =
              getText(
                row?.rUnitObj?.text_bn,
                row?.rUnitObj?.unit_name_bn,
                row?.rUnitObj?.text,

                row
                  ?.retailUnitObj
                  ?.text_bn,

                row
                  ?.retailUnitObj
                  ?.unit_name_bn,

                row
                  ?.retailUnitObj
                  ?.text,

                retailUnit?.text_bn,
                retailUnit?.text,

                row?.unit_name_bn,
                row?.unitBn,

                "কিলোগ্রাম"
              );

            const unitEn =
              getText(
                row?.rUnitObj?.text_en,
                row?.rUnitObj?.unit_name,
                row?.rUnitObj?.text,

                row
                  ?.retailUnitObj
                  ?.text_en,

                row
                  ?.retailUnitObj
                  ?.unit_name,

                row
                  ?.retailUnitObj
                  ?.text,

                retailUnit?.text_en,
                retailUnit?.text,

                row?.unit_name,
                row?.unitEn,

                "Kilogram"
              );

            // -------------------------------------------------
            // RETAIL PRICE
            // -------------------------------------------------

            const retailAvg =
              getRetailAverage(row);

            const retailLow =
              getNumber(
                row?.r_lowestPrice,
                row?.retail_low,
                row?.retailLow,
                row?.retail?.low,
                row?.r_low_price,
                row?.rLowestPrice,
                row?.retail_lowest_price,
                row?.retailLowestPrice
              );

            const retailHigh =
              getNumber(
                row?.r_highestPrice,
                row?.retail_high,
                row?.retailHigh,
                row?.retail?.high,
                row?.r_high_price,
                row?.rHighestPrice,
                row?.retail_highest_price,
                row?.retailHighestPrice
              );

            // -------------------------------------------------
            // WHOLESALE PRICE
            // -------------------------------------------------

            const wholesaleAvg =
              getNumber(
                row?.w_avgPriceAvg,
                row?.wholesale_avg,
                row?.wholesaleAvg,
                row?.wholesale?.avg,
                row?.w_avg_price,
                row?.wAvgPrice,
                row?.wholesale_average_price,
                row?.wholesaleAveragePrice
              );

            const wholesaleLow =
              getNumber(
                row?.w_lowestPrice,
                row?.wholesale_low,
                row?.wholesaleLow,
                row?.wholesale?.low,
                row?.w_low_price,
                row?.wLowestPrice,
                row?.wholesale_lowest_price,
                row?.wholesaleLowestPrice
              );

            const wholesaleHigh =
              getNumber(
                row?.w_highestPrice,
                row?.wholesale_high,
                row?.wholesaleHigh,
                row?.wholesale?.high,
                row?.w_high_price,
                row?.wHighestPrice,
                row?.wholesale_highest_price,
                row?.wholesaleHighestPrice
              );

            // =================================================
            // ACTUAL PREVIOUS DAM PRICE
            // =================================================

            const previousAvgPrice =
              previousPriceMap.get(
                commodityId
              ) || 0;

            // =================================================
            // ACTUAL PRICE CHANGE
            // =================================================

            let priceChange = 0;

            let priceChangePercent =
              0;

            let priceChangeType:
              | "increase"
              | "decrease"
              | "unchanged"
              | "no_data" =
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
                    ((retailAvg -
                      previousAvgPrice) /
                      previousAvgPrice) *
                    100
                  ).toFixed(2)
                );

              if (
                retailAvg >
                previousAvgPrice
              ) {
                priceChangeType =
                  "increase";
              } else if (
                retailAvg <
                previousAvgPrice
              ) {
                priceChangeType =
                  "decrease";
              } else {
                priceChangeType =
                  "unchanged";
              }
            }

            // =================================================
            // FINAL ITEM
            // =================================================

            return {
              commodityId,

              nameBn,
              nameEn,

              categorySlug:
                category.slug,

              categoryBn:
                category.nameBn,

              categoryEn:
                category.nameEn,

              unitBn,
              unitEn,

              unitRetailId:
                retailUnitId ||
                null,

              unitWholesaleId:
                wholesaleUnitId ||
                null,

              retail: {
                avgPrice:
                  retailAvg,

                lowestPrice:
                  retailLow,

                highestPrice:
                  retailHigh,
              },

              wholesale: {
                avgPrice:
                  wholesaleAvg,

                lowestPrice:
                  wholesaleLow,

                highestPrice:
                  wholesaleHigh,
              },

              // =============================================
              // ACTUAL DAM COMPARISON
              // =============================================

              priceChange,

              priceChangePercent,

              previousAvgPrice:
                previousAvgPrice ||
                null,

              previousPriceDate:
                previousDate ||
                null,

              priceChangeType,

              source:
                "Ministry of Agriculture / DAM",

              verified: true,

              reportDate:
                date,
            };
          }
        )

        // -----------------------------------------------------
        // REMOVE INVALID ITEMS
        // -----------------------------------------------------

        .filter(
          (
            item: AnyObject
          ) =>
            item.commodityId > 0 &&
            (
              item.retail.avgPrice >
                0 ||
              item.wholesale.avgPrice >
                0
            )
        );

    // =========================================================
    // 11. CATEGORY COUNTS
    // =========================================================

    const categoryCounts =
      items.reduce(
        (
          acc: Record<
            string,
            number
          >,
          item: AnyObject
        ) => {
          acc[
            item.categorySlug
          ] =
            (
              acc[
                item.categorySlug
              ] || 0
            ) + 1;

          return acc;
        },
        {}
      );

    // =========================================================
    // 12. PRICE CHANGE COUNTS
    // =========================================================

    const priceChangeCounts =
      items.reduce(
        (
          acc: {
            increase: number;
            decrease: number;
            unchanged: number;
            no_data: number;
          },
          item: AnyObject
        ) => {
          const type =
            item.priceChangeType;

          if (
            type === "increase"
          ) {
            acc.increase++;
          } else if (
            type === "decrease"
          ) {
            acc.decrease++;
          } else if (
            type === "unchanged"
          ) {
            acc.unchanged++;
          } else {
            acc.no_data++;
          }

          return acc;
        },
        {
          increase: 0,
          decrease: 0,
          unchanged: 0,
          no_data: 0,
        }
      );

    // =========================================================
    // 13. DEBUG
    // =========================================================

    console.log(
      "DaamBD category counts:",
      JSON.stringify(
        categoryCounts,
        null,
        2
      )
    );

    console.log(
      "DaamBD price change counts:",
      JSON.stringify(
        priceChangeCounts,
        null,
        2
      )
    );

    console.log(
      "DaamBD previous available date:",
      previousDate || "NONE"
    );

    if (
      items.length > 0
    ) {
      console.log(
        "DaamBD first mapped item:",
        JSON.stringify(
          items[0],
          null,
          2
        )
      );

      const item608 =
        items.find(
          (
            item
          ) =>
            item.commodityId ===
            608
        );

      if (item608) {
        console.log(
          "DaamBD MAPPED 608:",
          JSON.stringify(
            item608,
            null,
            2
          )
        );
      }
    }

    // =========================================================
    // 14. RESPONSE
    // =========================================================

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
        previousDate || null,

      total:
        items.length,

      items,

      categoryCounts,

      priceChangeCounts,

      source:
        "Official Ministry of Agriculture / DAM",

      timestamp:
        new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(
      "DaamBD API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Failed to fetch official market prices",

        items: [],
      },
      {
        status: 500,
      }
    );
  }
}