import Link from "next/link";
import type { ReactNode } from "react";

import { adminPath } from "@/lib/admin-path";
import { requireAdmin } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "@/components/admin/admin-shell.module.css";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
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

            <span className="admin-service-header__tag">
              Admin
            </span>
          </Link>

          <Link
            href="/"
            className="govuk-link govuk-link--inverse"
            style={{ color: "#ffffff" }}
          >
            Back to public site
          </Link>
        </div>
      </header>

      <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main} id="main-content">
        {children}
      </main>
      </div>
    </div>
  );
}
