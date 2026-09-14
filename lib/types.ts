export type Language = 'bn' | 'en';
export type PriceType = 'retail' | 'wholesale';
export type AnomalyStatus = 'normal' | 'warning' | 'critical';
export type PriceMovement = 'up' | 'down' | 'stable';

export interface PriceSource {
  code: string;
  nameBn: string;
  nameEn: string;
  trustLevel: 'official_gov' | 'verified_field' | 'crowdsourced';
  sourceUrl?: string;
  verified: boolean;
}

export interface PriceRecord {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  unitBn: string;
  unitEn: string;
}

export interface DailyPriceItem {
  id: string;
  commodityId: number;
  nameBn: string;
  nameEn: string;
  slug: string;
  categoryBn: string;
  categoryEn: string;
  categorySlug: string;
  districtBn: string;
  districtEn: string;
  retail: PriceRecord;
  wholesale: PriceRecord;
  anomalyStatus: AnomalyStatus;
  anomalyReasons?: string[];
  priceChange: number;
  movement: PriceMovement;
  pctChange: number;
  source: PriceSource;
  reportDate: string;
  collectedAt: string;
  imageUrl?: string;
  history30Days: Array<{
    date: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
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
