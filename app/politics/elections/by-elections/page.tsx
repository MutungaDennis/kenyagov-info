import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import LastUpdated from "@/components/govuk/LastUpdated";

export const metadata = {
  title: "By-Elections in Kenya",
  description:
    "Information on upcoming, ongoing, and past by-elections in Kenya including parliamentary and county ward seats.",
};

export default function ByElectionsPage() {
  return (
    <main className="govuk-width-container">

      {/* BREADCRUMBS */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Politics", href: "/politics" },
          { text: "Elections", href: "/politics/elections" },
          { text: "By-elections", href: "/politics/elections/by-elections" },
        ]}
      />

      {/* TITLE */}
      <h1 className="govuk-heading-xl">By-Elections in Kenya</h1>

      <p className="govuk-body-l">
        By-elections are held when a seat in Parliament or County Assembly becomes vacant due to
        death, resignation, appointment, or court nullification.
      </p>

      {/* UPCOMING BY-ELECTION */}
      <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6">
        <h2 className="govuk-panel__title">Upcoming By-Election</h2>
        <div className="govuk-panel__body">
          Ol Kalou Constituency, Nyandarua County
          <br />
          <strong>Thursday, 16 July 2026</strong>
          <br />
          Member of National Assembly
        </div>
      </div>

      {/* RECENTLY CONCLUDED */}
      <section className="govuk-!-margin-top-6">
        <h2 className="govuk-heading-l">Recently Concluded By-Elections</h2>

        <p className="govuk-body">
          Multiple by-elections were held on <strong>14 May 2026</strong> to fill vacancies
          resulting from deaths of elected leaders.
        </p>

        <ul className="govuk-list govuk-list--bullet">
          <li>
            <strong>Emurua Dikirr Constituency (Narok County)</strong> — Member of National Assembly seat
          </li>
          <li>
            <strong>Porro Ward (Samburu County)</strong> — Member of County Assembly (MCA)
          </li>
          <li>
            <strong>Endo Ward (Elgeyo Marakwet County)</strong> — Member of County Assembly (MCA)
          </li>
        </ul>
      </section>

      {/* PARLIAMENTARY BY-ELECTIONS */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">
          Parliamentary By-Elections (National Assembly & Senate)
        </h2>

        <p className="govuk-body">
          These by-elections occur when a Member of Parliament or Senator vacates office due to
          death, appointment, resignation, or court ruling.
        </p>

        <details className="govuk-details" open>
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">2025–2026 Parliamentary By-Elections</span>
          </summary>

          <div className="govuk-details__text">
            <ul className="govuk-list govuk-list--bullet">
              <li>Kasipul Constituency (2025) — triggered by death of MP Charles Ong’ondo Were</li>
              <li>Baringo North Constituency (2025) — death of MP William Cheptumo</li>
              <li>Malava Constituency (2025) — death of MP Malulu Injendi</li>
              <li>Banissa Constituency (2023) — death of MP Kulow Maalim Hassan</li>
              <li>Isiolo South Constituency (2026) — death of MP Tubi Bidu Mohamed</li>
              <li>Ol Kalou Constituency (2026) — vacancy following death of MP David Njuguna Kiaraho</li>
            </ul>
          </div>
        </details>
      </section>

      {/* COUNTY WARD BY-ELECTIONS */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">
          County Assembly (MCA) By-Elections
        </h2>

        <p className="govuk-body">
          Ward-level by-elections are common and occur due to vacancies in County Assemblies.
        </p>

        <details className="govuk-details" open>
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">Recent Ward By-Elections</span>
          </summary>

          <div className="govuk-details__text">
            <ul className="govuk-list govuk-list--bullet">
              <li>Kariobangi North Ward (2025) — Nairobi County</li>
              <li>Chewani Ward (2025) — Tana River County</li>
              <li>Kabuchai Ward (2025) — Bungoma County</li>
              <li>Porro Ward (2026) — Samburu County</li>
              <li>Endo Ward (2026) — Elgeyo Marakwet County</li>
              <li>West Kabras Ward (2026) — Kakamega County</li>
            </ul>
          </div>
        </details>
      </section>

      {/* HISTORICAL OVERVIEW */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Historical By-Elections (2022–2025)</h2>

        <p className="govuk-body">
          Following the 2022 General Election, Kenya held multiple by-elections across Parliament
          and County Assemblies due to vacancies, resignations, and court rulings.
        </p>

        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">Key National By-Elections</span>
          </summary>

          <div className="govuk-details__text">
            <ul className="govuk-list govuk-list--bullet">
              <li>8 Dec 2022 — Bungoma Senatorial race</li>
              <li>5 Jan 2023 — Elgeyo Marakwet Senatorial by-election</li>
              <li>27 Nov 2025 — Major consolidated by-election exercise (24+ seats)</li>
              <li>Magarini Constituency (2025) — court nullification case</li>
            </ul>
          </div>
        </details>
      </section>

      {/* LEGAL BASIS */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Legal Basis for By-Elections</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li>Constitution of Kenya (2010) — Articles 101, 103, 180</li>
          <li>Elections Act (2011)</li>
          <li>IEBC Act</li>
          <li>Political Parties Act (Cap. 7D)</li>
          <li>Electoral Code of Conduct Regulations</li>
        </ul>

        <p className="govuk-body-s govuk-hint">
          IEBC is required to hold a by-election within 90 days of a vacancy being declared.
        </p>
      </section>

      {/* LAST UPDATED */}
      <LastUpdated
        lastUpdated={new Date().toISOString()}
        published={new Date("2026-01-01").toISOString()}
      />

      {/* FEEDBACK */}
      <GovUKFeedback />

    </main>
  );
}