import Link from 'next/link';
//import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import GovUKFeedback from '@/components/govuk/Feedback';
import { getGuides } from '@/lib/sanity/client';

export const metadata = {
  title: 'Government Guides',
  description: 'Procedural guides and how-to information for government services',
};

export default async function GuidesPage() {
  let guides = [];
  try {
    guides = await getGuides();
  } catch (error) {
    console.error('Error fetching guides:', error);
  }

  const featuredGuides = guides.filter((g: any) => g.featured);
  const regularGuides = guides.filter((g: any) => !g.featured);

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Guides', href: '/guides' },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Government Guides</h1>
        <p className="govuk-body-l">
          Step-by-step guides to help you navigate government services and procedures.
        </p>

        {/* Featured Guides */}
        {featuredGuides.length > 0 && (
          <section className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-m">Featured Guides</h2>
            <div className="govuk-grid-row">
              {featuredGuides.map((guide: any) => (
                <div key={guide._id} className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
                  <div className="govuk-!-padding-4 border border-gray-200">
                    <h3 className="govuk-heading-s">
                      <Link
                        href={`/guides/${guide.slug.current}`}
                        className="govuk-link"
                      >
                        {guide.title}
                      </Link>
                    </h3>
                    <p className="govuk-body-s">{guide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Guides */}
        <section>
          <h2 className="govuk-heading-m">All Guides</h2>
          {regularGuides.length > 0 ? (
            <ul className="govuk-list govuk-list--spaced">
              {regularGuides.map((guide: any) => (
                <li key={guide._id} className="govuk-!-margin-bottom-4 pb-4 border-b border-gray-200 last:border-b-0">
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                    <Link
                      href={`/guides/${guide.slug.current}`}
                      className="govuk-link"
                    >
                      {guide.title}
                    </Link>
                  </h3>
                  <p className="govuk-body-s text-gray-600">{guide.description}</p>
                  {guide.category && (
                    <p className="govuk-body-s">
                      <strong>Category:</strong> {guide.category}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="govuk-inset-text">
              <p className="govuk-body">No guides available at this time.</p>
            </div>
          )}
        </section>

        <GovUKFeedback />
      </main>
    </div>
  );
}
