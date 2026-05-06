import { NextRequest, NextResponse } from 'next/server';
import {
  getAllOfficials,
  searchOfficials,
  getOfficialsCount,
} from '@/lib/supabase/officials';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (query) {
      const officials = await searchOfficials(query, { limit, offset });
      const total = await getOfficialsCount({ searchQuery: query });
      
      return NextResponse.json({
        data: officials,
        total,
        limit,
        offset,
      });
    }

    const officials = await getAllOfficials({ limit, offset });
    const total = await getOfficialsCount();

    return NextResponse.json({
      data: officials,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch officials' },
      { status: 500 }
    );
  }
}
