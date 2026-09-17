'use client';

import React from 'react';
import {
  Language,
  MarketSummaryStats,
} from '@/lib/types';
import {
  translations,
  toBanglaNumber,
  formatPrice,
} from '@/lib/i18n';

import {
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Shield,
  Activity,
} from 'lucide-react';

interface MarketStatsProps {
  lang: Language;
  stats: MarketSummaryStats;
}

export const MarketStats: React.FC<
  MarketStatsProps
> = ({
  lang,
  stats,
}) => {
  const t = translations[lang];

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-3 sm:-mt-4">

      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-card-subtle border border-surface-border overflow-hidden">

        {/* =========================
            Header
        ========================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-surface-borderLight">

          {/* Title */}

          <div className="flex items-center gap-2 min-w-0">

            <Activity className="w-4 h-4 text-brand-700 shrink-0" />

            <h3 className="text-sm sm:text-base font-black text-content-main truncate">
              {t.marketPulseTitle}
            </h3>

          </div>

          {/* Last Updated */}

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-content-muted min-w-0">

            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />

            <span className="truncate">
              {t.lastUpdated}:{' '}
              {lang === 'bn'
                ? toBanglaNumber(
                    String(
                      stats.lastUpdated
                    )
                  )
                : String(
                    stats.lastUpdated
                  )}
            </span>

          </div>

        </div>

        {/* =========================
            4 Statistics
        ========================== */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3">

          {/* =========================
              Tracked Items
          ========================== */}

          <div className="min-w-0 bg-surface-bg rounded-xl sm:rounded-2xl p-3 border border-surface-borderLight flex items-center justify-between gap-2">

            <div className="min-w-0">

              <p className="text-[10px] sm:text-xs font-semibold text-content-muted leading-tight truncate">
                {t.trackedCommodities}
              </p>

              <p className="text-lg sm:text-xl font-black text-content-main mt-0.5">
                {lang === 'bn'
                  ? toBanglaNumber(
                      stats.totalItems
                    )
                  : stats.totalItems}
              </p>

            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center text-brand-700">

              <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

            </div>

          </div>

          {/* =========================
              Price Drops
          ========================== */}

          <div className="min-w-0 bg-emerald-50/70 rounded-xl sm:rounded-2xl p-3 border border-emerald-200/60 flex items-center justify-between gap-2">

            <div className="min-w-0">

              <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 leading-tight truncate">
                {t.priceDrops}
              </p>

              <p className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5">
                {lang === 'bn'
                  ? toBanglaNumber(
                      stats.decreasedCount
                    )
                  : stats.decreasedCount}
              </p>

            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center text-status-drop">

              <TrendingDown className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

            </div>

          </div>

          {/* =========================
              Price Spikes
          ========================== */}

          <div className="min-w-0 bg-red-50/70 rounded-xl sm:rounded-2xl p-3 border border-red-200/60 flex items-center justify-between gap-2">

            <div className="min-w-0">

              <p className="text-[10px] sm:text-xs font-semibold text-red-800 leading-tight truncate">
                {t.priceSpikes}
              </p>

              <p className="text-lg sm:text-xl font-black text-status-spike mt-0.5">
                {lang === 'bn'
                  ? toBanglaNumber(
                      stats.increasedCount
                    )
                  : stats.increasedCount}
              </p>

            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl bg-red-100 flex items-center justify-center text-status-spike">

              <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

            </div>

          </div>

          {/* =========================
              Stable Items
          ========================== */}

          <div className="min-w-0 bg-surface-bg rounded-xl sm:rounded-2xl p-3 border border-surface-borderLight flex items-center justify-between gap-2">

            <div className="min-w-0">

              <p className="text-[10px] sm:text-xs font-semibold text-content-muted leading-tight truncate">
                {t.unchanged}
              </p>

              <p className="text-lg sm:text-xl font-black text-content-main mt-0.5">
                {lang === 'bn'
                  ? toBanglaNumber(
                      stats.stableCount
                    )
                  : stats.stableCount}
              </p>

            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">

              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

            </div>

          </div>

        </div>

        {/* =========================
            Top Movers
        ========================== */}

        {(stats.topDropItem ||
          stats.topSpikeItem) && (

          <div className="mt-3 pt-3 border-t border-surface-borderLight">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

              {/* =========================
                  Top Drop
              ========================== */}

              {stats.topDropItem && (

                <div className="min-w-0 flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-800 bg-emerald-50 px-2.5 py-2 rounded-lg sm:rounded-xl border border-emerald-100">

                  <TrendingDown className="w-3.5 h-3.5 shrink-0 text-status-drop" />

                  <span className="font-bold shrink-0">
                    {t.topDropItem}:
                  </span>

                  <span className="font-semibold truncate">
                    {lang === 'bn'
                      ? stats.topDropItem
                          .nameBn
                      : stats.topDropItem
                          .nameEn}
                  </span>

                  <span className="text-status-drop font-black shrink-0 ml-auto">
                    ↓{' '}
                    {formatPrice(
                      stats.topDropItem
                        .change,
                      lang
                    )}
                  </span>

                </div>

              )}

              {/* =========================
                  Top Spike
              ========================== */}

              {stats.topSpikeItem && (

                <div className="min-w-0 flex items-center gap-1.5 text-[10px] sm:text-xs text-red-800 bg-red-50 px-2.5 py-2 rounded-lg sm:rounded-xl border border-red-100">

                  <TrendingUp className="w-3.5 h-3.5 shrink-0 text-status-spike" />

                  <span className="font-bold shrink-0">
                    {t.topSpikeItem}:
                  </span>

                  <span className="font-semibold truncate">
                    {lang === 'bn'
                      ? stats.topSpikeItem
                          .nameBn
                      : stats.topSpikeItem
                          .nameEn}
                  </span>

                  <span className="text-status-spike font-black shrink-0 ml-auto">
                    ↑{' '}
                    {formatPrice(
                      stats.topSpikeItem
                        .change,
                      lang
                    )}
                  </span>

                </div>

              )}

            </div>

          </div>

        )}

      </div>

    </section>
  );
};