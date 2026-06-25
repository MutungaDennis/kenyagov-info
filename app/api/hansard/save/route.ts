import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { textToPortableText } from '@/lib/hansard-processor';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

interface SaveHansardRequest {
  houseType: 'national-assembly' | 'senate' | 'county-assembly';
  sittingDate: string; // YYYY-MM-DD
  title: string;
  slug?: string;
  contributions: Array<{
    order: number;
    speakerName: string;
    speakerTitle?: string;
    constituency?: string;
    party?: string;
    role?: string;
    speech: string;
    startTime?: string;
  }>;
  editorialSummary?: string;
  suggestedTopics?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveHansardRequest = await request.json();

    if (!body.sittingDate || !body.title || !body.contributions?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: sittingDate, title, or contributions' },
        { status: 400 }
      );
    }

    // Generate clean slug
    const slugBase = body.slug || `${body.houseType}-${body.sittingDate}`;
    const slug = slugBase.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Convert speech text → Portable Text blocks
    const processedContributions = body.contributions.map((contrib, index) => ({
      _key: `contrib-${index}`,
      order: contrib.order,
      speakerName: contrib.speakerName.trim(),
      speakerTitle: contrib.speakerTitle?.trim() || '',
      constituency: contrib.constituency?.trim() || '',
      party: contrib.party?.trim() || '',
      role: contrib.role?.trim() || '',
      startTime: contrib.startTime?.trim() || '',
      speech: textToPortableText(contrib.speech),
    }));

    const document = {
      _type: 'hansardSitting',
      title: body.title.trim(),
      slug: { _type: 'slug', current: slug },
      house: body.houseType,
      sittingDate: body.sittingDate,
      contributions: processedContributions,
      editorialSummary: body.editorialSummary || '',
      suggestedTopics: body.suggestedTopics || [],
      _createdAt: new Date().toISOString(),
    };

    const created = await sanity.create(document);

    return NextResponse.json({
      success: true,
      documentId: created._id,
      slug: created.slug?.current,
      title: created.title,
      contributionsCount: processedContributions.length,
      message: 'Hansard sitting published successfully',
    });
  } catch (error: any) {
    console.error('[Hansard Save Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save to Sanity' },
      { status: 500 }
    );
  }
}