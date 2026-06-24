import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
//import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import {
  LEADERSHIP_HIERARCHY,
  isValidLeadershipCategory,
  LeadershipCategory,
} from '@/lib/data/leadership-hierarchy';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  
  if (!isValidLeadershipCategory(category)) {
    return { title: 'Not Found' };
  }

  const categoryData = LEADERSHIP_HIERARCHY[category as LeadershipCategory];
  return {
    title: `${categoryData.name} | Kenya Info`,
    description: categoryData.description,
  };
}

export default async function LeadershipCategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (!isValidLeadershipCategory(category)) {
    notFound();
  }

  const categoryData = LEADERSHIP_HIERARCHY[category as LeadershipCategory];
  const subcategories = Object.entries(categoryData.subcategories);

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/leadership" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Leadership', href: '/leadership' },
          { text: categoryData.name, href: `/leadership/${category}` },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{categoryData.name}</h1>
            <p className="govuk-body-l">{categoryData.description}</p>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">Browse by role</h2>
            <div className="govuk-grid-row">
              {subcategories.map(([subcatKey, subcatData]) => (
                <div key={subcatKey} className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
                  <div className="govuk-card govuk-!-height-full">
                    <div className="govuk-card__content">
                      <h3 className="govuk-heading-m govuk-!-margin-top-0">
                        <Link
                          href={`/leadership/${category}/${subcatData.slug}`}
                          className="govuk-link"
                        >
                          {subcatData.name}
                        </Link>
                      </h3>
                      <p className="govuk-body govuk-!-margin-bottom-0">
                        {subcatData.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </main>
    </div>
  );
}
