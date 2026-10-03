import { PROCEEDING_TYPES } from "@/lib/hansard/collections";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHansardDocument } from "@/lib/hansard/queries";
import { createPublicClient } from "@/lib/supabase/public";
import { safeHtml } from "@/lib/safe-html";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params; const doc = await getHansardDocument({ slug });
  return { title: doc ? `${doc.sitting.title} — Hansard` : "Hansard sitting", alternates: { canonical: `/government/legislature/hansard/sitting/${slug}` } };
}
export default async function HansardReader({ params }: Props) {
  const { slug } = await params; const doc = await getHansardDocument({ slug });
  if (!doc) notFound();
  const ids = [...new Set(doc.contributions.map(c => c.leader_id).filter((id): id is string => !!id))];
  const members = new Map<string, string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await createPublicClient().from("leaders").select("id,slug").in("id", ids.slice(i,i+100));
    if (error) throw error;
    for (const member of data || []) members.set(member.id, member.slug);
  }
  const sitting = doc.sitting;
  const source = sitting.official_hansard_url || doc.sources.find(s => s.is_official_source && s.source_url)?.source_url;
  return <div>
    <nav className="govuk-body-s"><Link className="govuk-link" href="/government/legislature/hansard">Hansard</Link> / {PROCEEDING_TYPES[sitting.proceeding_type]} / {sitting.house_type.replaceAll("-", " ")}</nav>
    <header className="govuk-!-margin-bottom-6"><h1 className="govuk-heading-xl">{sitting.title}</h1><p className="govuk-body-l">{new Date(`${sitting.sitting_date}T12:00:00`).toLocaleDateString("en-KE", { dateStyle: "long" })} · {sitting.sitting_period}</p><p className="govuk-body">{sitting.parliamentary_term}{sitting.county_name ? ` · ${sitting.county_name}` : ""}</p>{source && <a className="govuk-link" href={source} target="_blank" rel="noopener noreferrer">Read the official source</a>}{sitting.summary_html && <div className="prose max-w-none govuk-!-margin-top-4" dangerouslySetInnerHTML={{ __html: safeHtml(sitting.summary_html) }} />}</header>
    <div className="grid items-start gap-10 lg:grid-cols-[16rem_1fr]">
      <aside className="rounded border p-4 lg:sticky lg:top-4"><h2 className="govuk-heading-s">In this sitting</h2><ol className="space-y-3">{doc.sections.map(section => <li key={section.section_key} className={section.parent_key ? "ml-4" : ""}><a className="govuk-link" href={`#section-${section.section_key}`}>{section.heading}</a></li>)}</ol><p className="govuk-body-s govuk-!-margin-top-4">{doc.contributions.length} contributions</p></aside>
      <div>{doc.sections.map(section => <section key={section.section_key} id={`section-${section.section_key}`} className="scroll-mt-6 govuk-!-margin-bottom-8"><h2 className="govuk-heading-l">{section.heading}</h2>{section.body_html && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml(section.body_html) }} />}{doc.contributions.filter(c => c.section_key === section.section_key).map(c => {
        const memberSlug = c.leader_id ? members.get(c.leader_id) : undefined;
        return <article key={c.contribution_key} id={`contribution-${c.contribution_key}`} className="scroll-mt-6 border-b border-slate-200 py-6"><header className="mb-4"><h3 className="govuk-heading-m govuk-!-margin-bottom-1">{memberSlug ? <Link className="govuk-link" href={`/government/legislature/hansard/member/${memberSlug}`}>{c.speaker_name}</Link> : c.speaker_name || "Proceedings"}</h3><p className="govuk-body-s">{[c.capacity || c.speaker_title, c.constituency || c.county, c.party, c.spoken_at].filter(Boolean).join(" · ")}</p><div className="flex gap-4 text-sm"><a className="govuk-link" href={`#contribution-${c.contribution_key}`}>Permanent link</a>{source && c.source_page && <a className="govuk-link" href={`${source.split("#")[0]}#page=${c.source_page}`} target="_blank" rel="noopener noreferrer">Source page {c.source_page}</a>}</div></header><div className="prose max-w-none leading-relaxed" lang={c.language} dangerouslySetInnerHTML={{ __html: safeHtml(c.body_html) }} /></article>;
      })}</section>)}</div>
    </div>
  </div>;
}
