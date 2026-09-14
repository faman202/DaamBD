'use client';

import React, { useState, useMemo } from 'react';
import { DailyPriceItem, Language, PriceType } from '@/lib/types';
import { translations, toBanglaNumber } from '@/lib/i18n';
import { getMarketPricesForDistrict, getMarketSummaryStats } from '@/lib/mockData';
import { Header } from '@/components/Header';
import { HeroSearch } from '@/components/HeroSearch';
import { MarketStats } from '@/components/MarketStats';
import { PriceCard } from '@/components/PriceCard';
import { PriceConverter } from '@/components/PriceConverter';
import { DistrictCompare } from '@/components/DistrictCompare';
import { PriceTrendModal } from '@/components/PriceTrendModal';
import { TransparencyModal } from '@/components/TransparencyModal';
import {
  ShieldCheck,
  RefreshCw,
  SearchX,
  ChevronUp,
  Heart,
  ExternalLink,
  Activity
} from 'lucide-react';

export default function Home() {
  // Global State
  const [lang, setLang] = useState<Language>('bn');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka');
  const [priceType, setPriceType] = useState<PriceType>('retail');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [movementFilter, setMovementFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  // Modals state
  const [calculatorItem, setCalculatorItem] = useState<DailyPriceItem | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const [trendItem, setTrendItem] = useState<DailyPriceItem | null>(null);
  const [isTrendOpen, setIsTrendOpen] = useState<boolean>(false);

  const [isTransparencyOpen, setIsTransparencyOpen] = useState<boolean>(false);

  // Raw dataset for selected district
  const allDistrictItems = useMemo(() => {
    return getMarketPricesForDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // Overall statistics for market pulse summary
  const summaryStats = useMemo(() => {
    return getMarketSummaryStats(allDistrictItems);
  }, [allDistrictItems]);

  // Filtered & Sorted items for grid display
  const filteredItems = useMemo(() => {
    let result = [...allDistrictItems];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.categorySlug === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.nameBn.toLowerCase().includes(q) ||
          item.nameEn.toLowerCase().includes(q) ||
          item.categoryBn.toLowerCase().includes(q) ||
          item.categoryEn.toLowerCase().includes(q)
      );
    }

    // Filter by Price Movement
    if (movementFilter !== 'all') {
      result = result.filter((item) => item.movement === movementFilter);
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const priceA = priceType === 'retail' ? a.retail.avgPrice : a.wholesale.avgPrice;
        const priceB = priceType === 'retail' ? b.retail.avgPrice : b.wholesale.avgPrice;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => {
        const priceA = priceType === 'retail' ? a.retail.avgPrice : a.wholesale.avgPrice;
        const priceB = priceType === 'retail' ? b.retail.avgPrice : b.wholesale.avgPrice;
        return priceB - priceA;
      });
    } else if (sortBy === 'change') {
      result.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
    }

    return result;
  }, [allDistrictItems, selectedCategory, searchQuery, movementFilter, sortBy, priceType]);

  const t = translations[lang];

  // Action Handlers
  const handleOpenCalculator = (item: DailyPriceItem) => {
    setCalculatorItem(item);
    setIsCalculatorOpen(true);
  };

  const handleOpenTrend = (item: DailyPriceItem) => {
    setTrendItem(item);
    setIsTrendOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      
      {/* 1. App Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        onOpenTransparency={() => setIsTransparencyOpen(true)}
      />

      {/* 2. Hero & Search Section */}
      <HeroSearch
        lang={lang}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        priceType={priceType}
        onPriceTypeChange={setPriceType}
        movementFilter={movementFilter}
        onMovementFilterChange={setMovementFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalFound={filteredItems.length}
      />

      {/* 3. Market Summary Stats Pulse Banner */}
      <MarketStats lang={lang} stats={summaryStats} />

      {/* 4. Main Content Container: Market Price Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-content-main tracking-tight flex items-center gap-2">
              <span>{lang === 'bn' ? `আজকের বাজারদর (${selectedDistrict === 'Dhaka' ? 'ঢাকা' : selectedDistrict})` : `Today's Market Rates (${selectedDistrict})`}</span>
            </h3>
            <p className="text-xs text-content-muted mt-0.5 font-semibold">
              {lang === 'bn'
                ? `প্রতিদিন সকাল ৯:০০ টা ও দুপুর ২:০০ টায় তথ্য হালনাগাদ করা হয়`
                : `Updated daily at 9:00 AM & 2:00 PM via official government feeds`}
            </p>
          </div>
        </div>

        {/* Price Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <PriceCard
                key={item.id}
                item={item}
                lang={lang}
                priceType={priceType}
                onOpenCalculator={handleOpenCalculator}
                onOpenTrend={handleOpenTrend}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-surface-border shadow-card-subtle max-w-md mx-auto my-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-brand-700">
              <SearchX className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-content-main">
                {t.noItemsFound}
              </h4>
              <p className="text-xs text-content-muted mt-1">
                {lang === 'bn' ? 'অনুগ্রহ করে অনুসন্ধানের শব্দ পরিবর্তন করে দেখুন।' : 'Try clearing your search query or choosing another category.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setMovementFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 transition-all shadow-md"
            >
              {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset All Filters'}
            </button>
          </div>
        )}

        {/* 5. Cross-District Price Comparison Component ("কোথায় দাম কম?") */}
        <DistrictCompare lang={lang} />

      </main>

      {/* 6. Interactive Calculator Modal */}
      <PriceConverter
        item={calculatorItem}
        lang={lang}
        priceType={priceType}
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* 7. Price Trend Modal */}
      <PriceTrendModal
        item={trendItem}
        lang={lang}
        priceType={priceType}
        isOpen={isTrendOpen}
        onClose={() => setIsTrendOpen(false)}
      />

      {/* 8. Transparency & Source Modal */}
      <TransparencyModal
        lang={lang}
        isOpen={isTransparencyOpen}
        onClose={() => setIsTransparencyOpen(false)}
      />

      {/* 9. Footer */}
      <footer className="bg-[#14532D] text-white border-t border-emerald-900 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-emerald-800/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black tracking-tight text-white">
                  DaamBD <span className="text-emerald-300 text-xs font-semibold">| আজকের বাজারদর</span>
                </h4>
                <p className="text-xs text-emerald-200/80">
                  {t.brandTagline}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-semibold text-emerald-200">
              <button onClick={() => setIsTransparencyOpen(true)} className="hover:text-white transition-colors underline-offset-2 hover:underline">
                {t.transparencyBtn}
              </button>
              <span>•</span>
              <a href="https://moa-services.com/agri-service/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <span>DAM Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/70 gap-2 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} DaamBD Intelligence Platform. Powered by Ministry of Agriculture (MOA / DAM) verified data.
            </p>
            <p className="flex items-center justify-center space-x-1">
              <span>Made for Bangladesh with</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
