import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { relationLabel } from "@/lib/gazette/relationship-types";

type Props = {
  leaderId?: string | null;
  mcaId?: string | null;
  heading?: string;
};

const one = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? v[0] || null : v || null;

export default async function PersonGazetteHistory({
  leaderId,
  mcaId,
  heading = "Gazette record",
}: Props) {
  if (!leaderId && !mcaId) return null;

  const supabase = await createClient();
  let query = supabase
    .from("gazette_notice_people")
    .select(`
      id, relationship_type, capacity_title, position_title,
      effective_from, effective_to, fiduciary_authority, fiduciary_basis,
      gazette_notices!inner(
        id, notice_number, title,
        gazette_issues!inner(year, volume, issue_number, date)
      )
    `)
    .eq("verification_status", "Verified");

  query = leaderId ? query.eq("leader_id", leaderId) : query.eq("mca_id", mcaId!);

  const { data } = await query.order("effective_from", { ascending: false });
  if (!data?.length) return null;

  return (
    <section aria-labelledby="person-gazette-heading" className="govuk-!-margin-top-8">
      <h2 id="person-gazette-heading" className="govuk-heading-l">{heading}</h2>
      <p className="govuk-body">
        Gazette notices connected to this person in CitizenGuide's structured public record.
      </p>
      <div className="govuk-table-wrapper">
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" scope="col">Date</th>
              <th className="govuk-table__header" scope="col">Relationship</th>
              <th className="govuk-table__header" scope="col">Gazette notice</th>
              <th className="govuk-table__header" scope="col">Position / capacity</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {data.map((row: any) => {
              const notice = one(row.gazette_notices);
              const issue = one(notice?.gazette_issues);
              if (!notice || !issue) return null;
              return (
                <tr className="govuk-table__row" key={row.id}>
                  <td className="govuk-table__cell">
                    {new Date(issue.date).toLocaleDateString("en-KE", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="govuk-table__cell">
                    {relationLabel(row.relationship_type)}
                    {row.fiduciary_authority && (
                      <div className="govuk-!-margin-top-1">
                        <strong className="govuk-tag govuk-tag--blue">Public / fiduciary authority</strong>
                      </div>
                    )}
                  </td>
                  <td className="govuk-table__cell">
                    <Link
                      className="govuk-link"
                      href={`/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`}
                    >
                      G.N. {notice.notice_number}: {notice.title}
                    </Link>
                  </td>
                  <td className="govuk-table__cell">
                    {row.position_title || row.capacity_title || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
