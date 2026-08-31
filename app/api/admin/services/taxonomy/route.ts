import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { createSanityWriteClient } from "@/lib/sanity/createSanityClient";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: "SANITY_API_TOKEN is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const kind = String(body.kind || "").trim();
    const name = String(body.name || body.title || "").trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 },
      );
    }

    const sanity = createSanityWriteClient();
    const slug = slugify(name);
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Could not build a slug from that name" },
        { status: 400 },
      );
    }

    if (kind === "ministry") {
      const existing = await sanity.fetch<{ _id: string; name: string } | null>(
        `*[_type == "governmentMinistry" && slug.current == $slug][0]{ _id, name }`,
        { slug },
      );
      if (existing) {
        return NextResponse.json({
          success: true,
          created: false,
          data: existing,
          message: "Providing body already exists",
        });
      }
      const id = `governmentMinistry-${slug}`;
      await sanity.createOrReplace({
        _id: id,
        _type: "governmentMinistry",
        name,
        slug: { _type: "slug", current: slug },
      });
      return NextResponse.json({
        success: true,
        created: true,
        data: { _id: id, name, slug },
        message: "Providing body created",
      });
    }

    if (kind === "category") {
      const existing = await sanity.fetch<{ _id: string; title: string } | null>(
        `*[_type == "governmentCategory" && slug.current == $slug][0]{ _id, title }`,
        { slug },
      );
      if (existing) {
        return NextResponse.json({
          success: true,
          created: false,
          data: { _id: existing._id, title: existing.title, slug },
          message: "Category already exists",
        });
      }
      const id = `governmentCategory-${slug}`;
      const description = body.description
        ? String(body.description).trim()
        : undefined;
      await sanity.createOrReplace({
        _id: id,
        _type: "governmentCategory",
        title: name,
        slug: { _type: "slug", current: slug },
        description,
        subTopics: [],
      });
      return NextResponse.json({
        success: true,
        created: true,
        data: { _id: id, title: name, slug },
        message: "Category created",
      });
    }

    return NextResponse.json(
      { success: false, error: "kind must be ministry or category" },
      { status: 400 },
    );
  } catch (err) {
    console.error("[services taxonomy]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create",
      },
      { status: 500 },
    );
  }
}
