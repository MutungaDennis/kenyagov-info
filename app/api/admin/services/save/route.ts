import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { getAdminServices } from "@/lib/services/queries";
import { deleteContent, getContent } from "@/lib/content/store";
import { refreshServices } from "@/lib/content/revalidate";
import { textToPortableText as paragraphsToPortableText } from "@/lib/portable-text";

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function withKeys<T extends Record<string, unknown>>(
  items: unknown,
  typeName: string,
): Array<T & { _key: string; _type: string }> {
  if (!Array.isArray(items)) return [];
  return items.map((raw) => {
    const item = (raw && typeof raw === "object" ? raw : {}) as T;
    return {
      ...item,
      _type: typeName,
      _key: String((item as { _key?: string })._key || randomKey()),
    };
  });
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x || "").trim()).filter(Boolean);
}

function toBodyBlocks(body: unknown, bodyParagraphs: unknown): unknown[] {
  if (Array.isArray(body) && body.length > 0 && (body[0] as { _type?: string })?._type) {
    return body as unknown[];
  }
  if (Array.isArray(bodyParagraphs) && bodyParagraphs.length > 0) {
    return paragraphsToPortableText(
      bodyParagraphs.map((p) => String(p || "")).join("\n\n"),
    ) as unknown[];
  }
  if (typeof body === "string" && body.trim()) {
    return paragraphsToPortableText(body) as unknown[];
  }
  return Array.isArray(body) ? (body as unknown[]) : [];
}


