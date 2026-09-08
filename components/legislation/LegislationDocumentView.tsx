import Link from "next/link";
import type {
  LegislationAmendmentGroup,
  LegislationDocument,
  LegislationProvision,
} from "@/lib/legislation/types";

import { DocumentMetadata } from "./DocumentMetadata";
import { PdfVersions } from "./PdfVersions";

function kindLabel(document: LegislationDocument) {
  if (document.legislation_kind === "amending") return "Amending Act";
  if (document.legislation_kind === "repealing") return "Repealing Act";
  if (document.legislation_kind === "revision") return "Revision Act";
  if (document.legislation_kind === "consolidation") return "Consolidation Act";
  if (document.category === "act") return "Act of Parliament";
  if (document.category === "county_act") return "County legislation";
  if (document.category === "subsidiary") return "Subsidiary legislation";
  return "Treaty";
}

function AmendmentSchedule({
  groups,
}: {
  groups: LegislationAmendmentGroup[];
}) {
  if (!groups.length) {
    return null;
  }

  const itemCount = groups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  return (
    <section id="schedule" className="legislation-amendment-schedule">
      <span className="govuk-caption-l">Schedule (s. 2)</span>
      <h2 className="govuk-heading-l">Amendments to written laws</h2>

      <p className="govuk-body">
        This Schedule contains {groups.length} written-law entries and{" "}
        {itemCount} amendment instructions.
      </p>

      <div className="legislation-amendment-table-wrap">
        <table className="govuk-table legislation-amendment-table">
          <caption className="govuk-visually-hidden">
            Written laws, provisions and amendments
          </caption>

          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th
                scope="col"
                className="govuk-table__header legislation-amendment-table__law"
              >
                Written law
              </th>

              <th
                scope="col"
                className="govuk-table__header legislation-amendment-table__provision"
              >
                Provision
              </th>

              <th scope="col" className="govuk-table__header">
                Amendment
              </th>
            </tr>
          </thead>

          <tbody className="govuk-table__body">
            {groups.flatMap((group) =>
              group.items.map((item, index) => (
                <tr
                  className="govuk-table__row legislation-amendment-row"
                  key={item.id}
                >
                  <td
                    className="govuk-table__cell legislation-amendment-cell legislation-amendment-cell--law"
                    data-label="Written law"
                  >
                    {index === 0 ? (
                      <>
                        {group.target_document_slug ? (
                          <Link
                            className="govuk-link govuk-link--no-visited-state"
                            href={`/legislation/acts/${group.target_document_slug}`}
                          >
                            {group.written_law_title}
                          </Link>
                        ) : (
                          <strong>{group.written_law_title}</strong>
                        )}

                        {group.written_law_citation ? (
                          <span className="legislation-amendment-citation">
                            {group.written_law_citation}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="govuk-visually-hidden">
                        {group.written_law_title}
                      </span>
                    )}
                  </td>

                  <td
                    className="govuk-table__cell legislation-amendment-cell legislation-amendment-cell--provision"
                    data-label="Provision"
                  >
                    <strong>{item.provision_label}</strong>
                  </td>

                  <td
                    className="govuk-table__cell legislation-amendment-cell legislation-amendment-cell--text"
                    data-label="Amendment"
                  >
                    {item.amendment_html ? (
                      <div
                        className="legislation-amendment-html"
                        dangerouslySetInnerHTML={{
                          __html: item.amendment_html,
                        }}
                      />
                    ) : (
                      <div className="legislation-amendment-text">
                        {item.amendment_text}
                      </div>
                    )}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function LegislationDocumentView({
  document,
  provisions,
  versions,
  amendmentSchedule = [],
}: {
  document: LegislationDocument;
  provisions: LegislationProvision[];
  versions: any[];
  amendmentSchedule?: LegislationAmendmentGroup[];
}) {
  const sections = provisions.filter(
    (provision) => provision.provision_type === "section",
  );

  const schedules = provisions.filter(
    (provision) => provision.provision_type === "schedule",
  );

  const isAmendingAct = document.legislation_kind === "amending";

  return (
    <main className="govuk-main-wrapper" id="main-content">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">{kindLabel(document)}</span>
          <h1 className="govuk-heading-xl">{document.title}</h1>

          {document.long_title ? (
            <p className="govuk-body-l">{document.long_title}</p>
          ) : null}

          {isAmendingAct ? (
            <div className="govuk-inset-text legislation-amending-act-note">
              This is an amending Act. Its Schedule changes provisions in other
              written laws. The amendments remain part of the legislative
              history of those laws.
            </div>
          ) : null}

          <DocumentMetadata document={document} />

          {document.source_url ? (
            <p className="govuk-body">
              <a className="govuk-link" href={document.source_url}>
                View official source <span aria-hidden="true">↗</span>
                <span className="govuk-visually-hidden">
                  {" "}
                  (external website)
                </span>
              </a>
            </p>
          ) : null}

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-l">Contents</h2>

          {sections.length > 0 ? (
            <ul className="govuk-list legislation-contents">
              {sections.map((provision) => (
                <li
                  key={provision.id}
                  className="govuk-!-margin-bottom-2"
                >
                  <Link
                    className="govuk-link"
                    href={provision.canonical_path}
                  >
                    {provision.provision_number ? (
                      <strong>{provision.provision_number}. </strong>
                    ) : null}
                    {provision.heading || "Untitled section"}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {schedules.length > 0 || amendmentSchedule.length > 0 ? (
            <ul className="govuk-list legislation-contents legislation-contents--schedules">
              <li>
                <a className="govuk-link" href="#schedule">
                  <strong>Schedule</strong>
                  {isAmendingAct ? " — amendments to written laws" : ""}
                </a>
              </li>
            </ul>
          ) : null}

          <AmendmentSchedule groups={amendmentSchedule} />

          <PdfVersions versions={versions} />
        </div>

        <div className="govuk-grid-column-one-third">
          <aside
            className="legislation-aside"
            aria-label="Related legislation navigation"
          >
            <h2 className="govuk-heading-s">Legislation</h2>

            <ul className="govuk-list">
              <li>
                <Link className="govuk-link" href="/legislation">
                  Legislation home
                </Link>
              </li>
              <li>
                <Link className="govuk-link" href="/legislation/acts">
                  Acts of Parliament
                </Link>
              </li>
              <li>
                <Link className="govuk-link" href="/legislation/counties">
                  County legislation
                </Link>
              </li>
              <li>
                <Link className="govuk-link" href="/legislation/subsidiary">
                  Subsidiary legislation
                </Link>
              </li>
              <li>
                <Link className="govuk-link" href="/legislation/treaties">
                  Treaties
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
