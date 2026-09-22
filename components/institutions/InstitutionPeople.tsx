import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { displayNameWithTitles, type LeaderNameParts } from "@/lib/leaders/display";
import { isInstitutionHistorical } from "@/lib/institutions/fields";
import { groupInstitutionPeople, safePortrait, type InstitutionService } from "@/lib/institutions/people-model";
import styles from "./institution-people.module.css";

type Person = LeaderNameParts & { id: string; slug: string; image_url: string | null };
type Role = { id: string; title: string; term_start_date: string | null; term_end_date: string | null; status: string | null; rank_order: number | null; display_priority: number | null; person: Person | null };
type Legacy = { id: string; name: string; title: string; start_date: string | null; end_date: string | null; is_current: boolean | null; profile_url: string | null; image_url: string | null };

function dateLabel(date: string | null) {
  if (!date) return "Date not recorded";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function PeopleCards({ people, current = false }: { people: InstitutionService[][]; current?: boolean }) {
  return <ul className={styles.people}>{people.map(roles => {
    const person = roles[0];
    return <li className={styles.person} key={person.personId}>
      {person.image ? /* Stored portraits can be on different approved publishers; no image proxy needed. */
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.image} alt="" width={72} height={88} loading="lazy" className={styles.portrait} />
        : <span className={styles.placeholder} aria-hidden="true">{person.name.split(/\s+/).slice(0, 2).map(part => part[0]).join("")}</span>}
      <div className={styles.details}>
        <h3 className="govuk-heading-s govuk-!-margin-bottom-2">{person.href ? <Link className="govuk-link" href={person.href}>{person.name}</Link> : person.name}</h3>
        <ul className="govuk-list govuk-body-s govuk-!-margin-bottom-0">{roles.map(role => <li key={role.id}>
          <strong>{role.title || "Role not recorded"}</strong><br />
          {dateLabel(role.start)} to {role.end ? dateLabel(role.end) : current ? "present" : "end date not recorded"}
          {role.status && !["Active", "Former"].includes(role.status) && <span> · {role.status}</span>}
        </li>)}</ul>
      </div>
    </li>;
  })}</ul>;
}

export default async function InstitutionPeople({ institutionId, status }: { institutionId: string; status: string | null }) {
  const db = createPublicClient();
  let services: InstitutionService[];
  try {
    const roles: Role[] = [];
    for (let offset = 0; ; offset += 1000) {
      const result = await db.from("leader_roles").select(`id,title,term_start_date,term_end_date,status,rank_order,display_priority,
        person:leaders!leader_roles_leader_id_fkey!inner(id,slug,full_name,first_name,other_names,surname,name_titles,national_honours,image_url)`)
        .eq("institution_id", institutionId).eq("person.is_active", true).order("id").range(offset, offset + 999);
      if (result.error) throw result.error;
      const page = (result.data || []) as unknown as Role[];
      roles.push(...page);
      if (page.length < 1000) break;
    }
    const legacyResult = await db.from("institution_leaders").select("id,name,title,start_date,end_date,is_current,profile_url,image_url").eq("institution_id", institutionId).order("start_date", { ascending: false });
    if (legacyResult.error) throw legacyResult.error;
    const peopleByName = new Map<string, Person | null>();
    for (const role of roles) {
      if (!role.person?.full_name) continue;
      const name = role.person.full_name.trim().toLowerCase();
      const previous = peopleByName.get(name);
      peopleByName.set(name, previous === undefined || previous?.id === role.person.id ? role.person : null);
    }
    services = roles.filter(role => role.person).map(role => ({
      id: role.id, personId: role.person!.id, name: displayNameWithTitles(role.person!), href: role.person!.slug ? `/government/people/${role.person!.slug}` : null,
      image: safePortrait(role.person!.image_url), title: role.title, start: role.term_start_date, end: role.term_end_date, status: role.status, priority: role.display_priority ?? role.rank_order,
    }));
    for (const legacy of (legacyResult.data || []) as Legacy[]) {
      const person = peopleByName.get(legacy.name.trim().toLowerCase());
      if (person && services.some(service => service.personId === person.id && service.title.toLowerCase() === legacy.title.toLowerCase() && service.start === legacy.start_date && service.end === legacy.end_date)) continue;
      services.push({ id: legacy.id, personId: person?.id || `legacy-${legacy.name.trim().toLowerCase()}`, name: person ? displayNameWithTitles(person) : legacy.name,
        href: person?.slug ? `/government/people/${person.slug}` : /^\/government\/people\/[a-z0-9-]+$/.test(legacy.profile_url || "") ? legacy.profile_url : null,
        image: safePortrait(legacy.image_url), title: legacy.title, start: legacy.start_date, end: legacy.end_date,
        status: legacy.is_current === true ? "Active" : legacy.is_current === false ? "Former" : null, priority: null });
    }
  } catch {
    return <section className="govuk-inset-text"><h2 className="govuk-heading-m">People and service history</h2><p className="govuk-body">These records could not be loaded. Refresh this page to try again.</p></section>;
  }
  const historical = isInstitutionHistorical(status);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const groups = groupInstitutionPeople(services, historical, today);
  return <section aria-labelledby="institution-people-heading" className="govuk-!-margin-top-8 govuk-!-margin-bottom-8">
    <h2 id="institution-people-heading" className="govuk-heading-l">People who serve this institution</h2>
    <p className="govuk-body-s">Roles and dates recorded against this institution. Open a profile to see the person’s wider service history.</p>
    {!historical && <><h3 className="govuk-heading-m">Current people <span className="govuk-caption-m">{groups.current.length} recorded</span></h3>
      {groups.current.length ? <PeopleCards people={groups.current} current /> : <p className="govuk-body">No current office holders are recorded here yet.</p>}</>}
    {groups.former.length > 0 && <details className="govuk-details" open={historical}>
      <summary className="govuk-details__summary"><span className="govuk-details__summary-text">Former people and service history ({groups.former.length})</span></summary>
      <div className="govuk-details__text"><PeopleCards people={groups.former} /></div>
    </details>}
    {groups.other.length > 0 && <details className="govuk-details"><summary className="govuk-details__summary"><span className="govuk-details__summary-text">Upcoming, suspended or unconfirmed roles ({groups.other.length})</span></summary><div className="govuk-details__text"><PeopleCards people={groups.other} /></div></details>}
    {historical && !services.length && <p className="govuk-body">No service history has been recorded for this institution yet.</p>}
  </section>;
}
