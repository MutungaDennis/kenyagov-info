import { Metadata } from 'next';
import Link from 'next/link';
//import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';

import { ENTITY_HIERARCHY } from '@/lib/data/leadership-hierarchy';

export const metadata: Metadata = {
  title: 'Government Entities | CitizenGuide.KE',
  description: 'Browse Kenyan government organizations, ministries, and institutions',
};

export default function EntitiesPage() {
  const categories = Object.entries(ENTITY_HIERARCHY);

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Entities', href: '/entities' },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Government Entities</h1>
            <p className="govuk-body-l">
              Find information about Kenyan government organizations, ministries, agencies, and institutions.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">Browse by entity type</h2>
            <div className="govuk-grid-row">
              {categories.map(([categoryKey, categoryData]) => (
                <div key={categoryKey} className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                  <div className="govuk-card" style={{ height: '100%' }}>
                    <div className="govuk-card__content">
                      <h3 className="govuk-heading-m govuk-!-margin-top-0">
                        <Link href={`/entities/${categoryKey}`} className="govuk-link">
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
                <Link href="/entities/ministries" className="govuk-link">
                  All Ministries & Departments
                </Link>
              </li>
              <li>
                <Link href="/entities/agencies" className="govuk-link">
                  Agencies & Commissions
                </Link>
              </li>
              <li>
                <Link href="/entities/counties" className="govuk-link">
                  County Governments
                </Link>
              </li>
              <li>
                <Link href="/entities/institutions" className="govuk-link">
                  Public Institutions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        
      </main>
    </div>
  );
}
