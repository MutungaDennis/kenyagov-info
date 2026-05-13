import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { createClient } from "@/lib/supabase/server";

type Ministry = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  description?: string | null;
  current_head_name?: string | null;
  current_head_title?: string | null;
};

type StateDepartment = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  description?: string | null;
};

export default async function MinistriesPage() {
  const supabase = createClient();

  // 1. Fetch all Ministries
  const { data: ministries } = await (await supabase)
    .from("institutions")
    .select("id, slug, name, short_name, description, current_head_name, current_head_title")
    .eq("institution_type", "Ministry")
    .eq("government_level", "National")
    .eq("is_active", true)
    .order("name");

  // 2. Fetch all State Departments
  const { data: stateDepts } = await (await supabase)
    .from("institutions")
    .select("id, slug, name, short_name, description, parent_institution_id")
    .eq("institution_type", "State Department")
    .eq("is_active", true)
    .order("name");

  // 3. Group State Departments by their parent ministry
  const deptsByMinistry: Record<string, StateDepartment[]> = (stateDepts || []).reduce((acc, dept) => {
    if (!dept.parent_institution_id) return acc;
    if (!acc[dept.parent_institution_id]) acc[dept.parent_institution_id] = [];
    acc[dept.parent_institution_id].push(dept);
    return acc;
  }, {} as Record<string, StateDepartment[]>);

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/executive" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "Ministries", href: "/executive/ministries" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Ministries of Kenya</h1>
            <p className="govuk-body-l">
              The core policy-making arms of the Government of Kenya. Each ministry is headed by a Cabinet Secretary.
            </p>

            <div className="govuk-!-margin-top-9">
              {(ministries || []).map((ministry: Ministry) => {
                const stateDepts = deptsByMinistry[ministry.id] || [];

                return (
                  <details key={ministry.id} className="govuk-details" open>
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">
                        Ministry of {ministry.name.replace(/^Ministry of /, '')}
                      </span>
                    </summary>

                    <div className="govuk-details__text">
                      {/* Cabinet Secretary */}
                      {ministry.current_head_name && (
                        <p className="govuk-body">
                          <strong>Cabinet Secretary:</strong> {ministry.current_head_name}
                          {ministry.current_head_title && ` — ${ministry.current_head_title}`}
                        </p>
                      )}

                      {/* Ministry Description */}
                      {ministry.description && (
                        <p className="govuk-body">{ministry.description}</p>
                      )}

                      {/* State Departments - Nested Accordion */}
                      {stateDepts.length > 0 && (
                        <details className="govuk-details govuk-!-margin-top-6" open>
                          <summary className="govuk-details__summary">
                            <span className="govuk-details__summary-text">
                              State Departments ({stateDepts.length})
                            </span>
                          </summary>
                          <div className="govuk-details__text">
                            <ul className="govuk-list govuk-list--bullet">
                              {stateDepts.map((dept: StateDepartment) => (
                                <li key={dept.id}>
                                  <Link href={`/institutions/${dept.slug}`} className="govuk-link">
                                    {dept.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </details>
                      )}

                      <div className="govuk-!-margin-top-6">
                        <Link 
                          href={`/institutions/${ministry.slug}`} 
                          className="govuk-link"
                        >
                          View full ministry profile →
                        </Link>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}