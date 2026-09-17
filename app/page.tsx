'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  DailyPriceItem,
  Language,
  PriceType,
} from '@/lib/types';

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
  DISTRICTS,
} from '@/lib/mockData';

import {
  SearchX,
  Heart,
  ExternalLink,
  Activity,
  RefreshCw,
} from 'lucide-react';

type AnyObject = Record<string, unknown>;

interface OfficialDistrict {
  id: number;
  en: string;
  bn: string;
  divisionId: number;
  divisionEn: string;
  divisionBn: string;
  districtId: number;
  upazilaId?: number;
  marketId?: number;
}

/* =========================================================
   OFFICIAL DAM LOCATION IDs
   ---------------------------------------------------------
   These IDs come from the official MOA / DAM marketList.
   No guessed IDs are used.
   ========================================================= */

const officialLocationMap: Record<
  string,
  {
    divisionId: number;
    districtId: number;
    upazilaId?: number;
    marketId?: number;
  }
> = {
  // ==================== DHAKA DIVISION ====================

  Dhaka: {
    divisionId: 6,
    districtId: 47,
    upazilaId: 493,
    marketId: 162,
  },

  Manikganj: {
    divisionId: 6,
    districtId: 46,
    upazilaId: 360,
    marketId: 109,
  },

  Gazipur: {
    divisionId: 6,
    districtId: 41,
    upazilaId: 320,
    marketId: 172,
  },

  Narayanganj: {
    divisionId: 6,
    districtId: 43,
    upazilaId: 330,
    marketId: 17,
  },

  Savar: {
    divisionId: 6,
    districtId: 47,
    upazilaId: 365,
    marketId: 169,
  },

  Tangail: {
    divisionId: 6,
    districtId: 44,
    upazilaId: 342,
    marketId: 111,
  },

  Munshiganj: {
    divisionId: 6,
    districtId: 48,
    upazilaId: 370,
    marketId: 59,
  },

  Narsingdi: {
    divisionId: 6,
    districtId: 40,
    upazilaId: 313,
    marketId: 26,
  },

  Faridpur: {
    divisionId: 6,
    districtId: 52,
    upazilaId: 390,
    marketId: 52,
  },

  // ==================== CHATTOGRAM DIVISION ====================

  Chattogram: {
    divisionId: 1,
    districtId: 8,
    upazilaId: 499,
    marketId: 79,
  },

  Cumilla: {
    divisionId: 1,
    districtId: 1,
    upazilaId: 11,
    marketId: 56,
  },

  CoxsBazar: {
    divisionId: 1,
    districtId: 9,
    upazilaId: 80,
    marketId: 103,
  },

  Feni: {
    divisionId: 1,
    districtId: 2,
    upazilaId: 19,
    marketId: 104,
  },

  Noakhali: {
    divisionId: 1,
    districtId: 5,
    upazilaId: 43,
    marketId: 106,
  },

  Brahmanbaria: {
    divisionId: 1,
    districtId: 3,
    upazilaId: 24,
    marketId: 23,
  },

  // ==================== RAJSHAHI DIVISION ====================

  Rajshahi: {
    divisionId: 2,
    districtId: 15,
    upazilaId: 496,
    marketId: 13,
  },

  Bogura: {
    divisionId: 2,
    districtId: 14,
    upazilaId: 123,
    marketId: 67,
  },

  Pabna: {
    divisionId: 2,
    districtId: 13,
    upazilaId: 116,
    marketId: 20,
  },

  Naogaon: {
    divisionId: 2,
    districtId: 19,
    upazilaId: 168,
    marketId: 30,
  },

  Sirajganj: {
    divisionId: 2,
    districtId: 12,
    upazilaId: 110,
    marketId: 115,
  },

  // ==================== KHULNA DIVISION ====================

  Khulna: {
    divisionId: 3,
    districtId: 27,
    upazilaId: 495,
    marketId: 37,
  },

  Jashore: {
    divisionId: 3,
    districtId: 20,
    upazilaId: 177,
    marketId: 112,
  },

  Kushtia: {
    divisionId: 3,
    districtId: 25,
    upazilaId: 196,
    marketId: 65,
  },

  Satkhira: {
    divisionId: 3,
    districtId: 21,
    upazilaId: 182,
    marketId: 119,
  },

  // ==================== SYLHET DIVISION ====================

  Sylhet: {
    divisionId: 5,
    districtId: 36,
    upazilaId: 281,
    marketId: 51,
  },

  Moulvibazar: {
    divisionId: 5,
    districtId: 37,
    upazilaId: 288,
    marketId: 24,
  },

  Habiganj: {
    divisionId: 5,
    districtId: 38,
    upazilaId: 298,
    marketId: 116,
  },

  Sunamganj: {
    divisionId: 5,
    districtId: 39,
    upazilaId: 300,
    marketId: 19,
  },

  // ==================== BARISHAL DIVISION ====================

  Barishal: {
    divisionId: 4,
    districtId: 33,
    upazilaId: 249,
    marketId: 27,
  },

  Bhola: {
    divisionId: 4,
    districtId: 34,
    upazilaId: 259,
    marketId: 28,
  },

  Patuakhali: {
    divisionId: 4,
    districtId: 31,
    upazilaId: 235,
    marketId: 70,
  },

  // ==================== RANGPUR DIVISION ====================

  Rangpur: {
    divisionId: 7,
    districtId: 59,
    upazilaId: 502,
    marketId: 5,
  },

  Dinajpur: {
    divisionId: 7,
    districtId: 54,
    upazilaId: 412,
    marketId: 220,
  },

  Kurigram: {
    divisionId: 7,
    districtId: 60,
    upazilaId: 448,
    marketId: 21,
  },

  // ==================== MYMENSINGH DIVISION ====================

  Mymensingh: {
    divisionId: 8,
    districtId: 62,
    upazilaId: 466,
    marketId: 176,
  },

  Jamalpur: {
    divisionId: 8,
    districtId: 63,
    upazilaId: 475,
    marketId: 29,
  },

  Netrokona: {
    divisionId: 8,
    districtId: 64,
    upazilaId: 491,
    marketId: 81,
  },
};

