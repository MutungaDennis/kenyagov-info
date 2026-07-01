'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import { OfficialDetail } from '@/components/officials/OfficialDetail';
import { OfficialWithRelations } from '@/lib/supabase/officials';

export default function OfficialPage() {
  const params = useParams();
  const id = params?.id as string;
  const [official, setOfficial] = useState<OfficialWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOfficial = async () => {
      try {
        const response = await fetch(`/api/officials/${id}`);
        if (!response.ok) {
          throw new Error('Official not found');
        }
        const data = await response.json();
        setOfficial(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load official');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOfficial();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <p className="govuk-body">Loading official information...</p>
      </div>
    );
  }

  if (error || !official) {
    return (
      <div className="govuk-width-container">
        {/* <GovUKBackLink href="/officials" /> */}
        <div className="govuk-error-summary">
          <h2 className="govuk-error-summary__title">
            Unable to load official information
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error || 'The official could not be found.'}</p>
            <Link href="/officials" className="govuk-link">
              Return to officials directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const position = official.positions?.title || 'Official';
  const county = official.counties?.name;

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/officials" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Officials Directory', href: '/officials' },
          { text: official.full_name, href: `/officials/${official.id}` },
        ]}
      />

      <main className="govuk-main-wrapper">
        <OfficialDetail official={official} />

        {/* Related Links Section */}
        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

        <section className="govuk-!-margin-top-8 govuk-!-margin-bottom-8">
          <h2 className="govuk-heading-m">Related Information</h2>

          <div className="govuk-grid-row">
            {official.counties && (
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-s">County Officials</h3>
                <p>
                  <Link
                    href={`/officials?county=${official.counties.code}`}
                    className="govuk-link"
                  >
                    View all officials in {official.counties.name}
                  </Link>
                </p>
              </div>
            )}

            {official.political_parties && (
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-s">Party Members</h3>
                <p>
                  <Link
                    href={`/officials?party=${official.political_parties.code}`}
                    className="govuk-link"
                  >
                    View other members of {official.political_parties.name}
                  </Link>
                </p>
              </div>
            )}

            {official.positions && (
              <div className="govuk-grid-column-one-third">
                <h3 className="govuk-heading-s">Other {position}s</h3>
                <p>
                  <Link
                    href={`/officials?position=${official.positions.code}`}
                    className="govuk-link"
                  >
                    View all {position}s
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
