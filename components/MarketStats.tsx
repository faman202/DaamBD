'use client';

import React from 'react';
import { Language, MarketSummaryStats } from '@/lib/types';
import { translations, toBanglaNumber, formatPrice } from '@/lib/i18n';
import { TrendingDown, TrendingUp, CheckCircle2, Shield, Flame, Activity } from 'lucide-react';

interface MarketStatsProps {
  lang: Language;
  stats: MarketSummaryStats;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ lang, stats }) => {
  const t = translations[lang];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-card-subtle border border-surface-border">
        
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-surface-borderLight gap-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-700" />
            <h3 className="text-sm sm:text-base font-black text-content-main">
              {t.marketPulseTitle}
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs text-content-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {t.lastUpdated}: {lang === 'bn' ? toBanglaNumber(stats.lastUpdated) : stats.lastUpdated}
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          
          {/* Tracked Items */}
          <div className="bg-surface-bg rounded-xl p-3 border border-surface-borderLight flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-content-muted">
                {t.trackedCommodities}
              </p>
              <p className="text-lg sm:text-xl font-black text-content-main mt-0.5">
                {lang === 'bn' ? toBanglaNumber(stats.totalItems) : stats.totalItems}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-brand-700">
              <Shield className="w-4 h-4" />
            </div>
          </div>

          {/* Price Drops */}
          <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-emerald-800">
                {t.priceDrops}
              </p>
              <p className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5">
                {lang === 'bn' ? toBanglaNumber(stats.decreasedCount) : stats.decreasedCount}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-status-drop">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          {/* Price Spikes */}
          <div className="bg-red-50/70 rounded-xl p-3 border border-red-200/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-red-800">
                {t.priceSpikes}
              </p>
              <p className="text-lg sm:text-xl font-black text-status-spike mt-0.5">
                {lang === 'bn' ? toBanglaNumber(stats.increasedCount) : stats.increasedCount}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-status-spike">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* Stable Items */}
          <div className="bg-surface-bg rounded-xl p-3 border border-surface-borderLight flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-content-muted">
                {t.unchanged}
              </p>
              <p className="text-lg sm:text-xl font-black text-content-main mt-0.5">
                {lang === 'bn' ? toBanglaNumber(stats.stableCount) : stats.stableCount}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* Highlight ticker: top movers */}
        {(stats.topDropItem || stats.topSpikeItem) && (
          <div className="mt-3 pt-3 border-t border-surface-borderLight flex flex-wrap items-center justify-between gap-2 text-xs">
            {stats.topDropItem && (
              <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <span className="font-bold">{t.topDropItem}:</span>
                <span className="font-semibold">
                  {lang === 'bn' ? stats.topDropItem.nameBn : stats.topDropItem.nameEn}
                </span>
                <span className="text-status-drop font-black">
                  (↓ {formatPrice(stats.topDropItem.change, lang)})
                </span>
              </div>
            )}
            {stats.topSpikeItem && (
              <div className="flex items-center space-x-1.5 text-red-800 bg-red-50 px-2.5 py-1 rounded-lg">
                <span className="font-bold">{t.topSpikeItem}:</span>
                <span className="font-semibold">
                  {lang === 'bn' ? stats.topSpikeItem.nameBn : stats.topSpikeItem.nameEn}
                </span>
                <span className="text-status-spike font-black">
                  (↑ {formatPrice(stats.topSpikeItem.change, lang)})
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
