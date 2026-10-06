import Link from "next/link";
import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import {
  chamberLabel,
  committeeMembershipStatus,
  committeePositionLabel,
  type ParliamentaryChamber,
} from "@/lib/legislature/committees";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type PersonRef = {
  slug: string | null;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  full_name: string | null;
};
type Membership = {
  id: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  person: PersonRef | PersonRef[] | null;
};
type StaffEntry = {
  id: string;
  name: string;
  role_title: string;
  email: string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  person: PersonRef | PersonRef[] | null;
};

function unwrapPerson(person: PersonRef | PersonRef[] | null): PersonRef | null {
  return Array.isArray(person) ? person[0] || null : person;
}

function fullName(person: PersonRef | null) {
  if (!person) return "";
  return [person.first_name, person.other_names, person.surname]
    .filter(Boolean)
    .join(" ")
    .trim() || person.full_name || "";
}

function dateLabel(date: string | null) {
  if (!date) return null;
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function termLabel(start: string | null, end: string | null, historical = false) {
  if (!start && !end) {
    return historical ? "Dates not recorded" : "Start date not recorded – present";
  }
  const finish = end ? dateLabel(end) : historical ? "End date not recorded" : "present";
  return `${start ? dateLabel(start) : "Start date not recorded"} – ${finish}`;
}

export default async function ParliamentaryCommitteePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = createPublicClient();
  const committeeResult = await db
    .from("parliamentary_committees")
    .select("id,chamber,category,name,slug,description,mandate,established_date,dissolved_date,is_active")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (committeeResult.error) {
    console.error("[parliamentary-committee] Could not load committee:", committeeResult.error);
    throw new Error("Could not load parliamentary committee.");
  }
  if (!committeeResult.data) notFound();
  const committee = committeeResult.data as {
    id: string;
    chamber: ParliamentaryChamber;
    category: string;
    name: string;
    slug: string;
    description: string | null;
    mandate: string | null;
    established_date: string | null;
    dissolved_date: string | null;
    is_active: boolean;
  };
  const [memberResult, staffResult] = await Promise.all([
    db.from("parliamentary_committee_memberships")
      .select(`id,position,start_date,end_date,sort_order,
        person:leaders!parliamentary_committee_memberships_leader_id_fkey(slug,first_name,other_names,surname,full_name)`)
      .eq("committee_id", committee.id)
      .order("position")
      .order("sort_order"),
    db.from("parliamentary_committee_staff")
      .select(`id,name,role_title,email,start_date,end_date,sort_order,
        person:leaders!parliamentary_committee_staff_leader_id_fkey(slug,first_name,other_names,surname,full_name)`)
      .eq("committee_id", committee.id)
      .order("sort_order")
      .order("role_title"),
  ]);
  if (memberResult.error || staffResult.error) {
    console.error("[parliamentary-committee] Could not load committee composition:", memberResult.error || staffResult.error);
    throw new Error("Could not load committee composition.");
  }

  const members = (memberResult.data || []) as unknown as Membership[];
  const staff = (staffResult.data || []) as unknown as StaffEntry[];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const currentMembers = committee.is_active
    ? members.filter((member) =>
        committeeMembershipStatus(member.start_date, member.end_date, today) === "current",
      )
    : [];
  const upcomingMembers = committee.is_active
    ? members.filter((member) =>
        committeeMembershipStatus(member.start_date, member.end_date, today) === "upcoming",
      )
    : [];
  const formerMembers = committee.is_active
    ? members.filter((member) =>
        committeeMembershipStatus(member.start_date, member.end_date, today) === "former",
      )
    : [];
  const currentStaff = committee.is_active
    ? staff.filter((entry) =>
        committeeMembershipStatus(entry.start_date, entry.end_date, today) === "current",
      )
    : [];
  const upcomingStaff = committee.is_active
    ? staff.filter((entry) =>
        committeeMembershipStatus(entry.start_date, entry.end_date, today) === "upcoming",
      )
    : [];
  const formerStaff = committee.is_active
    ? staff.filter((entry) =>
        committeeMembershipStatus(entry.start_date, entry.end_date, today) === "former",
      )
    : [];
  const positions = ["chairperson", "vice_chairperson", "member"];

  return (
    <>
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "The Legislature", href: "/government/legislature" },
        { text: "Committees", href: "/government/legislature/committees" },
        { text: committee.name },
      ]} />
      <main className="govuk-width-container govuk-main-wrapper">
        <span className="govuk-caption-l">{chamberLabel(committee.chamber)} · {committee.category}</span>
        <h1 className="govuk-heading-xl">{committee.name}</h1>
        {!committee.is_active && <strong className="govuk-tag govuk-tag--grey govuk-!-margin-bottom-4">Historical committee</strong>}
        {committee.description && <p className="govuk-body-l">{committee.description}</p>}
        {committee.mandate && (
          <section className="govuk-!-margin-top-6" aria-labelledby="committee-mandate-heading">
            <h2 className="govuk-heading-m" id="committee-mandate-heading">Role and mandate</h2>
            <p className="govuk-body">{committee.mandate}</p>
          </section>
        )}
        {(committee.established_date || committee.dissolved_date) && (
          <p className="govuk-body-s">
            {committee.established_date ? `Established ${dateLabel(committee.established_date)}` : ""}
            {committee.established_date && committee.dissolved_date ? " · " : ""}
            {committee.dissolved_date ? `Ended ${dateLabel(committee.dissolved_date)}` : ""}
          </p>
        )}

        <section className="govuk-!-margin-top-8" aria-labelledby="committee-members-heading">
          <h2 className="govuk-heading-l" id="committee-members-heading">Committee members</h2>
          {positions.map((position) => {
            const rows = (committee.is_active ? currentMembers : members)
              .filter((member) => member.position === position);
            return (
              <section className="govuk-!-margin-bottom-5" key={position}>
                <h3 className="govuk-heading-m">{committeePositionLabel(position)}</h3>
                {!rows.length ? <p className="govuk-body">No {committee.is_active ? "current " : ""}{committeePositionLabel(position).toLowerCase()} recorded.</p> : (
                  <ul className="govuk-list govuk-list--border">
                    {rows.map((member) => {
                      const person = unwrapPerson(member.person);
                      const name = fullName(person) || "Member name not recorded";
                      return <li className="govuk-!-padding-top-3 govuk-!-padding-bottom-3" key={member.id}>
                        {person?.slug ? <Link className="govuk-link govuk-!-font-weight-bold" href={`/government/people/${person.slug}`}>{name}</Link> : <strong>{name}</strong>}
                        {termLabel(member.start_date, member.end_date, !committee.is_active) && <p className="govuk-body-s govuk-!-margin-bottom-0">{termLabel(member.start_date, member.end_date, !committee.is_active)}</p>}
                      </li>;
                    })}
                  </ul>
                )}
              </section>
            );
          })}
          {formerMembers.length > 0 && (
            <details className="govuk-details">
              <summary className="govuk-details__summary"><span className="govuk-details__summary-text">Former committee members ({formerMembers.length})</span></summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--border">{formerMembers.map((member) => {
                  const person = unwrapPerson(member.person);
                  const name = fullName(person) || "Member name not recorded";
                  return <li key={member.id}>
                    {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                    {" — "}{committeePositionLabel(member.position)}
                    {termLabel(member.start_date, member.end_date, true) && ` · ${termLabel(member.start_date, member.end_date, true)}`}
                  </li>;
                })}</ul>
              </div>
            </details>
          )}
          {upcomingMembers.length > 0 && (
            <section className="govuk-!-margin-top-6" aria-labelledby="upcoming-committee-members-heading">
              <h3 className="govuk-heading-m" id="upcoming-committee-members-heading">Upcoming committee appointments</h3>
              <ul className="govuk-list govuk-list--border">
                {upcomingMembers.map((member) => {
                  const person = unwrapPerson(member.person);
                  const name = fullName(person) || "Member name not recorded";
                  return <li className="govuk-!-padding-top-3 govuk-!-padding-bottom-3" key={member.id}>
                    {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                    {" — "}{committeePositionLabel(member.position)}
                    {` · ${termLabel(member.start_date, member.end_date)}`}
                  </li>;
                })}
              </ul>
            </section>
          )}
        </section>

        <section className="govuk-!-margin-top-8" aria-labelledby="committee-secretariat-heading">
          <h2 className="govuk-heading-l" id="committee-secretariat-heading">Administrative secretariat</h2>
          <p className="govuk-body">Professional parliamentary staff provide procedural, legal and research support. They are not voting committee members.</p>
          {!(committee.is_active ? currentStaff : staff).length ? <p className="govuk-body">No {committee.is_active ? "current " : ""}secretariat staff recorded.</p> : (
            <ul className="govuk-list govuk-list--border">
              {(committee.is_active ? currentStaff : staff).map((entry) => {
                const person = unwrapPerson(entry.person);
                const name = fullName(person) || entry.name;
                return <li className="govuk-!-padding-top-3 govuk-!-padding-bottom-3" key={entry.id}>
                  <strong>{entry.role_title}</strong>
                  <br />
                  {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                  {entry.email && <> · <a className="govuk-link" href={`mailto:${entry.email}`}>{entry.email}</a></>}
                  {(entry.start_date || entry.end_date) && termLabel(entry.start_date, entry.end_date, !committee.is_active) && <p className="govuk-body-s govuk-!-margin-bottom-0">{termLabel(entry.start_date, entry.end_date, !committee.is_active)}</p>}
                </li>;
              })}
            </ul>
          )}
          {formerStaff.length > 0 && (
            <details className="govuk-details">
              <summary className="govuk-details__summary"><span className="govuk-details__summary-text">Former secretariat staff ({formerStaff.length})</span></summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--border">{formerStaff.map((entry) => {
                  const person = unwrapPerson(entry.person);
                  const name = fullName(person) || entry.name;
                  return <li key={entry.id}><strong>{entry.role_title}</strong>: {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}{termLabel(entry.start_date, entry.end_date, true) && ` · ${termLabel(entry.start_date, entry.end_date, true)}`}</li>;
                })}</ul>
              </div>
            </details>
          )}
          {upcomingStaff.length > 0 && (
            <section className="govuk-!-margin-top-6" aria-labelledby="upcoming-secretariat-heading">
              <h3 className="govuk-heading-m" id="upcoming-secretariat-heading">Upcoming secretariat appointments</h3>
              <ul className="govuk-list govuk-list--border">
                {upcomingStaff.map((entry) => {
                  const person = unwrapPerson(entry.person);
                  const name = fullName(person) || entry.name;
                  return <li key={entry.id}>
                    <strong>{entry.role_title}</strong>: {person?.slug ? <Link className="govuk-link" href={`/government/people/${person.slug}`}>{name}</Link> : name}
                    {` · ${termLabel(entry.start_date, entry.end_date)}`}
                  </li>;
                })}
              </ul>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
