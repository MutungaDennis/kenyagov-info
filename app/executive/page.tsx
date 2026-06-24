'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


export default function ExecutivePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
        ]}
      />

      {/* Reduced padding wrapper to pull layout higher above the fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced from heading-xl to heading-l for strict style guide compliance */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">The Executive</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              The Executive is one of the three constitutional arms of government under Chapter 9 of the Constitution of Kenya. It is responsible for national policy formulation, law enforcement, and public administration.
            </p>

            {/* Section 1: The Presidency */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">The Presidency</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Comprises the Office of the President, the Office of the Deputy President, and assisting executive secretariats.
            </p>

            <GovUKSummaryList
              items={[
                { key: "Constitutional Role", value: "Head of State and Government, Commander-in-Chief of the Kenya Defence Forces" },
                { key: "Current President", value: <Link href="/executive/presidency/president" className="govuk-link govuk-!-font-weight-bold">H.E. Dr. William Samoei Ruto, CGH</Link> },
                { key: "Current Deputy President", value: <Link href="/executive/presidency/deputy-president" className="govuk-link govuk-!-font-weight-bold">H.E. Prof. Kithure Kindiki, EGH</Link> },
                { key: "Term of Office", value: "Five years, renewable once (maximum two terms under Article 136)" },
              ]}
            />

            {/* Direct task router connection to the newly built registers hub */}
            <p className="govuk-body govuk-!-margin-top-3 govuk-!-margin-bottom-6">
              <Link href="/executive/presidency" className="govuk-link govuk-!-font-weight-bold">
                View presidency registers, executive orders, and cabinet decisions &rarr;
              </Link>
            </p>

            {/* Section 2: The Cabinet */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">The Cabinet</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              The Cabinet consists of the President, Deputy President, Cabinet Secretaries, and the Attorney-General.
            </p>

            <GovUKSummaryList
              items={[
                { key: "Cabinet Composition", value: "Between 14 and 22 Cabinet Secretaries as per Article 152 of the Constitution" },
                { key: "Primary Function", value: "Advising the President and implementing national government policies and legislative programs" },
                { key: "Attorney-General", value: <Link href="/executive/attorney-general" className="govuk-link govuk-!-font-weight-bold">Hon. Dorcas Agik Oduor, SC</Link> },
              ]}
            />

            <h3 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Current Cabinet Register (2026)</h3>
          </div>
        </div>

        {/* Section 3: Semantic, Mobile Responsive Data Table */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            {/* Mobile Safe Horizontal Scroll Layer Wrapper to ensure full responsiveness */}
            <div className="govuk-!-overflow-x-auto govuk-!-margin-bottom-5">
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">List of national ministries and appointed Cabinet Secretaries.</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header govuk-body-s govuk-!-font-weight-bold" style={{ width: '60px' }}>No.</th>
                    <th scope="col" className="govuk-table__header govuk-body-s govuk-!-font-weight-bold">Ministry / Docket</th>
                    <th scope="col" className="govuk-table__header govuk-body-s govuk-!-font-weight-bold" style={{ width: '280px' }}>Cabinet Secretary</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">1</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/foreign-affairs" className="govuk-link govuk-!-font-weight-bold">Prime Cabinet Secretary & Foreign Affairs</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/musalia-mudavadi" className="govuk-link">Hon. Musalia Mudavadi</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">2</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/interior" className="govuk-link govuk-!-font-weight-bold">Interior & National Administration</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/kipchumba-murkomen" className="govuk-link">Hon. Kipchumba Murkomen</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">3</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/treasury" className="govuk-link govuk-!-font-weight-bold">National Treasury & Economic Planning</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/john-mbadi" className="govuk-link">Hon. John Mbadi</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">4</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/education" className="govuk-link govuk-!-font-weight-bold">Education</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/julius-ogamba" className="govuk-link">Hon. Julius Migos Ogamba</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">5</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/defence" className="govuk-link govuk-!-font-weight-bold">Defence</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/soipan-tuya" className="govuk-link">Hon. Soipan Tuya</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">6</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/health" className="govuk-link govuk-!-font-weight-bold">Health</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/susan-nakhumicha" className="govuk-link">Hon. Susan Nakhumicha</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">7</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/agriculture" className="govuk-link govuk-!-font-weight-bold">Agriculture & Livestock Development</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/mutahi-kagwe" className="govuk-link">Hon. Mutahi Kagwe</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">8</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/transport" className="govuk-link govuk-!-font-weight-bold">Transport & Infrastructure</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/davis-chirchir" className="govuk-link">Hon. Davis Chirchir</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">9</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/energy" className="govuk-link govuk-!-font-weight-bold">Energy & Petroleum</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/opiyo-wandayi" className="govuk-link">Hon. Opiyo Wandayi</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">10</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/water" className="govuk-link govuk-!-font-weight-bold">Water, Sanitation & Irrigation</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/eric-muuga" className="govuk-link">Hon. Eric Muuga</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">11</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/trade" className="govuk-link govuk-!-font-weight-bold">Trade, Investment & Industry</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/moses-kuria" className="govuk-link">Hon. Moses Kuria</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">12</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/youth" className="govuk-link govuk-!-font-weight-bold">Youth Affairs, Sports & Arts</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/ababu-namwamba" className="govuk-link">Hon. Ababu Namwamba</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">13</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/labour" className="govuk-link govuk-!-font-weight-bold">Labour & Social Protection</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/florence-bore" className="govuk-link">Hon. Florence Bore</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">14</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/environment" className="govuk-link govuk-!-font-weight-bold">Environment, Climate Change & Forestry</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/aden-duale" className="govuk-link">Hon. Aden Duale</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">15</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/tourism" className="govuk-link govuk-!-font-weight-bold">Tourism & Wildlife</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/rebecca-miano" className="govuk-link">Hon. Rebecca Miano</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">16</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/ict" className="govuk-link govuk-!-font-weight-bold">Information, Communications & Digital Economy</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/eliud-owalo" className="govuk-link">Hon. Eliud Owalo</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">17</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/lands" className="govuk-link govuk-!-font-weight-bold">Lands, Public Works, Housing & Urban Development</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/alice-wahome" className="govuk-link">Hon. Alice Wahome</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">18</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/cooperatives" className="govuk-link govuk-!-font-weight-bold">Cooperatives & MSMEs</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/simon-kingara" className="govuk-link">Hon. Simon King’ara</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">19</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/gender" className="govuk-link govuk-!-font-weight-bold">Gender, Culture & Equality</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/aisha-jumwa" className="govuk-link">Hon. Aisha Jumwa</Link>
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell govuk-body-s">20</td>
                    <th scope="row" className="govuk-table__header govuk-body-s" >
                      <Link href="/executive/ministries/eac" className="govuk-link govuk-!-font-weight-bold">East African Community & Regional Development</Link>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">
                      <Link href="/executive/cs/peninah-malonza" className="govuk-link">Hon. Peninah Malonza</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Task Links Section */}
            <div className="govuk-!-margin-top-6 govuk-!-margin-bottom-6">
              <p className="govuk-body">
                <Link href="/executive/ministries" className="govuk-link govuk-!-font-weight-bold">
                  Explore all Ministries &rarr;
                </Link>
                &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                <Link href="/executive/cabinet-secretaries" className="govuk-link govuk-!-font-weight-bold">
                  Explore all Cabinet Secretaries &rarr;
                </Link>
              </p>
            </div>

            
          </div>
        </div>
      </main>
    </div>
  );
}
