import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideAcronymBySlug } from "@/lib/guides/reference-terms";
import LinkedBiography from "@/components/site/LinkedBiography";

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getGuideAcronymBySlug(slug);
  return entry
    ? { title: `${entry.acronym}: ${entry.full_form}`, description: entry.short_meaning }
    : { title: "Acronym not found", description: "This acronym entry could not be found." };
}

export default async function AcronymDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getGuideAcronymBySlug(slug);
  if (!entry) notFound();

  return (
    <main className="govuk-width-container govuk-main-wrapper" id="main-content">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/">Home</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/guides">Guides</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/guides/acronyms">Acronyms</Link></li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">{entry.acronym}</li>
        </ol>
      </nav>
      <article className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Acronyms</span>
          <h1 className="govuk-heading-xl">{entry.acronym}</h1>
          <p className="govuk-body-l govuk-!-font-weight-bold">{entry.full_form}</p>
          <p className="govuk-body">{entry.short_meaning}</p>
          <section aria-labelledby="full-details-heading">
            <h2 id="full-details-heading" className="govuk-heading-m">Full details</h2>
            <LinkedBiography text={entry.details} />
          </section>
          <p className="govuk-body"><Link className="govuk-link" href="/guides/acronyms">Back to acronyms</Link></p>
        </div>
      </article>
    </main>
  );
}
