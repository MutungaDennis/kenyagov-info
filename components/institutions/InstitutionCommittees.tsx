import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import {
  chamberLabel,
  committeeMembershipStatus,
  committeePositionLabel,
  groupCommitteesByCategory,
  isCurrentParliamentaryTerm,
  representationLabel,
  type ParliamentaryChamber,
} from "@/lib/legislature/committees";
import { safePortrait } from "@/lib/institutions/people-model";
import styles from "./institution-people.module.css";

type Person = {
  image_url?: string | null;
  slug: string | null;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  full_name: string | null;
};
type Membership = {
  id: string;
  committee_id: string;
  leader_id: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  person: Person | Person[] | null;
};
type Secretariat = {
  id: string;
  committee_id: string;
  name: string;
  role_title: string;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  person: Person | Person[] | null;
};

function personValue(person: Person | Person[] | null): Person | null {
  return Array.isArray(person) ? person[0] || null : person;
}

function fullName(person: Person | null, fallback = "") {
  if (!person) return fallback;
  return [person.first_name, person.other_names, person.surname]
    .filter(Boolean)
    .join(" ")
    .trim() || person.full_name || fallback;
}

function dateLabel(date: string | null) {
  if (!date) return "Date not recorded";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function serviceRange(start: string | null, end: string | null, status: string) {
  if (!start && !end) return status === "current" ? "Dates not recorded — serving" : "Dates not recorded";
  const finish = end ? dateLabel(end) : status === "current" ? "present" : "End date not recorded";
  return `${start ? dateLabel(start) : "Start date not recorded"} – ${finish}`;
}

async function loadPages<T>(
  factory: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await factory(offset, offset + 999);
    if (result.error) throw result.error;
    const page = result.data || [];
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

export default async function InstitutionCommittees({
  chamber,
  institutionId,
}: {
  chamber: ParliamentaryChamber;
  institutionId: string;
}) {
  const db = createPublicClient();
  const committeesResult = await db
    .from("parliamentary_committees")
    .select("id,name,slug,category,sort_order,is_active")
    .eq("chamber", chamber)
    .eq("is_published", true)
    .order("category")
    .order("sort_order")
    .order("name");
  if (committeesResult.error) {
    console.error("[institution-committees] Could not load committees:", committeesResult.error);
    return <section className="govuk-inset-text"><h2 className="govuk-heading-m">Committee membership</h2><p className="govuk-body">Committee information is temporarily unavailable. Refresh this page to try again.</p></section>;
  }
  const committees = committeesResult.data || [];
  if (!committees.length) {
    return <section className="govuk-!-margin-top-8 govuk-!-margin-bottom-8" aria-labelledby="house-committees-heading">
      <h2 className="govuk-heading-l" id="house-committees-heading">{chamberLabel(chamber)} committees</h2>
      <p className="govuk-body">No published committees have been added for the {chamberLabel(chamber)} yet.</p>
    </section>;
  }

  let memberships: Membership[];
  let staff: Secretariat[];
  const representation = new Map<string, string>();
  try {
    const [roles, loadedMemberships, loadedStaff] = await Promise.all([
      loadPages<{ leader_id: string; seat_type: string | null; nomination_category: string | null; county: string | null; constituency: string | null; status: string | null; term_start_date: string | null; term_end_date: string | null }>((from, to) => db
        .from("leader_roles")
        .select("leader_id,seat_type,nomination_category,county,constituency,status,term_start_date,term_end_date")
        .eq("institution_id", institutionId)
        .order("id")
        .range(from, to)),
      loadPages<Membership>((from, to) => db
        .from("parliamentary_committee_memberships")
        .select(`id,committee_id,leader_id,position,start_date,end_date,sort_order,
          person:leaders!parliamentary_committee_memberships_leader_id_fkey(image_url,slug,first_name,other_names,surname,full_name)`)
        .in("committee_id", committees.map((committee) => committee.id))
        .order("position")
        .order("sort_order")
        .range(from, to)),
      loadPages<Secretariat>((from, to) => db
        .from("parliamentary_committee_staff")
        .select(`id,committee_id,name,role_title,start_date,end_date,sort_order,
          person:leaders!parliamentary_committee_staff_leader_id_fkey(slug,first_name,other_names,surname,full_name)`)
        .in("committee_id", committees.map((committee) => committee.id))
        .order("sort_order")
        .range(from, to)),
    ]);
    memberships = loadedMemberships;
    staff = loadedStaff;
    const todayForRoles = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
    for (const role of roles) {
      const label = representationLabel(role);
      if (!label) continue;
      const current = isCurrentParliamentaryTerm({ start: role.term_start_date, end: role.term_end_date, status: role.status }, todayForRoles);
      if (current || !representation.has(role.leader_id)) representation.set(role.leader_id, label);
    }
  } catch (error) {
    console.error("[institution-committees] Could not load committee rosters:", error);
    return <section className="govuk-inset-text"><h2 className="govuk-heading-m">Committee membership</h2><p className="govuk-body">Committee rosters are temporarily unavailable. Refresh this page to try again.</p></section>;
  }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  return (
    <section className="govuk-!-margin-top-8 govuk-!-margin-bottom-8" aria-labelledby="house-committees-heading">
      <h2 className="govuk-heading-l" id="house-committees-heading">{chamberLabel(chamber)} committees</h2>
      <p className="govuk-body">
        Current committee leadership and membership. A member may serve on more than one committee.
      </p>
      <nav aria-label="Committee categories" className="govuk-!-margin-bottom-6">
        <ul className="govuk-list govuk-list--bullet">
          {groupCommitteesByCategory(chamber, committees).map((group, index) => <li key={group.category}><a className="govuk-link" href={`#committee-category-${index}`}>{group.category}</a> ({group.committees.length})</li>)}
        </ul>
      </nav>
      {groupCommitteesByCategory(chamber, committees).map((group, groupIndex) => <section key={group.category} id={`committee-category-${groupIndex}`} aria-labelledby={`committee-category-heading-${groupIndex}`} className="govuk-!-margin-bottom-8">
      <h3 className="govuk-heading-m" id={`committee-category-heading-${groupIndex}`}>{group.category} <span className="govuk-caption-m">{group.committees.length} committees</span></h3>
      {group.committees.map((committee) => {
        const committeeMembers = memberships.filter((row) => row.committee_id === committee.id);
        const activeMembers = committee.is_active ? committeeMembers.filter((row) =>
          committeeMembershipStatus(row.start_date, row.end_date, today) === "current",
        ) : [];
        const upcomingMembers = committee.is_active ? committeeMembers.filter((row) =>
          committeeMembershipStatus(row.start_date, row.end_date, today) === "upcoming",
        ) : [];
        const formerMembers = committee.is_active ? committeeMembers.filter((row) =>
          committeeMembershipStatus(row.start_date, row.end_date, today) === "former",
        ) : committeeMembers;
        const committeeStaff = staff.filter((row) => row.committee_id === committee.id);
        const activeStaff = committee.is_active ? committeeStaff.filter((row) =>
          committeeMembershipStatus(row.start_date, row.end_date, today) === "current",
        ) : [];
        const upcomingStaff = committee.is_active ? committeeStaff.filter((row) =>
          committeeMembershipStatus(row.start_date, row.end_date, today) === "upcoming",
        ) : [];
        const formerStaff = committee.is_active ? committeeStaff.filter((row) =>
          committeeMembershipStatus(row.start_date, row.end_date, today) === "former",
        ) : committeeStaff;
        return (
          <details className="govuk-details" key={committee.id}>
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                <strong>{committee.name}</strong>
                {" - "}{activeMembers.length} {activeMembers.length === 1 ? "member" : "members"}
                {!committee.is_active && " - Historical committee"}
              </span>
            </summary>
            <div className="govuk-details__text">
            <p className="govuk-body-s"><Link className="govuk-link" href={`/government/legislature/committees/${committee.slug}`}>Open full committee page</Link></p>
            {[
              { key: "leaders", label: "Leadership", rows: activeMembers.filter((member) => member.position !== "member") },
              { key: "members", label: "Members", rows: activeMembers.filter((member) => member.position === "member") },
            ].map((group) => {
              if (!group.rows.length) return null;
              return (
                <section className="govuk-!-margin-bottom-4" key={group.key} aria-label={group.label}>
                  <h5 className="govuk-heading-s">{group.label}</h5>
                  <ul className={styles.people}>
                    {group.rows.map((row) => {
                      const person = personValue(row.person);
                      const name = fullName(person, "Member name not recorded");
                      const image = safePortrait(person?.image_url);
                      const represents = representation.get(row.leader_id);
                      return <li className={styles.person} key={row.id}>
                        {group.key === "leaders" && <strong className="govuk-tag govuk-tag--blue">{committeePositionLabel(row.position)}</strong>}
                        {image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={image} alt="" width={72} height={88} loading="lazy" className={styles.portrait} />
                          : <span className={styles.placeholder} aria-hidden="true">{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span>}
                        <div className={styles.details}>
                          <p className="govuk-body govuk-!-margin-bottom-1">{person?.slug ? <Link className="govuk-link govuk-!-font-weight-bold" href={`/government/people/${person.slug}`}>{name}</Link> : <strong>{name}</strong>}</p>
                          {represents && <p className="govuk-body-s govuk-!-margin-bottom-1">{represents}</p>}
                        </div>
                      </li>;
                    })}
                  </ul>
                </section>
              );
            })}
            {activeStaff.length > 0 && (
              <section className="govuk-!-margin-bottom-4" aria-label="Administrative secretariat">
                <h5 className="govuk-heading-s">Administrative secretariat</h5>
                <ul className="govuk-list govuk-list--border">
                  {activeStaff.map((row) => {
                    const person = personValue(row.person);
                    const name = fullName(person, row.name);
                    return <li className="govuk-!-padding-top-2 govuk-!-padding-bottom-2" key={row.id}>
                      <strong>{row.role_title}</strong>: {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                      {(row.start_date || row.end_date) && <p className="govuk-body-s govuk-!-margin-bottom-0">{serviceRange(row.start_date, row.end_date, "current")}</p>}
                    </li>;
                  })}
                </ul>
              </section>
            )}
            {(upcomingMembers.length > 0 || upcomingStaff.length > 0 || formerMembers.length > 0 || formerStaff.length > 0) && (
              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Upcoming and former assignments</span>
                </summary>
                <div className="govuk-details__text">
                  {upcomingMembers.map((row) => {
                    const person = personValue(row.person);
                    const name = fullName(person, "Member name not recorded");
                    return <p className="govuk-body-s" key={row.id}>
                      Upcoming {committeePositionLabel(row.position)}: {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                      {" · "}{serviceRange(row.start_date, row.end_date, "upcoming")}
                    </p>;
                  })}
                  {upcomingStaff.map((row) => {
                    const person = personValue(row.person);
                    const name = fullName(person, row.name);
                    return <p className="govuk-body-s" key={row.id}>
                      Upcoming {row.role_title}: {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                      {" · "}{serviceRange(row.start_date, row.end_date, "upcoming")}
                    </p>;
                  })}
                  {formerMembers.map((row) => {
                    const person = personValue(row.person);
                    const name = fullName(person, "Member name not recorded");
                    return <p className="govuk-body-s" key={row.id}>
                      Former {committeePositionLabel(row.position)}: {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                      {" · "}{serviceRange(row.start_date, row.end_date, "former")}
                    </p>;
                  })}
                  {formerStaff.map((row) => {
                    const person = personValue(row.person);
                    const name = fullName(person, row.name);
                    return <p className="govuk-body-s" key={row.id}>
                      Former {row.role_title}: {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                      {" · "}{serviceRange(row.start_date, row.end_date, "former")}
                    </p>;
                  })}
                </div>
              </details>
            )}
            {!committeeMembers.length && !committeeStaff.length && (
              <p className="govuk-body">No committee assignments have been recorded.</p>
            )}
            </div>
          </details>
        );
      })}
      </section>)}
    </section>
  );
}
