import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
//import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import GovUKFeedback from '@/components/govuk/Feedback';
import {
  ENTITY_HIERARCHY,
  isValidEntityCategory,
  EntityCategory,
} from '@/lib/data/leadership-hierarchy';
import { getEntitiesByCategory } from '@/lib/supabase/entities';

// ✅ ADD THIS TYPE
type Entity = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  county?: string | null;
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isValidEntityCategory(category)) {
    return { title: 'Not Found' };
  }

  const categoryData = ENTITY_HIERARCHY[category as EntityCategory];

  return {
    title: `${categoryData.name} | CitizenGuide.KE`,
    description: categoryData.description,
  };
}

export default async function EntitiesCategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (!isValidEntityCategory(category)) {
    notFound();
  }

  const categoryData = ENTITY_HIERARCHY[category as EntityCategory];

  // ✅ FIXED: typed array instead of implicit any[]
  let entities: Entity[] = [];
  let error: string | null = null;

  try {
    entities = (await getEntitiesByCategory(
      category as EntityCategory
    )) as Entity[];
  } catch (err) {
    console.error('Error fetching entities:', err);
    error = 'Failed to load entities';
  }

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/entities" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Entities', href: '/entities' },
          { text: categoryData.name, href: `/entities/${category}` },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{categoryData.name}</h1>
            <p className="govuk-body-l">{categoryData.description}</p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="govuk-grid-row govuk-!-margin-top-6">
            <div className="govuk-grid-column-full">
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">{error}</h2>
              </div>
            </div>
          </div>
        )}

        {/* ENTITIES */}
        {entities.length > 0 ? (
          <div className="govuk-grid-row govuk-!-margin-top-9">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-m">
                {categoryData.name} ({entities.length})
              </h2>

              <div className="govuk-grid-row">
                {entities.map((entity) => (
                  <div
                    key={entity.id}
                    className="govuk-grid-column-one-third govuk-!-margin-bottom-6"
                  >
                    <div className="govuk-card" style={{ height: '100%' }}>
                      <div className="govuk-card__content">
                        <h3 className="govuk-heading-m govuk-!-margin-top-0">
                          <Link
                            href={`/entities/${category}/${entity.slug}`}
                            className="govuk-link"
                          >
                            {entity.name}
                          </Link>
                        </h3>

                        {entity.description && (
                          <p className="govuk-body-s govuk-!-margin-bottom-0">
                            {entity.description.substring(0, 100)}
                            {entity.description.length > 100 ? '...' : ''}
                          </p>
                        )}

                        {entity.county && (
                          <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                            <strong>{entity.county}</strong>
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
              <p className="govuk-body">No entities found in this category.</p>
            </div>
          </div>
        )}

        <GovUKFeedback />
      </main>
    </div>
  );
}