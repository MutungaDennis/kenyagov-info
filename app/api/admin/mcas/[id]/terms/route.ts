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
      .from("mca_terms")
      .select(`
        *,
        political_parties (name, abbreviation),
        wards (name),
        counties (name)
      `)
      .eq("mca_id", id)
      .order("term_number", { ascending: true });

    if (error) {
      console.error("Terms fetch error:", error);
      return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("Terms API crash:", err);
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
      .from("mca_terms")
      .insert([{ mca_id: id, ...body }])
      .select()
      .single();

    if (error) {
      console.error("Term insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Term POST crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { termId, ...updateData } = body;

    const { data, error } = await supabase
      .from("mca_terms")
      .update(updateData)
      .eq("id", termId)
      .eq("mca_id", id)
      .select()
      .single();

    if (error) {
      console.error("Term update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Term PUT crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const termId = searchParams.get("termId");

  if (!termId) {
    return NextResponse.json({ error: "termId is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("mca_terms")
      .delete()
      .eq("id", termId)
      .eq("mca_id", id);

    if (error) {
      console.error("Term delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Term DELETE crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}