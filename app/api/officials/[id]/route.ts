import { NextRequest, NextResponse } from 'next/server';
import { getOfficialById } from '@/lib/supabase/officials';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const official = await getOfficialById(id);

    if (!official) {
      return NextResponse.json(
        { error: 'Official not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: official,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch official' },
      { status: 500 }
    );
  }
}
