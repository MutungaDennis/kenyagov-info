import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import {
  CONSTITUTION_SETTINGS_ID,
  type ConstitutionSettings,
} from "@/lib/constitution/plain-english";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const sanity = createSanityWriteClient();
    const data = await sanity.fetch<ConstitutionSettings | null>(
      `*[_type == "constitutionSettings" && _id == $id][0]{
        _id,
        showPlainEnglishGlobal,
        chapterPlainEnglish[]{ chapter, showPlainEnglish }
      }`,
      { id: CONSTITUTION_SETTINGS_ID },
    );

    return NextResponse.json({
      success: true,
      data: data || {
        _id: CONSTITUTION_SETTINGS_ID,
        showPlainEnglishGlobal: true,
        chapterPlainEnglish: [],
      },
    });
  } catch (err) {
    console.error("[constitution/settings GET]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load settings",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "SANITY_API_TOKEN is not configured for writes",
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const showPlainEnglishGlobal =
      typeof body.showPlainEnglishGlobal === "boolean"
        ? body.showPlainEnglishGlobal
        : true;

    const chapterPlainEnglish = Array.isArray(body.chapterPlainEnglish)
      ? body.chapterPlainEnglish
          .map((row: { chapter?: unknown; showPlainEnglish?: unknown }) => {
            const chapter = Number(row.chapter);
            if (!Number.isFinite(chapter)) return null;
            return {
              _key: `ch-${chapter}`,
              chapter,
              showPlainEnglish: Boolean(row.showPlainEnglish),
            };
          })
          .filter(Boolean)
      : [];

    const sanity = createSanityWriteClient();
    await sanity.createOrReplace({
      _id: CONSTITUTION_SETTINGS_ID,
      _type: "constitutionSettings",
      showPlainEnglishGlobal,
      chapterPlainEnglish,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: CONSTITUTION_SETTINGS_ID,
        showPlainEnglishGlobal,
        chapterPlainEnglish,
      },
      message: "Constitution Plain English settings saved",
    });
  } catch (err) {
    console.error("[constitution/settings POST]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save settings",
      },
      { status: 500 },
    );
  }
}
