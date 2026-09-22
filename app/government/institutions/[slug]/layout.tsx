import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { buildPageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getPublicSchool } from "@/lib/schools/queries";
import { schoolLevelLabel } from "@/lib/schools/types";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return { title: "Institution" };
  }

  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("institutions")
      .select(
        "slug, name, short_name, official_name, description, mandate, institution_type, institution_category, status",
      )
      .eq("slug", slug).eq("is_active", true)
      .maybeSingle();

    if (data) {
      const name =
        data.official_name || data.name || data.short_name || "Institution";
      const typeBits = [
        data.institution_type,
        data.institution_category,
      ]
        .filter(Boolean)
        .join(" · ");

      const nameLower = name.toLowerCase();
      const isCountyAssembly =
        nameLower.includes("county assembly") ||
        (data.institution_type || "").toLowerCase().includes("county assembly");
      const isCounty =
        !isCountyAssembly &&
        (data.institution_type === "County Government" ||
          data.institution_category?.toLowerCase().includes("county"));

      const rawDesc =
        data.description ||
        data.mandate ||
        `${name}${typeBits ? ` (${typeBits})` : ""} — ${
          isCountyAssembly
            ? "County Assembly institution profile"
            : isCounty
              ? "Official county profile, demographics, and development data"
              : "public institution profile"
        } on ${SITE_NAME}.`;

      const description = String(rawDesc)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300);

      const keywords = [
        name,
        data.short_name,
        data.institution_type,
        isCountyAssembly
          ? "Kenya county assemblies"
          : isCounty
            ? "Kenya counties"
            : "Kenya institutions",
        isCounty ? `${name} county government` : "",
        isCounty ? `${name} county profile` : "",
        isCountyAssembly ? `${name} legislature` : "",
        SITE_NAME,
      ].filter(Boolean) as string[];

      return buildPageMetadata({
        title: data.short_name
          ? `${name} (${data.short_name})`
          : name,
        description,
        path: `/government/institutions/${data.slug || slug}`,
        keywords,
      });
    }
    const school = await getPublicSchool(slug);
    if (school) return buildPageMetadata({
      title: school.official_name,
      description: `${school.official_name}: a public ${schoolLevelLabel(school.main_tier).toLowerCase()} institution in ${school.county || "Kenya"}. Governance, location, contacts and recorded school information.`,
      path: `/government/institutions/${school.slug}`,
      keywords: [school.official_name, "Kenya public schools", school.county || "Kenya"],
    });
  } catch {
    /* The page reports data-source failures; metadata remains conservative. */
  }

  return buildPageMetadata({
    title: "Institution",
    description: `Public institutions on ${SITE_NAME}.`,
    path: `/government/institutions/${slug}`,
    noIndex: true,
  });
}

export default async function InstitutionSlugLayout({
  children,
  params,
}: Props) {
  const { slug } = await params;
  let schema: Record<string, unknown> | null = null;

  try {
    const supabase = createPublicClient();
    const { data: inst } = await supabase
      .from("institutions")
      .select(
        "name, short_name, official_name, description, mandate, email, phone, physical_address, headquarters, website_url, established_date, institution_type, institution_category, parent_institution_id, slug",
      )
      .eq("slug", slug).eq("is_active", true)
      .maybeSingle();

    if (inst) {
      let parent:
        | { name: string; slug: string }
        | null = null;
      if (inst.parent_institution_id) {
        const { data: p } = await supabase
          .from("institutions")
          .select("name, slug")
          .eq("id", inst.parent_institution_id).eq("is_active", true)
          .maybeSingle();
        if (p?.name && p?.slug) parent = { name: p.name, slug: p.slug };
      }

      const nameLower = (inst.name || "").toLowerCase();
      const isCounty =
        inst.institution_type === "County Government" ||
        (!nameLower.includes("assembly") &&
          (inst.institution_category || "").toLowerCase().includes("county"));

      schema = {
        "@context": "https://schema.org",
        "@type": isCounty ? "AdministrativeArea" : "GovernmentOrganization",
        name: inst.official_name || inst.name,
        alternateName: inst.short_name || undefined,
        description: inst.description || inst.mandate || undefined,
        url: `${SITE_URL}/government/institutions/${inst.slug || slug}`,
        email: inst.email || undefined,
        telephone: inst.phone || undefined,
        address: inst.physical_address || inst.headquarters || undefined,
        sameAs: inst.website_url ? [inst.website_url] : undefined,
        areaServed: { "@type": "Country", name: "Kenya" },
        parentOrganization: parent
          ? {
              "@type": "GovernmentOrganization",
              name: parent.name,
              url: `${SITE_URL}/government/institutions/${parent.slug}`,
            }
          : undefined,
        foundingDate: inst.established_date || undefined,
        inLanguage: "en-KE",
      };
    }
  } catch {
    /* skip schema */
  }

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
