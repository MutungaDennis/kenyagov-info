import Link from "next/link";
import { adminPath } from "@/lib/admin-path";

const TASKS = [
  {
    segment: "institutions",
    title: "Institutions",
    body: "Manage ministries, departments, agencies and public bodies in Supabase.",
    group: "Content",
  },
  {
    segment: "officials",
    title: "Officials",
    body: "Add and update government officials and leadership data.",
    group: "Content",
  },
  {
    segment: "hansard",
    title: "Hansard",
    body: "Browse sittings, enter contributions manually, or upload a PDF for Grok extraction — all on one page.",
    group: "Parliament",
    accent: true,
  },
  {
    segment: "polling-stations/upload",
    title: "Polling stations upload",
    body: "Upload IEBC polling station data into Supabase.",
    group: "Elections data",
  },
  {
    segment: "contact",
    title: "Contact messages",
    body: "Read and manage messages from the public contact form.",
    group: "Citizen responses",
  },
  {
    segment: "feedback",
    title: "General feedback",
    body: "Read feedback submitted by citizens on the public site.",
    group: "Citizen responses",
  },
  {
    segment: "bug-reports",
    title: "Bug reports",
    body: "Review technical problem reports from citizens.",
    group: "Citizen responses",
  },
  {
    segment: "analytics",
    title: "Analytics",
    body: "View traffic and usage metrics for the public site.",
    group: "System",
  },
  {
    segment: "site-status",
    title: "Site status",
    body: "Check maintenance mode and operational status settings.",
    group: "System",
  },
] as const;

const GROUPS = [
  "Content",
  "Parliament",
  "Elections data",
  "Citizen responses",
  "System",
] as const;

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="govuk-heading-xl">Admin dashboard</h1>
      <p className="govuk-body-l">
        Manage data stored in Supabase and Sanity. Changes appear on the public
        CitizenGuide.KE site.
      </p>

      <div className="govuk-inset-text">
        Use the side menu to move between admin tasks. On smaller screens, open{" "}
        <strong>Menu</strong> at the top of the page.
      </div>

      {GROUPS.map((group) => {
        const items = TASKS.filter((t) => t.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">{group}</h2>
            <div className="admin-task-grid">
              {items.map((task) => (
                <div
                  key={task.segment}
                  className={
                    "accent" in task && task.accent
                      ? "admin-task-card admin-task-card--accent"
                      : "admin-task-card"
                  }
                >
                  <h3 className="govuk-heading-m">
                    <Link href={adminPath(task.segment)} className="govuk-link">
                      {task.title}
                    </Link>
                  </h3>
                  <p className="govuk-body-s">{task.body}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="govuk-inset-text govuk-!-margin-top-2">
        <strong>Note:</strong> Hansard content is stored in Sanity CMS.
        Institutions, officials, feedback and polling data use Supabase.
      </div>
    </div>
  );
}
