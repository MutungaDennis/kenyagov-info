import { NextRequest, NextResponse } from 'next/server';
import {
  getOfficialsByParty,
  getOfficialsCount,
} from '@/lib/supabase/officials';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const officials = await getOfficialsByParty(code, { limit, offset });
    const total = await getOfficialsCount({ partyCode: code });

    return NextResponse.json({
      data: officials,
      total,
      limit,
      offset,
      party: code,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch officials by party' },
      { status: 500 }
    );
  }
}
