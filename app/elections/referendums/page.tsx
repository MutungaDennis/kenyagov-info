import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import Link from "next/link";

export default function ReferendumsPage() {
  return (
    <>
    

      {/* BREADCRUMBS */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "Elections", href: "/elections" },
          { text: "Referendums" },
        ]}
      />

      {/* TITLE */}
      <h1 className="govuk-heading-xl">Referendums in Kenya</h1>

      <p className="govuk-body-l">
        A referendum is a national vote where citizens decide directly on proposed changes to the Constitution.
        It is only required for major constitutional amendments under Article 255 of the Constitution of Kenya.
      </p>

      {/* ACTION BANNER */}
      <div className="govuk-inset-text">
        <p className="govuk-body">
          Before any referendum, ensure you are registered as a voter with the{" "}
          <Link className="govuk-link" href="https://www.iebc.or.ke">
            Independent Electoral and Boundaries Commission (IEBC)
          </Link>.
        </p>
      </div>

      {/* PART 1: WHY REFERENDUMS ARE DONE */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Why referendums are held</h2>

        <p className="govuk-body">
          Referendums are required when proposed constitutional amendments affect key national principles.
        </p>

        <ul className="govuk-list govuk-list--bullet">
          <li>Change of sovereignty or independence of Kenya</li>
          <li>Changes to the Bill of Rights</li>
          <li>Changes to the territory of Kenya</li>
          <li>Changes to devolution structure</li>
          <li>Changes to term limits of the President</li>
          <li>Changes to independence of Judiciary or constitutional commissions</li>
          <li>Changes to parliamentary structure or national governance framework</li>
        </ul>

        <p className="govuk-body">
          A referendum passes if it receives a <strong>simple majority (50% + 1)</strong> AND at least
          <strong> 20% of registered voters in at least half of the 47 counties</strong> approve it.
        </p>
      </section>

      {/* PART 2: 2010 REFERENDUM */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">The 2010 constitutional referendum</h2>

        <p className="govuk-body">
          Kenya adopted its current Constitution on 4 August 2010 after a national referendum.
        </p>

        <div className="govuk-table__wrapper">
          <table className="govuk-table">
            <thead>
              <tr>
                <th className="govuk-table__header">Choice</th>
                <th className="govuk-table__header">Votes</th>
                <th className="govuk-table__header">Percentage</th>
                <th className="govuk-table__header">Outcome</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="govuk-table__cell">Yes (Green)</td>
                <td className="govuk-table__cell">6,092,593</td>
                <td className="govuk-table__cell">68.55%</td>
                <td className="govuk-table__cell">Passed</td>
              </tr>
              <tr>
                <td className="govuk-table__cell">No (Red)</td>
                <td className="govuk-table__cell">2,795,059</td>
                <td className="govuk-table__cell">31.45%</td>
                <td className="govuk-table__cell">Rejected</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="govuk-body">
          The referendum introduced devolution, strengthened the Bill of Rights, and restructured executive authority.
        </p>
      </section>

      {/* PART 3: OTHER REFERENDUM INITIATIVES */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Other referendum initiatives</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li>
            <strong>Okoa Kenya Initiative (2014–2016):</strong> Failed at signature verification stage.
          </li>
          <li>
            <strong>Punguza Mizigo Bill (2019):</strong> Did not meet county approval threshold.
          </li>
          <li>
            <strong>Building Bridges Initiative (BBI 2020–2022):</strong> Declared unconstitutional by the Supreme Court.
          </li>
        </ul>
      </section>

      {/* PART 4: HOW REFERENDUMS WORK */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">How a referendum is conducted</h2>

        <ol className="govuk-list govuk-list--number">
          <li>Proposal is initiated by Parliament or citizens (popular initiative)</li>
          <li>At least 1 million voter signatures are collected (if citizen-led)</li>
          <li>IEBC verifies signatures and voter registration</li>
          <li>At least 24 County Assemblies approve the proposal</li>
          <li>Parliament debates and votes on the bill</li>
          <li>IEBC issues a referendum gazette notice</li>
          <li>Citizens vote in a national ballot</li>
        </ol>
      </section>

      {/* LEGAL FRAMEWORK */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Legal framework</h2>

        <p className="govuk-body">
          Referendums in Kenya are governed by constitutional and statutory law.
        </p>

        <h3 className="govuk-heading-m">Constitution of Kenya (2010)</h3>
        <ul className="govuk-list govuk-list--bullet">
          <li>
            <Link className="govuk-link" href="#">
              Article 38 – Political Rights
            </Link>
          </li>
          <li>
            <Link className="govuk-link" href="#">
              Article 81 – Electoral principles (fairness, transparency, inclusivity)
            </Link>
          </li>
          <li>
            <Link className="govuk-link" href="#">
              Article 82 – Election legislation
            </Link>
          </li>
          <li>
            <Link className="govuk-link" href="#">
              Article 86 – Voting standards
            </Link>
          </li>
          <li>
            <Link className="govuk-link" href="#">
              Article 88 – IEBC mandate
            </Link>
          </li>
          <li>
            <Link className="govuk-link" href="#">
              Article 255 – Referendum triggers
            </Link>
          </li>
        </ul>

        <h3 className="govuk-heading-m">Statutory framework</h3>
        <ul className="govuk-list govuk-list--bullet">
          <li><Link className="govuk-link" href="#">Elections Act (2011)</Link></li>
          <li><Link className="govuk-link" href="#">IEBC Act</Link></li>
          <li><Link className="govuk-link" href="#">Political Parties Act (Cap. 7D)</Link></li>
          <li><Link className="govuk-link" href="#">Election Campaign Financing Act</Link></li>
          <li><Link className="govuk-link" href="#">Electoral Code of Conduct</Link></li>
        </ul>
      </section>

      {/* LAST UPDATED (MUST COME BEFORE FEEDBACK) */}
      <LastUpdated
        lastUpdated={new Date().toISOString()}
        published={new Date().toISOString()}
      />

      {/* FEEDBACK */}

    
  
    </>
);
}