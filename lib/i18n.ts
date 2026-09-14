import { Language } from './types';

// Convert English digits (0-9) to Bangla digits (০-৯)
export function toBanglaNumber(num: number | string): string {
  if (num === null || num === undefined) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const str = num.toString();
  return str.replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

// Format numbers according to active language
export function formatNumber(num: number | string, lang: Language): string {
  if (lang === 'bn') {
    return toBanglaNumber(num);
  }
  return num.toString();
}

// Format Currency
export function formatPrice(amount: number, lang: Language): string {
  const formatted = Math.round(amount * 100) / 100;
  if (lang === 'bn') {
    return `৳${toBanglaNumber(formatted)}`;
  }
  return `৳${formatted}`;
}

// Format Price Range
export function formatPriceRange(min: number, max: number, unit: string, lang: Language): string {
  if (min === max) {
    return `${formatPrice(min, lang)} / ${unit}`;
  }
  if (lang === 'bn') {
    return `৳${toBanglaNumber(min)}–${toBanglaNumber(max)} / ${unit}`;
  }
  return `৳${min}–${max} / ${unit}`;
}

export const translations = {
  bn: {
    // Header
    brandName: 'DaamBD',
    brandTagline: 'আজকের বাজারদর, এক জায়গায়',
    districtSelect: 'জেলা নির্বাচন করুন',
    allDistricts: 'সমগ্র বাংলাদেশ',
    officialVerified: 'সরকারি দাম (DAM) দ্বারা যাচাইকৃত',
    liveUpdate: 'লাইভ আপডেট',
    transparencyBtn: 'তথ্যসূত্র ও নীতিমালা',

    // Hero & Filters
    searchPlaceholder: 'পণ্য খুঁজুন (যেমন: পেঁয়াজ, চাল, তেল, ব্রয়লার, আলু)...',
    allCategories: 'সব পণ্য',
    retailTab: 'খুচরা বাজারদর',
    wholesaleTab: 'পাইকারি বাজারদর',
    filterAll: 'সবদর',
    filterDrop: '↓ দাম কমেছে',
    filterSpike: '↑ দাম বেড়েছে',
    filterStable: '— স্থিতিশীল',
    sortBy: 'বাছাই করুন',
    sortDefault: 'জনপ্রিয়তা',
    sortPriceLow: 'কম দাম থেকে বেশি',
    sortPriceHigh: 'বেশি দাম থেকে কম',
    sortChangeHigh: 'সর্বোচ্চ দর পরিবর্তন',

    // Market Stats
    marketPulseTitle: 'আজকের বাজার পরিস্থিতির সারসংক্ষেপ',
    trackedCommodities: 'নজরদারিকৃত পণ্য',
    priceDrops: 'দরপতন ঘটেছে',
    priceSpikes: 'দরবৃদ্ধি পেয়েছে',
    unchanged: 'অপরিবর্তিত',
    topSpikeItem: 'সর্বোচ্চ বৃদ্ধি',
    topDropItem: 'সর্বোচ্চ পতন',
    todaySummary: 'আজকের সামগ্রিক বাজারদর পরিস্থিতি স্থিতিশীল ও স্বাভাবিক।',

    // Price Card
    priceRange: 'বাজারদর সীমা',
    averagePrice: 'গড় দাম',
    priceStatus: 'আজকের পরিবর্তন',
    priceDropped: 'কমেছে',
    priceIncreased: 'বেড়েছে',
    priceStable: 'অপরিবর্তিত',
    sourceLabel: 'উৎস',
    lastUpdated: 'আপডেট',
    calculatorBtn: 'হিসাব করুন',
    trendBtn: 'মূল্য ইতিহাস',
    anomalyAlert: 'অস্বাভাবিক দাম শনাক্ত',
    verifiedBadge: 'যাচাইকৃত',

    // Price Converter / Calculator
    calculatorTitle: 'ওজন ও খরচের লাইভ হিসাব',
    calculatorSubtitle: 'আপনার বাজেট অনুযায়ী কতটুকু পাবেন বা নির্দিষ্ট ওজনে কত খরচ হবে হিসাব করুন।',
    estimateNotice: 'আনুমানিক হিসাব',
    estimateNoticeDesc: 'এটি খুচরা গড় মূল্যের ভিত্তিতে প্রস্তুতকৃত গাণিতিক হিসাব। বাজারে সামান্য ভিন্নতা হতে পারে।',
    modeWeightToPrice: 'ওজন থেকে দাম বের করুন',
    modePriceToWeight: 'বাজেট থেকে ওজন বের করুন',
    enterWeight: 'ওজন লিখুন',
    enterBudget: 'আপনার বাজেট (টাকা)',
    selectUnit: 'একক',
    calculatedCost: 'আনুমানিক খরচ',
    calculatedAmount: 'আপনি পাবেন',
    presetWeights: 'দ্রুত নির্বাচন',
    takaUnit: 'টাকা',

    // Cross-district compare
    compareTitle: 'কোথায় দাম কম? (জেলা ভিত্তিক তুলনা)',
    compareSubtitle: 'বাংলাদেশের বিভিন্ন প্রধান জেলায় একই পণ্যের আজকের বাজারদর তুলনা করুন।',
    selectProductToCompare: 'তুলনার জন্য পণ্য বেছে নিন',
    districtHeader: 'জেলা',
    divisionHeader: 'বিভাগ',
    retailRangeHeader: 'খুচরা দর (টাকা)',
    averageHeader: 'গড় দাম',
    comparisonHeader: 'পার্থক্য',
    lowestPriceTag: '★ সর্বনিম্ন দাম',
    cheaperBy: 'কম',
    costlierBy: 'বেশি',
    samePrice: 'একই দর',

    // Trend Modal
    trendTitle: '৩০ দিনের মূল্য পরিবর্তন চিত্র',
    trendSubtitle: 'গত এক মাসের দৈনিক সর্বনিম্ন, সর্বোচ্চ ও গড় বাজারদরের গতিপ্রকৃতি।',
    lowestInMonth: 'মাসের সর্বনিম্ন',
    highestInMonth: 'মাসের সর্বোচ্চ',
    monthAvg: 'মাসিক গড়',
    closeBtn: 'বন্ধ করুন',

    // Transparency Modal
    transparencyTitle: 'তথ্য সংগ্রহ ও যাচাইকরণ পদ্ধতি',
    transparencyP1: 'DaamBD কোনো ই-কমার্স বা বাণিজ্যিক প্রতিষ্ঠান নয়। এটি একটি অলাভজনক ও উন্মুক্ত বাজারদর পর্যবেক্ষণ প্ল্যাটফর্ম।',
    sourceDAM: 'কৃষি বিপণন অধিদপ্তর (DAM), কৃষি মন্ত্রণালয়',
    sourceTCB: 'ট্রেডিং কর্পোরেশন অব বাংলাদেশ (TCB)',
    zeroFakeGuarantee: 'জিরো ফেইক প্রাইস গ্যারান্টি',
    zeroFakeDesc: 'প্রতিটি মূল্য সরকারি ডেটা ফিড থেকে সরাসরি রিয়েল-টাইমে সংগ্রহ করা হয় এবং অস্বাভাবিক উলম্ফন রোধে অটোমেটেড ভ্যালিডেটর দ্বারা যাচাই করা হয়।',

    // Common
    itemsFound: 'টি পণ্য পাওয়া গেছে',
    noItemsFound: 'কোনো পণ্য পাওয়া যায়নি। অন্য কোনো নাম দিয়ে চেষ্টা করুন।',
    kgUnit: 'কেজি',
    gramUnit: 'গ্রাম',
    literUnit: 'লিটার',
    pieceUnit: 'হালি',
  },
  en: {
    // Header
    brandName: 'DaamBD',
    brandTagline: 'Today’s Market Prices in Bangladesh, in One Place',
    districtSelect: 'Select District',
    allDistricts: 'All Bangladesh',
    officialVerified: 'Verified via DAM (Ministry of Agriculture)',
    liveUpdate: 'Live Update',
    transparencyBtn: 'Data Sources & Methodology',

    // Hero & Filters
    searchPlaceholder: 'Search grocery items (e.g., Onion, Rice, Oil, Beef, Potato)...',
    allCategories: 'All Items',
    retailTab: 'Retail Prices',
    wholesaleTab: 'Wholesale Prices',
    filterAll: 'All Movements',
    filterDrop: '↓ Price Drops',
    filterSpike: '↑ Price Spikes',
    filterStable: '— Stable',
    sortBy: 'Sort By',
    sortDefault: 'Popularity',
    sortPriceLow: 'Price: Low to High',
    sortPriceHigh: 'Price: High to Low',
    sortChangeHigh: 'Highest Price Change',

    // Market Stats
    marketPulseTitle: "Today's Market Pulse Summary",
    trackedCommodities: 'Tracked Items',
    priceDrops: 'Price Drops',
    priceSpikes: 'Price Spikes',
    unchanged: 'Unchanged',
    topSpikeItem: 'Top Price Spike',
    topDropItem: 'Top Price Drop',
    todaySummary: 'Overall market conditions today are steady with standard seasonal variations.',

    // Price Card
    priceRange: 'Price Range',
    averagePrice: 'Average Price',
    priceStatus: 'Today’s Change',
    priceDropped: 'dropped',
    priceIncreased: 'increased',
    priceStable: 'stable',
    sourceLabel: 'Source',
    lastUpdated: 'Updated',
    calculatorBtn: 'Calculate',
    trendBtn: 'Price Trend',
    anomalyAlert: 'Price Anomaly Detected',
    verifiedBadge: 'Verified',

    // Price Converter / Calculator
    calculatorTitle: 'Weight & Budget Live Calculator',
    calculatorSubtitle: 'Calculate exact cost for a specific weight or weight you receive for your budget.',
    estimateNotice: 'Calculated Estimate',
    estimateNoticeDesc: 'This is a mathematical estimation based on current average retail rates. Market prices may slightly vary.',
    modeWeightToPrice: 'Calculate Cost from Weight',
    modePriceToWeight: 'Calculate Weight from Budget',
    enterWeight: 'Enter Weight',
    enterBudget: 'Your Budget (BDT)',
    selectUnit: 'Unit',
    calculatedCost: 'Estimated Cost',
    calculatedAmount: 'You Will Get',
    presetWeights: 'Quick Select',
    takaUnit: 'BDT',

    // Cross-district compare
    compareTitle: 'Where is it Cheaper? (Cross-District Matrix)',
    compareSubtitle: 'Compare today’s real prices for the same commodity across major districts of Bangladesh.',
    selectProductToCompare: 'Select Item to Compare',
    districtHeader: 'District',
    divisionHeader: 'Division',
    retailRangeHeader: 'Retail Range (BDT)',
    averageHeader: 'Average Price',
    comparisonHeader: 'Variance',
    lowestPriceTag: '★ Lowest Price',
    cheaperBy: 'cheaper',
    costlierBy: 'costlier',
    samePrice: 'Same Rate',

    // Trend Modal
    trendTitle: '30-Day Price Movement History',
    trendSubtitle: 'Daily price curve showing minimum, maximum, and average market rates over the past month.',
    lowestInMonth: 'Monthly Lowest',
    highestInMonth: 'Monthly Highest',
    monthAvg: 'Monthly Average',
    closeBtn: 'Close',

    // Transparency Modal
    transparencyTitle: 'Data Collection & Verification Methodology',
    transparencyP1: 'DaamBD is not an e-commerce platform. It is an independent, non-profit public price intelligence utility.',
    sourceDAM: 'Department of Agricultural Marketing (DAM), Ministry of Agriculture',
    sourceTCB: 'Trading Corporation of Bangladesh (TCB)',
    zeroFakeGuarantee: 'Zero Fake Price Guarantee',
    zeroFakeDesc: 'All prices are directly aggregated from official government market feeds and cross-verified via automated sanity algorithms.',

    // Common
    itemsFound: 'items found',
    noItemsFound: 'No items found matching your criteria.',
    kgUnit: 'Kg',
    gramUnit: 'Gram',
    literUnit: 'Liter',
    pieceUnit: 'Hali (4 pcs)',
  }
};
