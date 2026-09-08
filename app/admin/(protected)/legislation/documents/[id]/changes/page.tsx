import Link from "next/link";
import { notFound } from "next/navigation";
import { LegislationAdminNav } from "@/components/legislation/admin/LegislationAdminNav";
import { LegislationChangesManager } from "@/components/legislation/admin/LegislationChangesManager";
import { getAdminLegislationDocument } from "@/lib/legislation/admin/queries";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAdminLegislationDocument(id);
  if (!data) notFound();

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <Link className="govuk-back-link" href={`/admin/legislation/documents/${id}`}>Back to legislation overview</Link>
      <span className="govuk-caption-xl">Legislation admin</span>
      <h1 className="govuk-heading-xl">Change history — {data.document.legal.title}</h1>
      <LegislationAdminNav documentId={id} active="changes" />
      <div className="govuk-grid-row govuk-!-margin-top-6">
        <div className="govuk-grid-column-two-thirds">
          <LegislationChangesManager documentId={id} />
        </div>
      </div>
    </main>
  );
}
