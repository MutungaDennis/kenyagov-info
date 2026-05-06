import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import GovUKFeedback from '@/components/govuk/Feedback';
import {
  LEADERSHIP_HIERARCHY,
  isValidLeadershipCategory,
  isValidLeadershipSubcategory,
  LeadershipCategory,
  LeadershipSubcategory,
} from '@/lib/data/leadership-hierarchy';
import { getLeadersBySubcategory } from '@/lib/supabase/leaders';

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, subcategory } = await params;

  if (
    !isValidLeadershipCategory(category) ||
    !isValidLeadershipSubcategory(subcategory)
  ) {
    return { title: 'Not Found' };
  }

  const categoryData = LEADERSHIP_HIERARCHY[category as LeadershipCategory];
  const subcatData = categoryData.subcategories[subcategory as LeadershipSubcategory];

  return {
    title: `${subcatData.name} | Kenya Info`,
    description: subcatData.description,
  };
}

export default async function LeadershipSubcategoryPage({ params }: PageProps) {
  const { category, subcategory } = await params;

  if (
    !isValidLeadershipCategory(category) ||
    !isValidLeadershipSubcategory(subcategory)
  ) {
    notFound();
  }

  const categoryData = LEADERSHIP_HIERARCHY[category as LeadershipCategory];
  const subcatData = categoryData.subcategories[subcategory as LeadershipSubcategory];

  let leaders = [];
  let error = null;

  try {
    leaders = await getLeadersBySubcategory(subcategory);
  } catch (err) {
    console.error('Error fetching leaders:', err);
    error = 'Failed to load leaders';
  }

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href={`/leadership/${category}`} />

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Leadership', href: '/leadership' },
          { text: categoryData.name, href: `/leadership/${category}` },
          { text: subcatData.name, href: `/leadership/${category}/${subcategory}` },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{subcatData.name}</h1>
            <p className="govuk-body-l">{subcatData.description}</p>
          </div>
        </div>

        {error && (
          <div className="govuk-grid-row govuk-!-margin-top-6">
            <div className="govuk-grid-column-full">
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">{error}</h2>
              </div>
            </div>
          </div>
        )}

        {leaders.length > 0 ? (
          <div className="govuk-grid-row govuk-!-margin-top-9">
            <div className="govuk-grid-column-full">
              <div className="govuk-grid-row">
                {leaders.map((leader) => (
                  <div key={leader.id} className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                    <div className="govuk-card" style={{ height: '100%' }}>
                      <div className="govuk-card__content">
                        <h3 className="govuk-heading-m govuk-!-margin-top-0">
                          <Link href={`/leadership/${category}/${subcategory}/${leader.id}`} className="govuk-link">
                            {leader.name}
                          </Link>
                        </h3>
                        {leader.title && (
                          <p className="govuk-body-s" style={{ marginTop: '0.5rem' }}>
                            <strong>{leader.title}</strong>
                          </p>
                        )}
                        {leader.county && (
                          <p className="govuk-body-s">{leader.county}</p>
                        )}
                        {leader.organization && (
                          <p className="govuk-body-s">
                            <span style={{ backgroundColor: '#e3e3e3', padding: '2px 6px' }}>
                              {leader.organization}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="govuk-grid-row govuk-!-margin-top-9">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">No leaders found in this category.</p>
            </div>
          </div>
        )}

        <GovUKFeedback />
      </main>
    </div>
  );
}
