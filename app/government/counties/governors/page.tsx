import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { buildCountyLeadership } from "@/lib/counties/leadership";
import GovernorsDirectoryClient from "./GovernorsDirectoryClient";

export const revalidate = 3600;

export default async function GovernorsPage() {
  const supabase = createPublicClient();

  const [{ data: counties, error: countiesError }, { data: roles, error: rolesError }] =
    await Promise.all([
      supabase
        .from("counties")
        .select("id, slug, name, code, region, headquarters")
        .order("code", { ascending: true }),
      supabase
        .from("leader_roles")
        .select(
          `
          title, status, party, county, county_id, term_end_date, seat_type, entry_type,
          leaders!leader_roles_leader_id_fkey (
            id, slug, first_name, other_names, surname, full_name
          )
        `,
        )
        .ilike("title", "%governor%"),
    ]);

  if (countiesError) {
    console.error("[governors] counties fetch failed:", countiesError);
  }
  if (rolesError) {
    console.error("[governors] leader_roles fetch failed:", rolesError);
  }

  const rows = buildCountyLeadership(counties || [], (roles || []) as never[]);
  const withGov = rows.filter((r) => r.governor).length;
  const withDep = rows.filter((r) => r.deputyGovernor).length;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Counties", href: "/government/counties" },
          { text: "County Executives" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">County governments</span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">
                County Executives
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-4">
                The executive arm of each county government — currently listing
                Governors and Deputy Governors. County Executive Committee
                members will be added as records are published.
              </p>
              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  <strong>{withGov}</strong> governors and{" "}
                  <strong>{withDep}</strong> deputy governors currently recorded.
                  Missing offices show as —. Oversight of the County Executive
                  sits with the County Assembly.
                </p>
              </div>
              <p className="govuk-body govuk-!-margin-bottom-6">
                <Link
                  href="/government/counties/county-assemblies"
                  className="govuk-link"
                >
                  County Assemblies
                </Link>
                {" · "}
                <Link href="/government/counties" className="govuk-link">
                  Counties
                </Link>
                {" · "}
                <Link
                  href="/government/counties/devolution"
                  className="govuk-link"
                >
                  Devolution
                </Link>
              </p>
            </div>
          </div>

          <GovernorsDirectoryClient rows={rows} />
        </main>
      </div>
    </>
  );
}
