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

export default function Home() {
  // =========================
  // Global State
  // =========================
  const [lang, setLang] = useState<Language>('bn');

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

  // =========================
  // District ID Mapping
  // =========================
  // Header থেকে যদি district name আসে,
  // এখানে official district ID পাঠানো হবে।
  const districtIds: Record<string, number> = {
    Dhaka: 46,
  };

  // =========================
  // Load Official Market Prices
  // =========================
  useEffect(() => {
    const loadPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        const districtId =
          districtIds[selectedDistrict] || 46;

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
            data?.error || 'Price API failed'
          );
        }

        setAllDistrictItems(
          Array.isArray(data?.items)
            ? data.items
            : []
        );
      } catch (err) {
        console.error(
          'DaamBD Price API Error:',
          err
        );

        setError(
          'বাজারদরের তথ্য লোড করা যাচ্ছে না।'
        );

        setAllDistrictItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [selectedDistrict]);

  // =========================
  // Summary Statistics
  // =========================
const summaryStats = useMemo(() => {
  const totalItems = allDistrictItems.length;

  const increasedCount = allDistrictItems.filter(
    (item) => item.priceChange > 0
  ).length;

  const decreasedCount = allDistrictItems.filter(
    (item) => item.priceChange < 0
  ).length;

  const stableCount = allDistrictItems.filter(
    (item) => item.priceChange === 0
  ).length;

  const sortedByChange = [...allDistrictItems].sort(
    (a, b) => b.priceChange - a.priceChange
  );

  const sortedByDrop = [...allDistrictItems].sort(
    (a, b) => a.priceChange - b.priceChange
  );

  const topSpike = sortedByChange[0];
  const topDrop = sortedByDrop[0];

  return {
    totalItems,
    increasedCount,
    decreasedCount,
    stableCount,

    topSpikeItem:
      topSpike && topSpike.priceChange > 0
        ? {
            nameBn: topSpike.nameBn,
            nameEn: topSpike.nameEn,
            change: topSpike.priceChange,
            pctChange: topSpike.priceChange,
          }
        : null,

    topDropItem:
      topDrop && topDrop.priceChange < 0
        ? {
            nameBn: topDrop.nameBn,
            nameEn: topDrop.nameEn,
            change: topDrop.priceChange,
            pctChange: Math.abs(topDrop.priceChange),
          }
        : null,

    lastUpdated: new Date().toISOString(),
  };
}, [allDistrictItems]);

  // =========================
  // Filtered & Sorted Items
  // =========================
  const filteredItems = useMemo(() => {
    let result = [...allDistrictItems];

    // -------------------------
    // Category Filter
    // -------------------------
    if (selectedCategory !== 'all') {
      result = result.filter(
        (item: any) =>
          item?.categorySlug ===
          selectedCategory
      );
    }

    // -------------------------
    // Search Filter
    // -------------------------
    if (searchQuery.trim() !== '') {
      const q =
        searchQuery
          .toLowerCase()
          .trim();

      result = result.filter(
        (item: any) =>
          String(
            item?.nameBn || ''
          )
            .toLowerCase()
            .includes(q) ||

          String(
            item?.nameEn || ''
          )
            .toLowerCase()
            .includes(q) ||

          String(
            item?.categoryBn || ''
          )
            .toLowerCase()
            .includes(q) ||

          String(
            item?.categoryEn || ''
          )
            .toLowerCase()
            .includes(q)
      );
    }

    // -------------------------
    // Price Movement Filter
    // -------------------------
    if (movementFilter !== 'all') {
      result = result.filter(
        (item: any) =>
          item?.movement ===
          movementFilter
      );
    }

    // -------------------------
    // Sorting
    // -------------------------
    if (sortBy === 'price-low') {
      result.sort((a: any, b: any) => {
        const priceA =
          priceType === 'retail'
            ? Number(
                a?.retail?.avgPrice || 0
              )
            : Number(
                a?.wholesale?.avgPrice || 0
              );

        const priceB =
          priceType === 'retail'
            ? Number(
                b?.retail?.avgPrice || 0
              )
            : Number(
                b?.wholesale?.avgPrice || 0
              );

        return priceA - priceB;
      });
    }

    if (sortBy === 'price-high') {
      result.sort((a: any, b: any) => {
        const priceA =
          priceType === 'retail'
            ? Number(
                a?.retail?.avgPrice || 0
              )
            : Number(
                a?.wholesale?.avgPrice || 0
              );

        const priceB =
          priceType === 'retail'
            ? Number(
                b?.retail?.avgPrice || 0
              )
            : Number(
                b?.wholesale?.avgPrice || 0
              );

        return priceB - priceA;
      });
    }

    if (sortBy === 'change') {
      result.sort(
        (a: any, b: any) =>
          Math.abs(
            Number(
              b?.priceChange || 0
            )
          ) -
          Math.abs(
            Number(
              a?.priceChange || 0
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

  const t = translations[lang];

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
  const districtDisplayName =
    lang === 'bn'
      ? selectedDistrict === 'Dhaka'
        ? 'ঢাকা'
        : selectedDistrict
      : selectedDistrict;

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">

      {/* =====================================
          1. Header
      ====================================== */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        selectedDistrict={selectedDistrict}
        onDistrictChange={
          setSelectedDistrict
        }
        onOpenTransparency={() =>
          setIsTransparencyOpen(true)
        }
      />

      {/* =====================================
          2. Hero & Search
      ====================================== */}
      <HeroSearch
        lang={lang}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        onSortByChange={setSortBy}
        totalFound={
          filteredItems.length
        }
      />

      {/* =====================================
          3. Market Stats
      ====================================== */}
      <MarketStats
        lang={lang}
        stats={summaryStats}
      />

      {/* =====================================
          4. Main Content
      ====================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">

        {/* =================================
            Section Heading
        ================================== */}
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
                ? `প্রতিদিন সকাল ৯:০০ টা ও দুপুর ২:০০ টায় তথ্য হালনাগাদ করা হয়`
                : `Updated daily via official government feeds`}
            </p>

          </div>
        </div>

        {/* =================================
            Loading State
        ================================== */}
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
                  ? 'সরকারি উৎস থেকে সর্বশেষ তথ্য আনা হচ্ছে।'
                  : 'Fetching the latest official government data.'}
              </p>

            </div>

          </div>
        ) : error ? (

          /* =================================
             API Error State
          ================================== */
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

          /* =================================
             Price Cards Grid
          ================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">

            {filteredItems.map(
              (item: DailyPriceItem) => (
                <PriceCard
                  key={
                    (item as any).id ??
                    (item as any).commodityId
                  }
                  item={item}
                  lang={lang}
                  priceType={priceType}
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

          /* =================================
             No Items State
          ================================== */
          <div className="bg-white rounded-3xl p-10 text-center border border-surface-border shadow-card-subtle max-w-md mx-auto my-8 space-y-4">

            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-brand-700">

              <SearchX className="w-8 h-8" />

            </div>

            <div>

              <h4 className="text-lg font-bold text-content-main">
                {t.noItemsFound}
              </h4>

              <p className="text-xs text-content-muted mt-1">
                {lang === 'bn'
                  ? 'অনুগ্রহ করে অনুসন্ধানের শব্দ পরিবর্তন করে দেখুন।'
                  : 'Try clearing your search query or choosing another category.'}
              </p>

            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(
                  'all'
                );
                setMovementFilter(
                  'all'
                );
              }}
              className="px-4 py-2 rounded-xl bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 transition-all shadow-md"
            >
              {lang === 'bn'
                ? 'ফিল্টার রিসেট করুন'
                : 'Reset All Filters'}
            </button>

          </div>
        )}

        {/* =====================================
            5. District Comparison
        ====================================== */}
        <DistrictCompare
          lang={lang}
        />

      </main>

      {/* =====================================
          6. Calculator Modal
      ====================================== */}
      <PriceConverter
        item={calculatorItem}
        lang={lang}
        priceType={priceType}
        isOpen={isCalculatorOpen}
        onClose={() =>
          setIsCalculatorOpen(false)
        }
      />

      {/* =====================================
          7. Price Trend Modal
      ====================================== */}
      <PriceTrendModal
        item={trendItem}
        lang={lang}
        priceType={priceType}
        isOpen={isTrendOpen}
        onClose={() =>
          setIsTrendOpen(false)
        }
      />

      {/* =====================================
          8. Transparency Modal
      ====================================== */}
      <TransparencyModal
        lang={lang}
        isOpen={isTransparencyOpen}
        onClose={() =>
          setIsTransparencyOpen(false)
        }
      />

      {/* =====================================
          9. Footer
      ====================================== */}
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

                <span>DAM Portal</span>

                <ExternalLink className="w-3 h-3" />

              </a>

            </div>

          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/70 gap-2 text-center sm:text-left">

            <p>
              © {new Date().getFullYear()} DaamBD Intelligence Platform.
              Powered by Ministry of Agriculture (MOA / DAM) verified data.
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