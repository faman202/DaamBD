'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DailyPriceItem, Language, PriceType } from '@/lib/types';
import { translations } from '@/lib/i18n';

import { Header } from '@/components/Header';
import { HeroSearch } from '@/components/HeroSearch';
import { MarketStats } from '@/components/MarketStats';
import { PriceCard } from '@/components/PriceCard';
import { PriceConverter } from '@/components/PriceConverter';
import { DistrictCompare } from '@/components/DistrictCompare';
import { PriceTrendModal } from '@/components/PriceTrendModal';
import { TransparencyModal } from '@/components/TransparencyModal';

import {
  SearchX,
  Heart,
  ExternalLink,
  Activity,
  RefreshCw,
} from 'lucide-react';

type AnyObject = Record<string, unknown>;

function isObject(value: unknown): value is AnyObject {
  return typeof value === 'object' && value !== null;
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
}

function getNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const number = Number(
        value.replace(/,/g, '').trim()
      );

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return 0;
}

function getPrice(
  item: DailyPriceItem,
  priceType: PriceType
): number {
  const object = item as unknown as AnyObject;

  const selected =
    priceType === 'retail'
      ? object.retail
      : object.wholesale;

  if (isObject(selected)) {
    const number = getNumber(
      selected.avgPrice,
      selected.averagePrice,
      selected.avg,
      selected.average,
      selected.retailAvg,
      selected.wholesaleAvg,
      selected.retailAverage,
      selected.wholesaleAverage,
      selected.retail_price,
      selected.wholesale_price,
      selected.retailPrice,
      selected.wholesalePrice,
      selected.price
    );

    if (number > 0) {
      return number;
    }
  }

  if (priceType === 'retail') {
    return getNumber(
      object.retailAvg,
      object.retailAverage,
      object.retailPrice,
      object.retail_price,
      object.price,
      object.avgPrice,
      object.averagePrice
    );
  }

  return getNumber(
    object.wholesaleAvg,
    object.wholesaleAverage,
    object.wholesalePrice,
    object.wholesale_price,
    object.avgPrice,
    object.averagePrice
  );
}

function normalizeCategory(value: unknown): string {
  return getText(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[-_]/g, ' ');
}

function categoryMatches(
  item: DailyPriceItem,
  selectedCategory: string
): boolean {
  if (
    !selectedCategory ||
    selectedCategory === 'all'
  ) {
    return true;
  }

  const object = item as unknown as AnyObject;

  const selected = normalizeCategory(
    selectedCategory
  );

  const possibleCategories = [
    object.categorySlug,
    object.category,
    object.categoryBn,
    object.categoryEn,
    object.categoryName,
    object.category_name,
    object.category_name_bn,
    object.category_name_en,
  ]
    .map(normalizeCategory)
    .filter(Boolean);

  if (possibleCategories.includes(selected)) {
    return true;
  }

  const aliases: Record<string, string[]> = {
    grains: [
      'চাল ও খাদ্যশস্য',
      'চাল',
      'খাদ্যশস্য',
      'rice',
      'rice and grains',
      'grains',
      'food grains',
    ],

    pulses: [
      'ডাল ও শিম',
      'ডাল',
      'শিম',
      'pulses',
      'pulse',
      'lentil',
      'legumes',
    ],

    vegetables: [
      'শাকসবজি',
      'সবজি',
      'vegetables',
      'vegetable',
      'veggies',
    ],

    'meat-eggs': [
      'মাংস ও ডিম',
      'মাংস',
      'ডিম',
      'meat and eggs',
      'meat',
      'eggs',
      'egg',
      'poultry',
    ],

    fish: [
      'মাছ',
      'fish',
      'fishes',
    ],

    spices: [
      'মসলা',
      'মশলা',
      'spices',
      'spice',
    ],

    oils: [
      'ভোজ্যতেল',
      'তেল',
      'edible oil',
      'cooking oil',
      'oil',
    ],

    essentials: [
      'নিত্যপণ্য',
      'essential',
      'essentials',
      'daily essentials',
    ],
  };

  const allowed = aliases[selected] || [selected];

  return possibleCategories.some((category) =>
    allowed.some(
      (alias) =>
        category === alias ||
        category.includes(alias) ||
        alias.includes(category)
    )
  );
}

