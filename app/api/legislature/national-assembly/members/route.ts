import { NextResponse } from "next/server";
import { fetchNationalAssemblyMembers } from "@/lib/legislature/members";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchNationalAssemblyMembers();
    return NextResponse.json(
      { success: true, data, total: data.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Failed to load members",
      },
      { status: 500 },
    );
  }
}
