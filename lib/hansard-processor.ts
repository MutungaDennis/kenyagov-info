import { createXai } from '@ai-sdk/xai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateObject } from 'ai';
import { z } from 'zod';

// ============================================
// TYPES & SCHEMAS
// ============================================

export const ContributionSchema = z.object({
  order: z.number(),
  speakerName: z.string().min(2),
  speakerTitle: z.string().optional(),
  constituency: z.string().optional(),
  party: z.string().optional(),
  role: z.string().optional(),
  speech: z.string().min(10),
  startTime: z.string().optional(),
});

export const HansardStructuredSchema = z.object({
  contributions: z.array(ContributionSchema),
  suggestedTopics: z.array(z.string()).optional(),
  editorialSummary: z.string().optional(),
});

export type Contribution = z.infer<typeof ContributionSchema>;
export type HansardStructured = z.infer<typeof HansardStructuredSchema>;

// ============================================
// LLAMA PARSE (unchanged - high quality)
// ============================================

interface LlamaParseResult {
  markdown: string;
  jobId: string;
}

export async function parsePdfWithLlamaParse(
  pdfBuffer: Buffer,
  fileName: string = 'hansard.pdf'
): Promise<LlamaParseResult> {
  const LLAMA_API_KEY = process.env.LLAMA_CLOUD_API_KEY;

  if (!LLAMA_API_KEY) {
    throw new Error('LLAMA_CLOUD_API_KEY is not set in environment variables');
  }

  const baseUrl = 'https://api.cloud.llamaindex.ai/api/parsing';

  const uint8Array = new Uint8Array(pdfBuffer);
  const fileBlob = new Blob([uint8Array], { type: 'application/pdf' });

  const formData = new FormData();
  formData.append('file', fileBlob, fileName);
  formData.append('result_type', 'markdown');
  formData.append(
    'parsing_instruction',
    'This is a Kenyan Parliamentary Hansard. Preserve speaker names, titles, constituencies, parties, roles, and the FULL spoken text accurately. Maintain correct reading order. Do not summarize or omit any speeches.'
  );

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${LLAMA_API_KEY}` },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`LlamaParse upload failed: ${uploadResponse.status} - ${errorText}`);
  }

  const uploadData = await uploadResponse.json();
  const jobId = uploadData.id || uploadData.job_id;

  if (!jobId) throw new Error('Failed to get job ID from LlamaParse');

  let attempts = 0;
  const maxAttempts = 40;
  let status = 'PENDING';

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const statusRes = await fetch(`${baseUrl}/job/${jobId}`, {
      headers: { Authorization: `Bearer ${LLAMA_API_KEY}` },
    });
    if (!statusRes.ok) throw new Error('Failed to check LlamaParse job status');

    const statusData = await statusRes.json();
    status = statusData.status;

    if (status === 'SUCCESS') break;
    if (status === 'ERROR' || status === 'FAILED') {
      throw new Error(`LlamaParse failed: ${statusData.error || 'Unknown error'}`);
    }
    attempts++;
  }

  if (status !== 'SUCCESS') {
    throw new Error(`LlamaParse timed out after ${maxAttempts * 3} seconds`);
  }

  const resultRes = await fetch(`${baseUrl}/job/${jobId}/result/markdown`, {
    headers: { Authorization: `Bearer ${LLAMA_API_KEY}` },
  });

  if (!resultRes.ok) throw new Error('Failed to fetch LlamaParse result');

  const resultData = await resultRes.json();
  const markdown = resultData.markdown || resultData.text || '';

  if (!markdown || markdown.length < 100) {
    throw new Error('LlamaParse returned empty or very short content');
  }

  return { markdown, jobId };
}

// ============================================
// PROVIDERS
// ============================================

const xai = createXai({
  apiKey: process.env.XAI_API_KEY!,
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const SYSTEM_PROMPT = `You are an expert Kenyan Parliamentary Hansard analyst.

Your job is to extract EVERY individual speech/contribution from the provided Hansard markdown into clean structured JSON.

CRITICAL RULES:
1. ACCURACY FIRST — Only extract what actually appears in the text. Never invent names, parties, or constituencies.
2. SPEAKER PATTERNS (common in Kenyan Hansard):
   - "The Hon. [Full Name], MP for [Constituency] ([Party])"
   - "Hon. [Name] (The Hon. Member for [Constituency])"
   - "The Speaker (Hon. [Name])"
   - "The Deputy Speaker", "The Leader of the Majority Party", etc.
3. Capture the FULL spoken text. Preserve paragraphs. Include procedural notes like (Laughter), (Applause), or interjections in [square brackets].
4. If the same person speaks multiple times, create separate entries in chronological order.
5. Number contributions sequentially starting from 1.
6. Extract as much metadata as possible: speakerName, speakerTitle, constituency, party, role.

Return ONLY valid JSON matching the schema. Be extremely precise with Kenyan MP names and constituencies.`;

// ============================================
// XAI (Primary)
// ============================================

async function structureWithXAI(markdownText: string, houseType: string): Promise<HansardStructured> {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY is not configured');
  }

  const model = process.env.HANSARD_XAI_MODEL || 'grok-3-latest';
  const maxChars = 180000;
  const textToProcess = markdownText.length > maxChars 
    ? markdownText.substring(0, maxChars) + '\n\n[CONTENT TRUNCATED]' 
    : markdownText;

  const { object } = await generateObject({
    model: xai(model),
    schema: HansardStructuredSchema,
    system: SYSTEM_PROMPT,
    prompt: `House: ${houseType}\n\nHansard content:\n\n${textToProcess}`,
    temperature: 0.1,
    maxOutputTokens: 8000,
  });

  return object;
}

// ============================================
// OPENROUTER (Fallback)
// ============================================

async function structureWithOpenRouter(markdownText: string, houseType: string): Promise<HansardStructured> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const model = process.env.HANSARD_OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const maxChars = 180000;
  const textToProcess = markdownText.length > maxChars 
    ? markdownText.substring(0, maxChars) + '\n\n[CONTENT TRUNCATED]' 
    : markdownText;

  const { object } = await generateObject({
    model: openrouter(model),
    schema: HansardStructuredSchema,
    system: SYSTEM_PROMPT,
    prompt: `House: ${houseType}\n\nHansard content:\n\n${textToProcess}`,
    temperature: 0.1,
    maxOutputTokens: 8000,
  });

  return object;
}

// ============================================
// MAIN AI STRUCTURING (with automatic fallback)
// ============================================

export async function structureHansardWithAI(
  markdownText: string,
  houseType: string = 'national-assembly'
): Promise<HansardStructured> {
  // Try XAI first
  try {
    console.log('[Hansard] Trying primary provider: xAI (Grok)');
    const result = await structureWithXAI(markdownText, houseType);
    console.log('[Hansard] ✅ Success with xAI');
    return result;
  } catch (xaiError: any) {
    console.warn(`[Hansard] xAI failed: ${xaiError.message}. Falling back to OpenRouter...`);

    // Fallback to OpenRouter
    try {
      const result = await structureWithOpenRouter(markdownText, houseType);
      console.log('[Hansard] ✅ Success with OpenRouter fallback');
      return result;
    } catch (openRouterError: any) {
      console.error('[Hansard] Both providers failed');
      throw new Error(
        `AI structuring failed. xAI: ${xaiError.message} | OpenRouter: ${openRouterError.message}`
      );
    }
  }
}

// ============================================
// MAIN ORCHESTRATOR
// ============================================

export interface ProcessHansardResult {
  success: boolean;
  structured: HansardStructured;
  rawMarkdownLength: number;
  processingTimeMs: number;
  warnings?: string[];
}

export async function processHansardPdf(
  pdfBuffer: Buffer,
  fileName: string,
  houseType: 'national-assembly' | 'senate' | 'county-assembly' = 'national-assembly'
): Promise<ProcessHansardResult> {
  const startTime = Date.now();

  // 1. LlamaParse
  let markdown: string;
  try {
    const llamaResult = await parsePdfWithLlamaParse(pdfBuffer, fileName);
    markdown = llamaResult.markdown;
    console.log(`[Hansard] LlamaParse OK. Job: ${llamaResult.jobId}, Length: ${markdown.length}`);
  } catch (error: any) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }

  // 2. AI Structuring (XAI → OpenRouter fallback)
  let structured: HansardStructured;
  try {
    structured = await structureHansardWithAI(markdown, houseType);
    console.log(`[Hansard] AI extracted ${structured.contributions?.length || 0} contributions`);
  } catch (error: any) {
    throw new Error(`AI structuring failed: ${error.message}`);
  }

  return {
    success: true,
    structured,
    rawMarkdownLength: markdown.length,
    processingTimeMs: Date.now() - startTime,
  };
}

// ============================================
// HELPER: Text → Portable Text
// ============================================

export function textToPortableText(text: string) {
  if (!text || typeof text !== 'string') return [];

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph) => ({
    _type: 'block',
    _key: Math.random().toString(36).substring(2, 12),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substring(2, 12),
        text: paragraph,
        marks: [],
      },
    ],
    markDefs: [],
  }));
}