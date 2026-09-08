import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { deleteContactMessage } from "@/app/admin/actions";
import DeleteRowButton from "@/components/admin/DeleteRowButton";

export const dynamic = "force-dynamic";

type ContactRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  contact_type: string | null;
  created_at: string;
};

async function getContactMessages(): Promise<{
  records: ContactRow[];
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, contact_type, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("contact_messages:", error.message);
      return { records: [], error: error.message };
    }
    return { records: (data as ContactRow[]) || [], error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("getContactMessages:", message);
    return { records: [], error: message };
  }
}

export default async function AdminContactPage() {
  const { records, error } = await getContactMessages();
  const total = records.length;
  const withEmail = records.filter((r) => r.email).length;

  return (
    <>
      <span className="govuk-caption-l">Citizen responses</span>
      <h1 className="govuk-heading-xl">Contact messages</h1>
      <p className="govuk-body">
        Messages submitted through the public contact form.
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
            Could not load contact messages
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-one-half">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">Total messages</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">{total}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-half">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">With email</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {withEmail}
            </p>
          </div>
        </div>
      </div>

      {total === 0 && !error ? (
        <div className="govuk-inset-text">No contact messages yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">
              Inbox
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Date</th>
                <th className="govuk-table__header">From</th>
                <th className="govuk-table__header">Subject</th>
                <th className="govuk-table__header">Message</th>
                <th className="govuk-table__header">
                  <span className="govuk-visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {records.map((row) => {
                const date = new Date(row.created_at).toLocaleDateString(
                  "en-KE",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );
                return (
                  <tr key={row.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{date}</td>
                    <td className="govuk-table__cell">
                      {row.name && (
                        <strong className="govuk-!-display-block">
                          {row.name}
                        </strong>
                      )}
                      {row.email && (
                        <a className="govuk-link" href={`mailto:${row.email}`}>
                          {row.email}
                        </a>
                      )}
                      {row.phone && (
                        <span className="govuk-body-s govuk-!-display-block">
                          {row.phone}
                        </span>
                      )}
                      {row.contact_type && (
                        <span className="govuk-tag govuk-tag--grey govuk-!-margin-top-1">
                          {row.contact_type}
                        </span>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      {row.subject || (
                        <span className="govuk-hint">No subject</span>
                      )}
                    </td>
                    <td
                      className="govuk-table__cell"
                      style={{ whiteSpace: "pre-wrap", maxWidth: "28rem" }}
                    >
                      {row.message}
                    </td>
                    <td className="govuk-table__cell">
                      <DeleteRowButton
                        id={row.id}
                        action={deleteContactMessage}
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
