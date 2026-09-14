import { NextRequest, NextResponse } from 'next/server';
import { getMarketPricesForDistrict, getMarketSummaryStats } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || 'Dhaka';
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search')?.toLowerCase() || '';
    const movement = searchParams.get('movement') || 'all';
    const sort = searchParams.get('sort') || 'default';

    let items = getMarketPricesForDistrict(district);

    // Filter by Category
    if (category !== 'all') {
      items = items.filter((item) => item.categorySlug === category);
    }

    // Filter by Search (supports Bangla & English substring)
    if (search) {
      items = items.filter(
        (item) =>
          item.nameBn.toLowerCase().includes(search) ||
          item.nameEn.toLowerCase().includes(search) ||
          item.categoryBn.toLowerCase().includes(search) ||
          item.categoryEn.toLowerCase().includes(search)
      );
    }

    // Filter by Price Movement
    if (movement !== 'all') {
      items = items.filter((item) => item.movement === movement);
    }

    // Sort
    if (sort === 'price-low') {
      items.sort((a, b) => a.retail.avgPrice - b.retail.avgPrice);
    } else if (sort === 'price-high') {
      items.sort((a, b) => b.retail.avgPrice - a.retail.avgPrice);
    } else if (sort === 'change') {
      items.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
    }

    const stats = getMarketSummaryStats(getMarketPricesForDistrict(district));

    return NextResponse.json({
      success: true,
      district,
      total: items.length,
      items,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch market prices' },
      { status: 500 }
    );
  }
}
