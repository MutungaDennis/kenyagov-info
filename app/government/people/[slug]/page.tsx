import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { InstitutionRecord } from "@/components/site/InstitutionLinkedText";
import PersonProfileClient from "./PersonProfileClient";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Server gate: missing officials return HTTP 404 (not a soft-404 client page).
 * Full profile still loads client-side to stay under Cloudflare Free CPU limits.
 */
export default async function PersonProfilePage({ params }: Props) {
  const { slug } = await params;
  if (!slug?.trim()) notFound();

  let shouldRenderProfile = false;
  let institutions: InstitutionRecord[] = [];

  try {
    const supabase = createPublicClient();
    const { data: leader } = await supabase
      .from("leaders")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (leader) {
      shouldRenderProfile = true;
    } else {
      const { data: mca } = await supabase
        .from("mcas")
        .select("id")
        .eq("slug", slug)
        .neq("status", "Unpublished")
        .maybeSingle();
      shouldRenderProfile = Boolean(mca);
    }

    if (shouldRenderProfile) {
      const { data } = await supabase
        .from("institutions")
        .select("id, slug, name, short_name, official_name, former_names, aliases")
        .is("deleted_at", null)
        .not("slug", "is", null)
        .order("name", { ascending: true })
        .limit(1000);
      institutions = (data || []) as InstitutionRecord[];
    }
  } catch {
    // If Supabase is briefly unavailable, still render the client shell so
    // legitimate profiles are not hard-404'd by a transient outage.
    shouldRenderProfile = true;
  }

  if (shouldRenderProfile) {
    return <PersonProfileClient institutions={institutions} />;
  }

  notFound();
}
