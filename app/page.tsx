'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DailyPriceItem, Language, PriceType } from '@/lib/types';
import { translations } from '@/lib/i18n';
import { DISTRICTS } from '@/lib/mockData';

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

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return '';
}

function getPrice(
  item: DailyPriceItem,
  priceType: PriceType
): number {
  const object = item as unknown as AnyObject;

  const selected =
    priceType === 'retail'
      ? object?.retail
      : object?.wholesale;

  if (isObject(selected)) {
    const values = [
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
      selected.price,
    ];

    for (const value of values) {
      const number = Number(value);

      if (
        Number.isFinite(number) &&
        number > 0
      ) {
        return number;
      }
    }
  }

  const fallbackValues =
    priceType === 'retail'
      ? [
          object?.retailAvg,
          object?.retailAverage,
          object?.retailPrice,
          object?.retail_price,
          object?.price,
          object?.avgPrice,
          object?.averagePrice,
        ]
      : [
          object?.wholesaleAvg,
          object?.wholesaleAverage,
          object?.wholesalePrice,
          object?.wholesale_price,
          object?.wholesale,
          object?.avgPrice,
          object?.averagePrice,
        ];

  for (const value of fallbackValues) {
    const number = Number(value);

    if (
      Number.isFinite(number) &&
      number > 0
    ) {
      return number;
    }
  }

  return 0;
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
    object?.categorySlug,
    object?.category,
    object?.categoryBn,
    object?.categoryEn,
    object?.categoryName,
    object?.category_name,
    object?.category_name_bn,
    object?.category_name_en,
  ]
    .map(normalizeCategory)
    .filter(Boolean);

  if (
    possibleCategories.includes(selected)
  ) {
    return true;
  }

  const aliases: Record<string, string[]> = {
    'চাল ও খাদ্যশস্য': [
      'চাল ও খাদ্যশস্য',
      'rice',
      'rice and grains',
      'grains',
      'food grains',
      'চাল',
      'খাদ্যশস্য',
      'rice grains',
    ],

    rice: [
      'চাল ও খাদ্যশস্য',
      'rice',
      'rice and grains',
      'grains',
      'food grains',
    ],

    grains: [
      'চাল ও খাদ্যশস্য',
      'rice',
      'rice and grains',
      'grains',
    ],

    'ডাল ও শিম': [
      'ডাল ও শিম',
      'ডাল',
      'শিম',
      'pulses',
      'pulse',
      'lentil',
      'legumes',
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

    'শাকসবজি': [
      'শাকসবজি',
      'সবজি',
      'vegetables',
      'vegetable',
      'veggies',
    ],

    vegetables: [
      'শাকসবজি',
      'সবজি',
      'vegetables',
      'vegetable',
      'veggies',
    ],

    'মাংস ও ডিম': [
      'মাংস ও ডিম',
      'মাংস',
      'ডিম',
      'meat and eggs',
      'meat',
      'eggs',
      'egg',
      'poultry',
      'meat-eggs',
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
      'meat-eggs',
      'meat eggs',
    ],

    'meat eggs': [
      'মাংস ও ডিম',
      'মাংস',
      'ডিম',
      'meat and eggs',
      'meat',
      'eggs',
      'egg',
      'poultry',
      'meat-eggs',
      'meat eggs',
    ],

    meat: [
      'মাংস ও ডিম',
      'মাংস',
      'ডিম',
      'meat and eggs',
      'meat',
      'eggs',
      'egg',
      'poultry',
    ],

    eggs: [
      'মাংস ও ডিম',
      'ডিম',
      'egg',
      'eggs',
      'meat and eggs',
    ],

    মাছ: [
      'মাছ',
      'fish',
      'fishes',
    ],

    fish: [
      'মাছ',
      'fish',
      'fishes',
    ],

    মসলা: [
      'মসলা',
      'মশলা',
      'spices',
      'spice',
    ],

    spices: [
      'মসলা',
      'মশলা',
      'spices',
      'spice',
    ],

    ভোজ্যতেল: [
      'ভোজ্যতেল',
      'তেল',
      'তৈল',
      'edible oil',
      'cooking oil',
      'oil',
      'oils',
    ],

    oils: [
      'ভোজ্যতেল',
      'তেল',
      'তৈল',
      'edible oil',
      'cooking oil',
      'oil',
      'oils',
    ],

    oil: [
      'ভোজ্যতেল',
      'তেল',
      'তৈল',
      'edible oil',
      'cooking oil',
      'oil',
      'oils',
    ],

    নিত্যপণ্য: [
      'নিত্যপণ্য',
      'essential',
      'essentials',
      'daily essentials',
    ],

    essentials: [
      'নিত্যপণ্য',
      'essential',
      'essentials',
      'daily essentials',
    ],
  };

  const selectedRaw = String(selectedCategory || '').toLowerCase().trim();

  const allowed =
    aliases[selectedRaw] ||
    aliases[selected] ||
    [selectedRaw, selected];

  return possibleCategories.some(
    (category) =>
      allowed.includes(category) ||
      allowed.some(
        (alias) =>
          category.includes(alias) ||
          alias.includes(category)
      )
  );
}

