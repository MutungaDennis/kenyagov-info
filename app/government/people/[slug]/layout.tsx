import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import {
  displayName,
  displayNameWithTitles,
  resolvePrimaryRole,
  type LeaderRoleLike,
} from "@/lib/leaders/display";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

/**
 * Server layout so social crawlers get title, description, and OG image
 * without relying on the client-only profile page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return { title: "Government official" };
  }

  try {
    const supabase = createPublicClient();

    // Leaders first
    const { data: leader } = await supabase
      .from("leaders")
      .select(
        `
        slug, first_name, other_names, surname, full_name, title,
        name_titles, national_honours, bio, image_url, category,
        current_organization, current_party, current_county, current_constituency,
        leader_roles!leader_roles_leader_id_fkey (
          title, organization, constituency, county, party, status,
          term_start_date, term_end_date
        )
      `,
      )
      .eq("slug", slug)
      .maybeSingle();

    if (leader) {
      const roles = (leader.leader_roles || []) as LeaderRoleLike[];
      const { role, isCurrent } = resolvePrimaryRole(roles);
      const name = displayNameWithTitles(leader) || displayName(leader);
      const roleTitle =
        role?.title || leader.title || leader.category || "Government official";
      const org =
        role?.organization || leader.current_organization || null;
      const place =
        role?.constituency ||
        role?.county ||
        leader.current_constituency ||
        leader.current_county ||
        null;

      const headline = [roleTitle, org, place].filter(Boolean).join(" · ");
      const description = (
        leader.bio
          ? String(leader.bio).replace(/\s+/g, " ").trim().slice(0, 200)
          : `${name} — ${headline}. Profile on ${SITE_NAME}, an independent guide to Kenyan governance.`
      ).slice(0, 300);

      const image =
        typeof leader.image_url === "string" && leader.image_url.trim()
          ? leader.image_url.trim()
          : null;

      return buildPageMetadata({
        title: name,
        description:
          description ||
          `${name} is listed on ${SITE_NAME}. ${isCurrent ? "Current" : "Former"} role: ${roleTitle}.`,
        path: `/government/people/${leader.slug || slug}`,
        image,
        imageAlt: image ? `Portrait of ${name}` : undefined,
        imageWidth: image ? 800 : undefined,
        imageHeight: image ? 800 : undefined,
        type: "profile",
        keywords: [
          name,
          roleTitle,
          "Kenya government",
          "public officials",
          SITE_NAME,
        ].filter(Boolean) as string[],
      });
    }

    // MCAs
    const { data: mca } = await supabase
      .from("mcas")
      .select(
        `
        slug, first_name, other_names, surname, assembly_role, bio, image_url,
        seat_type, status,
        counties (name),
        wards (name)
      `,
      )
      .eq("slug", slug)
      .neq("status", "Unpublished")
      .maybeSingle();

    if (mca) {
      const name =
        [mca.first_name, mca.other_names, mca.surname]
          .filter(Boolean)
          .join(" ")
          .trim() || "MCA";
      const county =
        (mca.counties as { name?: string } | null)?.name || null;
      const ward = (mca.wards as { name?: string } | null)?.name || null;
      const role =
        mca.assembly_role || "Member of County Assembly";
      const description = [
        `${name}, ${role}`,
        ward ? `for ${ward}` : null,
        county ? `${county} County` : null,
        `— profile on ${SITE_NAME}.`,
      ]
        .filter(Boolean)
        .join(" ");

      const image =
        typeof mca.image_url === "string" && mca.image_url.trim()
          ? mca.image_url.trim()
          : null;

      return buildPageMetadata({
        title: name,
        description: description.slice(0, 300),
        path: `/government/people/${mca.slug || slug}`,
        image,
        imageAlt: image ? `Portrait of ${name}` : undefined,
        type: "profile",
        keywords: [name, role, county, "MCA", "Kenya"].filter(
          Boolean,
        ) as string[],
      });
    }
  } catch {
    /* fall through */
  }

  // Unknown slug — server page will 404; keep out of the index if this HTML is served
  return buildPageMetadata({
    title: "Government official",
    description: `Official profiles on ${SITE_NAME}.`,
    path: `/government/people/${slug}`,
    noIndex: true,
  });
}

export default function PersonProfileLayout({ children }: Props) {
  return children;
}
