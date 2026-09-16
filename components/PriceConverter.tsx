'use client';

import React, { useState } from 'react';
import { DailyPriceItem, Language, PriceType } from '@/lib/types';
import { translations, formatPrice, toBanglaNumber } from '@/lib/i18n';
import {
  Calculator,
  Scale,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';

interface PriceConverterProps {
  item: DailyPriceItem | null;
  lang: Language;
  priceType: PriceType;
  isOpen: boolean;
  onClose: () => void;
}

type UnknownObject = Record<string, unknown>;

const isObject = (value: unknown): value is UnknownObject => {
  return typeof value === 'object' && value !== null;
};

const getNumber = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const cleaned = value
        .replace(/৳/g, '')
        .replace(/টাকা/g, '')
        .replace(/,/g, '')
        .trim();

      const parsed = Number(cleaned);

      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return 0;
};

const getValue = (
  object: UnknownObject | null,
  keys: string[]
): unknown => {
  if (!object) {
    return undefined;
  }

  for (const key of keys) {
    const value = object[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const getPriceFromObject = (
  object: UnknownObject | null,
  priceType: PriceType
): number => {
  if (!object) {
    return 0;
  }

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

  const directPrice = getNumber(
    getValue(object, averageKeys)
  );

  if (directPrice > 0) {
    return directPrice;
  }

  const containers = [
    'price',
    'prices',
    'data',
    'result',
    'item',
  ];

  for (const containerName of containers) {
    const container = object[containerName];

    if (isObject(container)) {
      const nestedPrice = getNumber(
        getValue(container, averageKeys)
      );

      if (nestedPrice > 0) {
        return nestedPrice;
      }
    }
  }

  return 0;
};

export const PriceConverter: React.FC<PriceConverterProps> = ({
  item,
  lang,
  priceType,
  isOpen,
  onClose,
}) => {
  const t = translations[lang];

  const [mode, setMode] = useState<
    'weight-to-price' | 'price-to-weight'
  >('weight-to-price');

  const [weightValue, setWeightValue] = useState<number>(500);
  const [budgetValue, setBudgetValue] = useState<number>(100);

  if (!isOpen || !item) {
    return null;
  }

  const rawItem = item as unknown as UnknownObject;

  const rawRetail = isObject(rawItem.retail)
    ? rawItem.retail
    : null;

  const rawWholesale = isObject(rawItem.wholesale)
    ? rawItem.wholesale
    : null;

  const currentPriceObj =
    priceType === 'retail'
      ? rawRetail
      : rawWholesale;

  let avgPricePerBaseUnit = getPriceFromObject(
    currentPriceObj,
    priceType
  );

  if (avgPricePerBaseUnit <= 0) {
    avgPricePerBaseUnit = getPriceFromObject(
      rawItem,
      priceType
    );
  }

  if (avgPricePerBaseUnit <= 0) {
    avgPricePerBaseUnit = getNumber(
      priceType === 'retail'
        ? rawItem.retailAvg
        : rawItem.wholesaleAvg,
      priceType === 'retail'
        ? rawItem.retailPrice
        : rawItem.wholesalePrice,
      rawItem.avgPrice,
      rawItem.averagePrice,
      rawItem.price
    );
  }

  const unitBn = String(
    getValue(currentPriceObj, [
      'unitBn',
      'unit_bn',
      'unitNameBn',
      'unit_name_bn',
      'unit',
    ]) ??
      getValue(rawItem, [
        'unitBn',
        'unit_bn',
        'unitNameBn',
        'unit_name_bn',
        'unit',
      ]) ??
      'কেজি'
  );

  const unitEn = String(
    getValue(currentPriceObj, [
      'unitEn',
      'unit_en',
      'unitNameEn',
      'unit_name_en',
      'unit',
    ]) ??
      getValue(rawItem, [
        'unitEn',
        'unit_en',
        'unitNameEn',
        'unit_name_en',
        'unit',
      ]) ??
      'Kilogram'
  );

  const isPerHali =
    unitEn.toLowerCase().includes('hali') ||
    unitBn.includes('হালি');

  const presets = [
    {
      labelBn: '১০০ গ্রাম',
      labelEn: '100 g',
      weightInGrams: 100,
    },
    {
      labelBn: '২৫০ গ্রাম',
      labelEn: '250 g',
      weightInGrams: 250,
    },
    {
      labelBn: '৫০০ গ্রাম (আধ কেজি)',
      labelEn: '500 g',
      weightInGrams: 500,
    },
    {
      labelBn: '১ কেজি',
      labelEn: '1 kg',
      weightInGrams: 1000,
    },
    {
      labelBn: '২ কেজি',
      labelEn: '2 kg',
      weightInGrams: 2000,
    },
    {
      labelBn: '৫ কেজি',
      labelEn: '5 kg',
      weightInGrams: 5000,
    },
  ];

  let calculatedResultCost = 0;
  let calculatedResultAmount = '';

  if (avgPricePerBaseUnit > 0) {
    if (mode === 'weight-to-price') {
      if (isPerHali) {
        const eggsCount = Math.max(0, weightValue);

        calculatedResultCost = Math.round(
          (eggsCount / 4) * avgPricePerBaseUnit
        );
      } else {
        const kg = Math.max(0, weightValue) / 1000;

        calculatedResultCost = Math.round(
          kg * avgPricePerBaseUnit
        );
      }
    } else {
      const safeBudget = Math.max(1, budgetValue);

      if (isPerHali) {
        const halis =
          safeBudget / avgPricePerBaseUnit;

        const totalEggs = Math.floor(halis * 4);

        const roundedHalis =
          Math.round(halis * 10) / 10;

        calculatedResultAmount =
          lang === 'bn'
            ? `${toBanglaNumber(
                totalEggs
              )} টি ডিম (${toBanglaNumber(
                roundedHalis
              )} হালি)`
            : `${totalEggs} eggs (${roundedHalis} hali)`;
      } else {
        const kgObtained =
          safeBudget / avgPricePerBaseUnit;

        if (kgObtained < 1) {
          const grams = Math.round(
            kgObtained * 1000
          );

          calculatedResultAmount =
            lang === 'bn'
              ? `${toBanglaNumber(
                  grams
                )} গ্রাম`
              : `${grams} grams`;
        } else {
          const roundedKg =
            Math.round(kgObtained * 100) / 100;

          calculatedResultAmount =
            lang === 'bn'
              ? `${toBanglaNumber(
                  roundedKg
                )} কেজি`
              : `${roundedKg} kg`;
        }
      }
    }
  }

  const handlePresetSelect = (grams: number) => {
    setWeightValue(grams);
    setMode('weight-to-price');
  };

  const productName =
    lang === 'bn'
      ? String(
          rawItem.nameBn ??
            rawItem.name_bn ??
            rawItem.commodityNameBn ??
            'পণ্য'
        )
      : String(
          rawItem.nameEn ??
            rawItem.name_en ??
            rawItem.commodityNameEn ??
            'Product'
        );

  if (avgPricePerBaseUnit <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-[#14532D] to-[#15803D] text-white p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-amber-300" />
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg">
                  {t.calculatorTitle}
                </h3>

                <p className="text-xs text-emerald-100 mt-0.5">
                  {productName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />

            <h4 className="mt-4 font-bold text-content-main">
              {lang === 'bn'
                ? 'মূল্যের তথ্য পাওয়া যায়নি'
                : 'Price information unavailable'}
            </h4>

            <p className="mt-2 text-sm text-content-muted">
              {lang === 'bn'
                ? 'এই পণ্যের জন্য হিসাব করার মতো মূল্যতথ্য বর্তমানে পাওয়া যাচ্ছে না।'
                : 'Price information is currently unavailable for this product.'}
            </p>
          </div>

          <div className="bg-surface-bg p-4 border-t border-surface-border flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm transition-all"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-surface-border animate-in zoom-in-95 duration-200">

        <div className="bg-gradient-to-r from-[#14532D] to-[#15803D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>

            <div>
              <h3 className="font-bold text-base sm:text-lg leading-snug">
                {t.calculatorTitle}
              </h3>

              <p className="text-xs text-emerald-100 font-medium">
                {productName}{' '}
                (
                {lang === 'bn'
                  ? 'গড় দর: '
                  : 'Average: '}
                {formatPrice(
                  avgPricePerBaseUnit,
                  lang
                )}
                {' / '}
                {lang === 'bn'
                  ? unitBn
                  : unitEn}
                )
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                {t.estimateNotice}
              </span>

              <p className="text-xs text-amber-900/90 font-medium mt-1 leading-relaxed">
                {t.estimateNoticeDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-surface-bg p-1.5 rounded-xl border border-surface-border">

            <button
              onClick={() =>
                setMode('weight-to-price')
              }
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'weight-to-price'
                  ? 'bg-brand-700 text-white shadow-md'
                  : 'text-content-muted hover:text-content-main'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />

              <span>
                {t.modeWeightToPrice}
              </span>
            </button>

            <button
              onClick={() =>
                setMode('price-to-weight')
              }
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'price-to-weight'
                  ? 'bg-brand-700 text-white shadow-md'
                  : 'text-content-muted hover:text-content-main'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />

              <span>
                {t.modePriceToWeight}
              </span>
            </button>

          </div>

          {mode === 'weight-to-price' && (
            <div className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-content-main mb-1.5">
                  {t.presetWeights}
                </label>

                <div className="grid grid-cols-3 gap-2">

                  {presets.map((preset) => {
                    const isSelected =
                      weightValue ===
                      preset.weightInGrams;

                    return (
                      <button
                        key={
                          preset.weightInGrams
                        }
                        onClick={() =>
                          handlePresetSelect(
                            preset.weightInGrams
                          )
                        }
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-brand-50 text-brand-800 border-brand-500 shadow-sm ring-2 ring-brand-400/40'
                            : 'bg-white text-content-muted border-surface-border hover:border-brand-300'
                        }`}
                      >
                        {lang === 'bn'
                          ? preset.labelBn
                          : preset.labelEn}
                      </button>
                    );
                  })}

                </div>
              </div>

              <div className="bg-surface-bg p-4 rounded-2xl border border-surface-border space-y-2">

                <div className="flex items-center justify-between text-xs font-bold text-content-main">

                  <span>
                    {lang === 'bn'
                      ? 'কাস্টম ওজন নির্বাচন (গ্রাম)'
                      : 'Custom Weight (Grams)'}
                  </span>

                  <span className="text-brand-700 text-sm">
                    {lang === 'bn'
                      ? `${toBanglaNumber(
                          weightValue
                        )} গ্রাম`
                      : `${weightValue} g`}
                  </span>

                </div>

                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={weightValue}
                  onChange={(event) =>
                    setWeightValue(
                      Number(event.target.value)
                    )
                  }
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
                />

              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-100/60 p-4 rounded-2xl border border-emerald-300 flex items-center justify-between">

                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {t.calculatedCost}
                  </span>

                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    (
                    {lang === 'bn'
                      ? `${toBanglaNumber(
                          weightValue
                        )} গ্রাম এর জন্য`
                      : `For ${weightValue}g`}
                    )
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-brand-900">
                    {formatPrice(
                      calculatedResultCost,
                      lang
                    )}
                  </span>
                </div>

              </div>
            </div>
          )}

          {mode === 'price-to-weight' && (
            <div className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-content-main mb-1.5">
                  {t.enterBudget}
                </label>

                <div className="grid grid-cols-4 gap-2 mb-3">

                  {[50, 100, 200, 500].map(
                    (budget) => (
                      <button
                        key={budget}
                        onClick={() =>
                          setBudgetValue(
                            budget
                          )
                        }
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          budgetValue === budget
                            ? 'bg-brand-50 text-brand-800 border-brand-500 shadow-sm ring-2 ring-brand-400/40'
                            : 'bg-white text-content-muted border-surface-border hover:border-brand-300'
                        }`}
                      >
                        {formatPrice(
                          budget,
                          lang
                        )}
                      </button>
                    )
                  )}

                </div>

                <div className="relative">

                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    ৳
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={budgetValue}
                    onChange={(event) => {
                      const value =
                        Number(
                          event.target.value
                        );

                      setBudgetValue(
                        Number.isFinite(value) &&
                          value > 0
                          ? value
                          : 1
                      );
                    }}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-surface-border text-content-main text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="100"
                  />

                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-100/60 p-4 rounded-2xl border border-emerald-300 flex items-center justify-between">

                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {t.calculatedAmount}
                  </span>

                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    (
                    {formatPrice(
                      budgetValue,
                      lang
                    )}{' '}
                    {lang === 'bn'
                      ? 'টাকায়'
                      : 'budget'}
                    )
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-brand-900">
                    {calculatedResultAmount}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

        <div className="bg-surface-bg p-4 border-t border-surface-border flex items-center justify-end">

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
          >
            {t.closeBtn}
          </button>

        </div>

      </div>
    </div>
  );
};