function getSearchableText(
  item: DailyPriceItem
): string {
  const object = item as unknown as AnyObject;

  return [
    object.nameBn,
    object.nameEn,

    object.commodityNameBn,
    object.commodityNameEn,
    object.commodityName,

    object.commodity_name_bn,
    object.commodity_name_en,
    object.commodity_name,

    object.textBn,
    object.textEn,
    object.text_bn,
    object.text_en,

    object.categoryBn,
    object.categoryEn,
    object.category,

    object.categoryName,
    object.category_name,
    object.category_name_bn,
    object.category_name_en,
  ]
    .map((value) =>
      getText(value).toLowerCase()
    )
    .filter(Boolean)
    .join(' ');
}

export default function Home() {
  const [lang, setLang] =
    useState<Language>('bn');

  const [selectedDistrict, setSelectedDistrict] =
    useState<string>('Dhaka');

  const [priceType, setPriceType] =
    useState<PriceType>('retail');

  const [searchQuery, setSearchQuery] =
    useState<string>('');

  const [selectedCategory, setSelectedCategory] =
    useState<string>('all');

  const [movementFilter, setMovementFilter] =
    useState<string>('all');

  const [sortBy, setSortBy] =
    useState<string>('default');

  const [calculatorItem, setCalculatorItem] =
    useState<DailyPriceItem | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] =
    useState<boolean>(false);

  const [trendItem, setTrendItem] =
    useState<DailyPriceItem | null>(null);

  const [isTrendOpen, setIsTrendOpen] =
    useState<boolean>(false);

  const [isTransparencyOpen, setIsTransparencyOpen] =
    useState<boolean>(false);

  const [allDistrictItems, setAllDistrictItems] =
    useState<DailyPriceItem[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<string | null>(null);

  /*
   * IMPORTANT:
   * Only add a district here when its official DAM ID
   * has been confirmed from the DAM dropdown API.
   *
   * Dhaka = 46 is confirmed.
   */
  const districtIds: Record<string, number> = {
    Dhaka: 46,
  };

  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        const districtId =
          districtIds[selectedDistrict];

        /*
         * Never silently use Dhaka for another district.
         * That was a serious data-integrity problem.
         */
        if (!districtId) {
          throw new Error(
            lang === 'bn'
              ? `${selectedDistrict} জেলার সরকারি DAM ID এখনো সংযুক্ত করা হয়নি।`
              : `The official DAM ID for ${selectedDistrict} has not been connected yet.`
          );
        }

        const response = await fetch(
          `/api/prices?district=${districtId}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch market prices: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data?.success) {
          throw new Error(
            data?.error ||
              'Price API failed'
          );
        }

        if (cancelled) {
          return;
        }

        const items = Array.isArray(data?.items)
          ? data.items
          : [];

        setAllDistrictItems(items);

        const apiTimestamp = getText(
          data?.timestamp,
          data?.updatedAt,
          data?.lastUpdated
        );

        setLastUpdated(
          apiTimestamp ||
            new Date().toISOString()
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'DaamBD Price API Error:',
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : '';

        setError(
          message ||
            (
              lang === 'bn'
                ? 'বাজারদরের তথ্য লোড করা যাচ্ছে না।'
                : 'Unable to load market prices.'
            )
        );

        setAllDistrictItems([]);
        setLastUpdated(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPrices();

    return () => {
      cancelled = true;
    };
  }, [selectedDistrict, lang]);

  const summaryStats = useMemo(() => {
    const totalItems =
      allDistrictItems.length;

    const increasedCount =
      allDistrictItems.filter(
        (item) =>
          Number(item.priceChange || 0) > 0
      ).length;

    const decreasedCount =
      allDistrictItems.filter(
        (item) =>
          Number(item.priceChange || 0) < 0
      ).length;

    const stableCount =
      allDistrictItems.filter(
        (item) =>
          Number(item.priceChange || 0) === 0
      ).length;

    const sortedByChange =
      [...allDistrictItems].sort(
        (a, b) =>
          Number(b.priceChange || 0) -
          Number(a.priceChange || 0)
      );

    const sortedByDrop =
      [...allDistrictItems].sort(
        (a, b) =>
          Number(a.priceChange || 0) -
          Number(b.priceChange || 0)
      );

    const topSpike =
      sortedByChange[0];

    const topDrop =
      sortedByDrop[0];

    const spikeChange =
      Number(
        topSpike?.priceChange || 0
      );

    const dropChange =
      Number(
        topDrop?.priceChange || 0
      );

    return {
      totalItems,

      increasedCount,

      decreasedCount,

      stableCount,

      topSpikeItem:
        topSpike && spikeChange > 0
          ? {
              nameBn: topSpike.nameBn,
              nameEn: topSpike.nameEn,
              change: spikeChange,
              pctChange: spikeChange,
            }
          : null,

      topDropItem:
        topDrop && dropChange < 0
          ? {
              nameBn: topDrop.nameBn,
              nameEn: topDrop.nameEn,
              change: dropChange,
              pctChange: Math.abs(
                dropChange
              ),
            }
          : null,

      lastUpdated:
        lastUpdated ||
        new Date().toISOString(),
    };
  }, [
    allDistrictItems,
    lastUpdated,
  ]);

  const filteredItems = useMemo(() => {
    let result =
      [...allDistrictItems];

    /*
     * Category
     */
    if (
      selectedCategory !== 'all'
    ) {
      result =
        result.filter((item) =>
          categoryMatches(
            item,
            selectedCategory
          )
        );
    }

    /*
     * Search
     */
    if (
      searchQuery.trim() !== ''
    ) {
      const query =
        searchQuery
          .toLowerCase()
          .trim();

      result =
        result.filter(
          (item) =>
            getSearchableText(
              item
            ).includes(query)
        );
    }

    /*
     * Movement
     */
    if (
      movementFilter !== 'all'
    ) {
      result =
        result.filter(
          (item) => {
            const change =
              Number(
                item.priceChange || 0
              );

            if (
              movementFilter === 'up'
            ) {
              return change > 0;
            }

            if (
              movementFilter === 'down'
            ) {
              return change < 0;
            }

            if (
              movementFilter === 'stable'
            ) {
              return change === 0;
            }

            const object =
              item as unknown as AnyObject;

            return (
              getText(
                object.movement
              ) ===
              movementFilter
            );
          }
        );
    }

    /*
     * Sort
     */
    if (
      sortBy === 'price-low'
    ) {
      result.sort(
        (a, b) =>
          getPrice(
            a,
            priceType
          ) -
          getPrice(
            b,
            priceType
          )
      );
    }

    if (
      sortBy === 'price-high'
    ) {
      result.sort(
        (a, b) =>
          getPrice(
            b,
            priceType
          ) -
          getPrice(
            a,
            priceType
          )
      );
    }

    if (
      sortBy === 'change'
    ) {
      result.sort(
        (a, b) =>
          Math.abs(
            Number(
              b.priceChange || 0
            )
          ) -
          Math.abs(
            Number(
              a.priceChange || 0
            )
          )
      );
    }

    return result;
  }, [
    allDistrictItems,
    selectedCategory,
    searchQuery,
    movementFilter,
    sortBy,
    priceType,
  ]);

  const t =
    translations[lang];

  const handleOpenCalculator = (
    item: DailyPriceItem
  ) => {
    setCalculatorItem(item);
    setIsCalculatorOpen(true);
  };

  const handleOpenTrend = (
    item: DailyPriceItem
  ) => {
    setTrendItem(item);
    setIsTrendOpen(true);
  };

  const districtDisplayName =
    lang === 'bn'
      ? selectedDistrict === 'Dhaka'
        ? 'ঢাকা'
        : selectedDistrict
      : selectedDistrict;

  const formattedUpdatedTime =
    useMemo(() => {
      if (!lastUpdated) {
        return '';
      }

      const date =
        new Date(lastUpdated);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return '';
      }

      return new Intl.DateTimeFormat(
        lang === 'bn'
          ? 'bn-BD'
          : 'en-BD',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone:
            'Asia/Dhaka',
        }
      ).format(date);
    }, [
      lastUpdated,
      lang,
    ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMovementFilter('all');
    setSortBy('default');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] overflow-x-hidden">

      {/* Header */}
      <Header
        lang={lang}
        onLanguageChange={
          setLang
        }
        selectedDistrict={
          selectedDistrict
        }
        onDistrictChange={
          setSelectedDistrict
        }
        onOpenTransparency={() =>
          setIsTransparencyOpen(
            true
          )
        }
      />

      {/* Hero / Search */}
      <HeroSearch
        lang={lang}
        searchQuery={
          searchQuery
        }
        onSearchChange={
          setSearchQuery
        }
        selectedCategory={
          selectedCategory
        }
        onCategoryChange={
          setSelectedCategory
        }
        priceType={
          priceType
        }
        onPriceTypeChange={
          setPriceType
        }
        movementFilter={
          movementFilter
        }
        onMovementFilterChange={
          setMovementFilter
        }
        sortBy={sortBy}
        onSortByChange={
          setSortBy
        }
        totalFound={
          filteredItems.length
        }
      />

      {/* Statistics */}
      <MarketStats
        lang={lang}
        stats={
          summaryStats
        }
      />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">

        {/* Section heading */}
        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-black text-content-main tracking-tight flex items-center gap-2">
            <span className="truncate">
              {lang === 'bn'
                ? `আজকের বাজারদর (${districtDisplayName})`
                : `Today's Market Rates (${selectedDistrict})`}
            </span>
          </h3>

          <p className="text-xs text-content-muted mt-1 font-semibold">
            {lang === 'bn'
              ? 'সরকারি DAM-এর দৈনিক বাজারদর'
              : 'Daily market prices sourced from DAM'}
          </p>

          {formattedUpdatedTime && (
            <p className="text-[11px] text-content-muted mt-1 break-words">
              {lang === 'bn'
                ? `সর্বশেষ আপডেট: ${formattedUpdatedTime}`
                : `Last updated: ${formattedUpdatedTime}`}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-surface-border shadow-card-subtle max-w-md mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-brand-700">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-content-main">
                {lang === 'bn'
                  ? 'বাজারদর লোড হচ্ছে...'
                  : 'Loading market prices...'}
              </h4>

              <p className="text-xs text-content-muted mt-1">
                {lang === 'bn'
                  ? 'সরকারি DAM উৎস থেকে তথ্য আনা হচ্ছে।'
                  : 'Fetching market data from DAM.'}
              </p>
            </div>
          </div>
        ) : error ? (
          /* Error */
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-red-200 shadow-card-subtle max-w-md mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <SearchX className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-content-main">
                {lang === 'bn'
                  ? 'তথ্য পাওয়া যাচ্ছে না'
                  : 'Unable to load prices'}
              </h4>

              <p className="text-xs text-content-muted mt-2 leading-relaxed">
                {error}
              </p>
            </div>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="px-4 py-2 rounded-xl bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 transition-all shadow-md"
            >
              {lang === 'bn'
                ? 'আবার চেষ্টা করুন'
                : 'Try Again'}
            </button>
          </div>
        ) : filteredItems.length > 0 ? (
          /* Price cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map(
              (
                item: DailyPriceItem
              ) => {
                const object =
                  item as unknown as AnyObject;

                const itemId =
                  getText(
                    object.id,
                    object.commodityId,
                    object.commodity_id,
                    object.productId,
                    object.product_id,
                    item.nameBn,
                    item.nameEn
                  );

                return (
                  <PriceCard
                    key={itemId}
                    item={item}
                    lang={lang}
                    priceType={
                      priceType
                    }
                    onOpenCalculator={
                      handleOpenCalculator
                    }
                    onOpenTrend={
                      handleOpenTrend
                    }
                  />
                );
              }
            )}
          </div>
        ) : (
          /* No results */
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-surface-border shadow-card-subtle max-w-md mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-brand-700">
              <SearchX className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-content-main">
                {allDistrictItems.length > 0
                  ? lang === 'bn'
                    ? 'এই ফিল্টারে কোনো পণ্য পাওয়া যায়নি'
                    : 'No products match these filters'
                  : t.noItemsFound}
              </h4>

              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                {allDistrictItems.length > 0
                  ? lang === 'bn'
                    ? 'ক্যাটাগরি, অনুসন্ধান বা দামের ফিল্টার পরিবর্তন করে দেখুন।'
                    : 'Try changing your category, search or price movement filter.'
                  : lang === 'bn'
                    ? 'বর্তমানে এই এলাকার জন্য কোনো বাজারদরের তথ্য পাওয়া যায়নি।'
                    : 'No market price data is currently available for this area.'}
              </p>
            </div>

            <button
              onClick={
                resetFilters
              }
              className="px-4 py-2 rounded-xl bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 transition-all shadow-md"
            >
              {lang === 'bn'
                ? 'ফিল্টার রিসেট করুন'
                : 'Reset All Filters'}
            </button>
          </div>
        )}

        {/* District comparison */}
        <DistrictCompare
          lang={lang}
        />
      </main>

      {/* Calculator */}
      <PriceConverter
        item={
          calculatorItem
        }
        lang={lang}
        priceType={
          priceType
        }
        isOpen={
          isCalculatorOpen
        }
        onClose={() =>
          setIsCalculatorOpen(
            false
          )
        }
      />

      {/* Trend */}
      <PriceTrendModal
        item={
          trendItem
        }
        lang={lang}
        priceType={
          priceType
        }
        isOpen={
          isTrendOpen
        }
        onClose={() =>
          setIsTrendOpen(
            false
          )
        }
      />

      {/* Transparency */}
      <TransparencyModal
        lang={lang}
        isOpen={
          isTransparencyOpen
        }
        onClose={() =>
          setIsTransparencyOpen(
            false
          )
        }
      />

      {/* Footer */}
      <footer className="bg-[#14532D] text-white border-t border-emerald-900 mt-12 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-5 pb-6 border-b border-emerald-800/60">

            {/* Brand */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl">
                <Activity className="w-6 h-6" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xl font-black tracking-tight text-white">
                  DaamBD{' '}
                  <span className="text-emerald-300 text-xs font-semibold">
                    | আজকের বাজারদর
                  </span>
                </h4>

                <p className="text-xs text-emerald-200/80">
                  {t.brandTagline}
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-emerald-200">
              <button
                onClick={() =>
                  setIsTransparencyOpen(
                    true
                  )
                }
                className="hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                {t.transparencyBtn}
              </button>

              <span className="hidden sm:inline">
                •
              </span>

              <a
                href="https://moa-services.com/agri-service/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>
                  DAM Portal
                </span>

                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/70 gap-3 text-center sm:text-left">

            <p>
              © {new Date().getFullYear()} DaamBD Intelligence Platform.
              Data sourced from Ministry of Agriculture (MOA / DAM).
            </p>

            <p className="flex items-center justify-center space-x-1 shrink-0">
              <span>
                Made for Bangladesh with
              </span>

              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            </p>

          </div>
        </div>
      </footer>
    </div>
  );
}