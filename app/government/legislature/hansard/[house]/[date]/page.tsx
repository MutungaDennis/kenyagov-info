import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listHansard } from "@/lib/hansard/queries";
export const dynamic = "force-dynamic";
export default async function SittingsOnDate({ params }: { params: Promise<{ house: string; date: string }> }) {
 const { house, date } = await params;
 if (!["national-assembly", "senate", "county-assembly"].includes(house) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
 const { rows } = await listHansard({ house, date, pageSize: 500 });
 if (!rows.length) notFound();
 if (rows.length === 1) redirect(`/government/legislature/hansard/sitting/${rows[0].slug.current}`);
 return <div><h1 className="govuk-heading-xl">Sittings on {date}</h1><ul className="govuk-list">{rows.map(s => <li key={s._id}><Link className="govuk-link" href={`/government/legislature/hansard/sitting/${s.slug.current}`}>{s.title} ? {s.sittingPeriod}</Link></li>)}</ul></div>;
}
