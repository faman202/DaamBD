import { NextRequest, NextResponse } from "next/server";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMODITY_API =
  "https://moa-services.com/agri-service/common-dropdowns";

type AnyObject = Record<string, any>;

function findArray(obj: any, keys: string[]): any[] {
  if (!obj || typeof obj !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(obj?.[key])) {
      return obj[key];
    }
  }

  return [];
}

function getNumber(...values: any[]): number {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !Number.isNaN(Number(value))
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
    // 1. FETCH OFFICIAL COMMON DROPDOWN / COMMODITY DATA
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
    // 2. FIND COMMODITY LIST
    // =========================================================

    const possibleLists = [
      commodityData?.commodityList,
      commodityData?.data?.commodityList,
      commodityData?.result?.commodityList,
      commodityData?.data,
      commodityData?.result,
    ];

    let commodityList: AnyObject[] = [];

    for (const list of possibleLists) {
      if (Array.isArray(list) && list.length > 0) {
        commodityList = list;
        break;
      }
    }

    /*
     * Sometimes the API returns the commodity list deeper
     * inside another object.
     */

    if (commodityList.length === 0) {
      const recursiveFind = (obj: any): any[] => {
        if (!obj || typeof obj !== "object") return [];

        if (Array.isArray(obj)) {
          const found = obj.find(
            (item) =>
              item &&
              typeof item === "object" &&
              (
                item.commodity_id !== undefined ||
                item.commodityId !== undefined ||
                item.commodity_name_bn !== undefined ||
                item.commodity_name !== undefined
              )
          );

          if (found) return obj;
        }

        for (const value of Object.values(obj)) {
          const result = recursiveFind(value);

          if (result.length > 0) {
            return result;
          }
        }

        return [];
      };

      commodityList = recursiveFind(commodityData);
    }

    // =========================================================
    // 3. CREATE COMMODITY MAP
    // =========================================================

    const commodities = new Map<number, AnyObject>();

    for (const item of commodityList) {
      if (!item || typeof item !== "object") continue;

      const id = getNumber(
        item.commodity_id,
        item.commodityId,
        item.value,
        item.id
      );

      if (id > 0) {
        commodities.set(id, item);
      }
    }

    console.log(
      "DaamBD commodity count:",
      commodities.size
    );

    // =========================================================
    // 4. OFFICIAL DAILY PRICE API
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
        year: 0,
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
    // 5. FIND PRICE ROWS
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

    // =========================================================
    // 6. MAP OFFICIAL DATA
    // =========================================================

    const items = rows
      .map((row: AnyObject) => {
        const commodityId = getNumber(
          row?.commodity_id,
          row?.commodityId,
          row?.commodityID,
          row?.product_id
        );

        const commodity = commodities.get(commodityId);

        // -----------------------------------------------------
        // NAME
        // -----------------------------------------------------

        const nameBn = getText(
          row?.commodity_name_bn,
          row?.commodityNameBn,
          row?.name_bn,
          row?.text_bn,

          commodity?.commodity_name_bn,
          commodity?.commodityNameBn,
          commodity?.name_bn,
          commodity?.text_bn,

          row?.commodity_name,
          commodity?.commodity_name,

          `পণ্য ${commodityId}`
        );

        const nameEn = getText(
          row?.commodity_name,
          row?.commodityName,
          row?.name_en,
          row?.text_en,

          commodity?.commodity_name,
          commodity?.commodityName,
          commodity?.name_en,
          commodity?.text_en,

          `Product ${commodityId}`
        );

        // -----------------------------------------------------
        // UNIT
        // -----------------------------------------------------

        /*
         * IMPORTANT:
         * MOA price response may contain rUnitObj.
         * This is much more reliable than assuming
         * unit_name_bn directly exists on commodity master.
         */

        const rUnitObj =
          row?.rUnitObj ??
          row?.retailUnitObj ??
          row?.unitObj ??
          commodity?.rUnitObj ??
          commodity?.retailUnitObj;

        const wUnitObj =
          row?.wUnitObj ??
          row?.wholesaleUnitObj ??
          commodity?.wUnitObj ??
          commodity?.wholesaleUnitObj;

        const unitBn = getText(
          rUnitObj?.unit_name_bn,
          rUnitObj?.unitNameBn,
          rUnitObj?.name_bn,
          rUnitObj?.text_bn,

          row?.unit_name_bn,
          row?.unitBn,
          row?.retail_unit_name_bn,

          commodity?.unit_name_bn,
          commodity?.unitBn,

          "কেজি"
        );

        const unitEn = getText(
          rUnitObj?.unit_name,
          rUnitObj?.unitName,
          rUnitObj?.name_en,
          rUnitObj?.text_en,

          row?.unit_name,
          row?.unitEn,
          row?.retail_unit_name,

          commodity?.unit_name,
          commodity?.unitEn,

          "kg"
        );

        // -----------------------------------------------------
        // UNIT IDs
        // -----------------------------------------------------

        const unitRetailId =
          rUnitObj?.id ??
          rUnitObj?.unit_id ??
          rUnitObj?.unitId ??
          row?.unit_retail ??
          row?.retail_unit ??
          commodity?.unit_retail ??
          null;

        const unitWholesaleId =
          wUnitObj?.id ??
          wUnitObj?.unit_id ??
          wUnitObj?.unitId ??
          row?.unit_wholesale ??
          row?.wholesale_unit ??
          commodity?.unit_wholesale ??
          null;

        // -----------------------------------------------------
        // RETAIL
        // -----------------------------------------------------

        const retailAvg = getNumber(
          row?.r_avgPriceAvg,
          row?.retail_avg,
          row?.retailAvg,
          row?.retail?.avg,
          row?.r_avg_price,
          row?.rAvgPrice
        );

        const retailLow = getNumber(
          row?.r_lowestPrice,
          row?.retail_low,
          row?.retailLow,
          row?.retail?.low,
          row?.r_low_price,
          row?.rLowestPrice
        );

        const retailHigh = getNumber(
          row?.r_highestPrice,
          row?.retail_high,
          row?.retailHigh,
          row?.retail?.high,
          row?.r_high_price,
          row?.rHighestPrice
        );

        // -----------------------------------------------------
        // WHOLESALE
        // -----------------------------------------------------

        const wholesaleAvg = getNumber(
          row?.w_avgPriceAvg,
          row?.wholesale_avg,
          row?.wholesaleAvg,
          row?.wholesale?.avg,
          row?.w_avg_price,
          row?.wAvgPrice
        );

        const wholesaleLow = getNumber(
          row?.w_lowestPrice,
          row?.wholesale_low,
          row?.wholesaleLow,
          row?.wholesale?.low,
          row?.w_low_price,
          row?.wLowestPrice
        );

        const wholesaleHigh = getNumber(
          row?.w_highestPrice,
          row?.wholesale_high,
          row?.wholesaleHigh,
          row?.wholesale?.high,
          row?.w_high_price,
          row?.wHighestPrice
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

        return {
          commodityId,

          nameBn,
          nameEn,

          categoryBn,
          categoryEn,

          unitBn,
          unitEn,

          unitRetailId,
          unitWholesaleId,

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

          /*
           * Historical comparison will be added later.
           * Do NOT invent movement data.
           */

          priceChange: 0,

          source: "Ministry of Agriculture / DAM",

          verified: true,

          reportDate: date,
        };
      })
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
    // 7. RESPONSE
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
    console.error("DaamBD API Error:", error);

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