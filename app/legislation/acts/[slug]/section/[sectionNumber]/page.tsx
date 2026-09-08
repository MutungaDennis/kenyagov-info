import { notFound } from "next/navigation";

import { SectionReader } from "@/components/legislation/SectionReader";
import {
  getLegislationDocument,
  getProvisions,
  getSection,
} from "@/lib/legislation/queries";

import "./section-page.css";

type PageProps = {
  params: Promise<{
    slug: string;
    sectionNumber: string;
  }>;
};

export default async function ActSectionPage({ params }: PageProps) {
  const { slug, sectionNumber } = await params;

  const document = await getLegislationDocument(slug, "act");

  if (!document) {
    notFound();
  }

  const [section, provisions] = await Promise.all([
    getSection(document.legislation_document_id, sectionNumber),
    getProvisions(document.legislation_document_id),
  ]);

  if (!section) {
    notFound();
  }

  const sections = provisions.filter(
    (provision) => provision.provision_type === "section",
  );

  const currentIndex = sections.findIndex(
    (provision) => provision.id === section.id,
  );

  const previousSection =
    currentIndex > 0 ? sections[currentIndex - 1] : null;

  const nextSection =
    currentIndex >= 0 && currentIndex < sections.length - 1
      ? sections[currentIndex + 1]
      : null;

  return (
    <main
      className="govuk-width-container govuk-main-wrapper legislation-section-page"
      id="main-content"
    >
      <SectionReader
        document={document}
        section={section}
        previous={previousSection}
        next={nextSection}
      />
    </main>
  );
}
