import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { createClient } from "@/lib/supabase/server";

type Leader = {
  id: string;
  name: string;
  title: string;
  category: string;
  county?: string;
  constituency?: string;
  organization?: string;
  description: string;
  image?: string;
};

export default async function LeaderProfile({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: leader, error } = await supabase
    .from('leaders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !leader) {
    notFound();
  }

  // Related leaders - with default empty array
  const { data } = await supabase
    .from('leaders')
    .select('*')
    .eq('category', leader.category)
    .neq('id', leader.id)
    .order('name', { ascending: true })
    .limit(4);

  const relatedLeaders = data ?? [];

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/leaders" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Current Leaders", href: "/leaders" },
          { text: leader.name, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-caption-l">{leader.title}</p>
            <h1 className="govuk-heading-xl">{leader.name}</h1>

            {/* Profile Image */}
            <div className="govuk-!-margin-bottom-8">
              {leader.image ? (
                <Image
                  src={leader.image}
                  alt={`Official portrait of ${leader.name}`}
                  width={280}
                  height={350}
                  className="govuk-!-margin-bottom-2"
                  priority
                />
              ) : (
                <div className="w-[280px] h-[350px] bg-gray-100 border border-gray-300 flex items-center justify-center text-6xl">
                  👤
                </div>
              )}
            </div>

            {/* KEY INFORMATION */}
            <h2 id="key-information" className="govuk-heading-l">Key information</h2>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Full name</dt>
                <dd className="govuk-summary-list__value">{leader.name}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Position</dt>
                <dd className="govuk-summary-list__value">{leader.title}</dd>
              </div>
              {leader.category && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Category</dt>
                  <dd className="govuk-summary-list__value">{leader.category}</dd>
                </div>
              )}
              {leader.organization && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Organisation</dt>
                  <dd className="govuk-summary-list__value">{leader.organization}</dd>
                </div>
              )}
              {leader.county && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">County</dt>
                  <dd className="govuk-summary-list__value">{leader.county}</dd>
                </div>
              )}
              {leader.constituency && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Constituency / Ward</dt>
                  <dd className="govuk-summary-list__value">{leader.constituency}</dd>
                </div>
              )}
            </dl>

            {/* BIOGRAPHY */}
            <h2 id="biography" className="govuk-heading-l govuk-!-margin-top-9">
              Biography
            </h2>
            <div className="govuk-body">
              <p>{leader.description}</p>
            </div>

            {/* RELATED LEADERS */}
            {relatedLeaders.length > 0 && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-9">Related leaders</h2>
                <ul className="govuk-list">
                  {relatedLeaders.map((l: Leader) => (
                    <li key={l.id}>
                      <Link href={`/leaders/${l.id}`} className="govuk-link">
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="govuk-grid-column-one-third">
            <nav className="govuk-related-items" aria-labelledby="contents-heading">
              <h2 id="contents-heading" className="govuk-heading-m">
                Contents
              </h2>
              <ul className="govuk-list govuk-list--spaced">
                <li><a href="#key-information" className="govuk-link">Key information</a></li>
                <li><a href="#biography" className="govuk-link">Biography</a></li>
              </ul>
            </nav>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}