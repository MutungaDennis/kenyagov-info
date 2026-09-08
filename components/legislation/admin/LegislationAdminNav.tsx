import Link from "next/link";

export function LegislationAdminNav({
  documentId,
  active,
}: {
  documentId: string;
  active: "overview" | "edit" | "relationships" | "versions" | "changes";
}) {
  const items = [
    ["overview", "Overview", `/admin/legislation/documents/${documentId}`],
    ["edit", "Edit metadata", `/admin/legislation/documents/${documentId}/edit`],
    ["relationships", "Relationships", `/admin/legislation/documents/${documentId}/relationships`],
    ["versions", "Versions and PDFs", `/admin/legislation/documents/${documentId}/versions`],
    ["changes", "Change history", `/admin/legislation/documents/${documentId}/changes`],
  ] as const;

  return (
    <nav className="admin-legislation-tabs" aria-label="Legislation admin">
      <ul className="govuk-list admin-legislation-tabs__list">
        {items.map(([key, label, href]) => (
          <li
            key={key}
            className={`admin-legislation-tabs__item ${
              active === key ? "admin-legislation-tabs__item--active" : ""
            }`}
          >
            <Link
              className="govuk-link govuk-link--no-visited-state"
              href={href}
              aria-current={active === key ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
