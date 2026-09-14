'use client';

import React from 'react';
import { Language, PriceType } from '@/lib/types';
import { translations, toBanglaNumber } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/mockData';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Sparkles,
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
  LayoutGrid
} from 'lucide-react';

interface HeroSearchProps {
  lang: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  priceType: PriceType;
  onPriceTypeChange: (type: PriceType) => void;
  movementFilter: string; // 'all' | 'drop' | 'spike' | 'stable'
  onMovementFilterChange: (filter: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalFound: number;
}

const categoryIconMap: Record<string, React.ReactNode> = {
  all: <LayoutGrid className="w-4 h-4" />,
  grains: <Wheat className="w-4 h-4" />,
  pulses: <Coins className="w-4 h-4" />,
  vegetables: <Carrot className="w-4 h-4" />,
  'meat-eggs': <Egg className="w-4 h-4" />,
  fish: <Fish className="w-4 h-4" />,
  spices: <Flame className="w-4 h-4" />,
  oils: <Droplets className="w-4 h-4" />,
  essentials: <Package className="w-4 h-4" />,
};

export const HeroSearch: React.FC<HeroSearchProps> = ({
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
    <section className="bg-gradient-to-b from-[#14532D] via-[#15803D] to-[#14532D] text-white pt-6 pb-8 px-4 sm:px-6 lg:px-8 shadow-md">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Top Hero headline & Retail/Wholesale switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{lang === 'bn' ? 'দৈনিক বাজারদর তালিকা' : 'Daily Grocery Price Intelligence'}</span>
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1">
              {lang === 'bn'
                ? 'সরকারি কৃষি বিপণন অধিদপ্তর (DAM) এবং বিশ্বস্ত মাঠপর্যায়ের রিয়েল-টাইম মূল্য তালিকা'
                : 'Real-time verified daily prices directly aggregated from official market feeds'}
            </p>
          </div>

          {/* Retail vs Wholesale Switch */}
          <div className="bg-black/30 p-1 rounded-xl flex items-center border border-emerald-500/30 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => onPriceTypeChange('retail')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                priceType === 'retail'
                  ? 'bg-white text-[#14532D] shadow-lg shadow-black/20'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.retailTab}</span>
            </button>
            <button
              onClick={() => onPriceTypeChange('wholesale')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                priceType === 'wholesale'
                  ? 'bg-white text-[#14532D] shadow-lg shadow-black/20'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{t.wholesaleTab}</span>
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-emerald-800 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-white text-[#17211B] placeholder-gray-400 text-sm sm:text-base font-semibold shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-300/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Scrolling Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 border ${
                  isActive
                    ? 'bg-white text-[#14532D] border-white shadow-md scale-105'
                    : 'bg-[#15803D]/60 hover:bg-[#15803D] text-emerald-100 border-emerald-400/20 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-[#15803D]' : 'text-emerald-200'}>
                  {categoryIconMap[cat.slug] || <Layers className="w-4 h-4" />}
                </span>
                <span>{lang === 'bn' ? cat.nameBn : cat.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar: Price Movement & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-600/40 text-xs">
          
          {/* Movement quick filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => onMovementFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                movementFilter === 'all'
                  ? 'bg-emerald-900 text-white font-bold border border-emerald-400/40'
                  : 'text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => onMovementFilterChange('drop')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                movementFilter === 'drop'
                  ? 'bg-emerald-600 text-white font-bold border border-emerald-300'
                  : 'text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.filterDrop}</span>
            </button>
            <button
              onClick={() => onMovementFilterChange('spike')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                movementFilter === 'spike'
                  ? 'bg-red-700 text-white font-bold border border-red-400'
                  : 'text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-300" />
              <span>{t.filterSpike}</span>
            </button>
            <button
              onClick={() => onMovementFilterChange('stable')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                movementFilter === 'stable'
                  ? 'bg-gray-700 text-white font-bold border border-gray-400'
                  : 'text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>{t.filterStable}</span>
            </button>
          </div>

          {/* Sort selection & Total items badge */}
          <div className="flex items-center space-x-3 ml-auto">
            <span className="text-emerald-200 text-xs hidden sm:inline">
              {lang === 'bn' ? `${toBanglaNumber(totalFound)} ${t.itemsFound}` : `${totalFound} ${t.itemsFound}`}
            </span>

            <div className="flex items-center space-x-1.5 bg-black/25 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-300" />
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="default" className="bg-[#14532D] text-white">{t.sortDefault}</option>
                <option value="price-low" className="bg-[#14532D] text-white">{t.sortPriceLow}</option>
                <option value="price-high" className="bg-[#14532D] text-white">{t.sortPriceHigh}</option>
                <option value="change" className="bg-[#14532D] text-white">{t.sortChangeHigh}</option>
              </select>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
