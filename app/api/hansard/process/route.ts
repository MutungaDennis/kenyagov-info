import { NextResponse } from "next/server";

/**
 * AI/PDF Hansard processing is disabled on the Cloudflare Worker.
 * Pulling `ai`, `@ai-sdk/xai`, OpenRouter, and PDF parsers inflates the
 * server bundle beyond Worker size limits.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Hansard PDF AI processing is not available on the Cloudflare deployment. Process Hansards locally or via a separate worker, then save via /api/hansard/save.",
      code: "CF_WORKER_LITE",
    },
    { status: 501 },
  );
}
