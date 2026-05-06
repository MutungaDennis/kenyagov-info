import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKTable from "@/components/govuk/Table";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function ExecutivePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">The Executive</h1>
            <p className="govuk-body-l">
              The Executive is one of the three arms of government under the Constitution of Kenya 2010. 
              It is headed by the President.
            </p>

            {/* Presidency */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">The Presidency</h2>
            <p className="govuk-body">Office of the President and Deputy President</p>

            <GovUKSummaryList
              items={[
                { key: "Constitutional Role", value: "Head of State and Government, Commander-in-Chief of the Kenya Defence Forces" },
                { key: "Current President", value: <Link href="/executive/president" className="govuk-link">H.E. Dr. William Samoei Ruto</Link> },
                { key: "Current Deputy President", value: <Link href="/executive/deputy-president" className="govuk-link">H.E. Rigathi Gachagua</Link> },
                { key: "Term of Office", value: "Five years, renewable once (maximum two terms)" },
              ]}
            />

            {/* Cabinet Section */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">The Cabinet</h2>
            <p className="govuk-body">
              The Cabinet consists of the President, Deputy President, Cabinet Secretaries and the Attorney General.
            </p>

            <GovUKSummaryList
              items={[
                { key: "Number of Cabinet Secretaries", value: "Between 14 and 22 (as per Article 152 of the Constitution)" },
                { key: "Role of Cabinet Secretaries", value: "Ministers responsible for the day-to-day running of government ministries and policy implementation" },
                { key: "Attorney General", value: <Link href="/executive/attorney-general" className="govuk-link">Hon. Dorcas Agik Oduor, SC</Link> },
              ]}
            />

            <h3 className="govuk-heading-m govuk-!-margin-top-9">Current Cabinet Secretaries (2026)</h3>

            <GovUKTable
              caption="List of Cabinet Secretaries and Ministries"
              headers={[
                { text: "No." },
                { text: "Ministry / Docket" },
                { text: "Cabinet Secretary" },
              ]}
              rows={[
                { cells: ["1", <Link key="m1" href="/executive/ministries/foreign-affairs" className="govuk-link">Prime Cabinet Secretary & Foreign Affairs</Link>, <Link key="c1" href="/executive/cs/musalia-mudavadi" className="govuk-link">Hon. Musalia Mudavadi</Link>] },
                { cells: ["2", <Link key="m2" href="/executive/ministries/interior" className="govuk-link">Interior & National Administration</Link>, <Link key="c2" href="/executive/cs/kipchumba-murkomen" className="govuk-link">Hon. Kipchumba Murkomen</Link>] },
                { cells: ["3", <Link key="m3" href="/executive/ministries/treasury" className="govuk-link">National Treasury & Economic Planning</Link>, <Link key="c3" href="/executive/cs/john-mbadi" className="govuk-link">Hon. John Mbadi</Link>] },
                { cells: ["4", <Link key="m4" href="/executive/ministries/education" className="govuk-link">Education</Link>, <Link key="c4" href="/executive/cs/julius-ogamba" className="govuk-link">Hon. Julius Migos Ogamba</Link>] },
                { cells: ["5", <Link key="m5" href="/executive/ministries/defence" className="govuk-link">Defence</Link>, <Link key="c5" href="/executive/cs/soipan-tuya" className="govuk-link">Hon. Soipan Tuya</Link>] },
                { cells: ["6", <Link key="m6" href="/executive/ministries/health" className="govuk-link">Health</Link>, <Link key="c6" href="/executive/cs/susan-nakhumicha" className="govuk-link">Hon. Susan Nakhumicha</Link>] },
                { cells: ["7", <Link key="m7" href="/executive/ministries/agriculture" className="govuk-link">Agriculture & Livestock Development</Link>, <Link key="c7" href="/executive/cs/mutahi-kagwe" className="govuk-link">Hon. Mutahi Kagwe</Link>] },
                { cells: ["8", <Link key="m8" href="/executive/ministries/transport" className="govuk-link">Transport & Infrastructure</Link>, <Link key="c8" href="/executive/cs/davis-chirchir" className="govuk-link">Hon. Davis Chirchir</Link>] },
                { cells: ["9", <Link key="m9" href="/executive/ministries/energy" className="govuk-link">Energy & Petroleum</Link>, <Link key="c9" href="/executive/cs/opiyo-wandayi" className="govuk-link">Hon. Opiyo Wandayi</Link>] },
                { cells: ["10", <Link key="m10" href="/executive/ministries/water" className="govuk-link">Water, Sanitation & Irrigation</Link>, <Link key="c10" href="/executive/cs/eric-muuga" className="govuk-link">Hon. Eric Muuga</Link>] },
                { cells: ["11", <Link key="m11" href="/executive/ministries/trade" className="govuk-link">Trade, Investment & Industry</Link>, <Link key="c11" href="/executive/cs/moses-kuria" className="govuk-link">Hon. Moses Kuria</Link>] },
                { cells: ["12", <Link key="m12" href="/executive/ministries/youth" className="govuk-link">Youth Affairs, Sports & Arts</Link>, <Link key="c12" href="/executive/cs/ababu-namwamba" className="govuk-link">Hon. Ababu Namwamba</Link>] },
                { cells: ["13", <Link key="m13" href="/executive/ministries/labour" className="govuk-link">Labour & Social Protection</Link>, <Link key="c13" href="/executive/cs/florence-bore" className="govuk-link">Hon. Florence Bore</Link>] },
                { cells: ["14", <Link key="m14" href="/executive/ministries/environment" className="govuk-link">Environment, Climate Change & Forestry</Link>, <Link key="c14" href="/executive/cs/aden-duale" className="govuk-link">Hon. Aden Duale</Link>] },
                { cells: ["15", <Link key="m15" href="/executive/ministries/tourism" className="govuk-link">Tourism & Wildlife</Link>, <Link key="c15" href="/executive/cs/rebecca-miano" className="govuk-link">Hon. Rebecca Miano</Link>] },
                { cells: ["16", <Link key="m16" href="/executive/ministries/ict" className="govuk-link">Information, Communications & Digital Economy</Link>, <Link key="c16" href="/executive/cs/eliud-owalo" className="govuk-link">Hon. Eliud Owalo</Link>] },
                { cells: ["17", <Link key="m17" href="/executive/ministries/lands" className="govuk-link">Lands, Public Works, Housing & Urban Development</Link>, <Link key="c17" href="/executive/cs/alice-wahome" className="govuk-link">Hon. Alice Wahome</Link>] },
                { cells: ["18", <Link key="m18" href="/executive/ministries/cooperatives" className="govuk-link">Cooperatives & MSMEs</Link>, <Link key="c18" href="/executive/cs/simon-kingara" className="govuk-link">Hon. Simon King’ara</Link>] },
                { cells: ["19", <Link key="m19" href="/executive/ministries/gender" className="govuk-link">Gender, Culture & Equality</Link>, <Link key="c19" href="/executive/cs/aisha-jumwa" className="govuk-link">Hon. Aisha Jumwa</Link>] },
                { cells: ["20", <Link key="m20" href="/executive/ministries/eac" className="govuk-link">East African Community & Regional Development</Link>, <Link key="c20" href="/executive/cs/peninah-malonza" className="govuk-link">Hon. Peninah Malonza</Link>] },
              ]}
            />

            {/* New Bottom Links */}
            <div className="govuk-!-margin-top-6">
              <p className="govuk-body">
                <Link href="/executive/ministries" className="govuk-link">
                  Explore all Ministries →
                </Link>
                &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                <Link href="/executive/cabinet-secretaries" className="govuk-link">
                  Explore all Cabinet Secretaries →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Feedback at the bottom of every page */}
        <GovUKFeedback />
      </main>
    </div>
  );
}