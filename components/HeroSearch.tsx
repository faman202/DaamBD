'use client';

import React from 'react';
import { Language, PriceType } from '@/lib/types';
import {
  translations,
  toBanglaNumber,
} from '@/lib/i18n';
import { CATEGORIES } from '@/lib/mockData';

import {
  Search,
  X,
  SlidersHorizontal,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  ShoppingBag,
  Store,
  Layers,
  Wheat,
  Coins,
  Carrot,
  Egg,
  Fish,
  Flame,
  Droplets,
  Package,
  LayoutGrid,
} from 'lucide-react';

interface HeroSearchProps {
  lang: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  priceType: PriceType;
  onPriceTypeChange: (type: PriceType) => void;
  movementFilter: string;
  onMovementFilterChange: (filter: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalFound: number;
}

const categoryIconMap: Record<
  string,
  React.ReactNode
> = {
  all: (
    <LayoutGrid className="w-4 h-4" />
  ),

  grains: (
    <Wheat className="w-4 h-4" />
  ),

  pulses: (
    <Coins className="w-4 h-4" />
  ),

  vegetables: (
    <Carrot className="w-4 h-4" />
  ),

  'meat-eggs': (
    <Egg className="w-4 h-4" />
  ),

  fish: (
    <Fish className="w-4 h-4" />
  ),

  spices: (
    <Flame className="w-4 h-4" />
  ),

  oils: (
    <Droplets className="w-4 h-4" />
  ),

  essentials: (
    <Package className="w-4 h-4" />
  ),
};

export const HeroSearch: React.FC<
  HeroSearchProps
> = ({
  lang,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  priceType,
  onPriceTypeChange,
  movementFilter,
  onMovementFilterChange,
  sortBy,
  onSortByChange,
  totalFound,
}) => {
  const t = translations[lang];

  return (
    <section className="w-full bg-gradient-to-b from-[#14532D] via-[#15803D] to-[#14532D] text-white shadow-md overflow-hidden">

      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8">

        <div className="space-y-4 sm:space-y-5">

          {/* =========================
              Hero Heading
          ========================== */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="min-w-0">

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">

                {lang === 'bn'
                  ? 'দৈনিক বাজারদর তালিকা'
                  : 'Daily Grocery Price Intelligence'}

              </h2>

              <p className="text-emerald-100/80 text-[11px] sm:text-xs lg:text-sm mt-1.5 leading-relaxed max-w-3xl">

                {lang === 'bn'
                  ? 'সরকারি কৃষি বিপণন অধিদপ্তর (DAM) থেকে সংগৃহীত দৈনিক বাজারদর'
                  : 'Daily market prices sourced from official DAM market reports'}

              </p>

            </div>

            {/* =========================
                Retail / Wholesale
            ========================== */}

            <div className="w-full sm:w-auto bg-black/30 p-1 rounded-xl flex items-center border border-emerald-500/30">

              <button
                type="button"
                onClick={() =>
                  onPriceTypeChange(
                    'retail'
                  )
                }
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all ${
                  priceType === 'retail'
                    ? 'bg-white text-[#14532D] shadow-lg shadow-black/20'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >

                <ShoppingBag className="w-4 h-4 shrink-0" />

                <span>
                  {t.retailTab}
                </span>

              </button>

              <button
                type="button"
                onClick={() =>
                  onPriceTypeChange(
                    'wholesale'
                  )
                }
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all ${
                  priceType ===
                  'wholesale'
                    ? 'bg-white text-[#14532D] shadow-lg shadow-black/20'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >

                <Store className="w-4 h-4 shrink-0" />

                <span>
                  {t.wholesaleTab}
                </span>

              </button>

            </div>

          </div>

          {/* =========================
              Search Bar
          ========================== */}

          <div className="relative w-full">

            <div className="relative flex items-center">

              <Search className="absolute left-3.5 sm:left-4 w-5 h-5 text-emerald-800 pointer-events-none shrink-0" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  onSearchChange(
                    e.target.value
                  )
                }
                placeholder={
                  t.searchPlaceholder
                }
                className="w-full min-w-0 pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 lg:py-4 rounded-xl sm:rounded-2xl bg-white text-[#17211B] placeholder-gray-400 text-xs sm:text-sm lg:text-base font-semibold shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-300/60 transition-all"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    onSearchChange('')
                  }
                  aria-label={
                    lang === 'bn'
                      ? 'অনুসন্ধান মুছুন'
                      : 'Clear search'
                  }
                  className="absolute right-3 sm:right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

            </div>

          </div>

          {/* =========================
              Category Chips
          ========================== */}

          <div className="relative w-full">

            <div
              className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none overscroll-x-contain"
              style={{
                WebkitOverflowScrolling:
                  'touch',
              }}
            >

              {CATEGORIES.map(
                (cat) => {
                  const isActive =
                    selectedCategory ===
                    cat.slug;

                  return (
                    <button
                      key={
                        cat.slug
                      }
                      type="button"
                      onClick={() =>
                        onCategoryChange(
                          cat.slug
                        )
                      }
                      className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs lg:text-sm font-semibold whitespace-nowrap transition-all duration-150 border ${
                        isActive
                          ? 'bg-white text-[#14532D] border-white shadow-md'
                          : 'bg-[#15803D]/60 hover:bg-[#15803D] text-emerald-100 border-emerald-400/20 hover:text-white'
                      }`}
                    >

                      <span
                        className={
                          isActive
                            ? 'text-[#15803D] shrink-0'
                            : 'text-emerald-200 shrink-0'
                        }
                      >
                        {categoryIconMap[
                          cat.slug
                        ] || (
                          <Layers className="w-4 h-4" />
                        )}
                      </span>

                      <span>
                        {lang === 'bn'
                          ? cat.nameBn
                          : cat.nameEn}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* =========================
              Secondary Filters
          ========================== */}

          <div className="pt-3 border-t border-emerald-600/40">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

              {/* =========================
                  Movement Filters
              ========================== */}

              <div
                className="w-full lg:w-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none overscroll-x-contain"
                style={{
                  WebkitOverflowScrolling:
                    'touch',
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    onMovementFilterChange(
                      'all'
                    )
                  }
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                    movementFilter ===
                    'all'
                      ? 'bg-emerald-900 text-white font-bold border border-emerald-400/40'
                      : 'text-emerald-200 hover:bg-emerald-800/60'
                  }`}
                >
                  {t.filterAll}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onMovementFilterChange(
                      'drop'
                    )
                  }
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                    movementFilter ===
                    'drop'
                      ? 'bg-emerald-600 text-white font-bold border border-emerald-300'
                      : 'text-emerald-200 hover:bg-emerald-800/60'
                  }`}
                >

                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />

                  <span>
                    {t.filterDrop}
                  </span>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    onMovementFilterChange(
                      'spike'
                    )
                  }
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                    movementFilter ===
                    'spike'
                      ? 'bg-red-700 text-white font-bold border border-red-400'
                      : 'text-emerald-200 hover:bg-emerald-800/60'
                  }`}
                >

                  <ArrowUpRight className="w-3.5 h-3.5 text-red-300 shrink-0" />

                  <span>
                    {t.filterSpike}
                  </span>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    onMovementFilterChange(
                      'stable'
                    )
                  }
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                    movementFilter ===
                    'stable'
                      ? 'bg-gray-700 text-white font-bold border border-gray-400'
                      : 'text-emerald-200 hover:bg-emerald-800/60'
                  }`}
                >

                  <Minus className="w-3.5 h-3.5 shrink-0" />

                  <span>
                    {t.filterStable}
                  </span>

                </button>

              </div>

              {/* =========================
                  Right Controls
              ========================== */}

              <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-2.5">

                {/* Total Found */}

                <span className="text-emerald-200 text-[11px] sm:text-xs font-medium whitespace-nowrap">

                  {lang === 'bn'
                    ? `${toBanglaNumber(
                        totalFound
                      )} ${t.itemsFound}`
                    : `${totalFound} ${t.itemsFound}`}

                </span>

                {/* Sort */}

                <div className="min-w-0 flex items-center gap-1.5 bg-black/25 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">

                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-300 shrink-0" />

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      onSortByChange(
                        e.target.value
                      )
                    }
                    aria-label={
                      lang === 'bn'
                        ? 'সাজানোর পদ্ধতি'
                        : 'Sort products'
                    }
                    className="max-w-[150px] sm:max-w-none bg-transparent text-white text-[11px] sm:text-xs font-semibold focus:outline-none cursor-pointer truncate"
                  >

                    <option
                      value="default"
                      className="bg-[#14532D] text-white"
                    >
                      {t.sortDefault}
                    </option>

                    <option
                      value="price-low"
                      className="bg-[#14532D] text-white"
                    >
                      {t.sortPriceLow}
                    </option>

                    <option
                      value="price-high"
                      className="bg-[#14532D] text-white"
                    >
                      {t.sortPriceHigh}
                    </option>

                    <option
                      value="change"
                      className="bg-[#14532D] text-white"
                    >
                      {t.sortChangeHigh}
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};