export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const id = request.nextUrl.searchParams.get("id") || undefined;
    const result = await getAdminServices(auth.supabase, id);
    if (id && !result.data) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[services GET]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load services",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {

    const payload = await request.json();
    const title = String(payload.title || "").trim();
    const slugRaw = String(payload.slug || "").trim() || slugify(title);
    const summary = String(payload.summary || "").trim();
    const executionMode = String(payload.executionMode || "").trim();
    const processingTime = String(payload.processingTime || "").trim();
    const baseCostLabel = String(payload.baseCostLabel || "").trim();

    if (!title || !slugRaw || !summary) {
      return NextResponse.json(
        { success: false, error: "title, slug and summary are required" },
        { status: 400 },
      );
    }
    if (!["online", "hybrid", "manual"].includes(executionMode)) {
      return NextResponse.json(
        { success: false, error: "executionMode must be online, hybrid or manual" },
        { status: 400 },
      );
    }
    if (!processingTime || !baseCostLabel) {
      return NextResponse.json(
        {
          success: false,
          error: "processingTime and baseCostLabel are required",
        },
        { status: 400 },
      );
    }

    const beforeYouStart = toStringArray(payload.beforeYouStart);
    const requiredDocuments = toStringArray(payload.requiredDocuments);
    if (beforeYouStart.length === 0 || requiredDocuments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "beforeYouStart and requiredDocuments need at least one item",
        },
        { status: 400 },
      );
    }

    const portalsIn = Array.isArray(payload.transactionPortals)
      ? payload.transactionPortals
      : [];
    const transactionPortals = portalsIn
      .map((p: Record<string, unknown>) => ({
        _type: "portalItem" as const,
        _key: randomKey(),
        portalLabel: String(p.portalLabel || "").trim(),
        portalUrl: String(p.portalUrl || "").trim(),
      }))
      .filter(
        (p: { portalLabel: string; portalUrl: string }) =>
          Boolean(p.portalLabel && p.portalUrl),
      );

    if (transactionPortals.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Add at least one transaction portal (Start now link)",
        },
        { status: 400 },
      );
    }

    const providingInstitutions = (
      Array.isArray(payload.providingInstitutions)
        ? payload.providingInstitutions
        : []
    )
      .map((p: Record<string, unknown>) => ({
        _type: "providingInstitution" as const,
        _key: randomKey(),
        institutionId: String(p.institutionId || "").trim(),
        name: String(p.name || "").trim(),
        slug: p.slug ? String(p.slug).trim() : undefined,
        shortName: p.shortName ? String(p.shortName).trim() : undefined,
        parentName: p.parentName ? String(p.parentName).trim() : undefined,
      }))
      .filter(
        (p: { institutionId: string; name: string }) =>
          Boolean(p.institutionId && p.name),
      );

    const providingBodyIds: string[] = Array.isArray(payload.providingBodyIds)
      ? payload.providingBodyIds.map(String).filter(Boolean)
      : [];

    if (providingInstitutions.length === 0 && providingBodyIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Select at least one providing institution",
        },
        { status: 400 },
      );
    }

    const relatedServiceIds: string[] = Array.isArray(payload.relatedServiceIds)
      ? payload.relatedServiceIds.map(String).filter(Boolean)
      : [];

    const docId =
      payload._id && String(payload._id).trim()
        ? String(payload._id).trim()
        : `governmentService-${slugRaw}`;

    const doc = {
      _id: docId,
      _type: "governmentService" as const,
      title,
      slug: { _type: "slug" as const, current: slugRaw },
      summary,
      body: toBodyBlocks(payload.body, payload.bodyParagraphs),
      status: payload.status === "draft" ? "draft" : "published",
      reviewedAt: payload.reviewedAt
        ? String(payload.reviewedAt).slice(0, 10)
        : undefined,
      moreInformationUrl: payload.moreInformationUrl
        ? String(payload.moreInformationUrl).trim()
        : undefined,
      popularityWeight: Number.isFinite(Number(payload.popularityWeight))
        ? Number(payload.popularityWeight)
        : 0,
      processingTime,
      baseCostLabel,
      executionMode,
      timelineGuidancePoints: toStringArray(payload.timelineGuidancePoints),
      beforeYouStart,
      requiredDocuments,
      steps: withKeys(
        (Array.isArray(payload.steps) ? payload.steps : []).map(
          (s: Record<string, unknown>, i: number) => ({
            stepNumber: Number(s.stepNumber) || i + 1,
            stepTitle: String(s.stepTitle || "").trim(),
            stepDescription: String(s.stepDescription || "").trim(),
          }),
        ),
        "stepItem",
      ),
      feesTable: withKeys(
        (Array.isArray(payload.feesTable) ? payload.feesTable : []).map(
          (f: Record<string, unknown>) => ({
            itemName: String(f.itemName || "").trim(),
            amount: String(f.amount || "").trim(),
          }),
        ),
        "feeItem",
      ),
      physicalVisits: withKeys(
        (Array.isArray(payload.physicalVisits) ? payload.physicalVisits : []).map(
          (v: Record<string, unknown>) => ({
            purpose: String(v.purpose || "").trim(),
            locations: String(v.locations || "").trim(),
          }),
        ),
        "visitDetail",
      ),
      downloadableResources: withKeys(
        (
          Array.isArray(payload.downloadableResources)
            ? payload.downloadableResources
            : []
        ).map((d: Record<string, unknown>) => ({
          label: String(d.label || "").trim(),
          sourceUrl: d.sourceUrl ? String(d.sourceUrl).trim() : undefined,
          fileUrl: d.fileUrl ? String(d.fileUrl).trim() : undefined,
          fileSize: typeof d.fileSize === "number" ? d.fileSize : undefined,
        })),
        "downloadableFile",
      ),
      commonMistakes: withKeys(
        (Array.isArray(payload.commonMistakes) ? payload.commonMistakes : []).map(
          (m: Record<string, unknown>) => ({
            errorTitle: String(m.errorTitle || "").trim(),
            errorFix: String(m.errorFix || "").trim(),
          }),
        ),
        "mistakeItem",
      ),
      faqs: withKeys(
        (Array.isArray(payload.faqs) ? payload.faqs : []).map(
          (f: Record<string, unknown>) => ({
            question: String(f.question || "").trim(),
            answer: String(f.answer || "").trim(),
          }),
        ),
        "faqItem",
      ),
      relatedLinks: withKeys(
        (Array.isArray(payload.relatedLinks) ? payload.relatedLinks : []).map(
          (l: Record<string, unknown>) => ({
            label: String(l.label || "").trim(),
            href: String(l.href || "").trim(),
          }),
        ),
        "relatedLink",
      ),
      transactionPortals,
      providingInstitutions,
      providingBodies: providingBodyIds.map((id) => ({
        _type: "reference" as const,
        _ref: id,
        _key: randomKey(),
      })),
      relatedServices: relatedServiceIds.map((id) => ({
        _type: "reference" as const,
        _ref: id,
        _key: randomKey(),
      })),
    };

    const { error } = await auth.supabase.rpc("save_government_service", {
      p_document: doc,
      p_category_id: payload.categoryId ? String(payload.categoryId) : null,
      p_heading: payload.subTopicHeading ? String(payload.subTopicHeading) : "General",
    });
    if (error) throw error;
    refreshServices(slugRaw);

    return NextResponse.json({
      success: true,
      id: docId,
      slug: slugRaw,
      message: "Service saved",
    });
  } catch (err) {
    console.error("[services POST]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save service",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {

    const body = await request.json().catch(() => ({}));
    const id =
      String(body.id || "").trim() ||
      request.nextUrl.searchParams.get("id") ||
      "";
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }

    const previous = await getContent("government_services", "id", id, auth.supabase);
    await deleteContent("government_services", id, auth.supabase);
    refreshServices((previous?.slug as { current?: string })?.current);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[services DELETE]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete",
      },
      { status: 500 },
    );
  }
}
