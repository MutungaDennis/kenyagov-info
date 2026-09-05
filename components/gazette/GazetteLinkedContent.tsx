import { createClient } from "@/lib/supabase/server";

type Props = {
  noticeId: string;
  html: string;
};

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function markerRegex(id: string) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Global on purpose: one logical entity can have several fragments when
  // a Gazette name spans multiple printed lines/HTML blocks.
  return new RegExp(
    `<span\\s+[^>]*data-gazette-inline-link=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/span>`,
    "gi",
  );
}

export default async function GazetteLinkedContent({
  noticeId,
  html,
}: Props) {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("gazette_inline_links")
    .select(
      "id, link_type, leader_id, mca_id, institution_id, verification_status",
    )
    .eq("notice_id", noticeId)
    .eq("verification_status", "Verified");

  const rows = links || [];

  const leaderIds = Array.from(
    new Set(rows.map((row) => row.leader_id).filter(Boolean)),
  ) as string[];

  const mcaIds = Array.from(
    new Set(rows.map((row) => row.mca_id).filter(Boolean)),
  ) as string[];

  const institutionIds = Array.from(
    new Set(rows.map((row) => row.institution_id).filter(Boolean)),
  ) as string[];

  const [leaders, mcas, institutions] = await Promise.all([
    leaderIds.length
      ? supabase.from("leaders").select("id, slug").in("id", leaderIds)
      : Promise.resolve({ data: [] }),

    mcaIds.length
      ? supabase.from("mcas").select("id, slug").in("id", mcaIds)
      : Promise.resolve({ data: [] }),

    institutionIds.length
      ? supabase
          .from("institutions")
          .select("id, slug")
          .in("id", institutionIds)
      : Promise.resolve({ data: [] }),
  ]);

  const leaderMap = new Map(
    (leaders.data || []).map((row: any) => [row.id, row.slug]),
  );

  const mcaMap = new Map(
    (mcas.data || []).map((row: any) => [row.id, row.slug]),
  );

  const institutionMap = new Map(
    (institutions.data || []).map((row: any) => [row.id, row.slug]),
  );

  let renderedHtml = html;

  for (const link of rows) {
    let href: string | null = null;

    if (link.link_type === "person") {
      const slug = link.leader_id
        ? leaderMap.get(link.leader_id)
        : link.mca_id
          ? mcaMap.get(link.mca_id)
          : null;

      if (slug) href = `/government/people/${slug}`;
    }

    if (link.link_type === "institution" && link.institution_id) {
      const slug = institutionMap.get(link.institution_id);
      if (slug) href = `/government/institutions/${slug}`;
    }

    if (!href) continue;

    const safeHref = escapeAttribute(href);

    renderedHtml = renderedHtml.replace(
      markerRegex(link.id),
      `<a class="govuk-link gazette-entity-link" href="${safeHref}">$1</a>`,
    );
  }

  return (
    <article
      id="gazette-notice-content"
      className="gazette-notice-content govuk-body-l govuk-!-font-size-19"
      style={{ lineHeight: "1.6" }}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}