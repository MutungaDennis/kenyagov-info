import { NextRequest, NextResponse } from "next/server";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { normalizeSpeechForSanity } from "@/lib/hansard/speech";

const sanity = createSanityWriteClient();

interface SaveHansardRequest {
  houseType: "national-assembly" | "senate" | "county-assembly";
  sittingDate: string;
  title: string;
  slug?: string;
  sittingPeriod?: string;
  parliamentaryTerm?: string;
  youtubeUrl?: string;
  officialHansardUrl?: string;
  contributions: Array<{
    _key?: string;
    order: number;
    type: "spoken" | "procedural" | "header";
    supabaseLeaderId?: string;
    speakerName?: string;
    speakerTitle?: string;
    constituency?: string;
    party?: string;
    role?: string;
    speech: string | unknown[];
    startTime?: string;
    sectionHeader?: string;
  }>;
  editorialSummary?: string;
  existingDocumentId?: string;
  /** true = public; false = draft */
  isActive?: boolean;
  /** draft | publish — convenience; maps to isActive */
  status?: "draft" | "publish";
}

function resolveIsActive(body: SaveHansardRequest): boolean {
  if (typeof body.isActive === "boolean") return body.isActive;
  if (body.status === "draft") return false;
  if (body.status === "publish") return true;
  // Default: create published, update keep existing via patch only if not specified
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveHansardRequest = await request.json();

    if (!body.sittingDate || !body.title || !body.contributions?.length) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: sittingDate, title, or contributions",
        },
        { status: 400 },
      );
    }

    const slugBase =
      body.slug || `${body.houseType}-${body.sittingDate}`;
    const slug = slugBase
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Sort by order then process — never wipe PT by treating arrays as empty strings
    const sorted = [...body.contributions].sort((a, b) => a.order - b.order);

    const processedContributions = sorted.map((contrib, index) => {
      const speech = normalizeSpeechForSanity(contrib.speech);
      const key =
        contrib._key && String(contrib._key).trim()
          ? String(contrib._key)
          : `contrib-${index}-${Math.random().toString(36).slice(2, 9)}`;

      return {
        _key: key,
        order: index + 1, // contiguous public order
        type: contrib.type || "spoken",
        supabaseLeaderId: contrib.supabaseLeaderId || undefined,
        speakerName: contrib.speakerName?.trim() || "",
        speakerTitle: contrib.speakerTitle?.trim() || "",
        constituency: contrib.constituency?.trim() || "",
        party: contrib.party?.trim() || "",
        role: contrib.role?.trim() || "",
        startTime: contrib.startTime?.trim() || "",
        sectionHeader: contrib.sectionHeader?.trim() || "",
        speech,
      };
    });

    const isActive = resolveIsActive(body);

    const meta = {
      title: body.title.trim(),
      sittingPeriod: body.sittingPeriod || "Morning Sitting",
      parliamentaryTerm:
        body.parliamentaryTerm || "13th Parliament (2022–2027)",
      youtubeUrl: body.youtubeUrl || undefined,
      officialHansardUrl: body.officialHansardUrl || undefined,
      editorialSummary: body.editorialSummary
        ? normalizeSpeechForSanity(body.editorialSummary)
        : undefined,
      contributions: processedContributions,
      isActive,
    };

    // ==================== UPDATE EXISTING ====================
    if (body.existingDocumentId) {
      const updated = await sanity
        .patch(body.existingDocumentId)
        .set(meta)
        .commit();

      return NextResponse.json({
        success: true,
        documentId: updated._id,
        slug: updated.slug?.current ?? slug,
        title: updated.title,
        contributionsCount: processedContributions.length,
        isActive: updated.isActive !== false,
        message: isActive
          ? "Hansard sitting updated and published"
          : "Hansard sitting saved as draft",
        action: "updated",
      });
    }

    // ==================== CREATE NEW ====================
    const document = {
      _type: "hansardSitting",
      title: meta.title,
      slug: { _type: "slug", current: slug },
      houseType: body.houseType,
      sittingDate: body.sittingDate,
      sittingPeriod: meta.sittingPeriod,
      parliamentaryTerm: meta.parliamentaryTerm,
      youtubeUrl: meta.youtubeUrl,
      officialHansardUrl: meta.officialHansardUrl,
      contributions: meta.contributions,
      editorialSummary: meta.editorialSummary || [],
      isActive,
    };

    const created = await sanity.create(document);

    return NextResponse.json({
      success: true,
      documentId: created._id,
      slug: created.slug?.current,
      title: created.title,
      contributionsCount: processedContributions.length,
      isActive,
      message: isActive
        ? "Hansard sitting created and published"
        : "Hansard sitting created as draft",
      action: "created",
    });
  } catch (error: unknown) {
    console.error("[Hansard Save Error]", error);
    const message =
      error instanceof Error ? error.message : "Failed to save to Sanity";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
