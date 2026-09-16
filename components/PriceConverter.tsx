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

export const PriceConverter: React.FC<PriceConverterProps> = ({
  item,
  lang,
  priceType,
  isOpen,
  onClose,
}) => {
  const t = translations[lang];

  const [mode, setMode] = useState<'weight-to-price' | 'price-to-weight'>(
    'weight-to-price'
  );

  const [weightValue, setWeightValue] = useState<number>(500);
  const [budgetValue, setBudgetValue] = useState<number>(100);

  if (!isOpen || !item) return null;

  /*
   * Safely select price object.
   * Some API records may not contain both retail and wholesale data.
   */
  const currentPriceObj =
    priceType === 'retail' ? item.retail : item.wholesale;

  /*
   * Safety check
   */
  if (!currentPriceObj) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-[#14532D] to-[#15803D] text-white p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-amber-300" />
              </div>

              <h3 className="font-bold text-base sm:text-lg">
                {t.calculatorTitle}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
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
              className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Safe numeric price
   */
  const rawAvgPrice = Number(currentPriceObj.avgPrice);

  const avgPricePerBaseUnit =
    Number.isFinite(rawAvgPrice) && rawAvgPrice > 0
      ? rawAvgPrice
      : 0;

  /*
   * Safe unit names
   */
  const unitBn =
    currentPriceObj.unitBn ||
    item.unitBn ||
    'কেজি';

  const unitEn =
    currentPriceObj.unitEn ||
    item.unitEn ||
    'kg';

  const unitBnSafe = String(unitBn);
  const unitEnSafe = String(unitEn);

  /*
   * Detect Hali safely
   */
  const isPerHali =
    unitEnSafe.toLowerCase().includes('hali') ||
    unitBnSafe.includes('হালি');

  /*
   * Presets
   */
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
      labelBn: '৫ কেজি (১ পাল্লা)',
      labelEn: '5 kg',
      weightInGrams: 5000,
    },
  ];

  /*
   * Calculation
   */
  let calculatedResultCost = 0;
  let calculatedResultAmount = '';

  if (avgPricePerBaseUnit > 0) {
    if (mode === 'weight-to-price') {
      if (isPerHali) {
        /*
         * Eggs:
         * 1 hali = 4 eggs
         */
        const eggsCount = Math.max(0, weightValue);

        calculatedResultCost = Math.round(
          (eggsCount / 4) * avgPricePerBaseUnit
        );
      } else {
        /*
         * Normal products:
         * grams -> kg
         */
        const kg = Math.max(0, weightValue) / 1000;

        calculatedResultCost = Math.round(
          kg * avgPricePerBaseUnit
        );
      }
    } else {
      /*
       * Budget -> quantity
       */
      const safeBudget = Math.max(1, budgetValue);

      if (isPerHali) {
        const halis = safeBudget / avgPricePerBaseUnit;
        const totalEggs = Math.floor(halis * 4);

        calculatedResultAmount =
          lang === 'bn'
            ? `${toBanglaNumber(totalEggs)} টি ডিম (${toBanglaNumber(
                Math.round(halis * 10) / 10
              )} হালি)`
            : `${totalEggs} eggs (${Math.round(halis * 10) / 10} hali)`;
      } else {
        const kgObtained =
          safeBudget / avgPricePerBaseUnit;

        if (kgObtained < 1) {
          const grams = Math.round(kgObtained * 1000);

          calculatedResultAmount =
            lang === 'bn'
              ? `${toBanglaNumber(grams)} গ্রাম`
              : `${grams} grams`;
        } else {
          const roundedKg =
            Math.round(kgObtained * 100) / 100;

          calculatedResultAmount =
            lang === 'bn'
              ? `${toBanglaNumber(roundedKg)} কেজি`
              : `${roundedKg} kg`;
        }
      }
    }
  } else {
    calculatedResultAmount =
      lang === 'bn'
        ? 'মূল্য তথ্য নেই'
        : 'Price unavailable';
  }

  const handlePresetSelect = (grams: number) => {
    setWeightValue(grams);
    setMode('weight-to-price');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-surface-border animate-in zoom-in-95 duration-200">

        {/* Header */}
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
                {lang === 'bn'
                  ? item.nameBn
                  : item.nameEn}{' '}
                (
                {lang === 'bn'
                  ? 'গড় দর: '
                  : 'Average: '}
                {avgPricePerBaseUnit > 0
                  ? formatPrice(
                      avgPricePerBaseUnit,
                      lang
                    )
                  : lang === 'bn'
                    ? 'তথ্য নেই'
                    : 'N/A'}
                {avgPricePerBaseUnit > 0 && (
                  <>
                    {' / '}
                    {lang === 'bn'
                      ? unitBnSafe
                      : unitEnSafe}
                  </>
                )}
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* Notice */}
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

          {/* Mode Switch */}
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
              <span>{t.modeWeightToPrice}</span>
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
              <span>{t.modePriceToWeight}</span>
            </button>

          </div>

          {/* Weight -> Price */}
          {mode === 'weight-to-price' && (
            <div className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-content-main mb-1.5">
                  {t.presetWeights}:
                </label>

                <div className="grid grid-cols-3 gap-2">

                  {presets.map((p) => {
                    const isSelected =
                      weightValue === p.weightInGrams;

                    return (
                      <button
                        key={p.weightInGrams}
                        onClick={() =>
                          handlePresetSelect(
                            p.weightInGrams
                          )
                        }
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-brand-50 text-brand-800 border-brand-500 shadow-sm ring-2 ring-brand-400/40'
                            : 'bg-white text-content-muted border-surface-border hover:border-brand-300'
                        }`}
                      >
                        {lang === 'bn'
                          ? p.labelBn
                          : p.labelEn}
                      </button>
                    );
                  })}

                </div>
              </div>

              {/* Slider */}
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
                  onChange={(e) =>
                    setWeightValue(
                      Number(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
                />

              </div>

              {/* Result */}
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
                    {avgPricePerBaseUnit > 0
                      ? formatPrice(
                          calculatedResultCost,
                          lang
                        )
                      : '—'}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* Budget -> Weight */}
          {mode === 'price-to-weight' && (
            <div className="space-y-4">

              <div>

                <label className="block text-xs font-bold text-content-main mb-1.5">
                  {t.enterBudget}:
                </label>

                <div className="grid grid-cols-4 gap-2 mb-3">

                  {[50, 100, 200, 500].map(
                    (b) => (
                      <button
                        key={b}
                        onClick={() =>
                          setBudgetValue(b)
                        }
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          budgetValue === b
                            ? 'bg-brand-50 text-brand-800 border-brand-500 shadow-sm ring-2 ring-brand-400/40'
                            : 'bg-white text-content-muted border-surface-border hover:border-brand-300'
                        }`}
                      >
                        {formatPrice(b, lang)}
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
                    onChange={(e) => {
                      const value =
                        Number(e.target.value);

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

              {/* Result */}
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
                    {calculatedResultAmount ||
                      '—'}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
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