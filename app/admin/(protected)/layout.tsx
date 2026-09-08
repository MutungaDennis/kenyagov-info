import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AdminNav from "../AdminNav";
import { adminPath } from "@/lib/admin-path";
import { createClient, requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  async function handleSignOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect(adminPath("login"));
  }

  return (
    <div className="admin-service">
      <a href="#main-content" className="govuk-skip-link">
        Skip to main content
      </a>

      <header className="admin-service-header">
        <div className="admin-service-header__inner">
          <Link
            href={adminPath()}
            className="admin-service-header__brand"
          >
            <span className="admin-service-header__name">
              CitizenGuide.KE
            </span>
            <span className="admin-service-header__tag">Admin</span>
          </Link>

          <div className="admin-service-header__meta">
            <span className="admin-service-header__email">
              {user.email ?? "Admin"}
            </span>

            <form
              action={handleSignOut}
              className="admin-service-header__sign-out"
            >
              <button type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="admin-service-body">
        <div
          className="govuk-phase-banner"
          style={{ marginBottom: "16px" }}
        >
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">
              Internal
            </strong>

            <span className="govuk-phase-banner__text">
              This is the CitizenGuide.KE administration service — not a
              public government website.
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
