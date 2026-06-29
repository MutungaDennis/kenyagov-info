import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ leaders: [] });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await supabase
    .from('leaders')
    .select('id, full_name, title, current_constituency, current_party, current_organization')
    .or(`full_name.ilike.%${q}%,current_constituency.ilike.%${q}%`)
    .limit(15);

  if (error) {
    return NextResponse.json({ leaders: [] }, { status: 500 });
  }

  const leaders = (data || []).map((l: any) => ({
    id: l.id,
    full_name: l.full_name,
    title: l.title,
    constituency: l.current_constituency,
    party: l.current_party,
    role: l.current_organization,
  }));

  return NextResponse.json({ leaders });
}