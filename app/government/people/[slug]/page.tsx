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
        
        // 1. Try fetching from leaders table
        const { data: leaderData, error: leaderError } = await supabase
          .from("leaders")
          .select(
            `
            *,
            leader_roles!leader_roles_leader_id_fkey (
              id, title, organization, constituency, county, ward, party,
              term_start_date, term_end_date, status, official_email,
              office_location, committees
            )
          `
          )
          .eq("slug", slug)
          .maybeSingle();

        // Handle potential schema mismatches gracefully
        if (leaderError && /name_titles|national_honours|column|schema/i.test(leaderError.message || "")) {
          const { data: fallbackData } = await supabase
            .from("leaders")
            .select(
              `
              id, slug, first_name, other_names, surname, full_name, title,
              category, bio, current_organization, current_constituency,
              current_county, current_party, is_active, status,
              leader_roles (
                id, title, organization, constituency, county, ward, party,
                term_start_date, term_end_date, status, official_email,
                office_location, committees
              )
            `
            )
            .eq("slug", slug)
            .maybeSingle();
            
          if (fallbackData) {
            setPerson(fallbackData as Leader);
            setIsLoading(false);
            return;
          }
        } else if (leaderData) {
          setPerson(leaderData as Leader);
          setIsLoading(false);
          return;
        }

        // 2. If not found in leaders, try fetching from mcas table
        const { data: mcaData, error: mcaError } = await supabase
          .from("mcas")
          .select(`
            id, slug, first_name, other_names, surname, gender, education_level,
            seat_type, nomination_category, assembly_role, status, term_start_date, term_end_date,
            official_email, ward_office_location, committees, bio, image_url, phone, social_media,
            counties (name),
            wards (name),
            political_parties (name, abbreviation)
          `)
          .eq("slug", slug)
          .maybeSingle();

        if (mcaData) {
          // ✅ Safely extract first element if Supabase returns an array, otherwise use the object
          const countyObj = Array.isArray(mcaData.counties) ? mcaData.counties[0] : mcaData.counties;
          const wardObj = Array.isArray(mcaData.wards) ? mcaData.wards[0] : mcaData.wards;
          const partyObj = Array.isArray(mcaData.political_parties) ? mcaData.political_parties[0] : mcaData.political_parties;

          const rawCountyName = countyObj?.name || "";
          const cleanCountyName = rawCountyName.replace(/\s+County$/i, "").trim();
          const wardName = wardObj?.name || (mcaData.seat_type === 'Nominated' ? 'County-wide' : "");
          const partyName = partyObj?.abbreviation || partyObj?.name || "";
          const roleTitle = mcaData.assembly_role || "Member of County Assembly";
          const orgName = cleanCountyName ? `${cleanCountyName} County Assembly` : null;

          const mappedMCA: Leader = {
            id: mcaData.id,
            slug: mcaData.slug,
            first_name: mcaData.first_name,
            other_names: mcaData.other_names || null,
            surname: mcaData.surname,
            full_name: `${mcaData.first_name} ${mcaData.surname}`.trim(),
            title: roleTitle,
            name_titles: null,
            national_honours: null,
            gender: mcaData.gender || null,
            date_of_birth: null,
            bio: mcaData.bio || null,
            image_url: mcaData.image_url || null,
            official_website: null,
            social_media: mcaData.social_media || null,
            contact_email: mcaData.official_email || null,
            phone: mcaData.phone || null,
            category: "Member of County Assembly",
            sub_category: mcaData.nomination_category || (mcaData.seat_type === 'Nominated' ? 'Nominated' : null),
            level: "county",
            current_party: partyName || null,
            current_organization: orgName,
            current_county: rawCountyName || null,
            current_constituency: wardName || null,
            academic_qualifications: mcaData.education_level ? [{ degree: mcaData.education_level }] : null,
            education: mcaData.education_level || null,
            is_active: mcaData.status === 'Active',
            status: mcaData.status || 'Active',
            leader_roles: [{
              id: mcaData.id,
              title: roleTitle,
              organization: orgName,
              constituency: wardName || null,
              county: rawCountyName || null,
              ward: wardObj?.name || null,
              party: partyName || null,
              term_start_date: mcaData.term_start_date,
              term_end_date: mcaData.term_end_date,
              status: mcaData.status || 'Active',
              official_email: mcaData.official_email || null,
              office_location: mcaData.ward_office_location || null,
              committees: mcaData.committees || [],
            }],
          };

          setPerson(mappedMCA);
          setIsLoading(false);
          return;
        }

        // If neither found
        throw new Error("Not found");

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
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "People", href: "/government/people" },
          ]}
        />
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Page not found</h1>
          <p className="govuk-body">
            The official you are looking for does not exist or has been removed.
          </p>
          <Link href="/government/people" className="govuk-link">
            Return to all government officials
          </Link>
        </main>
      </div>
    );
  }

  const plainName = displayName(person);
  const publicName = displayNameWithTitles(person);
  const roles = sortRolesChronologically(person.leader_roles);
  const primary = resolvePrimaryRole(person.leader_roles);

  const primaryRole = primary.role;
  
  // 1. Enhanced Role Title: Automatically append seat details for elected reps to avoid redundancy
  let displayRoleTitle = primaryRole?.title || person.title || person.category || "Government official";
  const titleLower = (primaryRole?.title || "").toLowerCase();

  if (titleLower === "member of parliament" && primaryRole?.constituency) {
    const constName = primaryRole.constituency.toLowerCase().includes("constituency") 
      ? primaryRole.constituency 
      : `${primaryRole.constituency} Constituency`;
    displayRoleTitle = `Member of Parliament for ${constName}`;
  } else if (titleLower === "senator" && primaryRole?.county) {
    const countyName = primaryRole.county.toLowerCase().includes("county") ? primaryRole.county : `${primaryRole.county} County`;
    displayRoleTitle = `Senator for ${countyName}`;
  } else if (titleLower.includes("member of county assembly")) {
    // Graceful handling for Nominated MCAs who represent the whole county
    if (primaryRole?.ward && primaryRole.ward !== "County-wide") {
      const wardName = primaryRole.ward.toLowerCase().includes("ward") ? primaryRole.ward : `${primaryRole.ward} Ward`;
      displayRoleTitle = `Member of County Assembly for ${wardName}`;
    } else {
      const countyName = primaryRole?.county?.toLowerCase().includes("county") ? primaryRole?.county : `${primaryRole?.county} County`;
      displayRoleTitle = `Nominated Member of County Assembly, ${countyName}`;
    }
  } else if (titleLower === "governor" && primaryRole?.county) {
    const countyName = primaryRole.county.toLowerCase().includes("county") ? primaryRole.county : `${primaryRole.county} County`;
    displayRoleTitle = `Governor of ${countyName}`;
  } else if (titleLower === "woman representative" && primaryRole?.county) {
    const countyName = primaryRole.county.toLowerCase().includes("county") ? primaryRole.county : `${primaryRole.county} County`;
    displayRoleTitle = `Woman Representative for ${countyName}`;
  }

  const orgName = primaryRole?.organization || person.current_organization || null;
  const party = primaryRole?.party || person.current_party || null;
  
  // 2. Hide redundant geographic details for elected representatives (since they are now in the title)
  const electedTitles = ["member of parliament", "senator", "member of county assembly", "governor", "woman representative", "county woman representative"];
  const isElectedRep = electedTitles.some(title => titleLower.includes(title));

  const showConstituency = Boolean(primaryRole?.constituency && !isElectedRep);
  const showCounty = Boolean(primaryRole?.county && !isElectedRep);
  const showWard = Boolean(primaryRole?.ward && !isElectedRep);
  
  // ✅ Use optional chaining to satisfy strict null checks
  const termLabel = formatTermRange(primaryRole?.term_start_date ?? null, primaryRole?.term_end_date ?? null) || "";

  const socialLinks = parseSocialLinks(person.social_media);
  const committees = (primaryRole?.committees || []) as unknown[];
  const qualifications = parseAcademicQualifications(
    person.academic_qualifications ?? person.education
  );

  const showHansard = isHansardEligible(
    person.leader_roles,
    primaryRole?.title || person.title
  );

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

  // Check if we actually need to show the summary list (only if there are non-redundant extra details)
  const hasExtraDetails = Boolean(party || showConstituency || showCounty || showWard || person.level || person.sub_category);

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

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              
              {person.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.image_url}
                  alt={`Portrait of ${publicName}`}
                  className="govuk-!-margin-bottom-6 person-profile-image"
                />
              )}

              {/* 1. Name and Prominent Role */}
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
                {publicName}
              </h1>

              <p className="govuk-body-l govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                {primary.isCurrent ? (
                  <>{displayRoleTitle}</>
                ) : (
                  <>
                    <span className="govuk-caption-l govuk-!-margin-bottom-1">Last position held</span>
                    <br />
                    {displayRoleTitle}
                  </>
                )}
              </p>

              {orgName && (
                <p className="govuk-body govuk-!-margin-bottom-6">
                  {orgName}
                  {termLabel && (
                    <span className="govuk-hint">
                      {" "}· {primary.isCurrent ? "Serving" : "Served"} {termLabel}
                    </span>
                  )}
                </p>
              )}

              {!orgName && <div className="govuk-!-margin-bottom-6" />}

              {/* 2. Biography (Moved up for immediate narrative context, GOV.UK style) */}
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

              {/* Separator before Key Details and subsequent sections */}
              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible govuk-!-margin-top-6 govuk-!-margin-bottom-6" />

              {/* 3. Key Details (Only shows non-redundant extra details) */}
              {hasExtraDetails && (
                <dl className="govuk-summary-list govuk-!-margin-bottom-6">
                  {party && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Political party</dt>
                      <dd className="govuk-summary-list__value">{party}</dd>
                    </div>
                  )}
                  {person.sub_category && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Category</dt>
                      <dd className="govuk-summary-list__value">{person.sub_category}</dd>
                    </div>
                  )}
                  {showConstituency && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Constituency</dt>
                      <dd className="govuk-summary-list__value">{primaryRole?.constituency}</dd>
                    </div>
                  )}
                  {showCounty && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">County</dt>
                      <dd className="govuk-summary-list__value">{primaryRole?.county}</dd>
                    </div>
                  )}
                  {showWard && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Ward</dt>
                      <dd className="govuk-summary-list__value">{primaryRole?.ward}</dd>
                    </div>
                  )}
                  {person.level && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Level</dt>
                      <dd className="govuk-summary-list__value">{person.level}</dd>
                    </div>
                  )}
                </dl>
              )}

              {/* 4. Other Current Roles */}
              {otherActiveRoles.length > 0 && (
                <div className="govuk-inset-text govuk-!-margin-bottom-6">
                  <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-2">
                    Other current roles
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

              {/* 5. Positions Held (Table) */}
              {roles.length > 0 && (
                <>
                  <h2 className="govuk-heading-m govuk-!-margin-top-8">
                    Positions held
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
                                role.term_end_date
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

              {/* 6. Academic Qualifications */}
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

              {/* 7. Committee Memberships */}
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
                                "Unnamed committee"
                            )
                          : "Unnamed committee"}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* 8. Contact */}
              {(person.contact_email ||
                person.phone ||
                person.official_website ||
                primaryRole?.official_email ||
                primaryRole?.office_location ||
                socialLinks.length > 0) && (
                <>
                  <h2 className="govuk-heading-m govuk-!-margin-top-8">
                    Contact
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
          </div>
        </main>
      </div>

      <style jsx>{`
        .person-profile-image {
          max-width: 100%;
          height: auto;
          border: 1px solid #b1b4b6;
        }
      `}</style>
    </>
  );
}