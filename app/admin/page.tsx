'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="govuk-heading-xl">Admin Dashboard</h1>
      <p className="govuk-body-l">
        Manage data stored in Supabase. Changes appear live on the public site.
      </p>

      <div className="govuk-inset-text">
        All management actions require admin authentication via Supabase.
      </div>

      <h2 className="govuk-heading-l">Data Management</h2>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
          <div className="govuk-card govuk-card--clickable" style={{ border: "1px solid #b1b4b6", padding: "16px" }}>
            <h3 className="govuk-heading-m">
              <Link href="/admin/institutions" className="govuk-link">Government Institutions</Link>
            </h3>
            <p className="govuk-body-s">Manage ministries, departments, agencies and public bodies from Supabase.</p>
          </div>
        </div>

        <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
          <div className="govuk-card govuk-card--clickable" style={{ border: "1px solid #b1b4b6", padding: "16px" }}>
            <h3 className="govuk-heading-m">
              <Link href="/admin/officials" className="govuk-link">Government Officials</Link>
            </h3>
            <p className="govuk-body-s">Add and manage officials data.</p>
          </div>
        </div>

        <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
          <div className="govuk-card govuk-card--clickable" style={{ border: "1px solid #b1b4b6", padding: "16px" }}>
            <h3 className="govuk-heading-m">
              <Link href="/admin/feedback" className="govuk-link">General Feedback</Link>
            </h3>
            <p className="govuk-body-s">View citizen feedback submissions stored in Supabase.</p>
          </div>
        </div>

        <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
          <div className="govuk-card govuk-card--clickable" style={{ border: "1px solid #b1b4b6", padding: "16px" }}>
            <h3 className="govuk-heading-m">
              <Link href="/admin/bug-reports" className="govuk-link">Bug Reports</Link>
            </h3>
            <p className="govuk-body-s">Review system bug reports from citizens.</p>
          </div>
        </div>

        <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
          <div className="govuk-card govuk-card--clickable" style={{ border: "1px solid #b1b4b6", padding: "16px" }}>
            <h3 className="govuk-heading-m">
              <Link href="/admin/polling-stations/upload" className="govuk-link">Polling Stations Upload</Link>
            </h3>
            <p className="govuk-body-s">Upload and process IEBC polling station PDF data into Supabase.</p>
          </div>
        </div>
      </div>

      <div className="govuk-inset-text govuk-!-margin-top-6">
        <strong>Note:</strong> Additional management sections (leaders, services, counties, etc.) can be added as needed from Supabase data. Current focus is on core institutional and user-submitted data.
      </div>
    </div>
  );
}