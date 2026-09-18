'use client';

import React from 'react';
import {
  DailyPriceItem,
  Language,
  PriceType,
} from '@/lib/types';

import {
  translations,
  formatPriceRange,
  formatPrice,
  toBanglaNumber,
} from '@/lib/i18n';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  LineChart,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface PriceCardProps {
  item: DailyPriceItem;
  lang: Language;
  priceType: PriceType;
  onOpenCalculator: (item: DailyPriceItem) => void;
  onOpenTrend: (item: DailyPriceItem) => void;
}

type UnknownObject = Record<string, unknown>;

const isObject = (
  value: unknown
): value is UnknownObject => {
  return (
    typeof value === 'object' &&
    value !== null
  );
};

const getNumber = (
  ...values: unknown[]
): number => {
  for (const value of values) {
    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      const cleaned = value
        .replace(/৳/g, '')
        .replace(/টাকা/g, '')
        .replace(/,/g, '')
        .trim();

      const parsed = Number(cleaned);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
};

const getValue = (
  object: UnknownObject | null | undefined,
  keys: string[]
): unknown => {
  if (!object) {
    return undefined;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return undefined;
};

const getNestedNumber = (
  object: UnknownObject | null | undefined,
  keys: string[]
): number => {
  if (!object) {
    return 0;
  }

  const direct = getNumber(
    getValue(object, keys)
  );

  if (direct > 0) {
    return direct;
  }

  const containers = [
    'price',
    'prices',
    'retail',
    'wholesale',
    'data',
    'result',
    'item',
  ];

  for (const container of containers) {
    const nested = object[container];

    if (isObject(nested)) {
      const value = getNumber(
        getValue(nested, keys)
      );

      if (value > 0) {
        return value;
      }
    }
  }

  return 0;
};

export const PriceCard: React.FC<
  PriceCardProps
> = ({
  item,
  lang,
  priceType,
  onOpenCalculator,
  onOpenTrend,
}) => {
  const t = translations[lang];

  const rawItem =
    item as unknown as UnknownObject;

  const rawRetail = isObject(
    rawItem.retail
  )
    ? rawItem.retail
    : null;

  const rawWholesale = isObject(
    rawItem.wholesale
  )
    ? rawItem.wholesale
    : null;

  const priceData =
    priceType === 'retail'
      ? rawRetail
      : rawWholesale;

  /* =========================
     Average Price
  ========================== */

  const averageKeys =
    priceType === 'retail'
      ? [
          'avgPrice',
          'averagePrice',
          'avg',
          'average',
          'retailAvg',
          'retailAverage',
          'retail_avg',
          'retail_average',
          'retailPrice',
          'retail_price',
          'price',
        ]
      : [
          'avgPrice',
          'averagePrice',
          'avg',
          'average',
          'wholesaleAvg',
          'wholesaleAverage',
          'wholesale_avg',
          'wholesale_average',
          'wholesalePrice',
          'wholesale_price',
          'price',
        ];

  let avgPrice = getNestedNumber(
    priceData,
    averageKeys
  );

  if (avgPrice <= 0) {
    avgPrice = getNestedNumber(
      rawItem,
      averageKeys
    );
  }

  if (avgPrice <= 0) {
    avgPrice = getNumber(
      priceType === 'retail'
        ? rawItem.retailAvg
        : rawItem.wholesaleAvg
    );
  }

  /* =========================
     Lowest / Highest
  ========================== */

  const lowestKeys = [
    'lowestPrice',
    'lowPrice',
    'lowest',
    'low',
    'minPrice',
    'minimumPrice',
    'min',
    'minimum',
    'retailLow',
    'wholesaleLow',
    'retail_low',
    'wholesale_low',
  ];

  const highestKeys = [
    'highestPrice',
    'highPrice',
    'highest',
    'high',
    'maxPrice',
    'maximumPrice',
    'max',
    'maximum',
    'retailHigh',
    'wholesaleHigh',
    'retail_high',
    'wholesale_high',
  ];

  let lowestPrice = getNestedNumber(
    priceData,
    lowestKeys
  );

  if (lowestPrice <= 0) {
    lowestPrice = getNestedNumber(
      rawItem,
      lowestKeys
    );
  }

  let highestPrice = getNestedNumber(
    priceData,
    highestKeys
  );

  if (highestPrice <= 0) {
    highestPrice = getNestedNumber(
      rawItem,
      highestKeys
    );
  }

  const displayLowest =
    lowestPrice > 0
      ? lowestPrice
      : avgPrice;

  const displayHighest =
    highestPrice > 0
      ? highestPrice
      : avgPrice;

  /* =========================
     Unit
  ========================== */

  const unit =
    lang === 'bn'
      ? String(
          getValue(rawItem, [
            'unitBn',
            'unit_bn',
            'unitNameBn',
            'unit_name_bn',
            'unit',
          ]) || 'কেজি'
        )
      : String(
          getValue(rawItem, [
            'unitEn',
            'unit_en',
            'unitNameEn',
            'unit_name_en',
            'unit',
          ]) || 'Kilogram'
        );

  /* =========================
     Product Names
  ========================== */

  const nameBn = String(
    getValue(rawItem, [
      'nameBn',
      'name_bn',
      'commodityNameBn',
      'commodity_name_bn',
      'text_bn',
      'text',
    ]) || 'পণ্য'
  );

  const nameEn = String(
    getValue(rawItem, [
      'nameEn',
      'name_en',
      'commodityNameEn',
      'commodity_name',
      'text_en',
      'text',
    ]) || 'Product'
  );

  /* =========================
     Category
  ========================== */

  const categoryBn = String(
    getValue(rawItem, [
      'categoryBn',
      'category_bn',
      'groupNameBn',
      'group_name_bn',
      'category',
    ]) || 'পণ্য'
  );

  const categoryEn = String(
    getValue(rawItem, [
      'categoryEn',
      'category_en',
      'groupNameEn',
      'group_name_en',
      'category',
    ]) || 'Product'
  );

  const category =
    lang === 'bn'
      ? categoryBn
      : categoryEn;

  /* =========================
     Movement
     Supports:
     up / down
     spike / drop
     stable
  ========================== */

  const movementValue = String(
    getValue(rawItem, [
      'movement',
      'priceMovement',
      'price_movement',
    ]) || ''
  ).toLowerCase();

  // Also read priceChangeType for accurate badge rendering
  const priceChangeType = String(
    getValue(rawItem, [
      'priceChangeType',
      'price_change_type',
      'changeType',
    ]) || 'no_data'
  ).toLowerCase();

  const movement =
    movementValue === 'up' ||
    movementValue === 'spike' ||
    priceChangeType === 'increase'
      ? 'spike'
      : movementValue === 'down' ||
        movementValue === 'drop' ||
        priceChangeType === 'decrease'
      ? 'drop'
      : priceChangeType === 'no_data'
      ? 'no_data'
      : 'stable';

  /* =========================
     Price Change
  ========================== */

  const priceChange = getNumber(
    getValue(rawItem, [
      'priceChange',
      'price_change',
      'change',
      'changeAmount',
      'priceDifference',
      'price_difference',
    ])
  );

  /* =========================
     Movement Badge
  ========================== */

  const renderMovementBadge = () => {
    if (movement === 'drop') {
      return (
        <span className="inline-flex max-w-full items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#ECFDF5] text-[#16A34A] border border-[#16A34A]/30 whitespace-nowrap">
          <TrendingDown className="w-3.5 h-3.5 shrink-0" />

          <span className="truncate">
            {lang === 'bn'
              ? `↓ ${toBanglaNumber(
                  Math.abs(priceChange)
                )} টাকা কমেছে`
              : `↓ ৳${Math.abs(
                  priceChange
                )} dropped`}
          </span>
        </span>
      );
    }

    if (movement === 'spike') {
      return (
        <span className="inline-flex max-w-full items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30 whitespace-nowrap">
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />

          <span className="truncate">
            {lang === 'bn'
              ? `↑ ${toBanglaNumber(
                  Math.abs(priceChange)
                )} টাকা বেড়েছে`
              : `↑ ৳${Math.abs(
                  priceChange
                )} increased`}
          </span>
        </span>
      );
    }

    // No previous-day data available — show neutral "no comparison" badge
    if (movement === 'no_data') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap">
          <Minus className="w-3.5 h-3.5 shrink-0" />

          <span>
            {lang === 'bn'
              ? '— তুলনামূলক তথ্য নেই'
              : '— No prev. data'}
          </span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
        <Minus className="w-3.5 h-3.5 shrink-0" />

        <span>
          {lang === 'bn'
            ? '— অপরিবর্তিত'
            : '— Stable'}
        </span>
      </span>
    );
  };

  return (
    <article className="w-full min-w-0 bg-white rounded-2xl p-3.5 sm:p-4 lg:p-5 border border-surface-border shadow-card-subtle hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">

      <div className="min-w-0">

        {/* =========================
            Category + Movement
        ========================== */}

        <div className="flex items-start justify-between gap-2 mb-2.5">

          <span className="min-w-0 max-w-[48%] text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-brand-700 bg-brand-50 px-2 sm:px-2.5 py-1 rounded-md border border-brand-200 truncate">
            {category}
          </span>

          <div className="min-w-0 max-w-[52%]">
            {renderMovementBadge()}
          </div>

        </div>

        {/* =========================
            Product Name
        ========================== */}

        <div className="mb-3 min-w-0">

          <h4 className="text-[15px] sm:text-base lg:text-lg font-bold text-content-main group-hover:text-brand-700 transition-colors leading-snug break-words">
            {lang === 'bn'
              ? nameBn
              : nameEn}
          </h4>

          <p className="text-[10px] sm:text-xs text-content-muted font-medium mt-1 break-words">
            {lang === 'bn'
              ? nameEn
              : nameBn}
          </p>

        </div>

        {/* =========================
            Anomaly Warning
        ========================== */}

        {rawItem.anomalyStatus ===
          'warning' && (
          <div className="mb-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-2.5 text-[10px] sm:text-xs flex items-start gap-1.5">

            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

            <span className="font-semibold leading-relaxed">
              {t.anomalyAlert}
            </span>

          </div>
        )}

        {/* =========================
            Price Box
        ========================== */}

        <div className="bg-surface-bg rounded-xl p-3 sm:p-3.5 border border-surface-borderLight mb-3">

          <div className="flex items-center justify-between gap-2">

            <span className="text-[10px] sm:text-xs text-content-muted font-medium whitespace-nowrap">
              {priceType === 'retail'
                ? t.retailTab
                : t.wholesaleTab}
            </span>

            <span className="text-[10px] sm:text-[11px] text-content-light text-right truncate">
              {t.averagePrice}:{' '}

              <strong className="text-content-main font-bold">
                {formatPrice(
                  avgPrice,
                  lang
                )}
              </strong>
            </span>

          </div>

          <div className="mt-1.5 min-w-0">

            <span className="block text-lg sm:text-xl lg:text-2xl font-black text-brand-900 tracking-tight leading-tight break-words">
              {formatPriceRange(
                displayLowest,
                displayHighest,
                unit,
                lang
              )}
            </span>

          </div>

        </div>

        {/* =========================
            Source + Date
        ========================== */}

        <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-content-muted pt-1 pb-3 border-b border-surface-borderLight">

          <div
            className="min-w-0 flex items-center gap-1 text-emerald-800 font-semibold"
            title={
              lang === 'bn'
                ? 'কৃষি বিপণন অধিদপ্তর (DAM)'
                : 'Department of Agricultural Marketing (DAM)'
            }
          >

            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />

            <span className="truncate">
              {lang === 'bn'
                ? 'কৃষি বিপণন অধিদপ্তর (DAM)'
                : 'DAM Data'}
            </span>

          </div>

          <div className="shrink-0 flex items-center gap-1 text-gray-500">

            <Clock className="w-3 h-3 text-gray-400 shrink-0" />

            <span>
              {lang === 'bn'
                ? 'আজকের তথ্য'
                : 'Today'}
            </span>

          </div>

        </div>

      </div>

      {/* =========================
          Action Buttons
      ========================== */}

      <div className="grid grid-cols-2 gap-2 mt-3 pt-1">

        <button
          type="button"
          onClick={() =>
            onOpenCalculator(item)
          }
          className="min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/70 text-[10px] sm:text-xs font-bold transition-all shadow-sm active:scale-95"
          title={t.calculatorSubtitle}
        >

          <Calculator className="w-3.5 h-3.5 text-amber-700 shrink-0" />

          <span className="truncate">
            {t.calculatorBtn}
          </span>

        </button>

        <button
          type="button"
          onClick={() =>
            onOpenTrend(item)
          }
          className="min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/70 text-[10px] sm:text-xs font-bold transition-all shadow-sm active:scale-95"
          title={t.trendSubtitle}
        >

          <LineChart className="w-3.5 h-3.5 text-brand-700 shrink-0" />

          <span className="truncate">
            {t.trendBtn}
          </span>

        </button>

      </div>

    </article>
  );
};