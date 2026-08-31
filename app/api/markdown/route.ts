import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { sanityClient } from "@/lib/sanity/client";
import { markdownResponse } from "@/lib/markdown/disclaimer";
import { portableTextToMarkdown } from "@/lib/markdown/portable-text";
import { buildCountyLeadership } from "@/lib/counties/leadership";
import { SITE_URL } from "@/lib/seo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get("slug") || "").trim();
  const type = (searchParams.get("type") || "").trim().toLowerCase();
  const chapter = searchParams.get("chapter");
  const article = searchParams.get("article");

  if (!type) {
    return NextResponse.json(
      {
        error: "Missing type",
        supported: [
          "county",
          "institution",
          "leader",
          "person",
          "service",
          "act",
          "constitution-article",
        ],
      },
      { status: 400 },
    );
  }

  try {
    if (type === "county" || type === "institution") {
      if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
      }
      return await markdownFromSupabaseEntity(type, slug, request);
    }

    if (type === "leader" || type === "person") {
      if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
      }
      return await markdownLeader(slug, request);
    }

    if (type === "service") {
      if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
      }
      return await markdownService(slug, request);
    }

    if (type === "act") {
      if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
      }
      return await markdownAct(slug, request);
    }

    if (type === "constitution-article") {
      const ch = Number(chapter || slug.split("-")[0]);
      const art = Number(article || slug.split("-")[1]);
      if (!Number.isFinite(ch) || !Number.isFinite(art)) {
        return NextResponse.json(
          {
            error:
              "Provide chapter & article query params, or slug as {chapter}-{article}",
          },
          { status: 400 },
        );
      }
      return await markdownConstitutionArticle(ch, art, request);
    }

    return NextResponse.json(
      {
        error: `Unsupported type: ${type}`,
        supported: [
          "county",
          "institution",
          "leader",
          "person",
          "service",
          "act",
          "constitution-article",
        ],
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[markdown]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function markdownFromSupabaseEntity(
  type: "county" | "institution",
  slug: string,
  request: NextRequest,
) {
  const supabase = createPublicClient();

  if (type === "county") {
    const slugCandidates = Array.from(
      new Set([
        slug,
        slug.endsWith("-county") ? slug.slice(0, -"-county".length) : `${slug}-county`,
      ]),
    );

    let county: Record<string, unknown> | null = null;
    let countyError: { message?: string } | null = null;
    for (const candidate of slugCandidates) {
      const res = await supabase
        .from("counties")
        .select("*")
        .eq("slug", candidate)
        .maybeSingle();
      if (res.data) {
        county = res.data as Record<string, unknown>;
        countyError = null;
        break;
      }
      countyError = res.error;
    }

    if (!county) {
      return NextResponse.json(
        { error: "County not found", detail: countyError?.message },
        { status: 404 },
      );
    }

    const [{ data: roles }, { data: wards }] = await Promise.all([
      supabase
        .from("leader_roles")
        .select(
          `
          title, status, party, county, county_id, term_end_date, seat_type, entry_type,
          leaders!leader_roles_leader_id_fkey (
            id, slug, first_name, other_names, surname, full_name
          )
        `,
        )
        .ilike("title", "%governor%"),
      supabase
        .from("wards")
        .select("name, slug")
        .eq("county_id", county.id as string)
        .order("name", { ascending: true })
        .limit(80),
    ]);

    const leadership = buildCountyLeadership(
      [
        {
          id: String(county.id),
          slug: String(county.slug || slug),
          name: String(county.name || ""),
          code: (county.code as number | null) ?? null,
          region: (county.region as string | null) ?? null,
          headquarters: (county.headquarters as string | null) ?? null,
        },
      ],
      (roles || []) as never[],
    )[0];

    const codePad =
      county.code != null ? String(county.code).padStart(2, "0") : "N/A";
    const canonicalSlug = String(county.slug || slug);
    const pop = county.population as number | null | undefined;
    const area = county.area_km2 as number | null | undefined;

    let md = `# ${county.name} (County Code ${codePad})\n\n`;
    md += `> Source: [${SITE_URL}/government/institutions/${canonicalSlug}](${SITE_URL}/government/institutions/${canonicalSlug})\n\n`;
    md += `## Profile\n`;
    md += `- **Region:** ${county.region || "N/A"}\n`;
    md += `- **Headquarters:** ${county.headquarters || "N/A"}\n`;
    md += `- **Population:** ${pop ? new Intl.NumberFormat("en-KE").format(pop) : "N/A"}\n`;
    md += `- **Area:** ${area ? `${area} km²` : "N/A"}\n`;
    if (county.poverty_rate != null) {
      md += `- **Poverty rate:** ${county.poverty_rate}%\n`;
    }
    md += `\n## County Executive (current records)\n`;
    md += `- **Governor:** ${leadership?.governor?.displayName || "—"}\n`;
    md += `- **Deputy Governor:** ${leadership?.deputyGovernor?.displayName || "—"}\n`;
    if (leadership?.governor?.party) {
      md += `- **Governor party:** ${leadership.governor.party}\n`;
    }
    md += `\n## Overview\n${county.description || "No description available."}\n\n`;

    if (wards && wards.length > 0) {
      md += `## Wards (sample)\n\n`;
      md += `| Ward | Profile |\n| --- | --- |\n`;
      for (const w of wards) {
        const href = w.slug
          ? `${SITE_URL}/government/counties/wards/${w.slug}/about`
          : "";
        md += `| ${w.name || "—"} | ${href ? `[Open](${href})` : "—"} |\n`;
      }
      md += `\n`;
    }

    return markdownResponse(
      md,
      `/government/institutions/${canonicalSlug}`,
      request,
    );
  }

  const { data: inst, error } = await supabase
    .from("institutions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !inst) {
    return NextResponse.json({ error: "Institution not found" }, { status: 404 });
  }

  let md = `# ${inst.name}\n\n`;
  md += `> Source: [${SITE_URL}/government/institutions/${slug}](${SITE_URL}/government/institutions/${slug})\n\n`;
  md += `**Category:** ${inst.institution_category || "N/A"} | **Type:** ${inst.institution_type || "N/A"}\n\n`;
  md += `## Overview\n${inst.description || "No description available."}\n\n`;
  if (inst.vision) md += `**Vision:** ${inst.vision}\n\n`;
  if (inst.mission) md += `**Mission:** ${inst.mission}\n\n`;
  if (inst.website_url) md += `**Official website:** ${inst.website_url}\n\n`;
  if (Array.isArray(inst.functions) && inst.functions.length > 0) {
    md += `## Core Functions\n`;
    inst.functions.forEach((func: string, i: number) => {
      md += `${i + 1}. ${func}\n`;
    });
    md += "\n";
  }
  return markdownResponse(md, `/government/institutions/${slug}`, request);
}

async function markdownLeader(slug: string, request: NextRequest) {
  const supabase = createPublicClient();
  const { data: leader, error } = await supabase
    .from("leaders")
    .select(
      "id, slug, first_name, other_names, surname, full_name, title, current_party, current_county, current_constituency, current_organization",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !leader) {
    return NextResponse.json({ error: "Leader not found" }, { status: 404 });
  }

  const name =
    [leader.first_name, leader.other_names, leader.surname]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    leader.full_name ||
    slug;

  const { data: roles } = await supabase
    .from("leader_roles")
    .select("title, status, party, county, seat_type")
    .eq("leader_id", leader.id)
    .limit(20);

  let md = `# ${name}\n\n`;
  md += `> Source: [${SITE_URL}/government/people/${slug}](${SITE_URL}/government/people/${slug})\n\n`;
  if (leader.title) md += `**Title:** ${leader.title}\n\n`;
  if (leader.current_party) md += `**Party:** ${leader.current_party}\n\n`;
  if (leader.current_county) md += `**County:** ${leader.current_county}\n\n`;
  if (leader.current_constituency)
    md += `**Constituency:** ${leader.current_constituency}\n\n`;
  if (leader.current_organization)
    md += `**Organisation:** ${leader.current_organization}\n\n`;
  if (roles && roles.length) {
    md += `## Roles\n\n| Title | Status | County | Party |\n| --- | --- | --- | --- |\n`;
    for (const r of roles) {
      md += `| ${r.title || "—"} | ${r.status || "—"} | ${r.county || "—"} | ${r.party || "—"} |\n`;
    }
    md += "\n";
  }
  return markdownResponse(md, `/government/people/${slug}`, request);
}

async function markdownService(slug: string, request: NextRequest) {
  const service = await sanityClient.fetch(
    `*[_type == "governmentService" && slug.current == $slug && status != "draft"][0]{
      title, summary, body, processingTime, baseCostLabel, executionMode,
      beforeYouStart, requiredDocuments,
      steps[]{ stepNumber, stepTitle, stepDescription },
      transactionPortals[]{ portalLabel, portalUrl },
      providingInstitutions[]{ name, parentName }
    }`,
    { slug },
  );

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  let md = `# ${service.title}\n\n`;
  md += `> Source: [${SITE_URL}/${slug}](${SITE_URL}/${slug})\n\n`;
  md += `${service.summary || ""}\n\n`;
  md += `## Quick facts\n`;
  md += `- **Processing time:** ${service.processingTime || "N/A"}\n`;
  md += `- **Cost:** ${service.baseCostLabel || "N/A"}\n`;
  md += `- **How to apply:** ${service.executionMode || "N/A"}\n\n`;
  if (service.providingInstitutions?.length) {
    md += `## From\n`;
    for (const p of service.providingInstitutions) {
      md += `- ${p.name}${p.parentName ? ` (under ${p.parentName})` : ""}\n`;
    }
    md += "\n";
  }
  if (service.body) {
    const bodyMd = await portableTextToMarkdown(service.body);
    if (bodyMd) md += `## Guidance\n\n${bodyMd}\n\n`;
  }
  if (service.beforeYouStart?.length) {
    md += `## Before you start\n`;
    for (const item of service.beforeYouStart) md += `- ${item}\n`;
    md += "\n";
  }
  if (service.requiredDocuments?.length) {
    md += `## Documents you need\n`;
    for (const item of service.requiredDocuments) md += `- ${item}\n`;
    md += "\n";
  }
  if (service.steps?.length) {
    md += `## Step by step\n`;
    for (const step of service.steps) {
      md += `### ${step.stepNumber || ""}. ${step.stepTitle || ""}\n${step.stepDescription || ""}\n\n`;
    }
  }
  if (service.transactionPortals?.length) {
    md += `## Start on official portals\n`;
    for (const p of service.transactionPortals) {
      md += `- [${p.portalLabel || "Official site"}](${p.portalUrl})\n`;
    }
    md += "\n";
  }
  return markdownResponse(md, `/${slug}`, request);
}

async function markdownAct(slug: string, request: NextRequest) {
  const act = await sanityClient.fetch(
    `*[_type == "actOfParliament" && slug.current == $slug][0]{
      title, shortTitle, citation, yearEnacted, status, houseOfOrigin, countyName,
      "partCount": count(parts),
      parts[]{ partNumber, partTitle, sections[]{ sectionNumber, sectionTitle } }
    }`,
    { slug },
  );
  if (!act) {
    return NextResponse.json({ error: "Act not found" }, { status: 404 });
  }

  let md = `# ${act.shortTitle || act.title}\n\n`;
  md += `> Source: [${SITE_URL}/acts/parliament/${slug}](${SITE_URL}/acts/parliament/${slug})\n\n`;
  md += `**Full title:** ${act.title || "N/A"}\n\n`;
  md += `**Citation:** ${act.citation || "N/A"}\n\n`;
  md += `**Year:** ${act.yearEnacted ?? "N/A"} | **Status:** ${act.status || "N/A"}\n\n`;
  if (act.houseOfOrigin) md += `**House of origin:** ${act.houseOfOrigin}\n\n`;
  if (act.countyName) md += `**County:** ${act.countyName}\n\n`;
  md += `**Parts indexed:** ${act.partCount ?? 0}\n\n`;

  if (Array.isArray(act.parts) && act.parts.length) {
    md += `## Arrangement of Act\n\n`;
    for (const part of act.parts) {
      md += `### Part ${part.partNumber || ""} — ${part.partTitle || ""}\n`;
      if (Array.isArray(part.sections)) {
        for (const sec of part.sections) {
          md += `- Section ${sec.sectionNumber || ""}: ${sec.sectionTitle || ""}\n`;
        }
      }
      md += "\n";
    }
  }

  return markdownResponse(md, `/acts/parliament/${slug}`, request);
}

async function markdownConstitutionArticle(
  chapter: number,
  article: number,
  request: NextRequest,
) {
  const data = await sanityClient.fetch(
    `*[_type == "constitutionArticle" && chapterNumber == $chapter && articleNumber == $article][0]{
      chapterNumber, chapterTitle, articleNumber, articleTitle, officialText, plainEnglish
    }`,
    { chapter, article },
  );
  if (!data) {
    return NextResponse.json(
      { error: "Constitution article not found" },
      { status: 404 },
    );
  }

  const path = `/constitution/chapter/${chapter}/article/${article}`;
  const officialMd = await portableTextToMarkdown(data.officialText);
  const plainMd = data.plainEnglish
    ? await portableTextToMarkdown(data.plainEnglish)
    : "";

  let md = `# Article ${data.articleNumber} — ${data.articleTitle || ""}\n\n`;
  md += `> Source: [${SITE_URL}${path}](${SITE_URL}${path})\n\n`;
  md += `**Chapter ${data.chapterNumber}:** ${data.chapterTitle || ""}\n\n`;
  md += `## Official text\n\n${officialMd || "_No text_"}\n\n`;
  if (plainMd) {
    md += `## Plain English\n\n${plainMd}\n`;
  }
  return markdownResponse(md, path, request);
}
