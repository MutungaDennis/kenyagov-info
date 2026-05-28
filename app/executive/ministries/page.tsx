import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

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
  parent_institution_id?: string | null;
};

export default async function MinistriesPage() {
  const supabase = await createClient();

  // 1. Fetch all Ministries
  const { data: ministries } = await supabase
    .from("institutions")
    .select("id, slug, name, short_name, description, current_head_name, current_head_title")
    .eq("institution_type", "Ministry")
    .eq("government_level", "National")
    .eq("is_active", true)
    .order("name");

  // 2. Fetch all State Departments
  const { data: stateDepts } = await supabase
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
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "Ministries", href: "" },
        ]}
      />

      {/* Reduced padding wrapper to pull directory modules above the fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Scaled down heading size for site-wide uniformity */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Ministries of Kenya</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Official public register of the national ministries, constituent state departments, and executive portfolios responsible for administrative sector policy and program implementation.
            </p>

            <div className="govuk-!-margin-top-4">
              {(ministries || []).map((ministry: Ministry) => {
                const subDepartments = deptsByMinistry[ministry.id] || [];
                // Clean up name prefixes to prevent duplicate "Ministry of Ministry of..." styling issues
                const cleanMinistryName = ministry.name.replace(/^Ministry of /i, '');

                return (
                  /* GOV.UK Details components default to CLOSED for mobile scannability */
                  <details key={ministry.id} className="govuk-details govuk-!-margin-bottom-4" data-module="govuk-details">
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text" style={{ fontSize: '19px', fontWeight: 'bold' }}>
                        Ministry of {cleanMinistryName}
                      </span>
                    </summary>

                    <div className="govuk-details__text" style={{ borderLeft: '4px solid #1d70b8', paddingLeft: '15px' }}>
                      {/* Leadership Designation Row */}
                      {ministry.current_head_name && (
                        <p className="govuk-body govuk-!-margin-bottom-3">
                          <strong>{ministry.current_head_title || "Cabinet Secretary"}:</strong> {ministry.current_head_name}
                        </p>
                      )}

                      {/* Ministry Institutional Mandate Objective */}
                      {ministry.description && (
                        <p className="govuk-body govuk-!-margin-bottom-4">{ministry.description}</p>
                      )}

                      {/* State Departments Sub-Grid Structure (Replaced illegal nested details component) */}
                      {subDepartments.length > 0 && (
                        <div className="govuk-!-margin-top-4 govuk-!-margin-bottom-4">
                          <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                            Constituent State Departments ({subDepartments.length})
                          </h3>
                          
                          {/* Mobile Safe Sub-Table Component Layer */}
                          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table className="govuk-table" style={{ minWidth: '100%', margin: 0 }}>
                              <thead className="govuk-table__head">
                                <tr className="govuk-table__row">
                                  <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Department Name</th>
                                  <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '100px', textAlign: 'right' }}>Action</th>
                                </tr>
                              </thead>
                              <tbody className="govuk-table__body">
                                {subDepartments.map((dept: StateDepartment) => (
                                  <tr key={dept.id} className="govuk-table__row">
                                    <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                                      {dept.name}
                                    </th>
                                    <td className="govuk-table__cell govuk-body-s" style={{ textAlign: 'right' }}>
                                      <Link href={`/institutions/${dept.slug}`} className="govuk-link govuk-!-font-weight-bold">
                                        View
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="govuk-!-margin-top-4" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '10px' }}>
                        <Link href={`/institutions/${ministry.slug}`} className="govuk-link govuk-!-font-weight-bold">
                          View full ministry profile and statutory resources &rarr;
                        </Link>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>

       
      </main>
    </div>
  );
}
