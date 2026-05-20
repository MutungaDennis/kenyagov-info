import Link from "next/link";

//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import GovUKAccordion from "@/components/govuk/Accordion";

import { getAllActsOfParliament } from "@/lib/sanity/client";

export default async function ParliamentActsPage() {
  const acts = await getAllActsOfParliament();

  // NEWEST FIRST
  const nationalAssemblyActs = acts
    .filter((act: any) => act.houseOfOrigin === "nationalAssembly")
    .sort((a: any, b: any) => b.yearEnacted - a.yearEnacted);

  const senateActs = acts.filter(
    (act: any) => act.houseOfOrigin === "senate"
  );

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Acts of Parliament", href: "/acts/parliament" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Acts of Parliament</h1>

        <p className="govuk-body-l">
          Browse Acts passed by the Parliament of Kenya, grouped by House of Origin.
        </p>

        {/* ================= SEARCH ================= */}
        <div className="govuk-form-group govuk-!-margin-top-6">
          <label className="govuk-label govuk-label--m" htmlFor="acts-search">
            Search Acts
          </label>

          <input
            id="acts-search"
            className="govuk-input govuk-input--width-full"
            type="text"
            placeholder="e.g. Media Council Act, Data Protection Act..."
          />
        </div>

        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

        {/* ================= NATIONAL ASSEMBLY ================= */}
        <section>
          <h2 className="govuk-heading-l">National Assembly Acts</h2>

          {nationalAssemblyActs.length === 0 ? (
            <p className="govuk-body">No Acts available yet.</p>
          ) : (
            <GovUKAccordion
              id="national-assembly-acts"
              items={nationalAssemblyActs.map((act: any) => ({
                id: act._id,

                // ACCORDION TITLE = ONLY ACT NAME
                title: act.shortTitle,

                // CONTENT = EXPANDS ON CLICK
                content: (
                  <div>
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      <strong>{act.citation}</strong> • {act.yearEnacted} •{" "}
                      <strong>{act.status}</strong>
                    </p>

                    <p className="govuk-body">
                      {act.globalSummary || "No summary available yet."}
                    </p>

                    <ul className="govuk-list govuk-list--bullet">
                      <li>
                        House of Origin: <strong>National Assembly</strong>
                      </li>

                      {act.capNumber && (
                        <li>Cap Number: {act.capNumber}</li>
                      )}

                      {act.dateOfAssent && (
                        <li>Date of Assent: {act.dateOfAssent}</li>
                      )}

                      {act.dateOfCommencement && (
                        <li>
                          Commencement: {act.dateOfCommencement}
                        </li>
                      )}
                    </ul>

                    <p className="govuk-body">
                      <Link
                        href={`/acts/parliament/${act.slug.current}`}
                        className="govuk-link"
                      >
                        View full Act →
                      </Link>
                    </p>
                  </div>
                ),
              }))}
            />
          )}
        </section>

        <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

        {/* ================= SENATE ================= */}
        <section>
          <h2 className="govuk-heading-l">Senate Acts</h2>

          <p className="govuk-body">
            Senate-originated Acts will appear here soon.
          </p>

          <div className="govuk-inset-text">
            Coming soon — Senate legislative database is being populated.
          </div>
        </section>

        <GovUKFeedback />
      </main>
    </div>
  );
}