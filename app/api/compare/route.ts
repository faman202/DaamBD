import { NextRequest, NextResponse } from 'next/server';
import { getCrossDistrictComparison } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodity = searchParams.get('commodity') || 'local-onion';

    const matrix = getCrossDistrictComparison(commodity);

    return NextResponse.json({
      success: true,
      commodity,
      matrix,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch comparison matrix' },
      { status: 500 }
    );
  }
}
