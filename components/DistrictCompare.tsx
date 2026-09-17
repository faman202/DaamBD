'use client';

import React, { useState } from 'react';
import { Language } from '@/lib/types';
import {
  translations,
  formatPrice,
  toBanglaNumber,
} from '@/lib/i18n';
import { getCrossDistrictComparison } from '@/lib/mockData';

import {
  MapPin,
  Sparkles,
  Award,
  Check,
} from 'lucide-react';

interface DistrictCompareProps {
  lang: Language;
}

const COMPARABLE_COMMODITIES = [
  {
    slug: 'local-onion',
    nameBn: 'দেশি পেঁয়াজ',
    nameEn: 'Local Onion',
  },
  {
    slug: 'potato-diamond',
    nameBn: 'আলু (ডায়মন্ড)',
    nameEn: 'Potato (Diamond)',
  },
  {
    slug: 'green-chili',
    nameBn: 'কাঁচা মরিচ',
    nameEn: 'Green Chili',
  },
  {
    slug: 'coarse-rice',
    nameBn: 'মোটা চাল (স্বর্ণা)',
    nameEn: 'Coarse Rice',
  },
  {
    slug: 'fine-rice',
    nameBn: 'সরু চাল (মিনিকেট)',
    nameEn: 'Fine Rice (Miniket)',
  },
  {
    slug: 'broiler-chicken',
    nameBn: 'ব্রয়লার মুরগি',
    nameEn: 'Broiler Chicken',
  },
  {
    slug: 'farm-eggs-hali',
    nameBn: 'ফার্মের ডিম (হালি)',
    nameEn: 'Farm Eggs (Hali)',
  },
  {
    slug: 'loose-soybean-oil',
    nameBn: 'খোলা সয়াবিন তেল',
    nameEn: 'Loose Soybean Oil',
  },
  {
    slug: 'beef-standard',
    nameBn: 'গরুর মাংস',
    nameEn: 'Beef (Standard)',
  },
];

export const DistrictCompare: React.FC<
  DistrictCompareProps
