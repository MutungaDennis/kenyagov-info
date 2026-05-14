import { NextResponse } from 'next/server';
import {
  getAllCounties,
  getAllParties,
  getAllPositions,
} from '@/lib/supabase/officials';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [counties, parties, positions] = await Promise.all([
      getAllCounties(),
      getAllParties(),
      getAllPositions(),
    ]);

    return NextResponse.json({
      counties: counties.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        region: c.region,
      })),
      parties: parties.map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        abbreviation: p.abbreviation,
        color_code: p.color_code,
      })),
      positions: positions.map(p => ({
        id: p.id,
        code: p.code,
        title: p.title,
        level: p.level,
      })),
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
