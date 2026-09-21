import Link from "next/link";
import type { ReactNode } from "react";

import { adminPath } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

export default function AdminAuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="admin-service">
      <a href="#main-content" className="govuk-skip-link">
        Skip to main content
      </a>

      <header className="admin-service-header">
        <div className="admin-service-header__inner">
          <Link
            href={adminPath("login")}
            className="admin-service-header__brand"
          >
            <span className="admin-service-header__name">
              CitizenGuide.KE
            </span>

            <span className="admin-service-header__tag">
              Admin
            </span>
          </Link>

          <a
            href="/"
            className="govuk-link govuk-link--inverse"
            style={{ color: "#ffffff" }}
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