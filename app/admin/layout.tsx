import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { adminPath } from "@/lib/admin-path";
import AdminNav from "./AdminNav";
import "./admin.css";

// Ensure auth checks always run fresh (no caching of user sessions)
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side protection.
  // On /admin/login, /forgot-password, /reset-password this returns null
  // (to avoid redirect loops) and we render the page without chrome.
  const user = await requireAdmin();

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(adminPath("login"));
  }

  const displayEmail = user?.email ?? "Admin";

  // Auth screens: minimal GOV.UK service header, no sidebar
  if (!user) {
    return (
      <div className="admin-service">
        <header className="admin-service-header">
          <div className="admin-service-header__inner">
            <Link href={adminPath("login")} className="admin-service-header__brand">
              <span className="admin-service-header__name">
                CitizenGuide.KE
              </span>
              <span className="admin-service-header__tag">Admin</span>
            </Link>
            <a
              href="/"
              className="govuk-link govuk-link--inverse"
              style={{ color: "#fff" }}
            >
              Back to public site
            </a>
          </div>
        </header>
        <main className="admin-auth-main" id="main-content">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="admin-service">
      <a href="#main-content" className="govuk-skip-link">
        Skip to main content
      </a>

      <header className="admin-service-header">
        <div className="admin-service-header__inner">
          <Link href={adminPath()} className="admin-service-header__brand">
            <span className="admin-service-header__name">CitizenGuide.KE</span>
            <span className="admin-service-header__tag">Admin</span>
          </Link>

          <div className="admin-service-header__meta">
            <span className="admin-service-header__email">{displayEmail}</span>
            <form action={handleSignOut} className="admin-service-header__sign-out">
              <button type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="admin-service-body">
        <div className="govuk-phase-banner" style={{ marginBottom: "16px" }}>
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">
              Internal
            </strong>
            <span className="govuk-phase-banner__text">
              This is the CitizenGuide.KE administration service — not a public
              government website.
            </span>
          </p>
        </div>

        <div className="admin-service-grid">
          <AdminNav />
          <main className="admin-main" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
