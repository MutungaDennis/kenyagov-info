import Link from "next/link";
import { notFound } from "next/navigation";
import { LegislationAdminNav } from "@/components/legislation/admin/LegislationAdminNav";
import { LegislationVersionsManager } from "@/components/legislation/admin/LegislationVersionsManager";
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
      <h1 className="govuk-heading-xl">Versions — {data.document.legal.title}</h1>
      <LegislationAdminNav documentId={id} active="versions" />
      <div className="govuk-grid-row govuk-!-margin-top-6">
        <div className="govuk-grid-column-two-thirds">
          <LegislationVersionsManager documentId={id} />
        </div>
      </div>
    </main>
  );
}
