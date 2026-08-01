import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ UUID validation helper
const isValidUUID = (value: any): boolean => {
  if (!value || value === null || value === "") return true;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// ✅ Sanitize UUID field
const sanitizeUUID = (value: any): string | null => {
  if (!value || value === "undefined" || value === "" || value === "null") {
    return null;
  }
  return value;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id === "undefined" || id.length < 10) {
    return NextResponse.json({ error: `Invalid MCA ID provided: ${id}` }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mcas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("API GET crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id === "undefined" || id.length < 10) {
    return NextResponse.json({ error: `Invalid MCA ID provided: ${id}` }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();

    // ✅ Sanitize and validate all UUID fields
    const uuidFields = ['ward_id', 'party_id', 'successor_mca_id'];
    for (const field of uuidFields) {
      body[field] = sanitizeUUID(body[field]);
      if (body[field] && !isValidUUID(body[field])) {
        return NextResponse.json(
          { error: `Invalid UUID format for ${field}: ${body[field]}` },
          { status: 400 }
        );
      }
    }

    // ✅ Handle slug: use provided slug if valid, otherwise auto-generate
    let slug = body.slug;
    if (!slug || slug === "undefined" || slug.length < 3) {
      // Auto-generate from name
      slug = `${body.first_name}-${body.surname}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    } else {
      // Validate and sanitize manual slug
      slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
      
      // Ensure minimum length after sanitization
      if (slug.length < 3) {
        slug = `${body.first_name}-${body.surname}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
    }

    // ✅ Check if slug already exists (but not for the current MCA)
    const { data: existingSlug } = await supabase
      .from("mcas")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existingSlug) {
      // Append a number to make it unique
      let counter = 1;
      let uniqueSlug = `${slug}-${counter}`;
      while (true) {
        const { data: check } = await supabase
          .from("mcas")
          .select("id")
          .eq("slug", uniqueSlug)
          .neq("id", id)
          .maybeSingle();
        if (!check) break;
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
      slug = uniqueSlug;
    }

    const { data, error } = await supabase
      .from("mcas")
      .update({ ...body, slug })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json({ error: error.message, hint: error.hint }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("API PUT crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id === "undefined" || id.length < 10) {
    return NextResponse.json({ error: `Invalid MCA ID provided: ${id}` }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("mcas").delete().eq("id", id);

    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API DELETE crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}