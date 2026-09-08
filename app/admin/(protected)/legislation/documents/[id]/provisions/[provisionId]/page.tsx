import Link from "next/link";
import { notFound } from "next/navigation";
import { LegislationProvisionEditor } from "@/components/legislation/admin/LegislationProvisionEditor";
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
    .select("*")
    .eq("id", provisionId)
    .eq("legislation_document_id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) notFound();

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <Link className="govuk-back-link" href={`/admin/legislation/documents/${id}`}>
        Back to legislation
      </Link>

      <span className="govuk-caption-xl">Legislation provision</span>
      <h1 className="govuk-heading-xl">
        {data.provision_number ? `${data.provision_type} ${data.provision_number}` : data.provision_type}
      </h1>

      <div className="govuk-button-group">
        <Link
          className="govuk-button govuk-button--secondary"
          href={`/admin/legislation/documents/${id}/provisions/${provisionId}/links`}
        >
          Link people, institutions and laws
        </Link>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <LegislationProvisionEditor provisionId={provisionId} initial={data} />
        </div>
      </div>
    </main>
  );
}
