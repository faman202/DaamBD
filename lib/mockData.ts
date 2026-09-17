import { DailyPriceItem, MarketSummaryStats } from './types';

export interface LocationItem {
  en: string;
  bn: string;
  divisionEn: string;
  divisionBn: string;
  isSubDistrict?: boolean;
}

/* =========================================================
   DIVISIONS
   Display locations only.
   Actual DAM IDs are handled by the API layer.
   ========================================================= */

export const DIVISIONS = [
  { en: 'Dhaka', bn: 'ঢাকা বিভাগ' },
  { en: 'Chattogram', bn: 'চট্টগ্রাম বিভাগ' },
  { en: 'Rajshahi', bn: 'রাজশাহী বিভাগ' },
  { en: 'Khulna', bn: 'খুলনা বিভাগ' },
  { en: 'Sylhet', bn: 'সিলেট বিভাগ' },
  { en: 'Barishal', bn: 'বরিশাল বিভাগ' },
  { en: 'Rangpur', bn: 'রংপুর বিভাগ' },
  { en: 'Mymensingh', bn: 'ময়মনসিংহ বিভাগ' },
];

/* =========================================================
   DISTRICTS / LOCATIONS
   Curated display list used by the DaamBD UI.
   ========================================================= */

export const DISTRICTS: LocationItem[] = [
  // Dhaka Division
  {
    en: 'Dhaka',
    bn: 'ঢাকা (সিটি কর্পোরেশন)',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
  },
  {
    en: 'Manikganj',
    bn: 'মানিকগঞ্জ (মানিকগঞ্জ সদর)',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Gazipur',
    bn: 'গাজীপুর (টঙ্গী/গাজীপুর)',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Narayanganj',
    bn: 'নারায়ণগঞ্জ (চাষাড়া)',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Savar',
    bn: 'সাভার (সাভার বাজার)',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Tangail',
    bn: 'টাঙ্গাইল',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Munshiganj',
    bn: 'মুন্সীগঞ্জ',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Narsingdi',
    bn: 'নরসিংদী',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Faridpur',
    bn: 'ফরিদপুর',
    divisionEn: 'Dhaka',
    divisionBn: 'ঢাকা বিভাগ',
    isSubDistrict: true,
  },

  // Chattogram Division
  {
    en: 'Chattogram',
    bn: 'চট্টগ্রাম (সিটি কর্পোরেশন)',
    divisionEn: 'Chattogram',
    divisionBn: 'চট্টগ্রাম বিভাগ',
  },
  {
    en: 'Cumilla',
    bn: 'কুমিল্লা (কান্দিরপাড়)',
    divisionEn: 'Chattogram',
    divisionBn: 'চট্টগ্রাম বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'CoxsBazar',
    bn: 'কক্সবাজার',
    divisionEn: 'Chattogram',
    divisionBn: 'চট্টগ্রাম বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Feni',
    bn: 'ফেনী',
    divisionEn: 'Chattogram',
    divisionBn: 'চট্টগ্রাম বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Noakhali',
    bn: 'নোয়াখালী (মাইজদী)',
    divisionEn: 'Chattogram',
    divisionBn: 'চট্টগ্রাম বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Brahmanbaria',
    bn: 'ব্রাহ্মণবাড়িয়া',
    divisionEn: 'Chattogram',
    divisionBn: 'চট্টগ্রাম বিভাগ',
    isSubDistrict: true,
  },

  // Rajshahi Division
  {
    en: 'Rajshahi',
    bn: 'রাজশাহী (সিটি কর্পোরেশন)',
    divisionEn: 'Rajshahi',
    divisionBn: 'রাজশাহী বিভাগ',
  },
  {
    en: 'Bogura',
    bn: 'বগুড়া (বগুড়া শহর)',
    divisionEn: 'Rajshahi',
    divisionBn: 'রাজশাহী বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Pabna',
    bn: 'পাবনা',
    divisionEn: 'Rajshahi',
    divisionBn: 'রাজশাহী বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Naogaon',
    bn: 'নওগাঁ',
    divisionEn: 'Rajshahi',
    divisionBn: 'রাজশাহী বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Sirajganj',
    bn: 'সিরাজগঞ্জ',
    divisionEn: 'Rajshahi',
    divisionBn: 'রাজশাহী বিভাগ',
    isSubDistrict: true,
  },

  // Khulna Division
  {
    en: 'Khulna',
    bn: 'খুলনা (সিটি কর্পোরেশন)',
    divisionEn: 'Khulna',
    divisionBn: 'খুলনা বিভাগ',
  },
  {
    en: 'Jashore',
    bn: 'যশোর (যশোর শহর)',
    divisionEn: 'Khulna',
    divisionBn: 'খুলনা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Kushtia',
    bn: 'কুষ্টিয়া',
    divisionEn: 'Khulna',
    divisionBn: 'খুলনা বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Satkhira',
    bn: 'সাতক্ষীরা',
    divisionEn: 'Khulna',
    divisionBn: 'খুলনা বিভাগ',
    isSubDistrict: true,
  },

  // Sylhet Division
  {
    en: 'Sylhet',
    bn: 'সিলেট (সিটি কর্পোরেশন)',
    divisionEn: 'Sylhet',
    divisionBn: 'সিলেট বিভাগ',
  },
  {
    en: 'Moulvibazar',
    bn: 'মৌলভীবাজার',
    divisionEn: 'Sylhet',
    divisionBn: 'সিলেট বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Habiganj',
    bn: 'হবিগঞ্জ',
    divisionEn: 'Sylhet',
    divisionBn: 'সিলেট বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Sunamganj',
    bn: 'সুনামগঞ্জ',
    divisionEn: 'Sylhet',
    divisionBn: 'সিলেট বিভাগ',
    isSubDistrict: true,
  },

  // Barishal Division
  {
    en: 'Barishal',
    bn: 'বরিশাল (সিটি কর্পোরেশন)',
    divisionEn: 'Barishal',
    divisionBn: 'বরিশাল বিভাগ',
  },
  {
    en: 'Bhola',
    bn: 'ভোলা',
    divisionEn: 'Barishal',
    divisionBn: 'বরিশাল বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Patuakhali',
    bn: 'পটুয়াখালী',
    divisionEn: 'Barishal',
    divisionBn: 'বরিশাল বিভাগ',
    isSubDistrict: true,
  },

  // Rangpur Division
  {
    en: 'Rangpur',
    bn: 'রংপুর (সিটি কর্পোরেশন)',
    divisionEn: 'Rangpur',
    divisionBn: 'রংপুর বিভাগ',
  },
  {
    en: 'Dinajpur',
    bn: 'দিনাজপুর',
    divisionEn: 'Rangpur',
    divisionBn: 'রংপুর বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Kurigram',
    bn: 'কুড়িগ্রাম',
    divisionEn: 'Rangpur',
    divisionBn: 'রংপুর বিভাগ',
    isSubDistrict: true,
  },

  // Mymensingh Division
  {
    en: 'Mymensingh',
    bn: 'ময়মনসিংহ (সিটি কর্পোরেশন)',
    divisionEn: 'Mymensingh',
    divisionBn: 'ময়মনসিংহ বিভাগ',
  },
  {
    en: 'Jamalpur',
    bn: 'জামালপুর',
    divisionEn: 'Mymensingh',
    divisionBn: 'ময়মনসিংহ বিভাগ',
    isSubDistrict: true,
  },
  {
    en: 'Netrokona',
    bn: 'নেত্রকোণা',
    divisionEn: 'Mymensingh',
    divisionBn: 'ময়মনসিংহ বিভাগ',
    isSubDistrict: true,
  },
];