/* =========================================================
   HELPERS
   ========================================================= */

function isObject(value: unknown): value is AnyObject {
  return (
    typeof value === 'object' &&
    value !== null
  );
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return '';
}

function getNumber(...values: unknown[]): number {
  for (const value of values) {
    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
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

/* =========================================================
   PRICE HELPER
   ========================================================= */

function getPrice(
  item: DailyPriceItem,
  priceType: PriceType
): number {
  const object =
    item as unknown as AnyObject;

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

/* =========================================================
   CATEGORY
   ========================================================= */

function normalizeCategory(
  value: unknown
): string {
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

  const object =
    item as unknown as AnyObject;

  const selected =
    normalizeCategory(selectedCategory);

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

  if (
    possibleCategories.includes(selected)
  ) {
    return true;
  }

  const aliases: Record<
    string,
    string[]
  > = {
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

  const allowed =
    aliases[selected] || [selected];

  return possibleCategories.some(
    category =>
      allowed.some(
        alias =>
          category === alias ||
          category.includes(alias) ||
          alias.includes(category)
      )
  );
}

/* =========================================================
   SEARCH
   ========================================================= */

function getSearchableText(
  item: DailyPriceItem
): string {
  const object =
    item as unknown as AnyObject;

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
    .map(value =>
      getText(value).toLowerCase()
    )
    .filter(Boolean)
    .join(' ');
}

/* =========================================================
   HOME
   ========================================================= */

export default function Home() {
  const [lang, setLang] =
    useState<Language>('bn');

  const [selectedDistrict, setSelectedDistrict] =
    useState<string>('Dhaka');

  const [priceType, setPriceType] =
    useState<PriceType>('retail');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [movementFilter, setMovementFilter] =
    useState('all');

  const [sortBy, setSortBy] =
    useState('default');

  const [calculatorItem, setCalculatorItem] =
    useState<DailyPriceItem | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] =
    useState(false);

  const [trendItem, setTrendItem] =
    useState<DailyPriceItem | null>(null);

  const [isTrendOpen, setIsTrendOpen] =
    useState(false);

  const [isTransparencyOpen, setIsTransparencyOpen] =
    useState(false);

  const [allDistrictItems, setAllDistrictItems] =
    useState<DailyPriceItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<string | null>(null);

  /* =======================================================
     DISPLAY LOCATION LIST
     ======================================================= */

  const districts =
    useMemo<OfficialDistrict[]>(() => {
      return DISTRICTS.map(
        (district, index) => {
          const official =
            officialLocationMap[
              district.en
            ];

          return {
            id: index + 1,

            en: district.en,

            bn: district.bn,

            divisionId:
              official?.divisionId || 0,

            divisionEn:
              district.divisionEn,

            divisionBn:
              district.divisionBn,

            districtId:
              official?.districtId || 0,

            upazilaId:
              official?.upazilaId,

            marketId:
              official?.marketId,
          };
        }
      );
    }, []);

  /* =======================================================
     SELECTED LOCATION
     ======================================================= */

  const selectedDistrictInfo =
    useMemo(() => {
      return districts.find(
        district =>
          district.en === selectedDistrict
      );
    }, [
      districts,
      selectedDistrict,
    ]);

  /* =======================================================
     LOAD OFFICIAL DAM PRICES
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      if (!selectedDistrictInfo) {
        setLoading(false);
        setAllDistrictItems([]);
        setLastUpdated(null);

        setError(
          lang === 'bn'
            ? 'নির্বাচিত এলাকার তথ্য পাওয়া যায়নি।'
            : 'The selected area could not be found.'
        );

        return;
      }

      /*
       * No official ID = no API request.
       * This prevents fake/guessed IDs.
       */

      if (
        !selectedDistrictInfo.divisionId ||
        !selectedDistrictInfo.districtId
      ) {
        setLoading(false);
        setAllDistrictItems([]);
        setLastUpdated(null);

        setError(
          lang === 'bn'
            ? 'এই এলাকার সরকারি DAM ID এখনো সংযুক্ত করা হয়নি।'
            : 'The official DAM ID for this area has not been connected yet.'
        );

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params =
          new URLSearchParams();

        params.set(
          'division',
          String(
            selectedDistrictInfo.divisionId
          )
        );

        params.set(
          'district',
          String(
            selectedDistrictInfo.districtId
          )
        );

        if (
          selectedDistrictInfo.upazilaId
        ) {
          params.set(
            'upazila',
            String(
              selectedDistrictInfo.upazilaId
            )
          );
        }

        if (
          selectedDistrictInfo.marketId
        ) {
          params.set(
            'market',
            String(
              selectedDistrictInfo.marketId
            )
          );
        }

        const response =
          await fetch(
            `/api/prices?${params.toString()}`,
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

        const data =
          await response.json();

        if (!data?.success) {
          throw new Error(
            data?.error ||
              'Price API failed'
          );
        }

        if (cancelled) {
          return;
        }

        const items =
          Array.isArray(data?.items)
            ? data.items
            : [];

        setAllDistrictItems(items);

        setLastUpdated(
          getText(
            data?.timestamp,
            data?.updatedAt,
            data?.lastUpdated
          ) ||
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
            (lang === 'bn'
              ? 'বাজারদরের তথ্য লোড করা যাচ্ছে না।'
              : 'Unable to load market prices.')
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
  }, [
    selectedDistrictInfo,
    lang,
  ]);

  /* =======================================================
     SUMMARY
     ======================================================= */

  const summaryStats =
    useMemo(() => {
      const totalItems =
        allDistrictItems.length;

      const increasedCount =
        allDistrictItems.filter(
          item =>
            Number(
              item.priceChange || 0
            ) > 0
        ).length;

      const decreasedCount =
        allDistrictItems.filter(
          item =>
            Number(
              item.priceChange || 0
            ) < 0
        ).length;

      const stableCount =
        allDistrictItems.filter(
          item =>
            Number(
              item.priceChange || 0
            ) === 0
        ).length;

      const sortedByChange =
        [...allDistrictItems].sort(
          (a, b) =>
            Number(
              b.priceChange || 0
            ) -
            Number(
              a.priceChange || 0
            )
        );

      const sortedByDrop =
        [...allDistrictItems].sort(
          (a, b) =>
            Number(
              a.priceChange || 0
            ) -
            Number(
              b.priceChange || 0
            )
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
          topSpike &&
          spikeChange > 0
            ? {
                nameBn:
                  topSpike.nameBn,

                nameEn:
                  topSpike.nameEn,

                change:
                  spikeChange,

                pctChange:
                  Number(
                    (
                      topSpike as unknown as AnyObject
                    ).priceChangePercent ||
                    spikeChange
                  ),
              }
            : null,

        topDropItem:
          topDrop &&
          dropChange < 0
            ? {
                nameBn:
                  topDrop.nameBn,

                nameEn:
                  topDrop.nameEn,

                change:
                  dropChange,

                pctChange:
                  Math.abs(
                    Number(
                      (
                        topDrop as unknown as AnyObject
                      ).priceChangePercent ||
                      dropChange
                    )
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

  /* =======================================================
     FILTERS
     ======================================================= */

  const filteredItems =
    useMemo(() => {
      let result =
        [...allDistrictItems];

      if (
        selectedCategory !== 'all'
      ) {
        result =
          result.filter(item =>
            categoryMatches(
              item,
              selectedCategory
            )
          );
      }

      if (searchQuery.trim()) {
        const query =
          searchQuery
            .toLowerCase()
            .trim();

        result =
          result.filter(item =>
            getSearchableText(
              item
            ).includes(query)
          );
      }

      if (
        movementFilter !== 'all'
      ) {
        result =
          result.filter(item => {
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
              ) === movementFilter
            );
          });
      }

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

      if (sortBy === 'change') {
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

  /* =======================================================
     TRANSLATIONS
     ======================================================= */

  const t =
    translations[lang];

  const districtDisplayName =
    lang === 'bn'
      ? selectedDistrictInfo?.bn ||
        selectedDistrict
      : selectedDistrictInfo?.en ||
        selectedDistrict;

  /* =======================================================
     UPDATED TIME
     ======================================================= */

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
          timeZone: 'Asia/Dhaka',
        }
      ).format(date);
    }, [
      lastUpdated,
      lang,
    ]);

  /* =======================================================
     RESET
     ======================================================= */

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMovementFilter('all');
    setSortBy('default');
  };

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] overflow-x-hidden">

      <Header
        lang={lang}
        onLanguageChange={setLang}
        selectedDistrict={
          selectedDistrict
        }
        onDistrictChange={
          setSelectedDistrict
        }
        onOpenTransparency={() =>
          setIsTransparencyOpen(true)
        }
      />

      <HeroSearch
        lang={lang}
        searchQuery={searchQuery}
        onSearchChange={
          setSearchQuery
        }
        selectedCategory={
          selectedCategory
        }
        onCategoryChange={
          setSelectedCategory
        }
        priceType={priceType}
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

      <MarketStats
        lang={lang}
        stats={summaryStats}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">

        {/* =================================================
            TITLE
            ================================================= */}

        <div className="min-w-0">

          <h3 className="text-xl sm:text-2xl font-black text-content-main tracking-tight flex items-center gap-2">

            <span className="truncate">
              {lang === 'bn'
                ? `আজকের বাজারদর (${districtDisplayName})`
                : `Today's Market Rates (${districtDisplayName})`}
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

        {/* =================================================
            LOADING
            ================================================= */}

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

          /* =================================================
             ERROR
             ================================================= */

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

          /* =================================================
             PRICE CARDS
             ================================================= */

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
                      item => {
                        setCalculatorItem(
                          item
                        );

                        setIsCalculatorOpen(
                          true
                        );
                      }
                    }
                    onOpenTrend={
                      item => {
                        setTrendItem(
                          item
                        );

                        setIsTrendOpen(
                          true
                        );
                      }
                    }
                  />
                );
              }
            )}

          </div>

        ) : (

          /* =================================================
             EMPTY
             ================================================= */

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

        {/* =================================================
            DISTRICT COMPARISON
            ================================================= */}

        <DistrictCompare
          lang={lang}
        />

      </main>

      {/* ===================================================
          PRICE CONVERTER
          =================================================== */}

      <PriceConverter
        item={calculatorItem}
        lang={lang}
        priceType={priceType}
        isOpen={isCalculatorOpen}
        onClose={() =>
          setIsCalculatorOpen(false)
        }
      />

      {/* ===================================================
          PRICE TREND
          =================================================== */}

      <PriceTrendModal
        item={trendItem}
        lang={lang}
        priceType={priceType}
        isOpen={isTrendOpen}
        onClose={() =>
          setIsTrendOpen(false)
        }
      />

      {/* ===================================================
          TRANSPARENCY
          =================================================== */}

      <TransparencyModal
        lang={lang}
        isOpen={
          isTransparencyOpen
        }
        onClose={() =>
          setIsTransparencyOpen(false)
        }
      />

      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="bg-[#14532D] text-white border-t border-emerald-900 mt-12 py-8 sm:py-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-5 pb-6 border-b border-emerald-800/60">

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

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/70 gap-3 text-center sm:text-left">

            <p>
              ©{' '}
              {new Date().getFullYear()}{' '}
              DaamBD Intelligence Platform.
              Data sourced from Ministry of
              Agriculture (MOA / DAM).
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