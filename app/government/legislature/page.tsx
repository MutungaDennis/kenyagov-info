// app/government/legislature/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import ParliamentExplainer from "@/components/hansard/ParliamentExplainer";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata = {
  title: "Parliament of Kenya",
  description:
    "Understand the National Assembly and Senate, read Hansard debates, track bills and questions, and follow what your MP or Senator says in the House.",
};

export default function LegislaturePage() {
  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Legislature" },
        ]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Parliament of Kenya</h1>

          <p className="govuk-body-l">
            Understand how the National Assembly and Senate work, read what was
            said in the House, and follow bills and questions — so you can hold
            your representatives to account.
          </p>

          <p className="govuk-body">
            Parliament makes laws, approves the national budget, and oversees
            the Executive. It has two houses with different roles.
          </p>

          <ParliamentExplainer variant="hub" />

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-m">The two houses</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <h3 className="govuk-heading-s">National Assembly</h3>
              <p className="govuk-body-s">
                Makes most national laws, controls national revenue and
                expenditure, and holds the President and Cabinet to account.
                Includes constituency MPs, women representatives and nominated
                members.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link
                    href="/government/legislature/national-assembly/members"
                    className="govuk-link"
                  >
                    National Assembly members
                  </Link>
                </li>
                <li>
                  <Link
                    href="/government/legislature/hansard/national-assembly"
                    className="govuk-link"
                  >
                    National Assembly Hansard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="govuk-grid-column-one-half">
              <h3 className="govuk-heading-s">Senate</h3>
              <p className="govuk-body-s">
                Protects counties and devolution: considers bills affecting
                counties, oversight of national revenue to counties, and related
                accountability.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link
                    href="/government/legislature/senate/senators"
                    className="govuk-link"
                  >
                    Senators
                  </Link>
                </li>
                <li>
                  <Link
                    href="/government/legislature/hansard/senate"
                    className="govuk-link"
                  >
                    Senate Hansard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-m">Hansard and debates</h2>
          <p className="govuk-body">
            Hansard is the written record of what is said in the chamber. On
            this site, sittings are structured so you can follow speakers in
            order and open a member&apos;s full contribution history.
          </p>
          <ul className="govuk-list govuk-list--spaced">
            <li>
              <Link
                href="/government/legislature/hansard/national-assembly"
                className="govuk-link govuk-!-font-weight-bold"
              >
                National Assembly debates
              </Link>
              <p className="govuk-body-s govuk-!-margin-top-1">
                Browse sittings by date; open a day to read contributions.
              </p>
            </li>
            <li>
              <Link
                href="/government/legislature/hansard/senate"
                className="govuk-link govuk-!-font-weight-bold"
              >
                Senate debates
              </Link>
              <p className="govuk-body-s govuk-!-margin-top-1">
                Structured Senate sittings published on CitizenGuide.
              </p>
            </li>
            <li>
              <Link
                href="/government/legislature/hansard/members"
                className="govuk-link govuk-!-font-weight-bold"
              >
                Find an MP or Senator — track contributions
              </Link>
              <p className="govuk-body-s govuk-!-margin-top-1">
                Search by name, constituency, county or party. View pulse and
                speeches while they are in office.
              </p>
            </li>
          </ul>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-m">Bills, questions and papers</h2>
          <p className="govuk-body">
            Speeches are only part of the story. Use the trackers for law-making
            and oversight business.
          </p>
          <ul className="govuk-list govuk-list--spaced">
            <li>
              <Link
                href="/government/legislature/tracker/bills"
                className="govuk-link"
              >
                Bills tracker
              </Link>
              <p className="govuk-body-s govuk-!-margin-top-1">
                Track bills from first reading toward assent.
              </p>
            </li>
            <li>
              <Link
                href="/government/legislature/tracker/questions"
                className="govuk-link"
              >
                Parliamentary questions
              </Link>
              <p className="govuk-body-s govuk-!-margin-top-1">
                Questions to the President and Cabinet Secretaries.
              </p>
            </li>
            <li>
              <Link
                href="/government/legislature/tracker/papers"
                className="govuk-link"
              >
                Tabled papers
              </Link>
              <p className="govuk-body-s govuk-!-margin-top-1">
                Reports and documents laid before the House.
              </p>
            </li>
          </ul>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-m">What Parliament does</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>makes laws for the Republic</li>
            <li>approves the national budget and revenue allocation</li>
            <li>oversees the Executive and public spending</li>
            <li>
              can remove the President or Deputy President through impeachment
              processes set out in the Constitution
            </li>
          </ul>
          <p className="govuk-body">
            <Link href="/constitution" className="govuk-link">
              Constitution of Kenya 2010
            </Link>
            {" · "}
            <Link href="/how-government-works" className="govuk-link">
              How government works
            </Link>
          </p>
        </div>

        <div className="govuk-grid-column-one-third">
          <aside className="govuk-!-display-none-print" role="complementary">
            <h2 className="govuk-heading-m">Start here</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link
                  href="/find-your-representatives"
                  className="govuk-link govuk-!-font-weight-bold"
                >
                  Find your representatives
                </Link>
              </li>
              <li>
                <Link
                  href="/government/legislature/hansard/members"
                  className="govuk-link"
                >
                  Search Hansard members
                </Link>
              </li>
              <li>
                <Link
                  href="/government/legislature/hansard/national-assembly"
                  className="govuk-link"
                >
                  Latest National Assembly sittings
                </Link>
              </li>
              <li>
                <Link href="/open-data" className="govuk-link">
                  Open data
                </Link>
              </li>
            </ul>

            <h2 className="govuk-heading-m">Related</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link
                  href="/government/counties/wards"
                  className="govuk-link"
                >
                  Constituencies and wards
                </Link>
              </li>
              <li>
                <Link href="/government/people" className="govuk-link">
                  Government officials
                </Link>
              </li>
              <li>
                <Link href="/elections" className="govuk-link">
                  Elections
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