/* =========================================================
   CATEGORIES
   UI categories only.
   Price data comes from official DAM API.
   ========================================================= */

export const CATEGORIES = [
  {
    slug: 'all',
    nameBn: 'সব পণ্য',
    nameEn: 'All Items',
    icon: 'LayoutGrid',
  },
  {
    slug: 'grains',
    nameBn: 'চাল ও খাদ্যশস্য',
    nameEn: 'Grains & Cereals',
    icon: 'Wheat',
  },
  {
    slug: 'pulses',
    nameBn: 'ডাল ও শিম',
    nameEn: 'Pulses & Lentils',
    icon: 'Coins',
  },
  {
    slug: 'vegetables',
    nameBn: 'শাকসবজি',
    nameEn: 'Vegetables',
    icon: 'Carrot',
  },
  {
    slug: 'meat-eggs',
    nameBn: 'মাংস ও ডিম',
    nameEn: 'Meat & Eggs',
    icon: 'Egg',
  },
  {
    slug: 'fish',
    nameBn: 'মাছ',
    nameEn: 'Fish & Seafood',
    icon: 'Fish',
  },
  {
    slug: 'spices',
    nameBn: 'মসলা',
    nameEn: 'Spices',
    icon: 'Flame',
  },
  {
    slug: 'oils',
    nameBn: 'ভোজ্যতেল',
    nameEn: 'Edible Oils',
    icon: 'Droplets',
  },
  {
    slug: 'essentials',
    nameBn: 'নিত্যপণ্য',
    nameEn: 'Essentials',
    icon: 'Package',
  },
];

/* =========================================================
   LEGACY COMPATIBILITY FUNCTIONS
   ---------------------------------------------------------
   These functions are intentionally kept so existing
   components/imports do not break.

   IMPORTANT:
   They do NOT generate fake prices.

   Real price data must come from:
   /api/prices
   ========================================================= */

/**
 * Returns no local/mock prices.
 *
 * Real prices are fetched from the official DAM API
 * through app/api/prices/route.ts.
 */
export function getMarketPricesForDistrict(
  _districtEn: string = 'Dhaka'
): DailyPriceItem[] {
  return [];
}

/**
 * Calculates summary statistics from actual API items.
 *
 * This function does not create any price data.
 */
export function getMarketSummaryStats(
  items: DailyPriceItem[]
): MarketSummaryStats {
  let increasedCount = 0;
  let decreasedCount = 0;
  let stableCount = 0;

  let topSpikeItem: MarketSummaryStats['topSpikeItem'] =
    null;

  let topDropItem: MarketSummaryStats['topDropItem'] =
    null;

  items.forEach((item) => {
    const movement = String(item.movement);

    const pctChange = Number(item.pctChange) || 0;
    const priceChange = Number(item.priceChange) || 0;

    if (movement === 'up') {
      increasedCount++;

      if (
        !topSpikeItem ||
        pctChange > topSpikeItem.pctChange
      ) {
        topSpikeItem = {
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          change: priceChange,
          pctChange,
        };
      }
    } else if (movement === 'down') {
      decreasedCount++;

      if (
        !topDropItem ||
        pctChange < topDropItem.pctChange
      ) {
        topDropItem = {
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          change: priceChange,
          pctChange,
        };
      }
    } else {
      stableCount++;
    }
  });

  return {
    totalItems: items.length,
    increasedCount,
    decreasedCount,
    stableCount,
    topSpikeItem,
    topDropItem,
    lastUpdated: new Date().toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    ),
  };
}

/**
 * Legacy compatibility function.
 *
 * Previously this generated fake cross-district prices.
 * It now returns an empty list because DaamBD must only
 * display real official DAM data.
 *
 * Cross-district comparison should be implemented using
 * real API data when the required district/market data
 * is available.
 */
export function getCrossDistrictComparison(
  _commoditySlug: string
) {
  return [];
}