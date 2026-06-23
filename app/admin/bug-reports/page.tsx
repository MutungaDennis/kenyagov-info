import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Force dynamic generation to ensure tracking metrics are completely live
export const dynamic = "force-dynamic";

async function getBugReportData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing database credentials in server context.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Pull records from the technical citizen_feedback logging table
  const { data, error } = await supabase
    .from("citizen_feedback")
    .select("id, what_were_you_doing, what_went_wrong, email_address, page_path, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase bug logs metrics read exception:", error.message);
    return [];
  }

  return data || [];
}

export default async function AdminBugReportsPage() {
  const records = await getBugReportData();
  const totalBugs = records.length;

  // Track unique platform path footprints to isolate high-impact technical bottlenecks
  const uniquePaths = new Set(records.map(r => r.page_path || "/unknown")).size;

  return (
    <>
      <span className="govuk-caption-l" style={{ color: "#505a5f", fontSize: "20px", display: "block", marginBottom: "5px" }}>
        Internal Management Console
      </span>
      <h1 className="govuk-heading-xl" style={{ fontSize: "38px", fontWeight: "bold", margin: "0 0 30px 0", color: "#0b0c0c" }}>
        System bug reports
      </h1>

      {/* GOV.UK Dashboard Metric Summary Cards Block */}
      <div className="govuk-grid-row" style={{ display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "180px", background: "#f3f2f1", padding: "20px", borderLeft: "5px solid #d4351c" }}>
          <span style={{ display: "block", fontSize: "14px", color: "#505a5f", marginBottom: "5px", fontWeight: "bold" }}>Total reports</span>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#d4351c" }}>{totalBugs}</span>
        </div>
        <div style={{ flex: "1", minWidth: "180px", background: "#f3f2f1", padding: "20px", borderLeft: "5px solid #ffdd00" }}>
          <span style={{ display: "block", fontSize: "14px", color: "#505a5f", marginBottom: "5px", fontWeight: "bold" }}>Affected unique paths</span>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#0b0c0c" }}>{uniquePaths}</span>
        </div>
      </div>

      <h2 className="govuk-heading-m" style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
        Technical issues logged by citizens
      </h2>

      {totalBugs === 0 ? (
        <div style={{ border: "4px solid #505a5f", padding: "20px", background: "#fafafa" }}>
          <p className="govuk-body" style={{ fontSize: "19px", margin: 0, color: "#505a5f", fontWeight: "bold" }}>
            There are currently no technical bug reports registered inside the system logs.
          </p>
        </div>
      ) : (
        /* GOV.UK Technical Audit Log Table Layout */
        <div style={{ overflowX: "auto" }}>
          <table className="govuk-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "15px", marginBottom: "40px" }}>
            <thead>
              <tr style={{ borderBottom: "3px solid #0b0c0c" }}>
                <th style={{ padding: "10px", fontWeight: "bold", width: "110px" }}>Reference</th>
                <th style={{ padding: "10px", fontWeight: "bold", width: "120px" }}>Date Logged</th>
                <th style={{ padding: "10px", fontWeight: "bold", width: "160px" }}>Page Context Location</th>
                <th style={{ padding: "10px", fontWeight: "bold", width: "200px" }}>What Citizen Was Doing</th>
                <th style={{ padding: "10px", fontWeight: "bold" }}>What Went Wrong Exception</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => {
                const referenceString = `CG-${row.id.split("-").toUpperCase()}`;
                const formattedDate = new Date(row.created_at).toLocaleDateString("en-KE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });

                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid #b1b4b6", verticalAlign: "top" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "bold", fontFamily: "monospace", color: "#505a5f" }}>{referenceString}</td>
                    <td style={{ padding: "12px 10px", color: "#0b0c0c", whiteSpace: "nowrap" }}>{formattedDate}</td>
                    <td style={{ padding: "12px 10px", wordBreak: "break-all" }}>
                      <code style={{ background: "#f3f2f1", padding: "2px 4px", fontSize: "13px", color: "#0b0c0c", display: "inline-block", fontFamily: "monospace" }}>
                        {row.page_path || "/unknown"}
                      </code>
                      {row.email_address && (
                        <div style={{ marginTop: "6px", fontSize: "13px" }}>
                          <span style={{ color: "#505a5f", display: "block" }}>Contact:</span>
                          <a href={`mailto:${row.email_address}`} style={{ color: "#1d70b8", textDecoration: "underline" }}>{row.email_address}</a>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#0b0c0c", lineHeight: "1.4" }}>{row.what_were_you_doing}</td>
                    
                    {/* FIXED: Removed the invalid syntax error formatting block nested style definition */}
                    <td style={{ padding: "12px 10px", color: "#0b0c0c", lineHeight: "1.4", borderLeft: "3px solid #d4351c", paddingLeft: "10px" }}>
                      <span style={{ color: "#d4351c", fontWeight: "bold", fontSize: "13px", display: "block", marginBottom: "3px" }}>ERROR REPORT:</span>
                      {row.what_went_wrong}
                    </td>
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
