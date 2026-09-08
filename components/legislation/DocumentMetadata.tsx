import { chamberLabel } from "@/lib/legislation/routes";
import type { LegislationDocument } from "@/lib/legislation/types";

function date(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function kindLabel(value: LegislationDocument["legislation_kind"]) {
  if (value === "principal") return "Principal Act";
  if (value === "amending") return "Amending Act";
  if (value === "repealing") return "Repealing Act";
  if (value === "revision") return "Revision Act";
  if (value === "consolidation") return "Consolidation Act";
  if (value === "subsidiary") return "Subsidiary legislation";
  if (value === "treaty") return "Treaty";
  return null;
}

export function DocumentMetadata({
  document,
}: {
  document: LegislationDocument;
}) {
  const rows = [
    ["Type", kindLabel(document.legislation_kind)],
    ["Status", document.status],
    ["Citation", document.citation],
    ["Act number", document.act_number],
    ["Cap number", document.cap_number],
    [
      "Jurisdiction",
      document.county_name ||
        (document.jurisdiction_level === "national" ? "Kenya" : "International"),
    ],
    ["Legislature", document.legislature_name],
    ["Originating House", chamberLabel(document.originating_chamber)],
    ["Assented", date(document.assent_date)],
    ["Published", date(document.publication_date)],
    ["Commenced", date(document.commencement_date)],
    ["Last amended", date(document.last_amended_date)],
    ["Repealed", date(document.repeal_date)],
    ["Treaty status", document.treaty_status?.replaceAll("_", " ") || null],
    ["Signed", date(document.signature_date)],
    ["Ratified", date(document.ratification_date)],
    ["Entered into force", date(document.entry_into_force_date)],
  ].filter(([, value]) => value);

  return (
    <dl className="govuk-summary-list">
      {rows.map(([key, value]) => (
        <div className="govuk-summary-list__row" key={key as string}>
          <dt className="govuk-summary-list__key">{key}</dt>
          <dd className="govuk-summary-list__value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