export default function Home() {
  // =========================
  // Global State
  // =========================

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

  // =========================
  // Modal State
  // =========================

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

  // =========================
  // API Data State
  // =========================

  const [allDistrictItems, setAllDistrictItems] =
    useState<DailyPriceItem[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<string | null>(null);

  // =========================
  // District ID Mapping
  // =========================

  const districtIds: Record<string, number> = {
    Dhaka: 46,
  };

  // =========================
  // Load Official Market Prices
  // =========================

  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/prices?district=${encodeURIComponent(selectedDistrict)}`,
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
            data?.error || 'Price API failed'
          );
        }

        if (cancelled) {
          return;
        }

        const items = Array.isArray(data?.items)
          ? data.items
          : [];

        setAllDistrictItems(items);

        // API timestamp থাকলে সেটি ব্যবহার করবে,
        // না থাকলে fetch-এর সময় ব্যবহার করবে।
        const apiTimestamp =
          getText(
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

        setError(
          'বাজারদরের তথ্য লোড করা যাচ্ছে না।'
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
  }, [selectedDistrict]);

  // =========================
  // Summary Statistics
  // =========================

  const summaryStats = useMemo(() => {
    const totalItems =
      allDistrictItems.length;

    // priceChangeType is reliably set by the API
    // ("increase" | "decrease" | "unchanged" | "no_data")
    // Using it is more accurate than comparing the numeric priceChange
    // which can be 0 when no previous-day data is available.
    const increasedCount =
      allDistrictItems.filter(
        (item) => item.priceChangeType === 'increase'
      ).length;

    const decreasedCount =
      allDistrictItems.filter(
        (item) => item.priceChangeType === 'decrease'
      ).length;

    const stableCount =
      allDistrictItems.filter(
        (item) =>
          item.priceChangeType === 'unchanged' ||
          item.priceChangeType === 'no_data'
      ).length;

    // Sort by absolute priceChange for top movers
    const sortedByChange =
      [...allDistrictItems]
        .filter((item) => item.priceChangeType === 'increase')
        .sort(
          (a, b) =>
            Number(b.priceChange || 0) -
            Number(a.priceChange || 0)
        );

    const sortedByDrop =
      [...allDistrictItems]
        .filter((item) => item.priceChangeType === 'decrease')
        .sort(
          (a, b) =>
            Number(a.priceChange || 0) -
            Number(b.priceChange || 0)
        );

    const topSpike =
      sortedByChange[0];

    const topDrop =
      sortedByDrop[0];

    return {
      totalItems,

      increasedCount,

      decreasedCount,

      stableCount,

      topSpikeItem:
        topSpike
          ? {
              nameBn: topSpike.nameBn,
              nameEn: topSpike.nameEn,
              change: Math.abs(Number(topSpike.priceChange || 0)),
              pctChange: Math.abs(Number(topSpike.priceChangePercent || 0)),
            }
          : null,

      topDropItem:
        topDrop
          ? {
              nameBn: topDrop.nameBn,
              nameEn: topDrop.nameEn,
              change: Math.abs(Number(topDrop.priceChange || 0)),
              pctChange: Math.abs(Number(topDrop.priceChangePercent || 0)),
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

  // =========================
  // Filtered & Sorted Items
  // =========================

  const filteredItems = useMemo(() => {
    let result =
      [...allDistrictItems];

    // =========================
    // Category Filter
    // =========================

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

    // =========================
    // Search Filter
    // =========================

    if (
      searchQuery.trim() !== ''
    ) {
      const q =
        searchQuery
          .toLowerCase()
          .trim();

      result =
        result.filter(
          (item: DailyPriceItem) => {
            const object =
              item as unknown as AnyObject;

            const searchableText =
              [
                object?.nameBn,
                object?.nameEn,
                object?.commodityNameBn,
                object?.commodity_name_bn,
                object?.commodityName,
                object?.commodity_name,
                object?.textBn,
                object?.text_bn,
                object?.textEn,
                object?.text_en,
                object?.categoryBn,
                object?.categoryEn,
                object?.category,
              ]
                .map((value) =>
                  getText(value)
                    .toLowerCase()
                )
                .filter(Boolean)
                .join(' ');

            return searchableText.includes(q);
          }
        );
    }

    // =========================
    // Price Movement Filter
    // =========================

    if (
      movementFilter !== 'all'
    ) {
      result =
        result.filter(
          (item: DailyPriceItem) => {
            const change =
              Number(
                item.priceChange || 0
              );
            const m = (
              item as unknown as AnyObject
            )?.movement;

            if (
              movementFilter === 'up' ||
              movementFilter === 'spike'
            ) {
              return change > 0 || m === 'up' || m === 'spike';
            }

            if (
              movementFilter === 'down' ||
              movementFilter === 'drop'
            ) {
              return change < 0 || m === 'down' || m === 'drop';
            }

            if (
              movementFilter === 'stable' ||
              movementFilter === 'unchanged'
            ) {
              return change === 0 || m === 'stable' || m === 'unchanged';
            }

            return true;
          }
        );
    }

    // =========================
    // Sorting
    // =========================

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

  // =========================
  // Modal Handlers
  // =========================

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

  // =========================
  // District Display Name
  // =========================

  const matchedDistrict = DISTRICTS.find(
    (d) => d.en === selectedDistrict
  );

  const districtDisplayName =
    lang === 'bn'
      ? matchedDistrict
        ? matchedDistrict.bn
        : selectedDistrict
      : selectedDistrict;

  // =========================
  // Format Update Time
  // =========================

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

  // =========================
  // Reset Filters
  // =========================

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMovementFilter('all');
    setSortBy('default');
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">

      {/* =========================
          1. Header
      ========================== */}

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

      {/* =========================
          2. Hero & Search
      ========================== */}

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

      {/* =========================
          3. Market Stats
      ========================== */}

      <MarketStats
        lang={lang}
        stats={
          summaryStats
        }
      />

      {/* =========================
          4. Main Content
      ========================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">

        {/* Section Heading */}

        <div className="flex items-center justify-between">
          <div>

            <h3 className="text-xl sm:text-2xl font-black text-content-main tracking-tight flex items-center gap-2">

              <span>
                {lang === 'bn'
                  ? `আজকের বাজারদর (${districtDisplayName})`
                  : `Today's Market Rates (${selectedDistrict})`}
              </span>

            </h3>

            <p className="text-xs text-content-muted mt-0.5 font-semibold">
              {lang === 'bn'
                ? 'সরকারি DAM-এর দৈনিক বাজারদর'
                : 'Daily market prices sourced from DAM'}
            </p>

            {formattedUpdatedTime && (
              <p className="text-[11px] text-content-muted mt-1">
                {lang === 'bn'
                  ? `সর্বশেষ আপডেট: ${formattedUpdatedTime}`
                  : `Last updated: ${formattedUpdatedTime}`}
              </p>
            )}

          </div>
        </div>

        {/* =========================
            Loading State
        ========================== */}

        {loading ? (

          <div className="bg-white rounded-3xl p-10 text-center border border-surface-border shadow-card-subtle max-w-md mx-auto my-8 space-y-4">

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
                  ? 'সরকারি DAM উৎস থেকে সর্বশেষ তথ্য আনা হচ্ছে।'
                  : 'Fetching the latest data from the official DAM source.'}
              </p>

            </div>

          </div>

        ) : error ? (

          /* =========================
             API Error State
          ========================== */

          <div className="bg-white rounded-3xl p-10 text-center border border-red-200 shadow-card-subtle max-w-md mx-auto my-8 space-y-4">

            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">

              <SearchX className="w-8 h-8" />

            </div>

            <div>

              <h4 className="text-lg font-bold text-content-main">
                {lang === 'bn'
                  ? 'তথ্য পাওয়া যাচ্ছে না'
                  : 'Unable to load prices'}
              </h4>

              <p className="text-xs text-content-muted mt-1">
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

          /* =========================
             Price Cards Grid
          ========================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">

            {filteredItems.map(
              (
                item: DailyPriceItem
              ) => (
                <PriceCard
                  key={
                    String(
                      (item as any).id ??
                      (item as any).commodityId ??
                      (item as any).commodity_id ??
                      item.nameBn
                    )
                  }
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
              )
            )}

          </div>

        ) : (

          /* =========================
             No Items State
          ========================== */

          <div className="bg-white rounded-3xl p-10 text-center border border-surface-border shadow-card-subtle max-w-md mx-auto my-8 space-y-4">

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

              <p className="text-xs text-content-muted mt-1">
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

        {/* =========================
            5. District Comparison
        ========================== */}

        <DistrictCompare
          lang={lang}
        />

      </main>

      {/* =========================
          6. Calculator Modal
      ========================== */}

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

      {/* =========================
          7. Price Trend Modal
      ========================== */}

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

      {/* =========================
          8. Transparency Modal
      ========================== */}

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

      {/* =========================
          9. Footer
      ========================== */}

      <footer className="bg-[#14532D] text-white border-t border-emerald-900 mt-12 py-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-emerald-800/60">

            {/* Brand */}

            <div className="flex items-center space-x-3">

              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl">

                <Activity className="w-6 h-6" />

              </div>

              <div>

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

            {/* Footer Links */}

            <div className="flex items-center space-x-4 text-xs font-semibold text-emerald-200">

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

              <span>•</span>

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

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/70 gap-2 text-center sm:text-left">

            <p>
              © {new Date().getFullYear()} DaamBD Intelligence Platform.
              Data sourced from Ministry of Agriculture (MOA / DAM).
            </p>

            <p className="flex items-center justify-center space-x-1">

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