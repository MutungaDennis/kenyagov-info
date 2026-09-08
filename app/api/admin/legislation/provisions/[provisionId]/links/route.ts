import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

type Ctx = { params: Promise<{ provisionId: string }> };

function markerRegex(id: string) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `<span\\s+[^>]*data-legislation-inline-link=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/span>`,
    "gi",
  );
}

function stripMarker(html: string, id: string) {
  return html.replace(markerRegex(id), "$1");
}

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { provisionId } = await context.params;

  const { data: provision, error } = await auth.supabase
    .from("legislation_provisions")
    .select("id,legislation_document_id,body_html,body_text,heading,provision_number")
    .eq("id", provisionId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!provision) return NextResponse.json({ error: "Provision not found." }, { status: 404 });

  const { data: links, error: linkError } = await auth.supabase
    .from("legislation_inline_links")
    .select("*")
    .eq("provision_id", provisionId)
    .order("created_at");

  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });

  const rows = links || [];

  const leaderIds = rows.map((x: any) => x.leader_id).filter(Boolean);
  const mcaIds = rows.map((x: any) => x.mca_id).filter(Boolean);
  const institutionIds = rows.map((x: any) => x.institution_id).filter(Boolean);
  const documentIds = rows.map((x: any) => x.target_document_id).filter(Boolean);

  const [leaders, mcas, institutions, documents] = await Promise.all([
    leaderIds.length
      ? auth.supabase.from("leaders").select("id,slug,full_name,first_name,other_names,surname").in("id", leaderIds)
      : Promise.resolve({ data: [] as any[] }),
    mcaIds.length
      ? auth.supabase.from("mcas").select("id,slug,first_name,other_names,surname").in("id", mcaIds)
      : Promise.resolve({ data: [] as any[] }),
    institutionIds.length
      ? auth.supabase.from("institutions").select("id,slug,name,short_name").in("id", institutionIds)
      : Promise.resolve({ data: [] as any[] }),
    documentIds.length
      ? auth.supabase.from("legal_documents").select("id,title,short_title,citation,slug,document_type").in("id", documentIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const leaderMap = new Map((leaders.data || []).map((x: any) => [x.id, x]));
  const mcaMap = new Map((mcas.data || []).map((x: any) => [x.id, x]));
  const institutionMap = new Map((institutions.data || []).map((x: any) => [x.id, x]));
  const documentMap = new Map((documents.data || []).map((x: any) => [x.id, x]));

  const hydrated = rows.map((row: any) => {
    let targetName: string | null = null;
    let targetHref: string | null = null;

    if (row.link_type === "person") {
      const person = row.leader_id
        ? leaderMap.get(row.leader_id)
        : mcaMap.get(row.mca_id);

      if (person) {
        targetName =
          person.full_name ||
          [person.first_name, person.other_names, person.surname]
            .filter(Boolean)
            .join(" ");
        targetHref = person.slug ? `/leaders/${person.slug}` : null;
      }
    }

    if (row.link_type === "institution") {
      const institution = institutionMap.get(row.institution_id);
      targetName = institution?.short_name || institution?.name || null;
      targetHref = institution?.slug
        ? `/government/institutions/${institution.slug}`
        : null;
    }

    if (row.link_type === "law") {
      const document = documentMap.get(row.target_document_id);
      targetName = document?.short_title || document?.title || null;
      targetHref = document?.slug
        ? document.document_type === "constitution"
          ? "/constitution"
          : `/legislation/acts/${document.slug}`
        : null;
    }

    if (row.link_type === "internal" || row.link_type === "external") {
      targetName = row.target_label || row.selected_text;
      targetHref = row.target_url || null;
    }

    return {
      ...row,
      target_name: targetName,
      target_href: targetHref,
    };
  });

  return NextResponse.json({ data: { provision, links: hydrated } });
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { provisionId } = await context.params;
  const body = await request.json();

  const id = String(body.id || "").trim();
  const selectedText = String(body.selected_text || "").trim();
  const linkType = String(body.link_type || "").trim();
  const contentHtml = String(body.content_html || "");

  if (!id || !selectedText || !contentHtml) {
    return NextResponse.json(
      { error: "id, selected_text and content_html are required." },
      { status: 400 },
    );
  }

  if (!["person", "institution", "law", "internal", "external"].includes(linkType)) {
    return NextResponse.json({ error: "Invalid link type." }, { status: 400 });
  }

  if (!contentHtml.includes(`data-legislation-inline-link="${id}"`)) {
    return NextResponse.json(
      { error: "The submitted HTML does not contain the permanent link marker." },
      { status: 400 },
    );
  }

  const { data: provision, error: provisionError } = await auth.supabase
    .from("legislation_provisions")
    .select("id,legislation_document_id")
    .eq("id", provisionId)
    .maybeSingle();

  if (provisionError) return NextResponse.json({ error: provisionError.message }, { status: 500 });
  if (!provision) return NextResponse.json({ error: "Provision not found." }, { status: 404 });

  const row: any = {
    id,
    provision_id: provisionId,
    selected_text: selectedText,
    link_type: linkType,
    semantic_role: body.semantic_role || "references",
    leader_id: body.leader_id || null,
    mca_id: body.mca_id || null,
    institution_id: body.institution_id || null,
    target_document_id: body.target_document_id || null,
    target_provision_id: body.target_provision_id || null,
    target_url: body.target_url || null,
    target_label: body.target_label || null,
    external_source_name: body.external_source_name || null,
    verification_status: "Verified",
    relationship_review_status: "Reviewed",
  };

  const { error: linkError } = await auth.supabase
    .from("legislation_inline_links")
    .insert(row);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 400 });
  }

  const { error: updateError } = await auth.supabase
    .from("legislation_provisions")
    .update({
      body_html: contentHtml,
      relationship_review_status: "Reviewed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", provisionId);

  if (updateError) {
    await auth.supabase.from("legislation_inline_links").delete().eq("id", id);
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await auth.supabase.from("legislation_admin_activity").insert({
    legislation_document_id: provision.legislation_document_id,
    legislation_provision_id: provisionId,
    action: "inline_link_added",
    summary: `${linkType}: ${selectedText}`,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { provisionId } = await context.params;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Link id is required." }, { status: 400 });
  }

  const { data: provision, error } = await auth.supabase
    .from("legislation_provisions")
    .select("body_html")
    .eq("id", provisionId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!provision) return NextResponse.json({ error: "Provision not found." }, { status: 404 });

  const nextHtml = stripMarker(provision.body_html || "", id);

  const { error: updateError } = await auth.supabase
    .from("legislation_provisions")
    .update({ body_html: nextHtml, updated_at: new Date().toISOString() })
    .eq("id", provisionId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  const { error: deleteError } = await auth.supabase
    .from("legislation_inline_links")
    .delete()
    .eq("id", id)
    .eq("provision_id", provisionId);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
