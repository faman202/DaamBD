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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const division = Number(searchParams.get("division") || 6);
    const district = Number(searchParams.get("district") || 46);
    const upazila = Number(searchParams.get("upazila") || 360);
    const market = Number(searchParams.get("market") || 109);

    const date =
      searchParams.get("date") ||
      new Date().toISOString().split("T")[0];

    // =========================================================
    // 1. FETCH OFFICIAL COMMON DROPDOWNS
    // =========================================================

    const commodityResponse = await fetch(COMMODITY_API, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!commodityResponse.ok) {
      throw new Error(
        `Commodity API failed: ${commodityResponse.status}`
      );
    }

    const commodityData = await commodityResponse.json();

    // =========================================================
    // 2. IMPORTANT:
    // Actual MOA structure is:
    //
    // commodityData.data.commoditySubGroupList
    // commodityData.data.measurementUnitList
    // =========================================================

    const commodityList: AnyObject[] = Array.isArray(
      commodityData?.data?.commoditySubGroupList
    )
      ? commodityData.data.commoditySubGroupList
      : [];

    const measurementUnitList: AnyObject[] = Array.isArray(
      commodityData?.data?.measurementUnitList
    )
      ? commodityData.data.measurementUnitList
      : [];

    console.log(
      "DaamBD commoditySubGroupList:",
      commodityList.length
    );

    console.log(
      "DaamBD measurementUnitList:",
      measurementUnitList.length
    );

    // =========================================================
    // 3. CREATE COMMODITY MAP
    //
    // Example:
    // value: 604
    // text_bn: "চাল -আমন - মোটা"
    // unit_retail: 2
    // unit_whole_sale: 1
    // =========================================================

    const commodityMap = new Map<number, AnyObject>();

    for (const item of commodityList) {
      const id = Number(item?.value);

      if (Number.isFinite(id) && id > 0) {
        commodityMap.set(id, item);
      }
    }

    // =========================================================
    // 4. CREATE UNIT MAP
    //
    // Example:
    // 2 => Kilogram / কিলোগ্রাম
    // 1 => Quintal / কুইন্টাল
    // =========================================================

    const unitMap = new Map<number, AnyObject>();

    for (const item of measurementUnitList) {
      const id = Number(item?.value);

      if (Number.isFinite(id) && id > 0) {
        unitMap.set(id, item);
      }
    }

    console.log(
      "DaamBD commodity map size:",
      commodityMap.size
    );

    console.log(
      "DaamBD unit map size:",
      unitMap.size
    );

    // =========================================================
    // 5. FETCH OFFICIAL DAILY PRICE
    // =========================================================

    const priceResponse = await fetch(PRICE_API, {
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

        price_date: date,

        select_type: "Daily",

        month_id: 0,
        year_id: 0,
        week_id: 0,
      }),

      cache: "no-store",
    });

    if (!priceResponse.ok) {
      throw new Error(
        `Official price API failed: ${priceResponse.status}`
      );
    }

    const priceData = await priceResponse.json();

    // =========================================================
    // 6. FIND PRICE ROWS
    // =========================================================

    const possibleRows = [
      priceData?.data,
      priceData?.result,
      priceData?.data?.data,
      priceData?.result?.data,
      priceData?.rows,
      priceData,
    ];

    let rows: AnyObject[] = [];

    for (const list of possibleRows) {
      if (Array.isArray(list) && list.length > 0) {
        rows = list;
        break;
      }
    }

    console.log(
      "DaamBD price rows:",
      rows.length
    );

    // =========================================================
    // 7. MAP OFFICIAL PRICE DATA
    // =========================================================

    const items = rows
      .map((row: AnyObject) => {
        // -----------------------------------------------------
        // COMMODITY ID
        // -----------------------------------------------------

        const commodityId = getNumber(
          row?.commodity_id,
          row?.commodityId,
          row?.commodityID,
          row?.product_id
        );

        const commodity = commodityMap.get(commodityId);

        // -----------------------------------------------------
        // OFFICIAL COMMODITY NAME
        // -----------------------------------------------------

        const nameBn = getText(
          row?.commodity_name_bn,
          row?.commodityNameBn,
          row?.name_bn,
          row?.text_bn,

          commodity?.text_bn,
          commodity?.text,

          commodity?.commodity_name_bn,
          commodity?.commodityNameBn,
          commodity?.name_bn,

          row?.commodity_name,
          commodity?.commodity_name,

          `পণ্য ${commodityId}`
        );

        const nameEn = getText(
          row?.commodity_name,
          row?.commodityName,
          row?.name_en,
          row?.text_en,

          commodity?.text_en,
          commodity?.text,

          commodity?.commodity_name,
          commodity?.commodityName,
          commodity?.name_en,

          `Product ${commodityId}`
        );

        // -----------------------------------------------------
        // OFFICIAL UNIT IDs
        //
        // Commodity example:
        //
        // unit_retail: 2
        // unit_whole_sale: 1
        // -----------------------------------------------------

        const retailUnitId = getNumber(
          commodity?.unit_retail,
          row?.unit_retail,
          row?.retail_unit,
          row?.retailUnitId,
          row?.retail_unit_id
        );

        const wholesaleUnitId = getNumber(
          commodity?.unit_whole_sale,
          row?.unit_wholesale,
          row?.wholesale_unit,
          row?.wholesaleUnitId,
          row?.wholesale_unit_id
        );

        const retailUnit = unitMap.get(retailUnitId);

        const wholesaleUnit = unitMap.get(
          wholesaleUnitId
        );

        // -----------------------------------------------------
        // UNIT NAME
        // -----------------------------------------------------

        const unitBn = getText(
          row?.rUnitObj?.text_bn,
          row?.rUnitObj?.unit_name_bn,
          row?.rUnitObj?.text,
          row?.retailUnitObj?.text_bn,
          row?.retailUnitObj?.unit_name_bn,

          retailUnit?.text_bn,
          retailUnit?.text,

          row?.unit_name_bn,
          row?.unitBn,

          "কিলোগ্রাম"
        );

        const unitEn = getText(
          row?.rUnitObj?.text_en,
          row?.rUnitObj?.unit_name,
          row?.rUnitObj?.text,

          row?.retailUnitObj?.text_en,
          row?.retailUnitObj?.unit_name,

          retailUnit?.text_en,
          retailUnit?.text,

          row?.unit_name,
          row?.unitEn,

          "Kilogram"
        );

        // -----------------------------------------------------
        // RETAIL PRICE
        // -----------------------------------------------------

        const retailAvg = getNumber(
          row?.r_avgPriceAvg,
          row?.retail_avg,
          row?.retailAvg,
          row?.retail?.avg,
          row?.r_avg_price,
          row?.rAvgPrice,
          row?.retail_average_price,
          row?.retailAveragePrice
        );

        const retailLow = getNumber(
          row?.r_lowestPrice,
          row?.retail_low,
          row?.retailLow,
          row?.retail?.low,
          row?.r_low_price,
          row?.rLowestPrice,
          row?.retail_lowest_price,
          row?.retailLowestPrice
        );

        const retailHigh = getNumber(
          row?.r_highestPrice,
          row?.retail_high,
          row?.retailHigh,
          row?.retail?.high,
          row?.r_high_price,
          row?.rHighestPrice,
          row?.retail_highest_price,
          row?.retailHighestPrice
        );

        // -----------------------------------------------------
        // WHOLESALE PRICE
        // -----------------------------------------------------

        const wholesaleAvg = getNumber(
          row?.w_avgPriceAvg,
          row?.wholesale_avg,
          row?.wholesaleAvg,
          row?.wholesale?.avg,
          row?.w_avg_price,
          row?.wAvgPrice,
          row?.wholesale_average_price,
          row?.wholesaleAveragePrice
        );

        const wholesaleLow = getNumber(
          row?.w_lowestPrice,
          row?.wholesale_low,
          row?.wholesaleLow,
          row?.wholesale?.low,
          row?.w_low_price,
          row?.wLowestPrice,
          row?.wholesale_lowest_price,
          row?.wholesaleLowestPrice
        );

        const wholesaleHigh = getNumber(
          row?.w_highestPrice,
          row?.wholesale_high,
          row?.wholesaleHigh,
          row?.wholesale?.high,
          row?.w_high_price,
          row?.wHighestPrice,
          row?.wholesale_highest_price,
          row?.wholesaleHighestPrice
        );

        // -----------------------------------------------------
        // CATEGORY
        // -----------------------------------------------------

        const categoryBn = getText(
          row?.commodity_group_name_bn,
          row?.commodityGroupNameBn,
          row?.group_name_bn,

          commodity?.commodity_group_name_bn,
          commodity?.group_name_bn,

          ""
        );

        const categoryEn = getText(
          row?.commodity_group_name,
          row?.commodityGroupName,
          row?.group_name,

          commodity?.commodity_group_name,
          commodity?.group_name,

          ""
        );

        // -----------------------------------------------------
        // FINAL ITEM
        // -----------------------------------------------------

        return {
          commodityId,

          nameBn,
          nameEn,

          categoryBn,
          categoryEn,

          unitBn,
          unitEn,

          unitRetailId: retailUnitId || null,
          unitWholesaleId: wholesaleUnitId || null,

          retail: {
            avgPrice: retailAvg,
            lowestPrice: retailLow,
            highestPrice: retailHigh,
          },

          wholesale: {
            avgPrice: wholesaleAvg,
            lowestPrice: wholesaleLow,
            highestPrice: wholesaleHigh,
          },

          // Historical comparison will be added later.
          priceChange: 0,

          source: "Ministry of Agriculture / DAM",

          verified: true,

          reportDate: date,
        };
      })

      // -------------------------------------------------------
      // REMOVE INVALID ITEMS
      // -------------------------------------------------------

      .filter((item: AnyObject) => {
        return (
          item.commodityId > 0 &&
          (
            item.retail.avgPrice > 0 ||
            item.wholesale.avgPrice > 0
          )
        );
      });

    // =========================================================
    // 8. DEBUG
    // =========================================================

    if (items.length > 0) {
      console.log(
        "DaamBD first mapped item:",
        JSON.stringify(items[0], null, 2)
      );
    }

    // =========================================================
    // 9. RESPONSE
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

      total: items.length,

      items,

      source: "Official Ministry of Agriculture / DAM",

      timestamp: new Date().toISOString(),
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