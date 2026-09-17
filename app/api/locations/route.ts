import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COMMON_API =
  'https://moa-services.com/agri-service/common-dropdowns';

type AnyObject = Record<string, any>;

function isObject(value: unknown): value is AnyObject {
  return typeof value === 'object' && value !== null;
}

function getNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const number = Number(value.replace(/,/g, '').trim());

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return 0;
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
}

function extractArrays(
  value: unknown,
  path = ''
): {
  key: string;
  path: string;
  items: AnyObject[];
}[] {
  const result: {
    key: string;
    path: string;
    items: AnyObject[];
  }[] = [];

  if (!isObject(value)) {
    return result;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;

    if (Array.isArray(child)) {
      const objects = child.filter(isObject);

      if (objects.length > 0) {
        result.push({
          key,
          path: childPath,
          items: objects,
        });
      }

      continue;
    }

    if (isObject(child)) {
      result.push(...extractArrays(child, childPath));
    }
  }

  return result;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_\-\s]/g, '');
}

function findId(
  item: AnyObject,
  candidates: string[]
): number {
  for (const key of candidates) {
    const value = getNumber(item[key]);

    if (value > 0) {
      return value;
    }
  }

  return 0;
}

function findNameBn(item: AnyObject): string {
  return getText(
    item.text_bn,
    item.name_bn,
    item.district_name_bn,
    item.districtNameBn,
    item.division_name_bn,
    item.divisionNameBn,
    item.textBn,
    item.nameBn,
    item.bn,
    item.text
  );
}

function findNameEn(item: AnyObject): string {
  return getText(
    item.text_en,
    item.name_en,
    item.district_name,
    item.districtName,
    item.division_name,
    item.divisionName,
    item.textEn,
    item.nameEn,
    item.en,
    item.text
  );
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

    const data = await response.json();

    const arrays = extractArrays(data);

    const divisionCandidates = arrays.filter((array) => {
      const key = normalizeKey(array.key);

      return (
        key.includes('division') &&
        !key.includes('district') &&
        !key.includes('upazila') &&
        !key.includes('market')
      );
    });

    const districtCandidates = arrays.filter((array) => {
      const key = normalizeKey(array.key);

      return (
        key.includes('district') &&
        !key.includes('upazila') &&
        !key.includes('market')
      );
    });

    const divisionsMap = new Map<number, AnyObject>();

    for (const candidate of divisionCandidates) {
      for (const item of candidate.items) {
        const id = findId(item, [
          'value',
          'id',
          'division_id',
          'divisionId',
        ]);

        if (id <= 0) {
          continue;
        }

        if (!divisionsMap.has(id)) {
          divisionsMap.set(id, item);
        }
      }
    }

    const districtsMap = new Map<number, AnyObject>();

    for (const candidate of districtCandidates) {
      for (const item of candidate.items) {
        const id = findId(item, [
          'value',
          'id',
          'district_id',
          'districtId',
        ]);

        if (id <= 0) {
          continue;
        }

        if (!districtsMap.has(id)) {
          districtsMap.set(id, item);
        }
      }
    }

    const divisions = Array.from(divisionsMap.entries())
      .map(([id, item]) => ({
        id,
        en: findNameEn(item),
        bn: findNameBn(item),
      }))
      .filter((item) => item.en || item.bn);

    const districts = Array.from(districtsMap.entries())
      .map(([id, item]) => {
        const divisionId = findId(item, [
          'division_id',
          'divisionId',
          'parent_division_id',
          'parentDivisionId',
        ]);

        return {
          id,
          en: findNameEn(item),
          bn: findNameBn(item),
          divisionId,
        };
      })
      .filter((item) => item.en || item.bn);

    return NextResponse.json({
      success: true,
      divisions,
      districts,
      source: 'Ministry of Agriculture / DAM',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('DaamBD locations API error:', error);

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