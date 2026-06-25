import { NextRequest, NextResponse } from 'next/server';
import { processHansardPdf } from '@/lib/hansard-processor';
import { createClient } from 'next-sanity';

export const maxDuration = 300; // 5 minutes for long Hansards

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File | null;
    const houseType = (formData.get('houseType') as string) || 'national-assembly';

    if (!pdfFile) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }
    if (pdfFile.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    console.log(`[API] Processing Hansard: ${pdfFile.name} (${(pdfFile.size / 1024 / 1024).toFixed(2)} MB)`);

    const result = await processHansardPdf(pdfBuffer, pdfFile.name, houseType as any);

    return NextResponse.json({
      success: true,
      fileName: pdfFile.name,
      fileSize: pdfFile.size,
      houseType,
      processingTimeMs: result.processingTimeMs,
      warnings: result.warnings,
      structured: result.structured, // Ready for admin preview
    });
  } catch (error: any) {
    console.error('[Hansard Process API Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process Hansard PDF',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check - Updated for OpenRouter migration
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: 'openrouter',                    // ← Changed from xAI
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    hasLlamaKey: !!process.env.LLAMA_CLOUD_API_KEY,
    hasSanityToken: !!process.env.SANITY_API_TOKEN,
    model: process.env.HANSARD_LLM_MODEL || 'google/gemini-2.5-flash (default)',
  });
}