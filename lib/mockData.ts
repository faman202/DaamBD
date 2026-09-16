import { DailyPriceItem, MarketSummaryStats } from './types';

export interface LocationItem {
  en: string;
  bn: string;
  divisionEn: string;
  divisionBn: string;
  isSubDistrict?: boolean;
}

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
    bn: 'কুমিল্লা (কাান্দিরপাড়)',
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

// Helper to generate 30 days realistic curve
function generate30DayHistory(
  baseAvg: number,
  volatility: number = 0.04
) {
  const history = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const dateStr = d.toISOString().split('T')[0];

    // Wave simulation
    const wave =
      Math.sin((30 - i) * 0.3) *
      (baseAvg * volatility);

    const noise =
      (Math.random() - 0.5) *
      (baseAvg * (volatility * 0.5));

    const avg =
      Math.round((baseAvg + wave + noise) * 10) / 10;

    const spread = Math.max(
      2,
      Math.round(avg * 0.05)
    );

    history.push({
      date: dateStr,
      avgPrice: avg,
      minPrice: Math.round(avg - spread),
      maxPrice: Math.round(avg + spread),
    });
  }

  return history;
}

const RAW_COMMODITY_DEFINITIONS = [
  {
    commodityId: 1,
    nameBn: 'মোটা চাল (স্বর্ণা/চায়না)',
    nameEn: 'Coarse Rice (Swarna/China)',
    slug: 'coarse-rice',
    categorySlug: 'grains',
    categoryBn: 'চাল ও খাদ্যশস্য',
    categoryEn: 'Grains & Cereals',
    baseMin: 50,
    baseMax: 54,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -1.5,
    movement: 'down' as const,
    pctChange: -2.8,
  },
  {
    commodityId: 2,
    nameBn: 'মাঝারি চাল (পাইজাম/লতা)',
    nameEn: 'Medium Rice (Paijam/Lata)',
    slug: 'medium-rice',
    categorySlug: 'grains',
    categoryBn: 'চাল ও খাদ্যশস্য',
    categoryEn: 'Grains & Cereals',
    baseMin: 60,
    baseMax: 65,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
  {
    commodityId: 3,
    nameBn: 'সরু চাল (মিনিকেট/নাজিরশাইল)',
    nameEn: 'Fine Rice (Miniket/Nazirshail)',
    slug: 'fine-rice',
    categorySlug: 'grains',
    categoryBn: 'চাল ও খাদ্যশস্য',
    categoryEn: 'Grains & Cereals',
    baseMin: 76,
    baseMax: 84,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 2.0,
    movement: 'up' as const,
    pctChange: 2.5,
  },
  {
    commodityId: 4,
    nameBn: 'খোলা আটা',
    nameEn: 'Loose Flour (Atta)',
    slug: 'loose-flour',
    categorySlug: 'grains',
    categoryBn: 'চাল ও খাদ্যশস্য',
    categoryEn: 'Grains & Cereals',
    baseMin: 42,
    baseMax: 46,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -2.0,
    movement: 'down' as const,
    pctChange: -4.3,
  },
  {
    commodityId: 6,
    nameBn: 'দেশি মসুর ডাল (সরু)',
    nameEn: 'Local Red Lentil (Mosur Dal)',
    slug: 'local-lentil',
    categorySlug: 'pulses',
    categoryBn: 'ডাল ও শিম',
    categoryEn: 'Pulses & Lentils',
    baseMin: 135,
    baseMax: 145,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
  {
    commodityId: 7,
    nameBn: 'আমদানি মসুর ডাল (মোটা)',
    nameEn: 'Imported Red Lentil (Mosur Dal)',
    slug: 'imported-lentil',
    categorySlug: 'pulses',
    categoryBn: 'ডাল ও শিম',
    categoryEn: 'Pulses & Lentils',
    baseMin: 105,
    baseMax: 112,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -3.0,
    movement: 'down' as const,
    pctChange: -2.7,
  },
  {
    commodityId: 8,
    nameBn: 'মুগ ডাল',
    nameEn: 'Mung Dal',
    slug: 'mung-dal',
    categorySlug: 'pulses',
    categoryBn: 'ডাল ও শিম',
    categoryEn: 'Pulses & Lentils',
    baseMin: 160,
    baseMax: 175,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 5.0,
    movement: 'up' as const,
    pctChange: 3.1,
  },
  {
    commodityId: 9,
    nameBn: 'খোলা সয়াবিন তেল',
    nameEn: 'Loose Soybean Oil',
    slug: 'loose-soybean-oil',
    categorySlug: 'oils',
    categoryBn: 'ভোজ্যতেল',
    categoryEn: 'Edible Oils',
    baseMin: 162,
    baseMax: 168,
    unitBn: 'লিটার',
    unitEn: 'liter',
    priceChange: -2.0,
    movement: 'down' as const,
    pctChange: -1.2,
  },
  {
    commodityId: 10,
    nameBn: 'বোতলজাত সয়াবিন তেল (১ লিটার)',
    nameEn: 'Bottled Soybean Oil (1L)',
    slug: 'bottled-soybean-oil-1l',
    categorySlug: 'oils',
    categoryBn: 'ভোজ্যতেল',
    categoryEn: 'Edible Oils',
    baseMin: 175,
    baseMax: 175,
    unitBn: 'লিটার',
    unitEn: 'liter',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
  {
    commodityId: 13,
    nameBn: 'আলু (ডায়মন্ড/সাদা)',
    nameEn: 'Potato (Diamond/White)',
    slug: 'potato-diamond',
    categorySlug: 'vegetables',
    categoryBn: 'শাকসবজি',
    categoryEn: 'Vegetables',
    baseMin: 52,
    baseMax: 58,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -4.0,
    movement: 'down' as const,
    pctChange: -6.8,
  },
  {
    commodityId: 14,
    nameBn: 'দেশি পেঁয়াজ',
    nameEn: 'Local Onion',
    slug: 'local-onion',
    categorySlug: 'spices',
    categoryBn: 'মসলা',
    categoryEn: 'Spices',
    baseMin: 110,
    baseMax: 120,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -5.0,
    movement: 'down' as const,
    pctChange: -4.2,
  },
  {
    commodityId: 15,
    nameBn: 'আমদানি পেঁয়াজ (ভারতীয়)',
    nameEn: 'Imported Onion (Indian)',
    slug: 'imported-onion',
    categorySlug: 'spices',
    categoryBn: 'মসলা',
    categoryEn: 'Spices',
    baseMin: 90,
    baseMax: 100,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -2.0,
    movement: 'down' as const,
    pctChange: -2.1,
  },
  {
    commodityId: 16,
    nameBn: 'দেশি রসুন',
    nameEn: 'Local Garlic',
    slug: 'local-garlic',
    categorySlug: 'spices',
    categoryBn: 'মসলা',
    categoryEn: 'Spices',
    baseMin: 200,
    baseMax: 220,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 10.0,
    movement: 'up' as const,
    pctChange: 5.0,
  },
  {
    commodityId: 18,
    nameBn: 'আমদানি আদা',
    nameEn: 'Imported Ginger',
    slug: 'imported-ginger',
    categorySlug: 'spices',
    categoryBn: 'মসলা',
    categoryEn: 'Spices',
    baseMin: 250,
    baseMax: 275,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
  {
    commodityId: 19,
    nameBn: 'কাঁচা মরিচ',
    nameEn: 'Green Chili',
    slug: 'green-chili',
    categorySlug: 'vegetables',
    categoryBn: 'শাকসবজি',
    categoryEn: 'Vegetables',
    baseMin: 160,
    baseMax: 190,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 25.0,
    movement: 'up' as const,
    pctChange: 16.7,
  },
  {
    commodityId: 20,
    nameBn: 'গোল বেগুন',
    nameEn: 'Round Eggplant (Begun)',
    slug: 'round-eggplant',
    categorySlug: 'vegetables',
    categoryBn: 'শাকসবজি',
    categoryEn: 'Vegetables',
    baseMin: 65,
    baseMax: 75,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -5.0,
    movement: 'down' as const,
    pctChange: -6.7,
  },
  {
    commodityId: 21,
    nameBn: 'পাকা টমেটো',
    nameEn: 'Ripe Tomato',
    slug: 'ripe-tomato',
    categorySlug: 'vegetables',
    categoryBn: 'শাকসবজি',
    categoryEn: 'Vegetables',
    baseMin: 60,
    baseMax: 70,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 5.0,
    movement: 'up' as const,
    pctChange: 8.3,
  },
  {
    commodityId: 22,
    nameBn: 'ব্রয়লার মুরগি',
    nameEn: 'Broiler Chicken',
    slug: 'broiler-chicken',
    categorySlug: 'meat-eggs',
    categoryBn: 'মাংস ও ডিম',
    categoryEn: 'Meat & Eggs',
    baseMin: 180,
    baseMax: 190,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -5.0,
    movement: 'down' as const,
    pctChange: -2.6,
  },
  {
    commodityId: 23,
    nameBn: 'সোনালী মুরগি',
    nameEn: 'Sonali Chicken',
    slug: 'sonali-chicken',
    categorySlug: 'meat-eggs',
    categoryBn: 'মাংস ও ডিম',
    categoryEn: 'Meat & Eggs',
    baseMin: 280,
    baseMax: 300,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 10.0,
    movement: 'up' as const,
    pctChange: 3.6,
  },
  {
    commodityId: 24,
    nameBn: 'গরুর মাংস',
    nameEn: 'Beef (Standard)',
    slug: 'beef-standard',
    categorySlug: 'meat-eggs',
    categoryBn: 'মাংস ও ডিম',
    categoryEn: 'Meat & Eggs',
    baseMin: 750,
    baseMax: 780,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
  {
    commodityId: 25,
    nameBn: 'খাসির মাংস',
    nameEn: 'Mutton / Goat Meat',
    slug: 'mutton-meat',
    categorySlug: 'meat-eggs',
    categoryBn: 'মাংস ও ডিম',
    categoryEn: 'Meat & Eggs',
    baseMin: 1050,
    baseMax: 1150,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
  {
    commodityId: 26,
    nameBn: 'ফার্মের মুরগির ডিম (হালি)',
    nameEn: 'Farm Chicken Eggs (Hali - 4pcs)',
    slug: 'farm-eggs-hali',
    categorySlug: 'meat-eggs',
    categoryBn: 'মাংস ও ডিম',
    categoryEn: 'Meat & Eggs',
    baseMin: 50,
    baseMax: 54,
    unitBn: 'হালি',
    unitEn: 'hali',
    priceChange: -2.0,
    movement: 'down' as const,
    pctChange: -3.7,
  },
  {
    commodityId: 27,
    nameBn: 'ইলিশ মাছ (১ কেজি সাইজ)',
    nameEn: 'Hilsha Fish (1kg Size)',
    slug: 'hilsha-fish-1kg',
    categorySlug: 'fish',
    categoryBn: 'মাছ',
    categoryEn: 'Fish & Seafood',
    baseMin: 1400,
    baseMax: 1550,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 50.0,
    movement: 'up' as const,
    pctChange: 3.5,
  },
  {
    commodityId: 28,
    nameBn: 'রুই মাছ (মাঝারি ২-৩ কেজি)',
    nameEn: 'Rui Fish (Medium 2-3kg)',
    slug: 'rui-fish-medium',
    categorySlug: 'fish',
    categoryBn: 'মাছ',
    categoryEn: 'Fish & Seafood',
    baseMin: 360,
    baseMax: 400,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: -10.0,
    movement: 'down' as const,
    pctChange: -2.6,
  },
  {
    commodityId: 29,
    nameBn: 'সাদা চিনি (খোলা)',
    nameEn: 'Refined White Sugar',
    slug: 'refined-sugar',
    categorySlug: 'essentials',
    categoryBn: 'নিত্যপণ্য',
    categoryEn: 'Essentials',
    baseMin: 132,
    baseMax: 138,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
  {
    commodityId: 30,
    nameBn: 'প্যাকেট আয়োডিনযুক্ত লবণ',
    nameEn: 'Packaged Iodized Salt',
    slug: 'packaged-salt',
    categorySlug: 'essentials',
    categoryBn: 'নিত্যপণ্য',
    categoryEn: 'Essentials',
    baseMin: 40,
    baseMax: 45,
    unitBn: 'কেজি',
    unitEn: 'kg',
    priceChange: 0,
    movement: 'stable' as const,
    pctChange: 0.0,
  },
];

const DISTRICT_SKEW: Record<
  string,
  { factor: number; bn: string }
> = {
  // Dhaka Division
  Dhaka: {
    factor: 1.0,
    bn: 'ঢাকা (সিটি)',
  },
  Manikganj: {
    factor: 0.93,
    bn: 'মানিকগঞ্জ',
  },
  Gazipur: {
    factor: 0.98,
    bn: 'গাজীপুর',
  },
  Narayanganj: {
    factor: 0.99,
    bn: 'নারায়ণগঞ্জ',
  },
  Savar: {
    factor: 0.96,
    bn: 'সাভার',
  },
  Tangail: {
    factor: 0.92,
    bn: 'টাঙ্গাইল',
  },
  Munshiganj: {
    factor: 0.94,
    bn: 'মুন্সীগঞ্জ',
  },
  Narsingdi: {
    factor: 0.93,
    bn: 'নরসিংদী',
  },
  Faridpur: {
    factor: 0.91,
    bn: 'ফরিদপুর',
  },

  // Chattogram Division
  Chattogram: {
    factor: 1.04,
    bn: 'চট্টগ্রাম (সিটি)',
  },
  Cumilla: {
    factor: 1.01,
    bn: 'কুমিল্লা',
  },
  CoxsBazar: {
    factor: 1.08,
    bn: 'কক্সবাজার',
  },
  Feni: {
    factor: 1.02,
    bn: 'ফেনী',
  },
  Noakhali: {
    factor: 1.03,
    bn: 'নোয়াখালী',
  },
  Brahmanbaria: {
    factor: 0.97,
    bn: 'ব্রাহ্মণবাড়িয়া',
  },

  // Rajshahi Division
  Rajshahi: {
    factor: 0.92,
    bn: 'রাজশাহী (সিটি)',
  },
  Bogura: {
    factor: 0.89,
    bn: 'বগুড়া',
  },
  Pabna: {
    factor: 0.9,
    bn: 'পাবনা',
  },
  Naogaon: {
    factor: 0.87,
    bn: 'নওগাঁ',
  },
  Sirajganj: {
    factor: 0.91,
    bn: 'সিরাজগঞ্জ',
  },

  // Khulna Division
  Khulna: {
    factor: 0.94,
    bn: 'খুলনা (সিটি)',
  },
  Jashore: {
    factor: 0.89,
    bn: 'যশোর',
  },
  Kushtia: {
    factor: 0.9,
    bn: 'কুষ্টিয়া',
  },
  Satkhira: {
    factor: 0.92,
    bn: 'সাতক্ষীরা',
  },

  // Sylhet Division
  Sylhet: {
    factor: 1.06,
    bn: 'সিলেট (সিটি)',
  },
  Moulvibazar: {
    factor: 1.05,
    bn: 'মৌলভীবাজার',
  },
  Habiganj: {
    factor: 1.02,
    bn: 'হবিগঞ্জ',
  },
  Sunamganj: {
    factor: 1.04,
    bn: 'সুনামগঞ্জ',
  },

  // Barishal Division
  Barishal: {
    factor: 0.96,
    bn: 'বরিশাল (সিটি)',
  },
  Bhola: {
    factor: 0.98,
    bn: 'ভোলা',
  },
  Patuakhali: {
    factor: 0.97,
    bn: 'পটুয়াখালী',
  },

  // Rangpur Division
  Rangpur: {
    factor: 0.9,
    bn: 'রংপুর (সিটি)',
  },
  Dinajpur: {
    factor: 0.86,
    bn: 'দিনাজপুর',
  },
  Kurigram: {
    factor: 0.88,
    bn: 'কুড়িগ্রাম',
  },

  // Mymensingh Division
  Mymensingh: {
    factor: 0.93,
    bn: 'ময়মনসিংহ (সিটি)',
  },
  Jamalpur: {
    factor: 0.9,
    bn: 'জামালপুর',
  },
  Netrokona: {
    factor: 0.91,
    bn: 'নেত্রকোণা',
  },
};

export function getMarketPricesForDistrict(
  districtEn: string = 'Dhaka'
): DailyPriceItem[] {
  const skew =
    DISTRICT_SKEW[districtEn] || {
      factor: 1.0,
      bn: districtEn,
    };

  const todayStr =
    new Date().toISOString().split('T')[0];

  return RAW_COMMODITY_DEFINITIONS.map((item) => {
    const factor = skew.factor;

    const minPrice = Math.round(
      item.baseMin * factor
    );

    const maxPrice = Math.round(
      item.baseMax * factor
    );

    const avgPrice =
      Math.round(
        ((minPrice + maxPrice) / 2) * 10
      ) / 10;

    const wholesaleMin = Math.round(
      minPrice * 0.88
    );

    const wholesaleMax = Math.round(
      maxPrice * 0.88
    );

    const wholesaleAvg =
      Math.round(
        ((wholesaleMin + wholesaleMax) / 2) * 10
      ) / 10;

    const history =
      generate30DayHistory(avgPrice);

    return {
      id: `${item.slug}-${districtEn.toLowerCase()}`,

      commodityId: item.commodityId,

      nameBn: item.nameBn,
      nameEn: item.nameEn,

      slug: item.slug,

      // IMPORTANT:
      // DailyPriceItem requires unit fields at top level.
      unitBn: item.unitBn,
      unitEn: item.unitEn,

      categoryBn: item.categoryBn,
      categoryEn: item.categoryEn,
      categorySlug: item.categorySlug,

      districtBn: skew.bn,
      districtEn: districtEn,

      retail: {
        minPrice,
        maxPrice,
        avgPrice,
        unitBn: item.unitBn,
        unitEn: item.unitEn,

        // Compatibility with API PriceRecord
        lowestPrice: minPrice,
        highestPrice: maxPrice,
      },

      wholesale: {
        minPrice: wholesaleMin,
        maxPrice: wholesaleMax,
        avgPrice: wholesaleAvg,
        unitBn: item.unitBn,
        unitEn: item.unitEn,

        // Compatibility with API PriceRecord
        lowestPrice: wholesaleMin,
        highestPrice: wholesaleMax,
      },

      anomalyStatus: 'normal' as const,

      priceChange: item.priceChange,
      movement: item.movement,
      pctChange: item.pctChange,

      source: {
        code: 'DAM_MOA',
        nameBn: 'কৃষি বিপণন অধিদপ্তর (DAM)',
        nameEn:
          'Dept. of Agricultural Marketing (DAM)',
        trustLevel: 'official_gov' as const,
        sourceUrl:
          'https://moa-services.com/agri-service/',
        verified: true,
      },

      reportDate: todayStr,

      collectedAt:
        new Date().toISOString(),

      history30Days: history,
    };
  });
}

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
    if (item.movement === 'up') {
      increasedCount++;

      if (
        !topSpikeItem ||
        item.pctChange > topSpikeItem.pctChange
      ) {
        topSpikeItem = {
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          change: item.priceChange,
          pctChange: item.pctChange,
        };
      }
    } else if (item.movement === 'down') {
      decreasedCount++;

      if (
        !topDropItem ||
        item.pctChange < topDropItem.pctChange
      ) {
        topDropItem = {
          nameBn: item.nameBn,
          nameEn: item.nameEn,
          change: item.priceChange,
          pctChange: item.pctChange,
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

export function getCrossDistrictComparison(
  commoditySlug: string
) {
  const targetCommodity =
    RAW_COMMODITY_DEFINITIONS.find(
      (c) => c.slug === commoditySlug
    ) || RAW_COMMODITY_DEFINITIONS[0];

  const comparisonList = DISTRICTS.map((d) => {
    const skew =
      DISTRICT_SKEW[d.en] || {
        factor: 1.0,
        bn: d.bn,
      };

    const minPrice = Math.round(
      targetCommodity.baseMin * skew.factor
    );

    const maxPrice = Math.round(
      targetCommodity.baseMax * skew.factor
    );

    const avgPrice =
      Math.round(
        ((minPrice + maxPrice) / 2) * 10
      ) / 10;

    return {
      districtEn: d.en,
      districtBn: d.bn,
      divisionEn: d.divisionEn,
      minPrice,
      maxPrice,
      avgPrice,
      unitBn: targetCommodity.unitBn,
      unitEn: targetCommodity.unitEn,
    };
  });

  // Sort by average price ascending
  comparisonList.sort(
    (a, b) => a.avgPrice - b.avgPrice
  );

  const lowestAvg =
    comparisonList[0]?.avgPrice ?? 0;

  return comparisonList.map((item, idx) => ({
    ...item,
    isLowest: idx === 0,
    diffFromLowest:
      Math.round(
        (item.avgPrice - lowestAvg) * 10
      ) / 10,
  }));
}