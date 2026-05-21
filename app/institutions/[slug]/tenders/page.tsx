import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GenericSubRoutePage({ params }: PageProps) {
  const { slug } = await params;

  // TODO: Fetch conditional database records from Sanity or Supabase
  // e.g., const data = await fetchSubrouteData(slug, 'tools');

  return (
    <div className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-6">
      
      {/* GOV.UK Breadcrumbs Pattern */}
      <div className="govuk-breadcrumbs govuk-!-margin-bottom-6">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link href="/" className="govuk-breadcrumbs__link">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link href="/institutions" className="govuk-breadcrumbs__link">Institutions</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link href={`/institutions/${slug}`} className="govuk-breadcrumbs__link">{slug.toUpperCase()}</Link>
          </li>
        </ol>
      </div>

      <main className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
            {slug.toUpperCase()} Information Node
          </h1>
          
          <p className="govuk-body-l">
            This module is structured dynamically to render public data for this specific institution.
          </p>

          <div className="govuk-inset-text">
            Data configurations and feature injection triggers will register automatically based on the database attributes tied to <code>{slug}</code>.
          </div>

          {/* Conditional Layout block injection placeholder */}
          <div className="govuk-!-margin-top-8" style={{ border: '2px dashed #bfc1c3', padding: '20px', textAlign: 'center', background: '#f3f2f1' }}>
            <p className="govuk-body govuk-!-margin-0">
              [Dynamic layout entry slot for <strong>{slug}</strong> features]
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
