import Link from "next/link";
import { notFound } from "next/navigation";

import { LegislationAdminNav } from "@/components/legislation/admin/LegislationAdminNav";
import { LegislationDocumentRelationships } from "@/components/legislation/admin/LegislationDocumentRelationships";
import { getAdminLegislationDocument } from "@/lib/legislation/admin/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LegislationRelationshipsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const data = await getAdminLegislationDocument(id);

  if (!data) {
    notFound();
  }

  const { document, provisions } = data;

  return (
    <main
      className="govuk-width-container govuk-main-wrapper"
      id="main-content"
    >
      <Link
        className="govuk-back-link"
        href={`/admin/legislation/documents/${id}`}
      >
        Back to legislation overview
      </Link>

      <span className="govuk-caption-xl">Legislation admin</span>

      <h1 className="govuk-heading-xl">
        Relationships — {document.legal.title}
      </h1>

      <LegislationAdminNav
        documentId={id}
        active="relationships"
      />

      <div className="govuk-grid-row govuk-!-margin-top-6">
        <div className="govuk-grid-column-two-thirds">
          <LegislationDocumentRelationships
            documentId={id}
            legalDocumentId={document.legal.id}
          />
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-l">
        Link wording inside provisions
      </h2>

      <p className="govuk-body">
        Select a provision to link exact wording to a person, institution,
        law, CitizenGuide page or official external source.
      </p>

      {provisions.length > 0 ? (
        <ul className="govuk-list govuk-list--spaced">
          {provisions.map((provision: any) => (
            <li key={provision.id}>
              <Link
                className="govuk-link"
                href={`/admin/legislation/documents/${id}/provisions/${provision.id}/links`}
              >
                {provision.provision_number
                  ? `${provision.provision_number}. `
                  : ""}
                {provision.heading || provision.provision_type}
              </Link>

              <span className="govuk-body-s">
                {" "}
                — relationship review:{" "}
                {provision.relationship_review_status || "Pending"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="govuk-body">
          No provisions have been added to this legislation yet.
        </p>
      )}
    </main>
  );
}