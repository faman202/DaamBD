'use client';

import React from 'react';
import { DailyPriceItem, Language, PriceType } from '@/lib/types';
import { translations, formatPriceRange, formatPrice, toBanglaNumber } from '@/lib/i18n';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  LineChart,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface PriceCardProps {
  item: DailyPriceItem;
  lang: Language;
  priceType: PriceType;
  onOpenCalculator: (item: DailyPriceItem) => void;
  onOpenTrend: (item: DailyPriceItem) => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  item,
  lang,
  priceType,
  onOpenCalculator,
  onOpenTrend,
}) => {
  const t = translations[lang];
  const priceData = priceType === 'retail' ? item.retail : item.wholesale;
  const unit = lang === 'bn' ? priceData.unitBn : priceData.unitEn;

  // Status Badge Logic
  const renderMovementBadge = () => {
    if (item.movement === 'down') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#16A34A] border border-[#16A34A]/30">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>
            {lang === 'bn'
              ? `↓ ${toBanglaNumber(Math.abs(item.priceChange))} টাকা কমেছে`
              : `↓ ৳${Math.abs(item.priceChange)} dropped`}
          </span>
        </span>
      );
    }
    if (item.movement === 'up') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>
            {lang === 'bn'
              ? `↑ ${toBanglaNumber(Math.abs(item.priceChange))} টাকা বেড়েছে`
              : `↑ ৳${Math.abs(item.priceChange)} increased`}
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        <Minus className="w-3.5 h-3.5" />
        <span>{lang === 'bn' ? '— অপরিবর্তিত' : '— Stable'}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-border shadow-card-subtle hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top indicator bar & category */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
            {lang === 'bn' ? item.categoryBn : item.categoryEn}
          </span>
          {renderMovementBadge()}
        </div>

        {/* Product Names */}
        <div className="mb-3">
          <h4 className="text-base sm:text-lg font-bold text-content-main group-hover:text-brand-700 transition-colors leading-snug">
            {lang === 'bn' ? item.nameBn : item.nameEn}
          </h4>
          <p className="text-xs text-content-muted font-medium mt-0.5">
            {lang === 'bn' ? item.nameEn : item.nameBn}
          </p>
        </div>

        {/* Anomaly Warning Banner if flagged */}
        {item.anomalyStatus === 'warning' && (
          <div className="mb-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-2 text-xs flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{t.anomalyAlert}</span>
          </div>
        )}

        {/* Price Display Section */}
        <div className="bg-surface-bg rounded-xl p-3.5 border border-surface-borderLight mb-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-content-muted font-medium">
              {priceType === 'retail' ? t.retailTab : t.wholesaleTab}
            </span>
            <span className="text-[11px] text-content-light">
              {t.averagePrice}: <strong className="text-content-main font-bold">{formatPrice(priceData.avgPrice, lang)}</strong>
            </span>
          </div>

          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl sm:text-2xl font-black text-brand-900 tracking-tight">
              {formatPriceRange(priceData.minPrice, priceData.maxPrice, unit, lang)}
            </span>
          </div>
        </div>

        {/* Source Attribution & Last Collection Time */}
        <div className="flex items-center justify-between text-[11px] text-content-muted pt-1 pb-3 border-b border-surface-borderLight">
          <div className="flex items-center space-x-1 text-emerald-800 font-semibold" title={item.source.nameEn}>
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[150px]">
              {lang === 'bn' ? item.source.nameBn : item.source.nameEn}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            <span>{lang === 'bn' ? 'আজ ৯:০০ AM' : 'Today 9:00 AM'}</span>
          </div>
        </div>
      </div>

      {/* Action Footer: Calculator & Trend Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-1">
        <button
          onClick={() => onOpenCalculator(item)}
          className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/70 text-xs font-bold transition-all shadow-sm active:scale-95"
          title={t.calculatorSubtitle}
        >
          <Calculator className="w-3.5 h-3.5 text-amber-700" />
          <span>{t.calculatorBtn}</span>
        </button>

        <button
          onClick={() => onOpenTrend(item)}
          className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/70 text-xs font-bold transition-all shadow-sm active:scale-95"
          title={t.trendSubtitle}
        >
          <LineChart className="w-3.5 h-3.5 text-brand-700" />
          <span>{t.trendBtn}</span>
        </button>
      </div>

    </div>
  );
};
