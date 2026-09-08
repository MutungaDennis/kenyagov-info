import Link from "next/link";
import { notFound } from "next/navigation";
import { LegislationAdminNav } from "@/components/legislation/admin/LegislationAdminNav";
import { LegislationDocumentEditor } from "@/components/legislation/admin/LegislationDocumentEditor";
import { getAdminLegislationDocument } from "@/lib/legislation/admin/queries";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAdminLegislationDocument(id);
  if (!data) notFound();
  const d = data.document;

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <Link className="govuk-back-link" href={`/admin/legislation/documents/${id}`}>Back to legislation overview</Link>
      <span className="govuk-caption-xl">Legislation admin</span>
      <h1 className="govuk-heading-xl">Edit {d.legal.title}</h1>
      <LegislationAdminNav documentId={id} active="edit" />
      <div className="govuk-grid-row govuk-!-margin-top-6">
        <div className="govuk-grid-column-two-thirds">
          <LegislationDocumentEditor
            documentId={id}
            initial={{
              title:d.legal.title,short_title:d.legal.short_title,citation:d.legal.citation,
              slug:d.legal.slug,year:d.legal.year,source_url:d.legal.source_url,
              category:d.category,legislation_kind:d.legislation_kind,status:d.status,
              act_number:d.act_number,cap_number:d.cap_number,bill_reference:d.bill_reference,
              long_title:d.long_title,legislature_name:d.legislature_name,
              originating_chamber:d.originating_chamber,assent_date:d.assent_date,
              publication_date:d.publication_date,commencement_date:d.commencement_date,
              last_amended_date:d.last_amended_date,current_version_date:d.current_version_date,
              repeal_date:d.repeal_date,review_status:d.review_status,
              relationship_review_status:d.relationship_review_status,admin_notes:d.admin_notes
            }}
          />
        </div>
      </div>
    </main>
  );
}
