import { notFound, permanentRedirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import InstitutionProfileClient from "./InstitutionProfileClient";
import { getPublicSchool } from "@/lib/schools/queries";
import SchoolProfile from "@/components/schools/SchoolProfile";
import InstitutionPeople from "@/components/institutions/InstitutionPeople";

type Props = {
  params: Promise<{ slug: string }>;
};

// Publishing changes must take effect without waiting for a cached profile to expire.
export const dynamic = "force-dynamic";

/**
 * Server gate: missing institutions return HTTP 404 (not a soft-404 client page).
 * Full profile still loads client-side to stay under Cloudflare Free CPU limits.
 */
export default async function InstitutionProfilePage({ params }: Props) {
  const { slug } = await params;
  if (!slug?.trim()) notFound();

    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("institutions")
      .select("id,status")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error("The institution directory is temporarily unavailable.");

    if (data) {
      return <InstitutionProfileClient people={<InstitutionPeople institutionId={data.id} status={data.status} />} />;
    }
  const school = await getPublicSchool(slug);
  if (school) {
    if (school.slug !== slug) permanentRedirect(`/government/institutions/${school.slug}`);
    return <SchoolProfile school={school} />;
  }

  notFound();
}
