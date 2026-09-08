import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { deleteBugReport } from "@/app/admin/actions";
import DeleteRowButton from "@/components/admin/DeleteRowButton";

export const dynamic = "force-dynamic";

type BugRow = {
  id: string;
  what_were_you_doing: string | null;
  what_went_wrong: string | null;
  email_address: string | null;
  page_path: string | null;
  created_at: string;
};

async function getBugReportData(): Promise<{
  records: BugRow[];
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("citizen_feedback")
      .select(
        "id, what_were_you_doing, what_went_wrong, email_address, page_path, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("citizen_feedback:", error.message);
      return { records: [], error: error.message };
    }
    return { records: (data as BugRow[]) || [], error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("getBugReportData:", message);
    return { records: [], error: message };
  }
}

export default async function AdminBugReportsPage() {
  const { records, error } = await getBugReportData();
  const total = records.length;
  const uniquePaths = new Set(
    records.map((r) => r.page_path || "/unknown"),
  ).size;

  return (
    <>
      <span className="govuk-caption-l">Citizen responses</span>
      <h1 className="govuk-heading-xl">Bug reports</h1>
      <p className="govuk-body">
        Technical problems reported via “report a problem on this page”.
      </p>

      {!hasServiceRoleKey() && (
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            SUPABASE_SERVICE_ROLE_KEY is not set. Admin reads may fail under RLS.
          </strong>
        </div>
      )}

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">
            Could not load bug reports
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-one-half">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">Total reports</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">{total}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-half">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              Unique page paths
            </p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {uniquePaths}
            </p>
          </div>
        </div>
      </div>

      {total === 0 && !error ? (
        <div className="govuk-inset-text">No bug reports yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">
              Technical issues
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Date</th>
                <th className="govuk-table__header">Page</th>
                <th className="govuk-table__header">What they were doing</th>
                <th className="govuk-table__header">What went wrong</th>
                <th className="govuk-table__header">Contact</th>
                <th className="govuk-table__header">
                  <span className="govuk-visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {records.map((row) => {
                const date = new Date(row.created_at).toLocaleDateString(
                  "en-KE",
                  { day: "2-digit", month: "short", year: "numeric" },
                );
                return (
                  <tr key={row.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{date}</td>
                    <td className="govuk-table__cell">
                      <code>{row.page_path || "/unknown"}</code>
                    </td>
                    <td
                      className="govuk-table__cell"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {row.what_were_you_doing}
                    </td>
                    <td
                      className="govuk-table__cell"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {row.what_went_wrong}
                    </td>
                    <td className="govuk-table__cell">
                      {row.email_address ? (
                        <a
                          className="govuk-link"
                          href={`mailto:${row.email_address}`}
                        >
                          {row.email_address}
                        </a>
                      ) : (
                        <span className="govuk-hint">—</span>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      <DeleteRowButton id={row.id} action={deleteBugReport} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
