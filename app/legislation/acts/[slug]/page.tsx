import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegislationDocumentView } from "@/components/legislation/LegislationDocumentView";
import {
  getAmendmentSchedule,
  getLegislationDocument,
  getProvisions,
  getVersions,
} from "@/lib/legislation/queries";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = await getLegislationDocument(slug, "act");

  if (!document) {
    return {
      title: "Act not found - CitizenGuide.KE",
    };
  }

  const description =
    document.long_title ||
    document.citation ||
    `Read ${document.title} on CitizenGuide.KE.`;

  return {
    title: `${document.title} - CitizenGuide.KE`,
    description,
    alternates: {
      canonical: `/legislation/acts/${document.slug}`,
    },
  };
}

export default async function ActPage({ params }: PageProps) {
  const { slug } = await params;

  const document = await getLegislationDocument(slug, "act");

  if (!document) {
    notFound();
  }

  const [provisions, versions, amendmentSchedule] = await Promise.all([
    getProvisions(document.legislation_document_id),
    getVersions(document.legislation_document_id),
    document.legislation_kind === "amending"
      ? getAmendmentSchedule(document.legislation_document_id)
      : Promise.resolve([]),
  ]);

  return (
    <div className="govuk-width-container">
      <LegislationDocumentView
        document={document}
        provisions={provisions}
        versions={versions}
        amendmentSchedule={amendmentSchedule}
      />
    </div>
  );
}