> = ({ lang }) => {
  const t = translations[lang];

  const [
    selectedCommoditySlug,
    setSelectedCommoditySlug,
  ] = useState<string>('local-onion');

  const comparisonData =
    getCrossDistrictComparison(
      selectedCommoditySlug
    );

  const activeCommodity =
    COMPARABLE_COMMODITIES.find(
      (c) =>
        c.slug === selectedCommoditySlug
    ) ||
    COMPARABLE_COMMODITIES[0];

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">

      <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-surface-border shadow-card-subtle overflow-hidden">

        {/* =========================
            HEADER
        ========================== */}

        <div className="flex flex-col gap-4 pb-4 sm:pb-5 border-b border-surface-borderLight">

          <div className="min-w-0">

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-brand-800 text-[10px] sm:text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />

              <span>
                {lang === 'bn'
                  ? 'বাজার বিশ্লেষণ'
                  : 'Market Analysis'}
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-content-main tracking-tight leading-tight">
              {t.compareTitle}
            </h3>

            <p className="text-[11px] sm:text-sm text-content-muted mt-1 font-medium leading-relaxed">
              {t.compareSubtitle}
            </p>

          </div>

          {/* Commodity Selector */}

          <div className="w-full sm:w-auto flex items-center gap-2 bg-surface-bg p-1.5 rounded-xl sm:rounded-2xl border border-surface-border">

            <span className="text-[10px] sm:text-xs font-bold text-content-muted pl-1.5 sm:pl-2 whitespace-nowrap">
              {lang === 'bn'
                ? 'পণ্য:'
                : 'Item:'}
            </span>

            <select
              value={selectedCommoditySlug}
              onChange={(e) =>
                setSelectedCommoditySlug(
                  e.target.value
                )
              }
              className="min-w-0 flex-1 sm:flex-none bg-white text-[#14532D] text-[11px] sm:text-sm font-bold px-2.5 sm:px-3 py-2 rounded-lg sm:rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
            >
              {COMPARABLE_COMMODITIES.map(
                (commodity) => (
                  <option
                    key={commodity.slug}
                    value={commodity.slug}
                  >
                    {lang === 'bn'
                      ? commodity.nameBn
                      : commodity.nameEn}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

        {/* =========================
            MOBILE COMMODITY PILLS
        ========================== */}

        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none -mx-1 px-1">

          {COMPARABLE_COMMODITIES.map(
            (commodity) => {
              const isSelected =
                selectedCommoditySlug ===
                commodity.slug;

              return (
                <button
                  key={commodity.slug}
                  type="button"
                  onClick={() =>
                    setSelectedCommoditySlug(
                      commodity.slug
                    )
                  }
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-brand-700 text-white border-brand-700 shadow-sm'
                      : 'bg-surface-bg text-content-muted border-surface-border hover:border-brand-300'
                  }`}
                >
                  {lang === 'bn'
                    ? commodity.nameBn
                    : commodity.nameEn}
                </button>
              );
            }
          )}

        </div>

        {/* =========================
            ACTIVE PRODUCT
        ========================== */}

        <div className="flex items-center justify-between gap-2 mb-3">

          <div className="min-w-0">

            <p className="text-[10px] sm:text-xs text-content-muted font-medium">
              {lang === 'bn'
                ? 'নির্বাচিত পণ্য'
                : 'Selected commodity'}
            </p>

            <p className="text-sm sm:text-base font-black text-content-main truncate">
              {lang === 'bn'
                ? activeCommodity.nameBn
                : activeCommodity.nameEn}
            </p>

          </div>

          <div className="shrink-0 text-[10px] sm:text-xs text-content-muted bg-surface-bg px-2.5 py-1.5 rounded-lg border border-surface-border">
            {lang === 'bn'
              ? `${toBanglaNumber(
                  comparisonData.length
                )} জেলা`
              : `${comparisonData.length} districts`}
          </div>

        </div>

        {/* =========================
            DESKTOP TABLE
        ========================== */}

        <div className="hidden md:block overflow-hidden rounded-2xl border border-surface-border">

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse text-xs sm:text-sm">

              <thead>
                <tr className="bg-surface-bg text-content-main font-black border-b border-surface-border">

                  <th className="py-3 px-4 whitespace-nowrap">
                    {t.districtHeader}
                  </th>

                  <th className="py-3 px-4 whitespace-nowrap">
                    {t.divisionHeader}
                  </th>

                  <th className="py-3 px-4 whitespace-nowrap">
                    {t.retailRangeHeader}
                  </th>

                  <th className="py-3 px-4 whitespace-nowrap">
                    {t.averageHeader}
                  </th>

                  <th className="py-3 px-4 whitespace-nowrap">
                    {t.comparisonHeader}
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-surface-borderLight">

                {comparisonData.map(
                  (row, index) => {
                    const unit =
                      lang === 'bn'
                        ? row.unitBn
                        : row.unitEn;

                    const isCheapest =
                      row.isLowest;

                    return (
                      <tr
                        key={
                          row.districtEn
                        }
                        className={`transition-colors ${
                          isCheapest
                            ? 'bg-emerald-50/80'
                            : index % 2 === 0
                            ? 'bg-white'
                            : 'bg-surface-bg/40'
                        } hover:bg-emerald-50/40`}
                      >

                        {/* District */}

                        <td className="py-3.5 px-4">

                          <div className="flex items-center gap-2 min-w-0">

                            <MapPin
                              className={`w-4 h-4 shrink-0 ${
                                isCheapest
                                  ? 'text-brand-700'
                                  : 'text-gray-400'
                              }`}
                            />

                            <span className="font-bold text-content-main whitespace-nowrap">
                              {lang === 'bn'
                                ? row.districtBn
                                : row.districtEn}
                            </span>

                            {isCheapest && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white whitespace-nowrap">

                                <Award className="w-3 h-3" />

                                <span>
                                  {
                                    t.lowestPriceTag
                                  }
                                </span>

                              </span>
                            )}

                          </div>

                        </td>

                        {/* Division */}

                        <td className="py-3.5 px-4 text-content-muted whitespace-nowrap">
                          {row.divisionEn}
                        </td>

                        {/* Range */}

                        <td className="py-3.5 px-4 font-semibold text-content-main whitespace-nowrap">
                          {lang === 'bn'
                            ? `৳${toBanglaNumber(
                                row.minPrice
                              )}–${toBanglaNumber(
                                row.maxPrice
                              )}`
                            : `৳${row.minPrice}–${row.maxPrice}`}
                        </td>

                        {/* Average */}

                        <td className="py-3.5 px-4 font-black text-brand-900 whitespace-nowrap">
                          {formatPrice(
                            row.avgPrice,
                            lang
                          )}{' '}
                          / {unit}
                        </td>

                        {/* Difference */}

                        <td className="py-3.5 px-4 whitespace-nowrap">

                          {isCheapest ? (
                            <span className="text-status-drop font-bold inline-flex items-center gap-1 text-xs">

                              <Check className="w-3.5 h-3.5" />

                              <span>
                                {lang ===
                                'bn'
                                  ? 'সর্বনিম্ন দর'
                                  : 'Lowest'}
                              </span>

                            </span>
                          ) : (
                            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-md text-xs border border-amber-200/70">
                              +
                              {formatPrice(
                                row.diffFromLowest ||
                                  0,
                                lang
                              )}{' '}
                              {t.costlierBy}
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =========================
            MOBILE CARDS
        ========================== */}

        <div className="md:hidden space-y-2.5">

          {comparisonData.map(
            (row, index) => {
              const unit =
                lang === 'bn'
                  ? row.unitBn
                  : row.unitEn;

              const isCheapest =
                row.isLowest;

              return (
                <div
                  key={row.districtEn}
                  className={`w-full rounded-xl border p-3 ${
                    isCheapest
                      ? 'bg-emerald-50/80 border-emerald-300'
                      : 'bg-white border-surface-border'
                  }`}
                >

                  {/* Top Row */}

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex items-center gap-2 min-w-0">

                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCheapest
                            ? 'bg-emerald-100'
                            : 'bg-surface-bg'
                        }`}
                      >
                        <MapPin
                          className={`w-4 h-4 ${
                            isCheapest
                              ? 'text-brand-700'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">

                        <p className="font-black text-sm text-content-main truncate">
                          {lang === 'bn'
                            ? row.districtBn
                            : row.districtEn}
                        </p>

                        <p className="text-[10px] text-content-muted">
                          {row.divisionEn}
                        </p>

                      </div>

                    </div>

                    {isCheapest && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black bg-emerald-600 text-white">

                        <Award className="w-3 h-3" />

                        <span>
                          {t.lowestPriceTag}
                        </span>

                      </span>
                    )}

                  </div>

                  {/* Price Details */}

                  <div className="grid grid-cols-2 gap-2 mt-3">

                    <div className="bg-surface-bg rounded-lg p-2.5 border border-surface-borderLight">

                      <p className="text-[9px] text-content-muted font-semibold">
                        {t.retailRangeHeader}
                      </p>

                      <p className="text-xs font-bold text-content-main mt-0.5">
                        {lang === 'bn'
                          ? `৳${toBanglaNumber(
                              row.minPrice
                            )}–${toBanglaNumber(
                              row.maxPrice
                            )}`
                          : `৳${row.minPrice}–${row.maxPrice}`}
                      </p>

                    </div>

                    <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">

                      <p className="text-[9px] text-content-muted font-semibold">
                        {t.averageHeader}
                      </p>

                      <p className="text-sm font-black text-brand-900 mt-0.5">
                        {formatPrice(
                          row.avgPrice,
                          lang
                        )}
                      </p>

                      <p className="text-[9px] text-content-muted">
                        / {unit}
                      </p>

                    </div>

                  </div>

                  {/* Comparison */}

                  <div className="mt-2.5">

                    {isCheapest ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/70 rounded-lg px-2.5 py-2 text-[10px] font-bold">

                        <Check className="w-3.5 h-3.5 shrink-0" />

                        <span>
                          {lang === 'bn'
                            ? 'এই পণ্যের সর্বনিম্ন গড় দর'
                            : 'Lowest average price'}
                        </span>

                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 bg-amber-50 rounded-lg px-2.5 py-2 border border-amber-100">

                        <span className="text-[10px] font-bold text-amber-800">
                          {t.comparisonHeader}
                        </span>

                        <span className="text-[10px] font-black text-amber-900">
                          +
                          {formatPrice(
                            row.diffFromLowest ||
                              0,
                            lang
                          )}{' '}
                          {t.costlierBy}
                        </span>

                      </div>
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* =========================
            DATA SOURCE NOTE
        ========================== */}

        <div className="mt-4 bg-surface-bg p-3 rounded-xl sm:rounded-2xl border border-surface-borderLight">

          <p className="text-[10px] sm:text-xs text-content-muted leading-relaxed">

            <span className="font-bold text-content-main">
              {lang === 'bn'
                ? 'তথ্য নোট:'
                : 'Data note:'}
            </span>{' '}

            {lang === 'bn'
              ? 'এই জেলা তুলনা বর্তমানে প্রদর্শনী ডেটার ওপর ভিত্তি করে দেখানো হচ্ছে। এটিকে সরকারি DAM-এর সরাসরি জেলা-ভিত্তিক মূল্য হিসেবে বিবেচনা করবেন না।'
              : 'This district comparison currently uses demonstration data. It should not be treated as direct district-level pricing from DAM.'}

          </p>

        </div>

      </div>

    </section>
  );
};