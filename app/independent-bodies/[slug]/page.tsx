import { notFound } from "next/navigation";
import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import LastUpdated from "@/components/govuk/LastUpdated";
import { createClient } from "@/lib/supabase/server";

type IndependentBody = {
  id: number;
  name: string;
  full_name?: string;
  acronym?: string;
  slug: string;
  category: string;
  description: string;
  mandate?: string;
  website?: string;
  established_year?: number;
  constitutional_article?: string;
  created_at: string;
  updated_at: string;
};

export default async function IndependentBodyPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: body, error } = await supabase
    .from('independent_bodies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !body) {
    notFound();
  }

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/independent-bodies" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Independent Bodies", href: "/independent-bodies" },
          { text: body.name, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <span className="govuk-caption-l">{body.category}</span>
        <h1 className="govuk-heading-xl">{body.name}</h1>

        {body.full_name && body.full_name !== body.name && (
          <p className="govuk-body-l">{body.full_name}</p>
        )}

        <p className="govuk-body-l govuk-!-margin-bottom-9">{body.description}</p>

        {body.mandate && (
          <>
            <h2 className="govuk-heading-l">Mandate</h2>
            <p className="govuk-body">{body.mandate}</p>
          </>
        )}

        <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Information</h2>
        <dl className="govuk-summary-list">
          {body.constitutional_article && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Constitutional Basis</dt>
              <dd className="govuk-summary-list__value">{body.constitutional_article}</dd>
            </div>
          )}
          {body.established_year && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Established</dt>
              <dd className="govuk-summary-list__value">{body.established_year}</dd>
            </div>
          )}
          {body.website && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Official Website</dt>
              <dd className="govuk-summary-list__value">
                <Link href={body.website} target="_blank" className="govuk-link">
                  Visit website →
                </Link>
              </dd>
            </div>
          )}
        </dl>

        {/* Last Updated Component */}
        <LastUpdated 
          lastUpdated={body.updated_at} 
          published={body.created_at} 
        />

        <GovUKFeedback />
      </main>
    </div>
  );
}