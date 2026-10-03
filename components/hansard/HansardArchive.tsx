import { PROCEEDING_TYPES, PUBLIC_PROCEEDINGS, type ProceedingType } from "@/lib/hansard/collections";
import Link from "next/link";
import { listHansard, hansardFacets } from "@/lib/hansard/queries";
import { fetchCountyNames } from "@/lib/legislature/members";

export type ArchiveParams = { q?: string; proceeding?: string; term?: string; year?: string; county?: string; page?: string; date?: string };
export default async function HansardArchive({ house, label, filters }: { house: string; label: string; filters: ArchiveParams }) {
  const page = Math.max(1, Number.parseInt(filters.page || "1",10) || 1);
  const date = filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date) ? filters.date : undefined;
  const [result, facets, counties] = await Promise.all([
    listHansard({ ...filters, proceeding: PUBLIC_PROCEEDINGS.includes(filters.proceeding as ProceedingType) ? filters.proceeding : undefined, date, house, page, pageSize: 25 }),
    hansardFacets(house), house === "county-assembly" ? fetchCountyNames() : Promise.resolve([]),
  ]);
  function pageUrl(next: number) { const p = new URLSearchParams(); for (const [key,value] of Object.entries(filters)) if (value && key !== "page") p.set(key,value); p.set("page",String(next)); return `?${p}`; }
  return <div><nav className="govuk-body-s"><Link className="govuk-link" href="/government/legislature/hansard">All Hansard</Link> / {label}</nav><h1 className="govuk-heading-xl">{label} Hansard</h1><p className="govuk-body-l">Browse reviewed sittings and read debates with links to members and official sources.</p>
    <form className="mb-8 grid items-end gap-4 rounded border p-4 md:grid-cols-3"><label>Search sitting titles<input className="govuk-input" name="q" defaultValue={filters.q} /></label><label>Date<input className="govuk-input" type="date" name="date" defaultValue={date} /></label><label>Proceedings<select className="govuk-select w-full" name="proceeding" defaultValue={filters.proceeding}><option value="">All public proceedings</option>{PUBLIC_PROCEEDINGS.map(type => <option key={type} value={type}>{PROCEEDING_TYPES[type]}</option>)}</select></label><label>Year<select className="govuk-select w-full" name="year" defaultValue={filters.year}><option value="">All years</option>{facets.years.map(year => <option key={year}>{year}</option>)}</select></label><label>Parliamentary term<select className="govuk-select w-full" name="term" defaultValue={filters.term}><option value="">All terms</option>{facets.terms.map(term => <option key={term}>{term}</option>)}</select></label>{counties.length > 0 && <label>County<select className="govuk-select w-full" name="county" defaultValue={filters.county}><option value="">All counties</option>{counties.map(county => <option key={county}>{county}</option>)}</select></label>}<button className="govuk-button govuk-!-margin-bottom-0">Filter sittings</button></form>
    <p className="govuk-body"><Link className="govuk-link" href="/government/legislature/hansard">Search the full text of debates</Link> · <Link className="govuk-link" href="/government/legislature/hansard/members">Find a member’s contributions</Link></p>
    <h2 className="govuk-heading-m">{result.total} {result.total === 1 ? "sitting" : "sittings"}</h2>{!result.total && <p className="govuk-body">No published sittings match these filters. New records will appear after editorial review.</p>}
    {result.rows.map(s => <article className="border-b py-5" key={s._id}><h3 className="govuk-heading-m govuk-!-margin-bottom-2"><Link className="govuk-link" href={`/government/legislature/hansard/sitting/${s.slug.current}`}>{s.title}</Link></h3><p className="govuk-body govuk-!-margin-bottom-2">{PROCEEDING_TYPES[s.proceedingType]} | {s.sittingDate} · {s.sittingPeriod}{s.countyName ? ` · ${s.countyName}` : ""} · {s.contributionCount} contributions</p>{!!s.topics?.length && <p className="govuk-body-s">Topics: {s.topics.join(", ")}</p>}</article>)}
    <nav aria-label="Sitting pages" className="mt-6 flex gap-6">{page > 1 && <Link className="govuk-link" href={pageUrl(page-1)}>Previous</Link>}{page*25 < result.total && <Link className="govuk-link" href={pageUrl(page+1)}>Next</Link>}</nav>
  </div>;
}
