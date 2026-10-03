import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { listContent, saveContent } from "@/lib/content/store";
import type { ServiceDocument } from "@/lib/services/queries";
import { refreshServices } from "@/lib/content/revalidate";
import {
  applyServicePhrasesToBlocks,
  type ServiceLinkPhrase,
} from "@/lib/services/link-phrases";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {

    const body = await request.json();
    const dryRun = body.dryRun !== false && body.write !== true;
    const serviceIds: string[] = Array.isArray(body.serviceIds)
      ? body.serviceIds.map(String).filter(Boolean)
      : body.serviceId
        ? [String(body.serviceId)]
        : [];

    const phrases = (await listContent<ServiceLinkPhrase>("service_link_phrases", auth.supabase)).filter(p => p.enabled !== false).sort((a,b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const services = (await listContent<ServiceDocument>("government_services", auth.supabase)).filter(s => !serviceIds.length || serviceIds.includes(s._id));

    const results: Array<{
      id: string;
      slug: string;
      matchCount: number;
      changed: boolean;
    }> = [];

    for (const svc of services || []) {
      const { blocks, matchCount, changed } = applyServicePhrasesToBlocks(
        svc.body,
        phrases || [],
        svc.slug.current,
      );
      results.push({
        id: svc._id,
        slug: svc.slug.current,
        matchCount,
        changed,
      });
      if (!dryRun && changed) {
        await saveContent("government_services", { ...svc, body: blocks }, auth.supabase);
        refreshServices(svc.slug.current);
      }
    }

    const totalMatches = results.reduce((n, r) => n + r.matchCount, 0);
    return NextResponse.json({
      success: true,
      dryRun,
      totalMatches,
      servicesTouched: results.filter((r) => r.changed).length,
      results,
      message: dryRun
        ? `Dry run: ${totalMatches} phrase hit(s) across ${results.filter((r) => r.changed).length} service(s)`
        : `Applied links: ${totalMatches} hit(s) written`,
    });
  } catch (err) {
    console.error("[service link-phrases apply]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Apply failed",
      },
      { status: 500 },
    );
  }
}
