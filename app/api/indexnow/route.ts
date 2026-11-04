import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

const SITE_URL = "https://www.citizenguide.ke";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
// IndexNow keys are public verification values, not credentials.
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "citizenguide-ke-indexnow-2026";

export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;


  const payload = (await request.json().catch(() => null)) as { urls?: unknown } | null;
  const urls = Array.isArray(payload?.urls)
    ? payload.urls.filter((value): value is string => typeof value === "string")
    : [];
  const uniqueUrls = [...new Set(urls)].slice(0, 10_000);
  const validUrls = uniqueUrls.filter((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === new URL(SITE_URL).hostname;
    } catch {
      return false;
    }
  });

  if (validUrls.length === 0) {
    return NextResponse.json({ error: "Provide at least one valid public URL." }, { status: 400 });
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/api/indexnow/key`,
      urlList: validUrls,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "IndexNow rejected the submission." }, { status: 502 });
  }

  return NextResponse.json({ submitted: validUrls.length });
}
