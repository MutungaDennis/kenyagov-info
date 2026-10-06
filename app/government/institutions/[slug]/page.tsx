import { notFound, permanentRedirect, redirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import InstitutionProfileClient from "./InstitutionProfileClient";
import { getPublicSchool } from "@/lib/schools/queries";
import SchoolProfile from "@/components/schools/SchoolProfile";
import InstitutionPeople from "@/components/institutions/InstitutionPeople";
import InstitutionCommittees from "@/components/institutions/InstitutionCommittees";
import { parliamentaryChamberForInstitution } from "@/lib/legislature/committees";

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
  let data: { id: string; status: string | null; record_kind?: string | null; slug?: string | null; name?: string | null } | null = null;
  let error: { message: string } | null = null;
  const current = await supabase
    .from("institutions")
    .select("id,status,record_kind,slug,name")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (
    current.error &&
    /record_kind|schema cache|column .* does not exist/i.test(
      current.error.message,
    )
  ) {
    const legacy = await supabase
      .from("institutions")
      .select("id,status,slug,name")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    data = legacy.data;
    error = legacy.error;
  } else {
    data = current.data;
    error = current.error;
  }

  if (error) throw new Error("The institution directory is temporarily unavailable.");

  if (data) {
    if (data.record_kind === "temporary_body") {
      redirect(`/government/temporary-bodies/${slug}`);
    }
    const chamber = parliamentaryChamberForInstitution(data.slug, data.name);
    return (
      <InstitutionProfileClient
        people={
          <InstitutionPeople
            institutionId={data.id}
            status={data.status}
            committeeChamber={chamber}
            afterCurrent={chamber ? <InstitutionCommittees chamber={chamber} institutionId={data.id} /> : null}
          />
        }
      />
    );
  }
  const school = await getPublicSchool(slug);
  if (school) {
    if (school.slug !== slug) permanentRedirect(`/government/institutions/${school.slug}`);
    return <SchoolProfile school={school} />;
  }

  notFound();
}
