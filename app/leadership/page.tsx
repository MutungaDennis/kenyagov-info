import { Metadata } from 'next';
import Link from 'next/link';
//import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import { LEADERSHIP_HIERARCHY } from '@/lib/data/leadership-hierarchy';

export const metadata: Metadata = {
  title: 'Government Leadership | Kenya Info',
  description: 'Browse Kenyan government officials and leaders by category',
};

export default function LeadershipPage() {
  const categories = Object.entries(LEADERSHIP_HIERARCHY);

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Leadership', href: '/leadership' },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Government Leadership</h1>
            <p className="govuk-body-l">
              Find information about Kenyan government officials and leaders across all branches and levels.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">Browse by government branch</h2>
            <div className="govuk-grid-row">
              {categories.map(([categoryKey, categoryData]) => (
                <div key={categoryKey} className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                  <div className="govuk-card" style={{ height: '100%' }}>
                    <div className="govuk-card__content">
                      <h3 className="govuk-heading-m govuk-!-margin-top-0">
                        <Link href={`/leadership/${categoryKey}`} className="govuk-link">
                          {categoryData.name}
                        </Link>
                      </h3>
                      <p className="govuk-body">{categoryData.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-12">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">Quick links</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/leadership/county/governors" className="govuk-link">
                  All County Governors
                </Link>
              </li>
              <li>
                <Link href="/leadership/legislature/senate" className="govuk-link">
                  Senate Members
                </Link>
              </li>
              <li>
                <Link href="/leadership/legislature/national-assembly" className="govuk-link">
                  National Assembly Members
                </Link>
              </li>
              <li>
                <Link href="/officials" className="govuk-link">
                  All Government Officials
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
