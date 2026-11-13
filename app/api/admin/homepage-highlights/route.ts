import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { parseHomepageHighlightsConfig } from "@/lib/homepage-highlights-schema";

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) {
    return errorResponse("This update must come from the admin site.", 403);
  }

  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("The update could not be read.", 400);
  }

  const parsed = parseHomepageHighlightsConfig(body);
  if (!parsed.success) {
    return errorResponse(
      "Check the section name, item details and links. You can add up to three items.",
      400,
    );
  }


  try {
    const { data, error } = await admin.supabase
      .from("homepage_highlights")
      .upsert(
        {
          id: 1,
          section_title: parsed.data.sectionTitle,
          items: parsed.data.items,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("section_title, items")
      .single();

    if (error) {
      console.error("Could not save homepage highlights:", error.message);
      return errorResponse("Your homepage highlights could not be saved.", 500);
    }

    revalidatePath("/");

    return NextResponse.json(
      {
        config: {
          sectionTitle: data.section_title,
          items: data.items,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Could not save homepage highlights:", error);
    return errorResponse("Your homepage highlights could not be saved.", 500);
  }
}
