import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import {
  applyServicePhrasesToBlocks,
  type ServiceLinkPhrase,
} from "@/lib/services/link-phrases";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "SANITY_API_TOKEN is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const dryRun = body.dryRun !== false && body.write !== true;
    const serviceIds: string[] = Array.isArray(body.serviceIds)
      ? body.serviceIds.map(String).filter(Boolean)
      : body.serviceId
        ? [String(body.serviceId)]
        : [];

    const sanity = createSanityWriteClient();
    const phrases = (await sanity.fetch(
      `*[_type == "serviceLinkPhrase" && enabled != false] | order(sortOrder asc) {
        _id, phrase, matchMode, internalHref, externalHref, externalLabel,
        scopeServiceSlugs, enabled, sortOrder
      }`,
    )) as ServiceLinkPhrase[];

    const services = serviceIds.length
      ? await sanity.fetch(
          `*[_type == "governmentService" && _id in $ids]{ _id, "slug": slug.current, body }`,
          { ids: serviceIds },
        )
      : await sanity.fetch(
          `*[_type == "governmentService" && defined(body) && count(body) > 0]{ _id, "slug": slug.current, body }`,
        );

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
        String(svc.slug || ""),
      );
      results.push({
        id: svc._id,
        slug: svc.slug,
        matchCount,
        changed,
      });
      if (!dryRun && changed) {
        await sanity.patch(svc._id).set({ body: blocks }).commit();
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
