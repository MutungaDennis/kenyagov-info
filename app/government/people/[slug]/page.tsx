"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import {
  displayName,
  displayNameWithTitles,
  formatQualification,
  formatRoleHeadline,
  formatTermRange,
  isHansardEligible,
  parseAcademicQualifications,
  relatedLinksForLeader,
  resolvePrimaryRole,
  sortRolesChronologically,
  type LeaderRoleLike,
} from "@/lib/leaders/display";
import {
  parseSocialLinks,
  socialPlatformLabel,
} from "@/lib/leaders/titles-social";

type LeaderRole = LeaderRoleLike & {
  id: string;
  title: string | null;
  organization: string | null;
  constituency: string | null;
  county: string | null;
  ward: string | null;
  party: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
  status: string | null;
  official_email: string | null;
  office_location: string | null;
  committees: unknown[] | null;
};

type Leader = {
  id: string;
  slug: string;
  title: string | null;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  full_name: string | null;
  name_titles?: unknown;
  national_honours?: unknown;
  gender: string | null;
  date_of_birth: string | null;
  bio: string | null;
  image_url: string | null;
  official_website: string | null;
  social_media: unknown;
  contact_email: string | null;
  phone: string | null;
  category: string | null;
  sub_category: string | null;
  level: string | null;
  current_party: string | null;
  current_organization: string | null;
  current_county: string | null;
  current_constituency: string | null;
  academic_qualifications?: unknown;
  education?: string | null;
  is_active: boolean;
  status: string;
  leader_roles: LeaderRole[] | null;
};

