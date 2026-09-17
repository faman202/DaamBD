import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COMMON_API =
  'https://moa-services.com/agri-service/common-dropdowns';

type AnyObject = Record<string, any>;

function getNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const number = Number(value.trim());

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return 0;
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return '';
}

export async function GET() {
  try {
    const response = await fetch(COMMON_API, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `DAM common dropdown API returned ${response.status}`
      );
    }

    const raw = await response.json();

    const data: AnyObject = raw?.data ?? {};

    /*
     * Official DAM structure:
     *
     * regionsList = Division
     * zonesList   = District
     *
     * Example:
     * region:
     * {
     *   value: 17,
     *   text_en: "Dhaka",
     *   text_bn: "ঢাকা"
     * }
     *
     * district:
     * {
     *   value: 31,
     *   text_en: "Dhaka",
     *   text_bn: "ঢাকা",
     *   region_id: 17
     * }
     */

    const regionsList: AnyObject[] = Array.isArray(data.regionsList)
      ? data.regionsList
      : [];

    const zonesList: AnyObject[] = Array.isArray(data.zonesList)
      ? data.zonesList
      : [];

    const divisions = regionsList
      .map((item) => ({
        id: getNumber(item.value ?? item.id),
        en: getText(
          item.text_en,
          item.text,
          item.name_en
        ),
        bn: getText(
          item.text_bn,
          item.text,
          item.name_bn
        ),
      }))
      .filter(
        (item) =>
          item.id > 0 &&
          (item.en || item.bn)
      );

    const districts = zonesList
      .map((item) => ({
        id: getNumber(item.value ?? item.id),
        en: getText(
          item.text_en,
          item.text,
          item.name_en
        ),
        bn: getText(
          item.text_bn,
          item.text,
          item.name_bn
        ),
        divisionId: getNumber(
          item.region_id
        ),
      }))
      .filter(
        (item) =>
          item.id > 0 &&
          (item.en || item.bn)
      );

    return NextResponse.json({
      success: true,
      divisions,
      districts,
      source: 'Ministry of Agriculture / DAM',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      'DaamBD locations API error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load official locations',
      },
      {
        status: 500,
      }
    );
  }
}