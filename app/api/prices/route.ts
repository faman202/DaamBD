import { NextRequest, NextResponse } from "next/server";

const PRICE_API =
  "https://moa-services.com/agri-service/crop-price-info/reports/price-report/market-daily-price-report";

const COMMODITY_API =
  "https://moa-services.com/agri-service/common-dropdowns";

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

    // 1. Get commodity master list
    const commodityResponse = await fetch(COMMODITY_API, {
      cache: "no-store",
    });

    if (!commodityResponse.ok) {
      throw new Error("Failed to fetch commodity list");
    }

    const commodityData = await commodityResponse.json();

    // Create commodity ID → name mapping
    const commodities = new Map<number, any>();

    const commodityList =
      commodityData?.commodityList ||
      commodityData?.data ||
      commodityData;

    if (Array.isArray(commodityList)) {
      commodityList.forEach((item: any) => {
        if (item?.value) {
          commodities.set(Number(item.value), item);
        }
      });
    }

    // 2. Get official daily market prices
    const priceResponse = await fetch(PRICE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      throw new Error("Failed to fetch official market prices");
    }

    const priceData = await priceResponse.json();

    const rows =
      priceData?.data ||
      priceData?.result ||
      priceData;

    const items = Array.isArray(rows)
      ? rows.map((row: any) => {
          const commodity = commodities.get(
            Number(row.commodity_id)
          );

          return {
            commodityId: Number(row.commodity_id),

            nameBn:
              commodity?.text_bn ||
              commodity?.text ||
              "অজানা পণ্য",

            nameEn:
              commodity?.text_en ||
              commodity?.text ||
              "Unknown Product",

            categoryBn: "",
            categoryEn: "",

            unitRetailId: row.unit_retail,
            unitWholesaleId: row.unit_wholesale,

            retail: {
              avgPrice: Number(row.r_avgPriceAvg || 0),
              lowestPrice: Number(row.r_lowestPrice || 0),
              highestPrice: Number(row.r_highestPrice || 0),
            },

            wholesale: {
              avgPrice: Number(row.w_avgPriceAvg || 0),
              lowestPrice: Number(row.w_lowestPrice || 0),
              highestPrice: Number(row.w_highestPrice || 0),
            },

            source: "Ministry of Agriculture / DAM",
            verified: true,
            reportDate: date,
          };
        })
      : [];

    return NextResponse.json({
      success: true,
      district,
      market,
      date,
      total: items.length,
      items,
      source: "Official MOA / DAM",
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
      },
      { status: 500 }
    );
  }
}