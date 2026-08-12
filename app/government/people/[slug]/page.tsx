import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
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

  try {
    const supabase = createPublicClient();

    const { data: leader } = await supabase
      .from("leaders")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (leader) {
      return <PersonProfileClient />;
    }

    const { data: mca } = await supabase
      .from("mcas")
      .select("id")
      .eq("slug", slug)
      .neq("status", "Unpublished")
      .maybeSingle();

    if (mca) {
      return <PersonProfileClient />;
    }
  } catch {
    // If Supabase is briefly unavailable, still render the client shell so
    // legitimate profiles are not hard-404'd by a transient outage.
    return <PersonProfileClient />;
  }

  notFound();
}
