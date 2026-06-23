import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Force dynamic generation to ensure feedback metrics are real-time
export const dynamic = "force-dynamic";

async function getFeedbackData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing database credentials in server context.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("general_feedback")
    .select("id, feedback_text, full_name, email_address, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase metrics read exception:", error.message);
    return [];
  }

  return data || [];
}

export default async function AdminFeedbackMetricsPage() {
  const records = await getFeedbackData();
  const totalSubmissions = records.length;

  const anonymousSubmissions = records.filter(r => !r.email_address).length;
  const contactableSubmissions = totalSubmissions - anonymousSubmissions;

  return (
    <>
      <span className="govuk-caption-l" style={{ color: "#505a5f", fontSize: "20px", display: "block", marginBottom: "5px" }}>
        Internal Management Console
      </span>
      <h1 className="govuk-heading-xl" style={{ fontSize: "38px", fontWeight: "bold", margin: "0 0 30px 0", color: "#0b0c0c" }}>
        General feedback responses
      </h1>

      {/* GOV.UK Dashboard Metric Summary Cards Block */}
      <div className="govuk-grid-row" style={{ display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "180px", background: "#f3f2f1", padding: "20px", borderLeft: "5px solid #1d70b8" }}>
          <span style={{ display: "block", fontSize: "14px", color: "#505a5f", marginBottom: "5px", fontWeight: "bold" }}>Total responses</span>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#1d70b8" }}>{totalSubmissions}</span>
        </div>
        <div style={{ flex: "1", minWidth: "180px", background: "#f3f2f1", padding: "20px", borderLeft: "5px solid #00703c" }}>
          <span style={{ display: "block", fontSize: "14px", color: "#505a5f", marginBottom: "5px", fontWeight: "bold" }}>Contactable logs</span>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#00703c" }}>{contactableSubmissions}</span>
        </div>
        <div style={{ flex: "1", minWidth: "180px", background: "#f3f2f1", padding: "20px", borderLeft: "5px solid #505a5f" }}>
          <span style={{ display: "block", fontSize: "14px", color: "#505a5f", marginBottom: "5px", fontWeight: "bold" }}>Anonymous entries</span>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#505a5f" }}>{anonymousSubmissions}</span>
        </div>
      </div>

      {totalSubmissions === 0 ? (
        <div style={{ border: "4px solid #1d70b8", padding: "20px", background: "#fafafa" }}>
          <p className="govuk-body" style={{ fontSize: "19px", margin: 0, color: "#1d70b8", fontWeight: "bold" }}>
            There are currently no feedback entries stored inside the database system.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="govuk-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "16px", marginBottom: "40px" }}>
            <thead>
              <tr style={{ borderBottom: "3px solid #0b0c0c" }}>
                <th style={{ padding: "10px", fontWeight: "bold", width: "120px" }}>Reference</th>
                <th style={{ padding: "10px", fontWeight: "bold", width: "140px" }}>Date Received</th>
                <th style={{ padding: "10px", fontWeight: "bold", width: "180px" }}>Citizen Details</th>
                <th style={{ padding: "10px", fontWeight: "bold" }}>Feedback Message Summary</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => {
                const referenceString = `CG-${row.id.split("-")[0].toUpperCase()}`;
                const formattedDate = new Date(row.created_at).toLocaleDateString("en-KE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });

                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid #b1b4b6", verticalAlign: "top" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "bold", fontFamily: "monospace", color: "#505a5f" }}>{referenceString}</td>
                    <td style={{ padding: "12px 10px", color: "#0b0c0c" }}>{formattedDate}</td>
                    <td style={{ padding: "12px 10px", lineHeight: "1.4" }}>
                      {row.full_name ? <strong style={{ display: "block", color: "#0b0c0c" }}>{row.full_name}</strong> : <span style={{ color: "#505a5f", fontStyle: "italic" }}>Anonymous</span>}
                      {row.email_address && <a href={`mailto:${row.email_address}`} style={{ color: "#1d70b8", textDecoration: "underline", fontSize: "14px", display: "block", wordBreak: "break-all" }}>{row.email_address}</a>}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#0b0c0c", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{row.feedback_text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <Link href="/" style={{ color: "#1d70b8", textDecoration: "underline", fontSize: "19px", fontWeight: "bold" }}>
          ‹ Back to citizen platform homepage
        </Link>
      </div>
    </>
  );
}
