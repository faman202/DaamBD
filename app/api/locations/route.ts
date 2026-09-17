import { NextResponse } from "next/server";

const PORTAL_DROPDOWN_API =
  "https://moa-services.com/comon-service/portal-common-dropdowns";

type AnyObj = Record<string, any>;

function label(item: AnyObj) {
  return (
    item.text_bn ??
    item.name_bn ??
    item.label_bn ??
    item.text ??
    item.name ??
    item.text_en ??
    item.name_en ??
    ""
  );
}

function id(item: AnyObj) {
  return item.value ?? item.id ?? item.code ?? null;
}

function allArrays(obj: any): AnyObj[][] {
  const result: AnyObj[][] = [];

  function walk(value: any) {
    if (!value || typeof value !== "object") return;

    if (Array.isArray(value)) {
      if (
        value.length > 0 &&
        value.every((x) => x && typeof x === "object" && !Array.isArray(x))
      ) {
        result.push(value);
      }

      value.forEach(walk);
      return;
    }

    Object.values(value).forEach(walk);
  }

  walk(obj);
  return result;
}

function findArray(
  arrays: AnyObj[][],
  keys: string[],
  requiredFields: string[] = []
) {
  return (
    arrays.find((arr) => {
      const first = arr[0];
      if (!first) return false;

      const fieldText = Object.keys(first).join(" ").toLowerCase();

      const keyMatch = keys.some((key) => fieldText.includes(key));

      const fieldsMatch = requiredFields.every((field) =>
        Object.prototype.hasOwnProperty.call(first, field)
      );

      return keyMatch && fieldsMatch;
    }) ?? []
  );
}

export async function GET() {
  try {
    const response = await fetch(PORTAL_DROPDOWN_API, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Portal dropdown API failed: ${response.status}`);
    }

    const data = await response.json();
    const arrays = allArrays(data);

    // Official DAM Division list
    let divisionRaw = findArray(
      arrays,
      ["division"],
      []
    );

    // Official DAM District list
    let districtRaw = findArray(
      arrays,
      ["district"],
      ["division_id"]
    );

    // Official DAM Upazila list
    let upazilaRaw = findArray(
      arrays,
      ["upazila", "upazilla"],
      ["district_id"]
    );

    // Official DAM Market list
    let marketRaw = findArray(
      arrays,
      ["market"],
      ["district_id", "upazila_id"]
    );

    /*
     * Some portal responses don't name the array cleanly.
     * Find them by their actual DAM fields as fallback.
     */

    if (!districtRaw.length) {
      districtRaw =
        arrays.find(
          (arr) =>
            arr.length > 0 &&
            arr.some(
              (x) =>
                x &&
                x.value != null &&
                x.division_id != null &&
                (x.dam_id != null || x.district_status != null)
            )
        ) ?? [];
    }

    if (!upazilaRaw.length) {
      upazilaRaw =
        arrays.find(
          (arr) =>
            arr.length > 0 &&
            arr.some(
              (x) =>
                x &&
                x.value != null &&
                x.district_id != null &&
                (x.dam_id != null || x.upazila_status != null)
            )
        ) ?? [];
    }

    if (!marketRaw.length) {
      marketRaw =
        arrays.find(
          (arr) =>
            arr.length > 0 &&
            arr.some(
              (x) =>
                x &&
                x.value != null &&
                x.district_id != null &&
                x.upazila_id != null &&
                (x.text_bn != null || x.text_en != null)
            )
        ) ?? [];
    }

    // If division array is not directly available,
    // create the official divisions from district records.
    if (!divisionRaw.length && districtRaw.length) {
      const map = new Map<number, AnyObj>();

      for (const item of districtRaw) {
        const divisionId = Number(item.division_id);

        if (!Number.isFinite(divisionId)) continue;
        if (map.has(divisionId)) continue;

        map.set(divisionId, {
          value: divisionId,
          text_bn:
            item.division_name_bn ??
            item.division_bn ??
            item.division_name ??
            "",
          text_en:
            item.division_name_en ??
            item.division_en ??
            item.division_name ??
            "",
        });
      }

      divisionRaw = Array.from(map.values());
    }

    const divisions = divisionRaw
      .map((item) => ({
        id: Number(id(item)),
        en:
          item.text_en ??
          item.name_en ??
          item.division_name_en ??
          item.text ??
          "",
        bn:
          item.text_bn ??
          item.name_bn ??
          item.division_name_bn ??
          item.text ??
          "",
      }))
      .filter((x) => Number.isFinite(x.id) && (x.en || x.bn));

    const districts = districtRaw
      .map((item) => ({
        id: Number(id(item)),
        en:
          item.text_en ??
          item.name_en ??
          item.district_name_en ??
          item.text ??
          "",
        bn:
          item.text_bn ??
          item.name_bn ??
          item.district_name_bn ??
          item.text ??
          "",
        divisionId: Number(item.division_id),
      }))
      .filter(
        (x) =>
          Number.isFinite(x.id) &&
          Number.isFinite(x.divisionId) &&
          (x.en || x.bn)
      );

    const upazilas = upazilaRaw
      .map((item) => ({
        id: Number(id(item)),
        en:
          item.text_en ??
          item.name_en ??
          item.upazila_name_en ??
          item.upazilla_name_en ??
          item.text ??
          "",
        bn:
          item.text_bn ??
          item.name_bn ??
          item.upazila_name_bn ??
          item.upazilla_name_bn ??
          item.text ??
          "",
        districtId: Number(item.district_id),
      }))
      .filter(
        (x) =>
          Number.isFinite(x.id) &&
          Number.isFinite(x.districtId) &&
          (x.en || x.bn)
      );

    const markets = marketRaw
      .map((item) => ({
        id: Number(id(item)),
        en:
          item.text_en ??
          item.name_en ??
          item.market_name_en ??
          item.text ??
          "",
        bn:
          item.text_bn ??
          item.name_bn ??
          item.market_name_bn ??
          item.text ??
          "",
        districtId: Number(item.district_id),
        upazilaId: Number(
          item.upazila_id ?? item.upazilla_id
        ),
        divisionId:
          item.division_id == null
            ? null
            : Number(item.division_id),
      }))
      .filter(
        (x) =>
          Number.isFinite(x.id) &&
          Number.isFinite(x.districtId) &&
          Number.isFinite(x.upazilaId) &&
          (x.en || x.bn)
      );

    return NextResponse.json({
      success: true,
      divisions,
      districts,
      upazilas,
      markets,
      source: "Ministry of Agriculture / DAM",
    });
  } catch (error) {
    console.error("DAM location API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load official DAM locations",
        divisions: [],
        districts: [],
        upazilas: [],
        markets: [],
      },
      { status: 500 }
    );
  }
}