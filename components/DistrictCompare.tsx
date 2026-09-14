'use client';

import React, { useState } from 'react';
import { Language } from '@/lib/types';
import { translations, formatPrice, toBanglaNumber } from '@/lib/i18n';
import { getCrossDistrictComparison } from '@/lib/mockData';
import {
  MapPin,
  TrendingDown,
  Sparkles,
  Layers,
  Award,
  ArrowUpDown,
  Check
} from 'lucide-react';

interface DistrictCompareProps {
  lang: Language;
}

const COMPARABLE_COMMODITIES = [
  { slug: 'local-onion', nameBn: 'দেশি পেঁয়াজ', nameEn: 'Local Onion' },
  { slug: 'potato-diamond', nameBn: 'আলু (ডায়মন্ড)', nameEn: 'Potato (Diamond)' },
  { slug: 'green-chili', nameBn: 'কাঁচা মরিচ', nameEn: 'Green Chili' },
  { slug: 'coarse-rice', nameBn: 'মোটা চাল (স্বর্ণা)', nameEn: 'Coarse Rice' },
  { slug: 'fine-rice', nameBn: 'সরু চাল (মিনিকেট)', nameEn: 'Fine Rice (Miniket)' },
  { slug: 'broiler-chicken', nameBn: 'ব্রয়লার মুরগি', nameEn: 'Broiler Chicken' },
  { slug: 'farm-eggs-hali', nameBn: 'ফার্মের ডিম (হালি)', nameEn: 'Farm Eggs (Hali)' },
  { slug: 'loose-soybean-oil', nameBn: 'খোলা সয়াবিন তেল', nameEn: 'Loose Soybean Oil' },
  { slug: 'beef-standard', nameBn: 'গরুর মাংস', nameEn: 'Beef (Standard)' },
];

export const DistrictCompare: React.FC<DistrictCompareProps> = ({ lang }) => {
  const t = translations[lang];
  const [selectedCommoditySlug, setSelectedCommoditySlug] = useState<string>('local-onion');

  const comparisonData = getCrossDistrictComparison(selectedCommoditySlug);
  const activeCommodity = COMPARABLE_COMMODITIES.find((c) => c.slug === selectedCommoditySlug) || COMPARABLE_COMMODITIES[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-surface-border shadow-card-subtle space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-surface-borderLight">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-brand-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বাজার বিশ্লেষণ' : 'Market Analysis'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-content-main tracking-tight">
              {t.compareTitle}
            </h3>
            <p className="text-xs sm:text-sm text-content-muted mt-1 font-medium">
              {t.compareSubtitle}
            </p>
          </div>

          {/* Commodity Selection Dropdown / Selector */}
          <div className="flex items-center space-x-2 bg-surface-bg p-1.5 rounded-2xl border border-surface-border">
            <span className="text-xs font-bold text-content-muted pl-2 hidden sm:inline">
              {lang === 'bn' ? 'পণ্য নির্বাচন:' : 'Item:'}
            </span>
            <select
              value={selectedCommoditySlug}
              onChange={(e) => setSelectedCommoditySlug(e.target.value)}
              className="bg-white text-[#14532D] text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
            >
              {COMPARABLE_COMMODITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {lang === 'bn' ? c.nameBn : c.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Commodity Fast Select Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {COMPARABLE_COMMODITIES.map((c) => {
            const isSelected = selectedCommoditySlug === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => setSelectedCommoditySlug(c.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-brand-700 text-white border-brand-700 shadow-sm'
                    : 'bg-surface-bg text-content-muted border-surface-border hover:border-brand-300'
                }`}
              >
                {lang === 'bn' ? c.nameBn : c.nameEn}
              </button>
            );
          })}
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-surface-border">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-surface-bg text-content-main font-black border-b border-surface-border text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{t.districtHeader}</th>
                <th className="py-3 px-4 hidden sm:table-cell">{t.divisionHeader}</th>
                <th className="py-3 px-4">{t.retailRangeHeader}</th>
                <th className="py-3 px-4">{t.averageHeader}</th>
                <th className="py-3 px-4">{t.comparisonHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-borderLight">
              {comparisonData.map((row, index) => {
                const unit = lang === 'bn' ? row.unitBn : row.unitEn;
                const isCheapest = row.isLowest;

                return (
                  <tr
                    key={row.districtEn}
                    className={`transition-colors ${
                      isCheapest
                        ? 'bg-emerald-50/80 font-bold'
                        : index % 2 === 0
                        ? 'bg-white'
                        : 'bg-surface-bg/40'
                    } hover:bg-emerald-50/40`}
                  >
                    {/* District */}
                    <td className="py-3.5 px-4 font-bold text-content-main flex items-center space-x-2">
                      <MapPin className={`w-4 h-4 ${isCheapest ? 'text-brand-700' : 'text-gray-400'}`} />
                      <span>{lang === 'bn' ? row.districtBn : row.districtEn}</span>
                      {isCheapest && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black bg-emerald-600 text-white shadow-sm">
                          <Award className="w-3 h-3" />
                          <span>{t.lowestPriceTag}</span>
                        </span>
                      )}
                    </td>

                    {/* Division */}
                    <td className="py-3.5 px-4 text-content-muted hidden sm:table-cell">
                      {row.divisionEn}
                    </td>

                    {/* Retail Range */}
                    <td className="py-3.5 px-4 font-semibold text-content-main">
                      {lang === 'bn'
                        ? `৳${toBanglaNumber(row.minPrice)}–${toBanglaNumber(row.maxPrice)}`
                        : `৳${row.minPrice}–${row.maxPrice}`}
                    </td>

                    {/* Average Price */}
                    <td className="py-3.5 px-4 font-black text-brand-900">
                      {formatPrice(row.avgPrice, lang)} / {unit}
                    </td>

                    {/* Difference Tag */}
                    <td className="py-3.5 px-4">
                      {isCheapest ? (
                        <span className="text-status-drop font-bold flex items-center space-x-1 text-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'বেস সর্বনিম্ন দর' : 'Base Lowest'}</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-md text-xs border border-amber-200/70">
                          +{formatPrice(row.diffFromLowest || 0, lang)} {t.costlierBy}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Insights Footer */}
        <div className="bg-surface-bg p-3.5 rounded-2xl border border-surface-borderLight text-xs text-content-muted flex items-center justify-between">
          <p>
            {lang === 'bn'
              ? `💡 টিপস: উত্তরবঙ্গের জেলাগুলোতে (যেমন: রাজশাহী, বগুড়া) শাকসবজি ও আলুর দাম সচরাচর ঢাকার চেয়ে ১০-১৫% কম থাকে।`
              : `💡 Tip: Northern production hubs (e.g. Bogura, Rajshahi) typically record 10-15% lower rates for vegetables than Dhaka.`}
          </p>
        </div>

      </div>
    </section>
  );
};
