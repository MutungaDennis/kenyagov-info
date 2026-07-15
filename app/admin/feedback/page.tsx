import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { deleteGeneralFeedback } from "@/app/admin/actions";
import DeleteRowButton from "@/components/admin/DeleteRowButton";

export const dynamic = "force-dynamic";

type FeedbackRow = {
  id: string;
  feedback_text: string | null;
  full_name: string | null;
  email_address: string | null;
  created_at: string;
};

async function getFeedbackData(): Promise<{
  records: FeedbackRow[];
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("general_feedback")
      .select("id, feedback_text, full_name, email_address, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("general_feedback:", error.message);
      return { records: [], error: error.message };
    }
    return { records: (data as FeedbackRow[]) || [], error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("getFeedbackData:", message);
    return { records: [], error: message };
  }
}

export default async function AdminFeedbackPage() {
  const { records, error } = await getFeedbackData();
  const total = records.length;
  const contactable = records.filter((r) => r.email_address).length;
  const anonymous = total - contactable;

  return (
    <>
      <span className="govuk-caption-l">Citizen responses</span>
      <h1 className="govuk-heading-xl">General feedback</h1>
      <p className="govuk-body">
        Feedback submitted via the public “give feedback” form.
      </p>

      {!hasServiceRoleKey() && (
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            SUPABASE_SERVICE_ROLE_KEY is not set. Admin reads may fail if RLS
            blocks the anon key. Set it as a Cloudflare runtime secret.
          </strong>
        </div>
      )}

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">Could not load feedback</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-one-third">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">Total</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">{total}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">With email</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {contactable}
            </p>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">Anonymous</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {anonymous}
            </p>
          </div>
        </div>
      </div>

      {total === 0 && !error ? (
        <div className="govuk-inset-text">No feedback entries yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">
              All feedback
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Reference</th>
                <th className="govuk-table__header">Date</th>
                <th className="govuk-table__header">Citizen</th>
                <th className="govuk-table__header">Message</th>
                <th className="govuk-table__header">
                  <span className="govuk-visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {records.map((row) => {
                const ref = `CG-${String(row.id).split("-")[0].toUpperCase()}`;
                const date = new Date(row.created_at).toLocaleDateString(
                  "en-KE",
                  { day: "2-digit", month: "short", year: "numeric" },
                );
                return (
                  <tr key={row.id} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <code>{ref}</code>
                    </td>
                    <td className="govuk-table__cell">{date}</td>
                    <td className="govuk-table__cell">
                      {row.full_name ? (
                        <strong className="govuk-!-display-block">
                          {row.full_name}
                        </strong>
                      ) : (
                        <span className="govuk-hint">Anonymous</span>
                      )}
                      {row.email_address && (
                        <a
                          className="govuk-link"
                          href={`mailto:${row.email_address}`}
                        >
                          {row.email_address}
                        </a>
                      )}
                    </td>
                    <td
                      className="govuk-table__cell"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {row.feedback_text}
                    </td>
                    <td className="govuk-table__cell">
                      <DeleteRowButton
                        id={row.id}
                        action={deleteGeneralFeedback}
                      />
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
