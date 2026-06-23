import { NextResponse } from 'next/server';

// The kill switch / site status feature has been completely removed.
export async function POST() {
  return NextResponse.json({ error: 'Feature removed' }, { status: 410 });
}