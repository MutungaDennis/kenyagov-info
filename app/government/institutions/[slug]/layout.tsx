import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo";

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
      .eq("slug", slug)
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
      const rawDesc =
        data.description ||
        data.mandate ||
        `${name}${typeBits ? ` (${typeBits})` : ""} — public institution profile on ${SITE_NAME}.`;
      const description = String(rawDesc)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300);

      return buildPageMetadata({
        title: data.short_name
          ? `${name} (${data.short_name})`
          : name,
        description,
        path: `/government/institutions/${data.slug || slug}`,
        keywords: [
          name,
          data.short_name,
          data.institution_type,
          "Kenya institutions",
          SITE_NAME,
        ].filter(Boolean) as string[],
      });
    }
  } catch {
    /* fall through */
  }

  // Unknown slug — server page will 404; keep out of the index if this HTML is served
  return buildPageMetadata({
    title: "Institution",
    description: `Public institutions on ${SITE_NAME}.`,
    path: `/government/institutions/${slug}`,
    noIndex: true,
  });
}

export default function InstitutionSlugLayout({ children }: Props) {
  return children;
}
