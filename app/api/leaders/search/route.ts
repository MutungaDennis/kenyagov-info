import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ leaders: [] });
  }

  // Safe client creation (prevents build-time crash)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.json({ leaders: [] }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase
      .from('leaders')
      .select(`
        id,
        slug,
        title,
        first_name,
        surname,
        full_name,
        category,
        level,
        current_party,
        current_constituency,
        current_county
      `)
      .or(`full_name.ilike.%${q}%,slug.ilike.%${q}%`)
      .order('full_name', { ascending: true })
      .limit(15);

    if (error) {
      console.error('Leader search error:', error);
      return NextResponse.json({ leaders: [] }, { status: 500 });
    }

    return NextResponse.json({ leaders: data || [] });
  } catch (err) {
    console.error('Unexpected error in leader search:', err);
    return NextResponse.json({ leaders: [] }, { status: 500 });
  }
}