'use client';

import React from 'react';
import { DailyPriceItem, Language, PriceType } from '@/lib/types';
import { translations, formatPrice, toBanglaNumber } from '@/lib/i18n';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  X,
  Calendar,
  ShieldAlert,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface PriceTrendModalProps {
  item: DailyPriceItem | null;
  lang: Language;
  priceType: PriceType;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceTrendModal: React.FC<PriceTrendModalProps> = ({
  item,
  lang,
  priceType,
  isOpen,
  onClose,
}) => {
  const t = translations[lang];

  if (!isOpen || !item) return null;

  const history = item.history30Days || [];
  const prices = history.map((h) => h.avgPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgMonthlyPrice = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 10) / 10;
  
  const unit = lang === 'bn' ? item.retail.unitBn : item.retail.unitEn;

  // Generate SVG path coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const priceSpread = maxPrice - minPrice || 1;

  const points = history.map((point, index) => {
    const x = paddingX + (index / (history.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - ((point.avgPrice - minPrice) / priceSpread) * chartHeight;
    return { x, y, ...point };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-surface-border animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#14532D] to-[#15803D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/60 border border-emerald-400/40 flex items-center justify-center">
              <LineChartIcon className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-snug">
                {t.trendTitle}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {lang === 'bn' ? item.nameBn : item.nameEn} ({item.districtBn || item.districtEn})
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
              <div className="flex items-center space-x-1 text-emerald-800 text-[11px] font-bold">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.lowestInMonth}</span>
              </div>
              <p className="text-base sm:text-xl font-black text-brand-900 mt-1">
                {formatPrice(minPrice, lang)} <span className="text-xs font-normal">/{unit}</span>
              </p>
            </div>

            <div className="bg-red-50 rounded-2xl p-3 border border-red-200">
              <div className="flex items-center space-x-1 text-red-800 text-[11px] font-bold">
                <ArrowUp className="w-3.5 h-3.5 text-red-600" />
                <span>{t.highestInMonth}</span>
              </div>
              <p className="text-base sm:text-xl font-black text-red-900 mt-1">
                {formatPrice(maxPrice, lang)} <span className="text-xs font-normal">/{unit}</span>
              </p>
            </div>

            <div className="bg-surface-bg rounded-2xl p-3 border border-surface-border">
              <div className="text-[11px] font-bold text-content-muted">
                {t.monthAvg}
              </div>
              <p className="text-base sm:text-xl font-black text-content-main mt-1">
                {formatPrice(avgMonthlyPrice, lang)} <span className="text-xs font-normal">/{unit}</span>
              </p>
            </div>

          </div>

          {/* SVG Price History Chart */}
          <div className="bg-surface-bg p-4 rounded-2xl border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-content-muted">
              <span>{lang === 'bn' ? '৩০ দিন পূর্বে' : '30 Days Ago'}</span>
              <span className="text-brand-800 font-bold">{lang === 'bn' ? 'মূল্য প্রবণতা' : 'Price Trend'}</span>
              <span>{lang === 'bn' ? 'আজ' : 'Today'}</span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 sm:h-56"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#15803D" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#15803D" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={svgWidth - paddingX}
                  y2={paddingY}
                  stroke="#E2E8E2"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight / 2}
                  x2={svgWidth - paddingX}
                  y2={svgHeight / 2}
                  stroke="#E2E8E2"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY}
                  stroke="#E2E8E2"
                  strokeDasharray="4 4"
                />

                {/* Shaded Area */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#15803D"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={idx === points.length - 1 ? 5 : 2.5}
                    className={
                      idx === points.length - 1
                        ? 'fill-brand-700 stroke-white stroke-2'
                        : 'fill-emerald-600'
                    }
                  >
                    <title>{`${p.date}: ৳${p.avgPrice}`}</title>
                  </circle>
                ))}
              </svg>
            </div>
          </div>

          <p className="text-xs text-content-muted leading-relaxed">
            {lang === 'bn'
              ? 'উৎস: কৃষি মন্ত্রণালয় (MOA) এবং কৃষি বিপণন অধিদপ্তর (DAM) দৈনিক বাজার রিপোর্ট।'
              : 'Source: Ministry of Agriculture (MOA) and DAM Daily Market Price Reports.'}
          </p>

        </div>

        {/* Modal Footer */}
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
