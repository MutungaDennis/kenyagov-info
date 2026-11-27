import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGlossaryTermBySlug } from "@/lib/guides/reference-terms";
import LinkedBiography from "@/components/site/LinkedBiography";

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getGlossaryTermBySlug(slug);
  return entry
    ? { title: entry.term, description: entry.short_meaning }
    : { title: "Glossary term not found", description: "This glossary entry could not be found." };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getGlossaryTermBySlug(slug);
  if (!entry) notFound();

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/">Home</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/guides">Guides</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/guides/glossary-of-terms">Glossary of terms</Link></li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">{entry.term}</li>
        </ol>
      </nav>
      <article className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Glossary of terms</span>
          <h1 className="govuk-heading-xl">{entry.term}</h1>
          <p className="govuk-body-l">{entry.short_meaning}</p>
          <section aria-labelledby="full-definition-heading">
            <h2 id="full-definition-heading" className="govuk-heading-m">Full definition</h2>
            <LinkedBiography text={entry.details} />
          </section>
          <p className="govuk-body"><Link className="govuk-link" href="/guides/glossary-of-terms">Back to glossary of terms</Link></p>
        </div>
      </article>
    </main>
  );
}