export default function PersonProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [person, setPerson] = useState<Leader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      if (!slug) return;

      try {
        const supabase = await createBrowserClientAsync();
        const { data, error: fetchError } = await supabase
          .from("leaders")
          .select(
            `
            *,
            leader_roles!leader_roles_leader_id_fkey (
              id, title, organization, constituency, county, ward, party,
              term_start_date, term_end_date, status, official_email,
              office_location, committees
            )
          `,
          )
          .eq("slug", slug)
          .single();

        if (fetchError) {
          const fallback = await supabase
            .from("leaders")
            .select(
              `
              *,
              leader_roles (
                id, title, organization, constituency, county, ward, party,
                term_start_date, term_end_date, status, official_email,
                office_location, committees
              )
            `,
            )
            .eq("slug", slug)
            .single();
          if (fallback.error) throw fallback.error;
          setPerson(fallback.data as Leader);
        } else {
          setPerson(data as Leader);
        }
      } catch (err: unknown) {
        console.error("Error fetching person:", err);
        setError("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <p className="govuk-body">Loading profile...</p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <>
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "People", href: "/government/people" },
          ]}
        />
        <h1 className="govuk-heading-xl">Page not found</h1>
        <p className="govuk-body">
          The official you are looking for does not exist or has been removed.
        </p>
        <Link href="/government/people" className="govuk-link">
          Return to all government officials
        </Link>
      </>
    );
  }

  // Breadcrumbs use plain name (no titles); H1 uses honorifics
  const plainName = displayName(person);
  const publicName = displayNameWithTitles(person);
  const roles = sortRolesChronologically(person.leader_roles);
  const primary = resolvePrimaryRole(person.leader_roles);

  const primaryRole = primary.role;
  const roleTitle =
    primaryRole?.title ||
    person.title ||
    person.category ||
    "Government official";
  const orgName =
    primaryRole?.organization || person.current_organization || null;
  const party = primaryRole?.party || person.current_party || null;
  const constituency =
    primaryRole?.constituency || person.current_constituency || null;
  const county = primaryRole?.county || person.current_county || null;
  const ward = primaryRole?.ward || null;
  const termLabel = primaryRole
    ? formatTermRange(primaryRole.term_start_date, primaryRole.term_end_date)
    : "";

  const socialLinks = parseSocialLinks(person.social_media);
  const committees = (primaryRole?.committees || []) as unknown[];
  const qualifications = parseAcademicQualifications(
    person.academic_qualifications ?? person.education,
  );

  const showHansard = isHansardEligible(
    person.leader_roles,
    primaryRole?.title || person.title,
  );

  const related = relatedLinksForLeader({
    slug: person.slug,
    roles: person.leader_roles,
    jobTitle: primaryRole?.title || person.title,
    organization: orgName,
    county,
    constituency,
  });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr.slice(0, 10) + "T12:00:00");
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const otherActiveRoles = roles.filter((r) => {
    if (!primaryRole) return false;
    if (r.id && primaryRole.id && r.id === primaryRole.id) return false;
    return !r.term_end_date && String(r.status || "").toLowerCase() !== "ended";
  });

  const headline =
    formatRoleHeadline(primaryRole) !== "Government official"
      ? formatRoleHeadline(primaryRole)
      : roleTitle;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "People", href: "/government/people" },
          { text: plainName, href: `/government/people/${person.slug}` },
        ]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
            {publicName}
          </h1>

          <p className="govuk-body-l govuk-!-margin-bottom-2">
            {primary.isCurrent ? (
              <>
                <span className="govuk-visually-hidden">Current position: </span>
                {headline}
              </>
            ) : (
              <>
                <span className="govuk-caption-l">Last position held</span>
                <br />
                {headline}
              </>
            )}
          </p>

          {termLabel && (
            <p className="govuk-body govuk-!-margin-bottom-6">
              {primary.isCurrent ? "Serving " : "Served "}
              {termLabel}
            </p>
          )}

          {!termLabel && <div className="govuk-!-margin-bottom-6" />}

          <dl className="govuk-summary-list govuk-!-margin-bottom-6">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                {primary.isCurrent ? "Current role" : "Last role held"}
              </dt>
              <dd className="govuk-summary-list__value">{roleTitle}</dd>
            </div>

            {orgName && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Organisation</dt>
                <dd className="govuk-summary-list__value">
                  <Link
                    href={`/government/institutions/${orgName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")}`}
                    className="govuk-link"
                  >
                    {orgName}
                  </Link>
                </dd>
              </div>
            )}

            {party && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Political party</dt>
                <dd className="govuk-summary-list__value">{party}</dd>
              </div>
            )}

            {constituency && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Constituency</dt>
                <dd className="govuk-summary-list__value">{constituency}</dd>
              </div>
            )}

            {county && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">County</dt>
                <dd className="govuk-summary-list__value">{county}</dd>
              </div>
            )}

            {ward && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Ward</dt>
                <dd className="govuk-summary-list__value">{ward}</dd>
              </div>
            )}

            {primaryRole?.term_start_date && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {primary.isCurrent ? "In post since" : "Term"}
                </dt>
                <dd className="govuk-summary-list__value">
                  {termLabel || formatDate(primaryRole.term_start_date)}
                </dd>
              </div>
            )}

            {person.level && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Level</dt>
                <dd className="govuk-summary-list__value">{person.level}</dd>
              </div>
            )}
          </dl>

          {otherActiveRoles.length > 0 && (
            <div className="govuk-inset-text">
              <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-2">
                Also currently holds
              </p>
              <ul className="govuk-list govuk-list--bullet">
                {otherActiveRoles.map((r) => (
                  <li key={r.id}>
                    {formatRoleHeadline(r)}
                    {formatTermRange(r.term_start_date, r.term_end_date)
                      ? ` (${formatTermRange(r.term_start_date, r.term_end_date)})`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          {person.bio && (
            <>
              <h2 className="govuk-heading-m">Biography</h2>
              {person.bio.split(/\n\n+/).map((para, i) => (
                <p key={i} className="govuk-body">
                  {para}
                </p>
              ))}
            </>
          )}

          {qualifications.length > 0 && (
            <>
              <h2 className="govuk-heading-m govuk-!-margin-top-8">
                Academic qualifications
              </h2>
              <ul className="govuk-list govuk-list--bullet">
                {qualifications.map((q, index) => (
                  <li key={index}>{formatQualification(q)}</li>
                ))}
              </ul>
            </>
          )}

          {roles.length > 0 && (
            <>
              <h2 className="govuk-heading-m govuk-!-margin-top-8">
                Career history
              </h2>
              <p className="govuk-body">
                Positions held in government, including concurrent offices and
                moves from one role to another over time.
              </p>
              <div className="govuk-table-wrapper">
                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header" scope="col">
                        Position
                      </th>
                      <th className="govuk-table__header" scope="col">
                        Organisation / seat
                      </th>
                      <th className="govuk-table__header" scope="col">
                        Term
                      </th>
                      <th className="govuk-table__header" scope="col">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {roles.map((role) => (
                      <tr key={role.id} className="govuk-table__row">
                        <td className="govuk-table__cell">
                          <strong>{role.title || "—"}</strong>
                          {role.party && (
                            <div className="govuk-hint govuk-!-margin-bottom-0">
                              {role.party}
                            </div>
                          )}
                        </td>
                        <td className="govuk-table__cell">
                          {[
                            role.organization,
                            role.constituency,
                            role.county,
                            role.ward,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </td>
                        <td className="govuk-table__cell">
                          {formatTermRange(
                            role.term_start_date,
                            role.term_end_date,
                          ) || "—"}
                        </td>
                        <td className="govuk-table__cell">
                          <span
                            className={`govuk-tag ${
                              !role.term_end_date
                                ? "govuk-tag--green"
                                : "govuk-tag--grey"
                            }`}
                          >
                            {role.status ||
                              (role.term_end_date ? "Ended" : "Active")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {committees.length > 0 && (
            <>
              <h2 className="govuk-heading-m govuk-!-margin-top-8">
                Committee memberships
              </h2>
              <ul className="govuk-list govuk-list--bullet">
                {committees.map((committee: unknown, index: number) => (
                  <li key={index}>
                    {typeof committee === "string"
                      ? committee
                      : committee &&
                          typeof committee === "object" &&
                          ("name" in committee || "title" in committee)
                        ? String(
                            (committee as { name?: string; title?: string })
                              .name ||
                              (committee as { title?: string }).title ||
                              "Unnamed committee",
                          )
                        : "Unnamed committee"}
                  </li>
                ))}
              </ul>
            </>
          )}

          {(person.contact_email ||
            person.phone ||
            person.official_website ||
            primaryRole?.official_email ||
            primaryRole?.office_location ||
            socialLinks.length > 0) && (
            <>
              <h2 className="govuk-heading-m govuk-!-margin-top-8">
                Contact information
              </h2>
              <dl className="govuk-summary-list">
                {(primaryRole?.official_email || person.contact_email) && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Email</dt>
                    <dd className="govuk-summary-list__value">
                      <a
                        href={`mailto:${primaryRole?.official_email || person.contact_email}`}
                        className="govuk-link"
                      >
                        {primaryRole?.official_email || person.contact_email}
                      </a>
                    </dd>
                  </div>
                )}
                {person.phone && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Phone</dt>
                    <dd className="govuk-summary-list__value">
                      <a href={`tel:${person.phone}`} className="govuk-link">
                        {person.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {primaryRole?.office_location && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Office location</dt>
                    <dd className="govuk-summary-list__value">
                      {primaryRole.office_location}
                    </dd>
                  </div>
                )}
                {person.official_website && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Website</dt>
                    <dd className="govuk-summary-list__value">
                      <a
                        href={person.official_website}
                        target="_blank"
                        rel="noreferrer"
                        className="govuk-link"
                      >
                        {person.official_website}
                      </a>
                    </dd>
                  </div>
                )}
                {socialLinks.map((link) => (
                  <div
                    className="govuk-summary-list__row"
                    key={`${link.platform}-${link.url}`}
                  >
                    <dt className="govuk-summary-list__key">
                      {socialPlatformLabel(link.platform)}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="govuk-link"
                      >
                        {link.url.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {showHansard && (
            <p className="govuk-body govuk-!-margin-top-8">
              <Link
                href={`/government/legislature/hansard/member/${person.slug}`}
                className="govuk-link"
              >
                Parliamentary contributions (Hansard)
              </Link>
            </p>
          )}
        </div>

        <div className="govuk-grid-column-one-third">
          <aside className="govuk-!-display-none-print">
            {person.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.image_url}
                alt=""
                className="govuk-!-margin-bottom-4"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  border: "1px solid #b1b4b6",
                }}
              />
            )}
            <h2 className="govuk-heading-m">Related content</h2>
            <nav role="navigation" aria-label="Related content">
              <ul className="govuk-list">
                {related.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="govuk-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
}
