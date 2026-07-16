"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { adminPath, getAdminBasePath } from "@/lib/admin-path";

type NavItem = {
  /** Path under admin base, e.g. "" | "institutions" | "hansard/upload" */
  segment: string;
  label: string;
  exact?: boolean;
  external?: boolean;
  /** Full href override for external links */
  href?: string;
};

type NavSection = {
  heading: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [{ segment: "", label: "Dashboard", exact: true }],
  },
  {
    heading: "Content",
    items: [
      { segment: "institutions", label: "Institutions" },
      { segment: "officials", label: "Officials" },
    ],
  },
  {
    heading: "Parliament",
    items: [
      { segment: "hansard", label: "Hansard", exact: false },
    ],
  },
  {
    heading: "Elections data",
    items: [
      {
        segment: "polling-stations/upload",
        label: "Polling stations upload",
      },
    ],
  },
  {
    heading: "Citizen responses",
    items: [
      { segment: "contact", label: "Contact messages" },
      { segment: "feedback", label: "General feedback" },
      { segment: "bug-reports", label: "Bug reports" },
    ],
  },
  {
    heading: "System",
    items: [
      { segment: "analytics", label: "Analytics" },
      { segment: "site-status", label: "Site status" },
      {
        segment: "",
        label: "View public site",
        external: true,
        href: "/",
      },
    ],
  },
];

function isActive(pathname: string, base: string, item: NavItem): boolean {
  if (item.external) return false;
  const href = adminPath(item.segment);

  if (item.exact) {
    if (item.segment === "") {
      return pathname === base || pathname === `${base}/`;
    }
    return pathname === href || pathname === `${href}/`;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();
  const panelId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const base = useMemo(() => getAdminBasePath(), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const activeLabel =
    NAV_SECTIONS.flatMap((s) => s.items).find((item) =>
      isActive(pathname, base, item),
    )?.label ?? "Menu";

  return (
    <div className="admin-nav-shell">
      <button
        type="button"
        className="admin-nav-toggle"
        aria-expanded={menuOpen}
        aria-controls={panelId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span>
          Menu
          <span className="govuk-visually-hidden">
            {" "}
            — current section: {activeLabel}
          </span>
        </span>
        <span className="admin-nav-toggle__chevron" aria-hidden="true" />
      </button>

      <nav
        id={panelId}
        className="admin-side-nav"
        aria-label="Admin sections"
        data-open={menuOpen ? "true" : "false"}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="admin-side-nav__section">
            <h2 className="admin-side-nav__heading">{section.heading}</h2>
            <ul className="admin-side-nav__list">
              {section.items.map((item) => {
                const href = item.external
                  ? item.href || "/"
                  : adminPath(item.segment);
                const active = isActive(pathname, base, item);
                return (
                  <li
                    key={href + item.label}
                    className={
                      active
                        ? "admin-side-nav__item admin-side-nav__item--active"
                        : "admin-side-nav__item"
                    }
                  >
                    {item.external ? (
                      <a
                        href={href}
                        data-external="true"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.label}
                        <span className="govuk-visually-hidden">
                          {" "}
                          (opens in new tab)
                        </span>
                      </a>
                    ) : (
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
