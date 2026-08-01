import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mca_social_media")
      .select("*")
      .eq("mca_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Social media fetch error:", error);
      return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("Social API crash:", err);
    return NextResponse.json({ error: "Server error", data: [] }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("mca_social_media")
      .insert([{ mca_id: id, ...body }])
      .select()
      .single();

    if (error) {
      console.error("Social insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Social POST crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const socialId = searchParams.get("socialId");

  if (!socialId) {
    return NextResponse.json({ error: "socialId is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("mca_social_media")
      .delete()
      .eq("id", socialId)
      .eq("mca_id", id);

    if (error) {
      console.error("Social delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Social DELETE crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}