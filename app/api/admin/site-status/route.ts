import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-api';

// The kill switch / site status feature has been completely removed.
export async function POST() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ error: 'Feature removed' }, { status: 410 });
}