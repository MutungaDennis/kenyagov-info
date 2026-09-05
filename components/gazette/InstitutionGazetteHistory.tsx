import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { relationLabel } from "@/lib/gazette/relationship-types";

type Props = {
  institutionId: string;
  heading?: string;
};

const one = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? v[0] || null : v || null;

export default async function InstitutionGazetteHistory({
  institutionId,
  heading = "Gazette record",
}: Props) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("gazette_notice_institutions")
    .select(`
      id, relationship_type,
      gazette_notices!inner(
        id, notice_number, title,
        gazette_issues!inner(year, volume, issue_number, date)
      )
    `)
    .eq("institution_id", institutionId)
    .eq("verification_status", "Verified")
    .order("created_at", { ascending: false });

  if (!data?.length) return null;

  return (
    <section aria-labelledby="institution-gazette-heading" className="govuk-!-margin-top-8">
      <h2 id="institution-gazette-heading" className="govuk-heading-l">{heading}</h2>
      <p className="govuk-body">
        Gazette notices linked to this institution in CitizenGuide.
      </p>
      <ul className="govuk-list govuk-list--spaced">
        {data.map((row: any) => {
          const notice = one(row.gazette_notices);
          const issue = one(notice?.gazette_issues);
          if (!notice || !issue) return null;
          return (
            <li key={row.id}>
              <strong>{relationLabel(row.relationship_type)}</strong>
              <br />
              <Link
                className="govuk-link"
                href={`/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`}
              >
                Gazette Notice No. {notice.notice_number}: {notice.title}
              </Link>
              <div className="govuk-hint govuk-!-margin-bottom-0">
                {new Date(issue.date).toLocaleDateString("en-KE", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
