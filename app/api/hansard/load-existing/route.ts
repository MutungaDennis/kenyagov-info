import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sittingDate = searchParams.get('date');
  const houseType = searchParams.get('houseType');

  if (!sittingDate || !houseType) {
    return NextResponse.json({ error: 'Missing date or houseType' }, { status: 400 });
  }

  try {
    const sitting = await sanity.fetch(
      `*[_type == "hansardSitting" && sittingDate == $date && houseType == $house][0]{
        _id,
        title,
        sittingDate,
        houseType,
        sittingPeriod,
        parliamentaryTerm,
        youtubeUrl,
        editorialSummary,
        contributions[] {
          _key,
          order,
          type,
          supabaseLeaderId,
          speakerName,
          speakerTitle,
          constituency,
          party,
          role,
          speech,
          startTime,
          sectionHeader
        }
      }`,
      { date: sittingDate, house: houseType }
    );

    if (!sitting) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, sitting });
  } catch (error: any) {
    console.error('Load existing sitting error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}