import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConstitutionShell from "@/components/constitution/ConstitutionShell";
import { getSchedule } from "@/lib/constitution/data";

type Props = { params: Promise<{ scheduleSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { scheduleSlug } = await params; const s = await getSchedule(scheduleSlug); return s ? { title: `${s.schedule_label}: ${s.title} | Constitution of Kenya` } : {}; }
export default async function SchedulePage({ params }: Props) {
  const { scheduleSlug } = await params; const s = await getSchedule(scheduleSlug); if (!s) notFound();
  return <ConstitutionShell title={s.title} caption={`${s.schedule_label} · Constitution of Kenya, 2010`}>
    <article className="constitution-schedule-reading" dangerouslySetInnerHTML={{ __html: s.body_html }} />
  </ConstitutionShell>;
}
