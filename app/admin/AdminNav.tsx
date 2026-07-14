"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  /** Match only exact path (e.g. dashboard) */
  exact?: boolean;
  external?: boolean;
};

type NavSection = {
  heading: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/institutions", label: "Institutions" },
      { href: "/admin/officials", label: "Officials" },
    ],
  },
  {
    heading: "Parliament",
    items: [
      { href: "/admin/hansard", label: "Hansard sittings", exact: true },
      { href: "/admin/hansard/upload", label: "Upload Hansard PDF" },
      { href: "/admin/hansard/manual", label: "Manual Hansard entry" },
    ],
  },
  {
    heading: "Elections data",
    items: [
      {
        href: "/admin/polling-stations/upload",
        label: "Polling stations upload",
      },
    ],
  },
  {
    heading: "Feedback",
    items: [
      { href: "/admin/feedback", label: "General feedback" },
      { href: "/admin/bug-reports", label: "Bug reports" },
    ],
  },
  {
    heading: "System",
    items: [
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/site-status", label: "Site status" },
      { href: "/", label: "View public site", external: true },
    ],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.external) return false;
  if (item.exact) {
    if (item.href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname === item.href || pathname === `${item.href}/`;
  }
  // Avoid /admin/hansard matching /admin/hansard/upload when exact siblings exist
  if (item.href === "/admin/hansard") {
    return (
      pathname === "/admin/hansard" ||
      pathname === "/admin/hansard/" ||
      (pathname.startsWith("/admin/hansard/") &&
        !pathname.startsWith("/admin/hansard/upload") &&
        !pathname.startsWith("/admin/hansard/manual"))
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();
  const panelId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Desktop always shows nav; mobile uses toggle
  const activeLabel =
    NAV_SECTIONS.flatMap((s) => s.items).find((item) =>
      isActive(pathname, item),
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
                const active = isActive(pathname, item);
                return (
                  <li
                    key={item.href + item.label}
                    className={
                      active
                        ? "admin-side-nav__item admin-side-nav__item--active"
                        : "admin-side-nav__item"
                    }
                  >
                    {item.external ? (
                      <a
                        href={item.href}
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
                        href={item.href}
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
