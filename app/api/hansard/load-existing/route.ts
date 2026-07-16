import { NextRequest, NextResponse } from "next/server";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";
import { portableTextToPlain } from "@/lib/hansard/speech";

const sanity = createSanityWriteClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sittingDate = searchParams.get("date");
  const houseType = searchParams.get("houseType");
  const id = searchParams.get("id");

  if ((!sittingDate || !houseType) && !id) {
    return NextResponse.json(
      { error: "Missing date+houseType or id" },
      { status: 400 },
    );
  }

  try {
    const sitting = id
      ? await sanity.fetch(
          `*[_type == "hansardSitting" && _id == $id][0]{
            _id, title, sittingDate, houseType, sittingPeriod, parliamentaryTerm,
            youtubeUrl, officialHansardUrl, editorialSummary, isActive,
            presidingOfficer,
            contributions[] {
              _key, order, type, supabaseLeaderId, speakerName, speakerTitle,
              constituency, party, role, isChairContribution, speech, startTime, sectionHeader
            }
          }`,
          { id },
        )
      : await sanity.fetch(
          `*[_type == "hansardSitting" && sittingDate == $date && houseType == $house] | order(_updatedAt desc)[0]{
            _id, title, sittingDate, houseType, sittingPeriod, parliamentaryTerm,
            youtubeUrl, officialHansardUrl, editorialSummary, isActive,
            presidingOfficer,
            contributions[] {
              _key, order, type, supabaseLeaderId, speakerName, speakerTitle,
              constituency, party, role, isChairContribution, speech, startTime, sectionHeader
            }
          }`,
          { date: sittingDate, house: houseType },
        );

    if (!sitting) {
      return NextResponse.json({ exists: false });
    }

    // Editor-friendly: plain text speech + keep original PT for re-save safety
    const contributions = (sitting.contributions || [])
      .map(
        (c: {
          speech?: unknown;
          order?: number;
          [key: string]: unknown;
        }) => ({
          ...c,
          order: typeof c.order === "number" ? c.order : 0,
          speechPlain: portableTextToPlain(c.speech),
          speech: c.speech, // keep PT for save path
        }),
      )
      .sort(
        (a: { order: number }, b: { order: number }) => a.order - b.order,
      );

    return NextResponse.json({
      exists: true,
      sitting: {
        ...sitting,
        contributions,
        isActive: sitting.isActive !== false,
      },
    });
  } catch (error: unknown) {
    console.error("Load existing sitting error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load sitting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
