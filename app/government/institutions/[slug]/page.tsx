import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import InstitutionProfileClient from "./InstitutionProfileClient";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Server gate: missing institutions return HTTP 404 (not a soft-404 client page).
 * Full profile still loads client-side to stay under Cloudflare Free CPU limits.
 */
export default async function InstitutionProfilePage({ params }: Props) {
  const { slug } = await params;
  if (!slug?.trim()) notFound();

  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("institutions")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      return <InstitutionProfileClient />;
    }
  } catch {
    // Transient Supabase failure — prefer showing client shell over false 404.
    return <InstitutionProfileClient />;
  }

  notFound();
}
