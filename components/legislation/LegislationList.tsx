import Link from "next/link";
import { chamberLabel } from "@/lib/legislation/routes";
import type { LegislationListItem } from "@/lib/legislation/types";

function displayTag(item: LegislationListItem) {
  if (item.legislation_kind === "amending") {
    return { label: "Amending Act", className: "govuk-tag--blue" };
  }

  if (item.legislation_kind === "repealing") {
    return { label: "Repealing Act", className: "govuk-tag--purple" };
  }

  if (item.status === "In force") {
    return { label: "In force", className: "govuk-tag--green" };
  }

  if (item.status === "Repealed") {
    return { label: "Repealed", className: "govuk-tag--grey" };
  }

  return { label: item.status, className: "govuk-tag--blue" };
}

export function LegislationList({ items }: { items: LegislationListItem[] }) {
  if (!items.length) {
    return <p className="govuk-body">No legislation matched your filters.</p>;
  }

  return (
    <ul className="legislation-list">
      {items.map((item) => {
        const tag = displayTag(item);

        return (
          <li key={item.legal_document_id} className="legislation-list__item">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-1">
              <Link className="govuk-link" href={item.href}>
                {item.title}
              </Link>
            </h2>

            <p className="govuk-body-s govuk-!-margin-bottom-1">
              {[
                item.citation,
                item.year ? String(item.year) : null,
                chamberLabel(item.originating_chamber),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <strong className={`govuk-tag ${tag.className}`}>
              {tag.label}
            </strong>
          </li>
        );
      })}
    </ul>
  );
}
