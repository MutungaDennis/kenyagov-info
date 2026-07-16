import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Find your representatives",
  description:
    "How to find your MP, senator, woman representative, governor and MCA in Kenya using CitizenGuide.KE directories.",
};

export default function FindYourRepresentativesPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Find your representatives" },
        ]}
        caption="Democracy and participation"
        title="Find your representatives"
        lead="Kenyan citizens are represented at national and county levels. Use the directories below to look up current office holders. Confirm critical details with IEBC or official parliamentary and county sources."
      
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Who represents you</h2>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">
              Common elected roles
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  Role
                </th>
                <th scope="col" className="govuk-table__header">
                  Area
                </th>
                <th scope="col" className="govuk-table__header">
                  Where to look
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Member of Parliament (MP)
                </th>
                <td className="govuk-table__cell">Constituency</td>
                <td className="govuk-table__cell">
                  <Link
                    href="/government/legislature/national-assembly/members"
                    className="govuk-link"
                  >
                    National Assembly members
                  </Link>
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Woman Representative
                </th>
                <td className="govuk-table__cell">County</td>
                <td className="govuk-table__cell">
                  <Link
                    href="/government/legislature/national-assembly/members"
                    className="govuk-link"
                  >
                    National Assembly members
                  </Link>
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Senator
                </th>
                <td className="govuk-table__cell">County</td>
                <td className="govuk-table__cell">
                  <Link
                    href="/government/legislature/senate/senators"
                    className="govuk-link"
                  >
                    Senators
                  </Link>
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Governor
                </th>
                <td className="govuk-table__cell">County</td>
                <td className="govuk-table__cell">
                  <Link
                    href="/government/counties/governors"
                    className="govuk-link"
                  >
                    Governors
                  </Link>
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  MCA
                </th>
                <td className="govuk-table__cell">Ward</td>
                <td className="govuk-table__cell">
                  <Link
                    href="/government/counties/wards"
                    className="govuk-link"
                  >
                    Wards
                  </Link>
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  President
                </th>
                <td className="govuk-table__cell">National</td>
                <td className="govuk-table__cell">
                  <Link href="/government/presidency" className="govuk-link">
                    The Presidency
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>

          <h2 className="govuk-heading-l">How to look someone up</h2>
          <ol className="govuk-list govuk-list--number">
            <li>
              Know your <strong>county</strong>, and if possible your{" "}
              <strong>constituency</strong> and <strong>ward</strong>.
            </li>
            <li>
              Use the ward and county pages to understand local units:{" "}
              <Link href="/government/counties" className="govuk-link">
                counties
              </Link>
              ,{" "}
              <Link href="/government/counties/wards" className="govuk-link">
                wards
              </Link>
              .
            </li>
            <li>
              Search the{" "}
              <Link href="/government/people" className="govuk-link">
                government officials directory
              </Link>{" "}
              by name or organisation.
            </li>
            <li>
              For elections data and polling stations, use the{" "}
              <Link href="/elections" className="govuk-link">
                elections section
              </Link>
              .
            </li>
          </ol>

          <h2 className="govuk-heading-l">What representatives can help with</h2>
          <p className="govuk-body">
            Elected leaders can raise issues, advocate for communities and
            participate in law-making or county assembly business. They do not
            replace formal applications for IDs, passports, tax or court cases.
          </p>
          <p className="govuk-body">
            For service applications, use{" "}
            <Link href="/ecitizen" className="govuk-link">
              eCitizen
            </Link>
            , agency portals or{" "}
            <Link href="/huduma-centres" className="govuk-link">
              Huduma Centres
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Appointed officials</h2>
          <p className="govuk-body">
            Cabinet Secretaries, principal secretaries, commissioners and agency
            heads are usually appointed rather than elected. Find them via:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link href="/government/cabinet" className="govuk-link">
                The Cabinet
              </Link>
            </li>
            <li>
              <Link href="/government/commissions" className="govuk-link">
                Commissions
              </Link>
            </li>
            <li>
              <Link href="/government/institutions" className="govuk-link">
                Institutions
              </Link>
            </li>
          </ul>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              After elections or by-elections, updates can take time to appear
              everywhere. Prefer IEBC-declared results and official Gazette
              notices for legal certainty.
            </p>
          </div>
        </div>

        <RelatedNav
          links={[
            { text: "How government works", href: "/how-government-works" },
            { text: "Elections", href: "/elections" },
            { text: "Contact government", href: "/contact-government" },
            { text: "All officials A–Z", href: "/government/people" },
            { text: "County governments", href: "/government/counties" },
          ]}
        />
      </div>
    </>
  );
}
