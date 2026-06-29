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
  sittingDate: string;
  title: string;
  slug?: string;
  sittingPeriod?: string;
  parliamentaryTerm?: string;
  youtubeUrl?: string;
  contributions: Array<{
    order: number;
    type: 'spoken' | 'procedural' | 'header';
    supabaseLeaderId?: string;
    speakerName?: string;
    speakerTitle?: string;
    constituency?: string;
    party?: string;
    role?: string;
    speech: string;
    startTime?: string;
    sectionHeader?: string;
  }>;
  editorialSummary?: string;
  existingDocumentId?: string; // NEW: for updating existing sittings
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

    // Process contributions
    const processedContributions = body.contributions.map((contrib, index) => ({
      _key: `contrib-${index}`,
      order: contrib.order,
      type: contrib.type || 'spoken',
      supabaseLeaderId: contrib.supabaseLeaderId || undefined,
      speakerName: contrib.speakerName?.trim() || '',
      speakerTitle: contrib.speakerTitle?.trim() || '',
      constituency: contrib.constituency?.trim() || '',
      party: contrib.party?.trim() || '',
      role: contrib.role?.trim() || '',
      startTime: contrib.startTime?.trim() || '',
      sectionHeader: contrib.sectionHeader?.trim() || '',
      speech: textToPortableText(contrib.speech),
    }));

    // ==================== UPDATE EXISTING SITTING ====================
    if (body.existingDocumentId) {
      const updated = await sanity
        .patch(body.existingDocumentId)
        .set({
          title: body.title.trim(),
          sittingPeriod: body.sittingPeriod || 'Morning Sitting',
          parliamentaryTerm: body.parliamentaryTerm || '13th Parliament (2022–2027)',
          youtubeUrl: body.youtubeUrl || undefined,
          editorialSummary: body.editorialSummary || '',
          contributions: processedContributions,
        })
        .commit();

      return NextResponse.json({
        success: true,
        documentId: updated._id,
        slug: updated.slug?.current,
        title: updated.title,
        contributionsCount: processedContributions.length,
        message: 'Hansard sitting updated successfully',
        action: 'updated',
      });
    }

    // ==================== CREATE NEW SITTING ====================
    const document: any = {
      _type: 'hansardSitting',
      title: body.title.trim(),
      slug: { _type: 'slug', current: slug },
      houseType: body.houseType,
      sittingDate: body.sittingDate,
      sittingPeriod: body.sittingPeriod || 'Morning Sitting',
      parliamentaryTerm: body.parliamentaryTerm || '13th Parliament (2022–2027)',
      youtubeUrl: body.youtubeUrl || undefined,
      contributions: processedContributions,
      editorialSummary: body.editorialSummary || '',
      isActive: true,
    };

    const created = await sanity.create(document);

    return NextResponse.json({
      success: true,
      documentId: created._id,
      slug: created.slug?.current,
      title: created.title,
      contributionsCount: processedContributions.length,
      message: 'Hansard sitting created successfully',
      action: 'created',
    });
  } catch (error: any) {
    console.error('[Hansard Save Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save to Sanity' },
      { status: 500 }
    );
  }
}