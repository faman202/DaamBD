'use client';

import React from 'react';
import { DailyPriceItem, Language, PriceType } from '@/lib/types';
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

const isObject = (value: unknown): value is UnknownObject => {
  return typeof value === 'object' && value !== null;
};

const getNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
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
    if (object[key] !== undefined && object[key] !== null) {
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

export const PriceCard: React.FC<PriceCardProps> = ({
  item,
  lang,
  priceType,
  onOpenCalculator,
  onOpenTrend,
}) => {
  const t = translations[lang];

  const rawItem = item as unknown as UnknownObject;

  const rawRetail = isObject(rawItem.retail)
    ? rawItem.retail
    : null;

  const rawWholesale = isObject(rawItem.wholesale)
    ? rawItem.wholesale
    : null;

  const priceData =
    priceType === 'retail'
      ? rawRetail
      : rawWholesale;

  /*
   * DAM price field mapping
   *
   * Supports:
   * avgPrice
   * averagePrice
   * avg
   * average
   * retailAvg
   * wholesaleAvg
   * price
   * retail_price
   * wholesale_price
   * retailAverage
   * wholesaleAverage
   */
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

  /*
   * Average price
   */
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

  /*
   * Direct known DailyPriceItem fields
   */
  if (avgPrice <= 0) {
    avgPrice = getNumber(
      priceType === 'retail'
        ? rawItem.retailAvg
        : rawItem.wholesaleAvg
    );
  }

  /*
   * Lowest price
   */
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

  /*
   * Highest price
   */
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

  /*
   * If DAM gives only average price,
   * use average as the displayed price.
   */
  const displayLowest =
    lowestPrice > 0
      ? lowestPrice
      : avgPrice;

  const displayHighest =
    highestPrice > 0
      ? highestPrice
      : avgPrice;

  /*
   * Unit
   */
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

  /*
   * Product names
   */
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

  /*
   * Category
   */
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

  /*
   * Movement
   */
  const movementValue = getValue(rawItem, [
    'movement',
    'priceMovement',
    'price_movement',
  ]);

  const movement =
    movementValue === 'up' ||
    movementValue === 'down' ||
    movementValue === 'stable'
      ? movementValue
      : 'stable';

  /*
   * Price change
   */
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

  const renderMovementBadge = () => {
    if (movement === 'down') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#16A34A] border border-[#16A34A]/30">
          <TrendingDown className="w-3.5 h-3.5" />

          <span>
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

    if (movement === 'up') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30">
          <TrendingUp className="w-3.5 h-3.5" />

          <span>
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

    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        <Minus className="w-3.5 h-3.5" />

        <span>
          {lang === 'bn'
            ? '— অপরিবর্তিত'
            : '— Stable'}
        </span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card-subtle hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
            {category}
          </span>

          {renderMovementBadge()}
        </div>

        <div className="mb-3">
          <h4 className="text-base sm:text-lg font-bold text-content-main group-hover:text-brand-700 transition-colors leading-snug">
            {lang === 'bn'
              ? nameBn
              : nameEn}
          </h4>

          <p className="text-xs text-content-muted font-medium mt-0.5">
            {lang === 'bn'
              ? nameEn
              : nameBn}
          </p>
        </div>

        {rawItem.anomalyStatus === 'warning' && (
          <div className="mb-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-2 text-xs flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />

            <span className="font-semibold">
              {t.anomalyAlert}
            </span>
          </div>
        )}

        <div className="bg-surface-bg rounded-xl p-3.5 border border-surface-borderLight mb-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-content-muted font-medium">
              {priceType === 'retail'
                ? t.retailTab
                : t.wholesaleTab}
            </span>

            <span className="text-[11px] text-content-light">
              {t.averagePrice}:{' '}

              <strong className="text-content-main font-bold">
                {formatPrice(
                  avgPrice,
                  lang
                )}
              </strong>
            </span>
          </div>

          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl sm:text-2xl font-black text-brand-900 tracking-tight">
              {formatPriceRange(
                displayLowest,
                displayHighest,
                unit,
                lang
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-content-muted pt-1 pb-3 border-b border-surface-borderLight">
          <div
            className="flex items-center space-x-1 text-emerald-800 font-semibold"
            title={
              lang === 'bn'
                ? 'কৃষি বিপণন অধিদপ্তর (DAM)'
                : 'Department of Agricultural Marketing (DAM)'
            }
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />

            <span className="truncate max-w-[130px] sm:max-w-[150px]">
              {lang === 'bn'
                ? 'কৃষি বিপণন অধিদপ্তর (DAM)'
                : 'DAM Official Data'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />

            <span>
              {lang === 'bn'
                ? 'আজকের তথ্য'
                : 'Today'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 pt-1">
        <button
          onClick={() =>
            onOpenCalculator(item)
          }
          className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/70 text-xs font-bold transition-all shadow-sm active:scale-95"
          title={t.calculatorSubtitle}
        >
          <Calculator className="w-3.5 h-3.5 text-amber-700" />

          <span>
            {t.calculatorBtn}
          </span>
        </button>

        <button
          onClick={() =>
            onOpenTrend(item)
          }
          className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/70 text-xs font-bold transition-all shadow-sm active:scale-95"
          title={t.trendSubtitle}
        >
          <LineChart className="w-3.5 h-3.5 text-brand-700" />

          <span>
            {t.trendBtn}
          </span>
        </button>
      </div>
    </div>
  );
};