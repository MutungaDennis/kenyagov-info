import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createPublicClient } from "@/lib/supabase/public";
import { displayNameWithTitles } from "@/lib/leaders/display";

// Helper to safely generate slugs from organization names (used as fallback)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper to assign a numeric rank to executive leadership roles for proper ordering
function getExecutiveRank(title: string | null): number {
  if (!title) return 99;
  const t = title.toLowerCase();
  if (t.includes("president") && !t.includes("deputy") && !t.includes("prime")) return 1;
  if (t.includes("deputy president")) return 2;
  if (t.includes("prime cabinet secretary")) return 3;
  return 99;
}

// Helper to normalize title text for matching (handles both hyphens and spaces)
function normalizeTitle(title: string | null): string {
  if (!title) return "";
  return title.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
}

export default async function CabinetPage() {
  const supabase = createPublicClient();

  const { data: activeRoles, error } = await supabase
    .from("leader_roles")
    .select(`
      id,
      title,
      organization,
      rank_order,
      institution_id,
      institutions!leader_roles_institution_id_fkey (
        id,
        slug,
        name
      ),
      leaders!leader_roles_leader_id_fkey (
        id,
        slug,
        first_name,
        other_names,
        surname,
        full_name,
        name_titles,
        national_honours
      )
    `)
    .is("term_end_date", null);

  if (error) {
    console.error("Error fetching cabinet members:", JSON.stringify(error, null, 2));
  }

  const executiveLeadership: any[] = [];
  const cabinetSecretaries: any[] = [];
  const alsoAttends: any[] = [];

  activeRoles?.forEach((role: any) => {
    const leader = role.leaders;
    if (!leader) return;

    // Normalize the title for consistent matching
    const normalizedTitle = normalizeTitle(role.title);

    // Use the institution's authoritative slug from the database
    const institution = role.institutions;
    const orgSlug = institution?.slug || (role.organization ? slugify(role.organization) : null);
    const orgName = institution?.name || role.organization || null;

    const item = {
      slug: leader.slug,
      fullName: displayNameWithTitles(leader),
      roleTitle: role.title,
      organization: orgName,
      orgSlug: orgSlug,
      rankOrder: role.rank_order ?? getExecutiveRank(role.title),
    };

    // Categorize based on normalized title
    // NOTE: Using normalized title handles both "attorney-general" and "attorney general"
    if (
      normalizedTitle.includes("president") ||
      normalizedTitle.includes("deputy president") ||
      normalizedTitle.includes("prime cabinet secretary")
    ) {
      executiveLeadership.push(item);
    } else if (normalizedTitle.includes("cabinet secretary")) {
      cabinetSecretaries.push(item);
    } else if (
      normalizedTitle.includes("attorney general") ||
      normalizedTitle.includes("attorney-general") ||
      normalizedTitle.includes("secretary to the cabinet")
    ) {
      alsoAttends.push(item);
    }
  });

  // Sort Executive Leadership by constitutional rank
  executiveLeadership.sort((a, b) => {
    const rankDiff = a.rankOrder - b.rankOrder;
    if (rankDiff !== 0) return rankDiff;
    return a.fullName.localeCompare(b.fullName);
  });

  // Sort other groups alphabetically
  const sortByName = (a: any, b: any) => a.fullName.localeCompare(b.fullName);
  cabinetSecretaries.sort(sortByName);
  alsoAttends.sort(sortByName);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Cabinet", href: "/government/cabinet" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                The Cabinet
              </h1>

              <p className="govuk-body-m govuk-!-margin-bottom-8">
                Read biographies and responsibilities of the Executive leadership,
                Cabinet Secretaries heading ministries, and officials who help
                coordinate government business.
              </p>

              <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
                Executive Leadership
              </h2>
              <ul className="govuk-list govuk-!-padding-left-0">
                {executiveLeadership.map((official, idx) => (
                  <li key={`${official.slug}-exec-${idx}`} className="govuk-!-margin-bottom-4">
                    <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-1">
                      <Link
                        href={`/government/people/${official.slug}`}
                        className="govuk-link govuk-link--no-visited-state"
                      >
                        {official.fullName}
                      </Link>
                    </h3>
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {official.roleTitle}
                      {official.organization && official.orgSlug && (
                        <>
                          {", "}
                          <Link
                            href={`/government/institutions/${official.orgSlug}`}
                            className="govuk-link govuk-!-font-weight-bold govuk-link--no-visited-state"
                          >
                            {official.organization}
                          </Link>
                        </>
                      )}
                    </p>
                    <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                  </li>
                ))}
              </ul>

              <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">
                Cabinet Secretaries
              </h2>
              <ul className="govuk-list govuk-!-padding-left-0">
                {cabinetSecretaries.map((official, idx) => (
                  <li key={`${official.slug}-cs-${idx}`} className="govuk-!-margin-bottom-4">
                    <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-1">
                      <Link
                        href={`/government/people/${official.slug}`}
                        className="govuk-link govuk-link--no-visited-state"
                      >
                        {official.fullName}
                      </Link>
                    </h3>
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {official.roleTitle}
                      {official.organization && official.orgSlug && (
                        <>
                          {", "}
                          <Link
                            href={`/government/institutions/${official.orgSlug}`}
                            className="govuk-link govuk-!-font-weight-bold govuk-link--no-visited-state"
                          >
                            {official.organization}
                          </Link>
                        </>
                      )}
                    </p>
                    <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                  </li>
                ))}
              </ul>

              <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">
                Also attends Cabinet
              </h2>
              <ul className="govuk-list govuk-!-padding-left-0">
                {alsoAttends.map((official, idx) => (
                  <li key={`${official.slug}-attendee-${idx}`} className="govuk-!-margin-bottom-4">
                    <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-1">
                      <Link
                        href={`/government/people/${official.slug}`}
                        className="govuk-link govuk-link--no-visited-state"
                      >
                        {official.fullName}
                      </Link>
                    </h3>
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {official.roleTitle}
                      {official.organization && official.orgSlug && (
                        <>
                          {", "}
                          <Link
                            href={`/government/institutions/${official.orgSlug}`}
                            className="govuk-link govuk-!-font-weight-bold govuk-link--no-visited-state"
                          >
                            {official.organization}
                          </Link>
                        </>
                      )}
                    </p>
                    <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}