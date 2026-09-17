export type Language = "bn" | "en";

export type PriceType = "retail" | "wholesale";

export type AnomalyStatus =
  | "normal"
  | "warning"
  | "critical";

export type PriceMovement =
  | "up"
  | "down"
  | "stable";

export interface PriceSource {
  code: string;
  nameBn: string;
  nameEn: string;
  trustLevel:
    | "official_gov"
    | "verified_field"
    | "crowdsourced";
  sourceUrl?: string;
  verified: boolean;
}

export interface PriceRecord {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  unitBn: string;
  unitEn: string;
  lowestPrice?: number;
  highestPrice?: number;
}

export interface DailyPriceItem {
  id: string | number;
  commodityId: number;

  nameBn: string;
  nameEn: string;

  slug?: string;

  commodityNameBn?: string;
  commodityName?: string;

  category?: string;

  categoryBn?: string;
  categoryEn?: string;
  categorySlug?: string;

  districtBn?: string;
  districtEn?: string;

  unitId?: number;
  unitBn: string;
  unitEn: string;

  unitRetailId?: number | null;
  unitWholesaleId?: number | null;

  price: number;
  avgPrice: number;
  averagePrice: number;

  retailPrice: number;
  retailAvg: number;
  retailLow: number;
  retailHigh: number;

  wholesaleAvg?: number | null;
  wholesaleLow?: number | null;
  wholesaleHigh?: number | null;

  previousAvgPrice?: number | null;
  previousPriceDate?: string | null;

  priceChange: number;
  priceChangePercent: number;

  priceChangeType:
    | "increase"
    | "decrease"
    | "unchanged"
    | "no_data";

  retail?: PriceRecord;
  wholesale?: PriceRecord;

  anomalyStatus?: AnomalyStatus;
  anomalyReasons?: string[];

  movement?: PriceMovement;
  pctChange?: number;

  source: string | PriceSource;

  reportDate: string;
  collectedAt?: string;

  imageUrl?: string;

  history30Days: Array<{
    date: string;
    avgPrice: number;
    minPrice?: number;
    maxPrice?: number;
  }>;
}

export interface DistrictComparisonItem {
  districtEn: string;
  districtBn: string;
  divisionEn: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  unitBn: string;
  unitEn: string;
  isLowest?: boolean;
  diffFromLowest?: number;
}

export interface MarketSummaryStats {
  totalItems: number;
  increasedCount: number;
  decreasedCount: number;
  stableCount: number;

  topSpikeItem: {
    nameBn: string;
    nameEn: string;
    change: number;
    pctChange: number;
  } | null;

  topDropItem: {
    nameBn: string;
    nameEn: string;
    change: number;
    pctChange: number;
  } | null;

  lastUpdated: string;
}