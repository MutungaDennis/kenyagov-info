import { NextRequest, NextResponse } from "next/server";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { normalizeSpeechForSanity } from "@/lib/hansard/speech";
import type { PresidingRole } from "@/lib/hansard/stats";

const sanity = createSanityWriteClient();

type ContributionType =
  | "spoken"
  | "procedural"
  | "header"
  | "mini-header";

interface SaveHansardRequest {
  houseType: "national-assembly" | "senate" | "county-assembly";
  sittingDate: string;
  title: string;
  slug?: string;
  sittingPeriod?: string;
  parliamentaryTerm?: string;
  youtubeUrl?: string;
  officialHansardUrl?: string;
  presidingOfficer?: {
    role?: PresidingRole | string;
    displayName?: string;
    supabaseLeaderId?: string;
    notes?: string;
  };
  contributions: Array<{
    _key?: string;
    order: number;
    type: ContributionType;
    supabaseLeaderId?: string;
    speakerName?: string;
    speakerTitle?: string;
    constituency?: string;
    party?: string;
    role?: string;
    isChairContribution?: boolean;
    speech: string | unknown[];
    startTime?: string;
    sectionHeader?: string;
  }>;
  editorialSummary?: string;
  existingDocumentId?: string;
  isActive?: boolean;
  status?: "draft" | "publish";
}

function resolveIsActive(body: SaveHansardRequest): boolean {
  if (typeof body.isActive === "boolean") return body.isActive;
  if (body.status === "draft") return false;
  if (body.status === "publish") return true;
  return true;
}

function normalizePresiding(
  raw: SaveHansardRequest["presidingOfficer"] | undefined,
) {
  if (!raw) return undefined;
  const role = (raw.role || "speaker").toString().trim();
  const displayName = raw.displayName?.trim() || "";
  const supabaseLeaderId = raw.supabaseLeaderId?.trim() || undefined;
  const notes = raw.notes?.trim() || undefined;
  if (!displayName && !supabaseLeaderId && !notes && role === "speaker") {
    // still store role so public can show "The Speaker" even without name
  }
  return {
    role: role || "speaker",
    displayName,
    supabaseLeaderId,
    notes,
  };
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

    const slugBase = body.slug || `${body.houseType}-${body.sittingDate}`;
    const slug = slugBase
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const sorted = [...body.contributions].sort((a, b) => a.order - b.order);

    const processedContributions = sorted.map((contrib, index) => {
      const type = (contrib.type || "spoken") as ContributionType;
      const isHeader = type === "header" || type === "mini-header";
      // Headers may have empty speech; spoken/procedural still normalize
      const speech = isHeader
        ? normalizeSpeechForSanity(contrib.speech || "")
        : normalizeSpeechForSanity(contrib.speech);
      const key =
        contrib._key && String(contrib._key).trim()
          ? String(contrib._key)
          : `contrib-${index}-${Math.random().toString(36).slice(2, 9)}`;

      const isChair =
        type === "spoken" ? Boolean(contrib.isChairContribution) : false;

      return {
        _key: key,
        order: index + 1,
        type,
        supabaseLeaderId: contrib.supabaseLeaderId || undefined,
        speakerName: contrib.speakerName?.trim() || "",
        speakerTitle: contrib.speakerTitle?.trim() || "",
        constituency: contrib.constituency?.trim() || "",
        party: contrib.party?.trim() || "",
        role: contrib.role?.trim() || "",
        isChairContribution: isChair,
        startTime: contrib.startTime?.trim() || "",
        sectionHeader: contrib.sectionHeader?.trim() || "",
        speech,
      };
    });

    const isActive = resolveIsActive(body);
    const presidingOfficer = normalizePresiding(body.presidingOfficer);

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
      presidingOfficer: presidingOfficer || undefined,
      contributions: processedContributions,
      isActive,
    };

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
      presidingOfficer: meta.presidingOfficer,
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
