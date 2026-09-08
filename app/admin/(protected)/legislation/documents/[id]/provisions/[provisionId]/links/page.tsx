import Link from "next/link";
import { notFound } from "next/navigation";
import { LegislationProvisionLinker } from "@/components/legislation/admin/LegislationProvisionLinker";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; provisionId: string }>;
}) {
  const { id, provisionId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("legislation_provisions")
    .select("id,provision_number,heading")
    .eq("id", provisionId)
    .eq("legislation_document_id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) notFound();

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <Link
        className="govuk-back-link"
        href={`/admin/legislation/documents/${id}/relationships`}
      >
        Back to relationships
      </Link>

      <span className="govuk-caption-xl">Inline legal linking</span>
      <h1 className="govuk-heading-xl">
        {data.provision_number ? `${data.provision_number}. ` : ""}
        {data.heading || "Provision"}
      </h1>

      <LegislationProvisionLinker provisionId={provisionId} />
    </main>
  );
}
