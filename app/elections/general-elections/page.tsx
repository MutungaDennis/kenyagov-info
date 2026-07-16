// app/elections/general-elections/page.tsx
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import { Metadata } from "next";

export const revalidate = 86400;
export const dynamic = "force-static";


export const metadata: Metadata = {
  title: "General Elections in Kenya | Elections | CitizenGuide.KE",
  description:
    "Information about Kenya's General Elections including voter registration, voting process, timelines, and legal framework.",
};

export default function GeneralElectionsPage() {
  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "General elections", href: "/elections/general-elections" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">General elections in Kenya</h1>

            {/* Next election panel */}
            <div className="app-next-election-panel govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Next general election</h2>
              <p className="govuk-heading-l govuk-!-margin-bottom-1">August 2027</p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                Held on the second Tuesday of August every 5 years, as required by the Constitution of Kenya.
              </p>
            </div>

            <p className="govuk-body-l">
              General elections in Kenya are run by the{' '}
              <Link href="/government/institutions/iebc" className="govuk-link">
                Independent Electoral and Boundaries Commission (IEBC)
              </Link>
              . They determine who will serve as{' '}
              <Link href="/government/presidency" className="govuk-link">
                President
              </Link>
              ,{' '}
              <Link href="/government/legislature/national-assembly/members" className="govuk-link">
                Members of Parliament
              </Link>
              ,{' '}
              <Link href="/government/legislature/senate/senators" className="govuk-link">
                Senators
              </Link>
              ,{' '}
              <Link href="/government/counties/governors" className="govuk-link">
                Governors
              </Link>
              , and{' '}
              <Link href="/government/counties" className="govuk-link">
                County Assembly representatives
              </Link>
              .
            </p>

            {/* Table of contents */}
            <nav className="govuk-!-margin-bottom-8" aria-label="Page contents">
              <h2 className="govuk-heading-s">Contents</h2>
              <ol className="govuk-list govuk-list--spaced">
                <li><a className="govuk-link" href="#voter-registration">Voter registration</a></li>
                <li><a className="govuk-link" href="#election-timelines">Election timelines</a></li>
                <li><a className="govuk-link" href="#candidates-parties">Candidates and political parties</a></li>
                <li><a className="govuk-link" href="#voting-process">How voting works</a></li>
                <li><a className="govuk-link" href="#results">Results and transparency</a></li>
                <li><a className="govuk-link" href="#legal-framework">Legal framework</a></li>
              </ol>
            </nav>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Voter Registration */}
            <section id="voter-registration" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Voter registration</h2>
              <p className="govuk-body">
                To vote, you must be registered with IEBC and have a valid national ID card or passport.
              </p>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">How to register as a voter</span>
                </summary>
                <div className="govuk-details__text">
                  <ol className="govuk-list govuk-list--number">
                    <li>
                      Visit an{' '}
                      <Link href="/elections/iebc-offices" className="govuk-link">
                        IEBC registration centre
                      </Link>
                    </li>
                    <li>Present your national ID or passport</li>
                    <li>Provide biometric data (fingerprints and photograph)</li>
                    <li>
                      Confirm your{' '}
                      <Link href="/elections/polling-stations" className="govuk-link">
                        polling station
                      </Link>
                    </li>
                    <li>Receive a voter acknowledgement slip</li>
                  </ol>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Check your voter registration status</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    You can verify your registration through the{' '}
                    <a 
                      href="https://verify.iebc.or.ke/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="govuk-link"
                    >
                      IEBC voter verification system
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                        style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span className="govuk-visually-hidden"> (opens in a new tab)</span>
                    </a>
                    .
                  </p>
                </div>
              </details>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Election Timelines */}
            <section id="election-timelines" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Election timelines</h2>
              <p className="govuk-body">
                Key milestones in the general election process:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>voter registration updates and verification</li>
                <li>candidate nominations by political parties</li>
                <li>IEBC clearance of candidates</li>
                <li>campaign period (regulated by law)</li>
                <li>election day (second Tuesday of August)</li>
                <li>announcement of results</li>
              </ul>
              <p className="govuk-body-s govuk-!-margin-top-4">
                Election laws must be enacted or reviewed at least one year before a general election.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Candidates & Parties */}
            <section id="candidates-parties" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Candidates and political parties</h2>
              <p className="govuk-body">
                Kenya has a multi-party system. Candidates can run through registered political parties or as independents.
              </p>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Offices elected during general elections</span>
                </summary>
                <div className="govuk-details__text">
                  <ul className="govuk-list govuk-list--spaced">
                    <li>
                      <Link href="/government/presidency" className="govuk-link">
                        President
                      </Link>
                    </li>
                    <li>
                      <Link href="/government/legislature/national-assembly/members" className="govuk-link">
                        Members of the National Assembly
                      </Link>
                    </li>
                    <li>
                      <Link href="/government/legislature/senate/senators" className="govuk-link">
                        Senators
                      </Link>
                    </li>
                    <li>
                      <Link href="/government/counties/governors" className="govuk-link">
                        County Governors
                      </Link>
                    </li>
                    <li>
                      <Link href="/government/counties" className="govuk-link">
                        Members of County Assemblies (MCAs)
                      </Link>
                    </li>
                  </ul>
                </div>
              </details>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Eligibility requirements for candidates</span>
                </summary>
                <div className="govuk-details__text">
                  <ul className="govuk-list govuk-list--bullet">
                    <li>must be a Kenyan citizen</li>
                    <li>must be a registered voter</li>
                    <li>must meet IEBC clearance requirements</li>
                    <li>must not have disqualifying criminal convictions</li>
                  </ul>
                </div>
              </details>

              <p className="govuk-body">
                See the full list of{' '}
                <Link href="/elections/political-parties" className="govuk-link">
                  registered political parties
                </Link>
                {' '}and{' '}
                <Link href="/elections/coalitions" className="govuk-link">
                  political coalitions
                </Link>
                .
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Voting Process */}
            <section id="voting-process" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">How voting works</h2>
              <ol className="govuk-list govuk-list--number">
                <li>Go to your assigned polling station</li>
                <li>Present your ID or passport</li>
                <li>Complete biometric verification</li>
                <li>Receive ballot papers</li>
                <li>Vote in the secret ballot booth</li>
                <li>Place ballots in the correct boxes</li>
                <li>Have your finger marked with indelible ink to prevent double voting</li>
              </ol>

              <h3 className="govuk-heading-s">Presidential election results</h3>
              <p className="govuk-body">
                A presidential candidate must win:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>more than half of all valid votes cast (50% + 1)</li>
                <li>at least 25% of valid votes in at least half of all counties</li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Results */}
            <section id="results" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Results and transparency</h2>
              <p className="govuk-body">
                IEBC is responsible for tallying and announcing official results. Results are transmitted from polling stations to constituency and national tallying centres using statutory forms:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><strong>Form 34A</strong> — polling station results</li>
                <li><strong>Form 34B</strong> — constituency tally</li>
                <li><strong>Form 34C</strong> — national presidential results</li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Legal Framework */}
            <section id="legal-framework" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Legal framework</h2>
              <p className="govuk-body">
                Elections in Kenya are governed by the{' '}
                <Link href="/constitution" className="govuk-link">
                  Constitution of Kenya (2010)
                </Link>
                {' '}and supporting laws.
              </p>

              <h3 className="govuk-heading-m">Constitutional provisions</h3>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <Link href="/constitution/chapter/7/article/38" className="govuk-link">
                    Article 38 — Political rights
                  </Link>
                  <br />
                  <span className="govuk-body-s">Guarantees every citizen the right to free, fair and regular elections.</span>
                </li>
                <li>
                  <Link href="/constitution/chapter/7/article/81" className="govuk-link">
                    Article 81 — General principles of the electoral system
                  </Link>
                  <br />
                  <span className="govuk-body-s">Requires elections to be free from violence, with fair representation and gender equity.</span>
                </li>
                <li>
                  <Link href="/constitution/chapter/7/article/82" className="govuk-link">
                    Article 82 — Legislation on elections
                  </Link>
                  <br />
                  <span className="govuk-body-s">Directs Parliament to enact laws on voter registration, boundaries and election procedures.</span>
                </li>
                <li>
                  <Link href="/constitution/chapter/7/article/86" className="govuk-link">
                    Article 86 — Voting
                  </Link>
                  <br />
                  <span className="govuk-body-s">Requires voting to be simple, accurate, verifiable, secure, accountable and transparent.</span>
                </li>
                <li>
                  <Link href="/constitution/chapter/7/article/88" className="govuk-link">
                    Article 88 — IEBC
                  </Link>
                  <br />
                  <span className="govuk-body-s">Establishes the{' '}
                    <Link href="/government/institutions/iebc" className="govuk-link">
                      Independent Electoral and Boundaries Commission
                    </Link>
                    .
                  </span>
                </li>
                <li>
                  <Link href="/constitution/chapter/8/article/101" className="govuk-link">
                    Article 101 — Election of members of Parliament
                  </Link>
                  <br />
                  <span className="govuk-body-s">Sets parliamentary elections for the second Tuesday of August every 5 years.</span>
                </li>
                <li>
                  <Link href="/constitution/chapter/9/article/136" className="govuk-link">
                    Article 136 — Election of the President
                  </Link>
                  <br />
                  <span className="govuk-body-s">Establishes presidential election timing and the 50% + 1 requirement.</span>
                </li>
                <li>
                  <Link href="/constitution/chapter/11/article/177" className="govuk-link">
                    Articles 177 and 180 — County elections
                  </Link>
                  <br />
                  <span className="govuk-body-s">Legal basis for election of Governors and Members of County Assemblies.</span>
                </li>
              </ul>

              <h3 className="govuk-heading-m govuk-!-margin-top-6">Acts of Parliament</h3>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <strong>Elections Act (2011)</strong>
                  <br />
                  <span className="govuk-body-s">Governs voter registration, candidate nominations, election procedures and dispute resolution. Administered by IEBC.</span>
                </li>
                <li>
                  <strong>Political Parties Act</strong>
                  <br />
                  <span className="govuk-body-s">Regulates formation, registration, funding and internal democracy of political parties. Administered by the{' '}
                    <Link href="/government/institutions/orpp" className="govuk-link">
                      Office of the Registrar of Political Parties (ORPP)
                    </Link>
                    .
                  </span>
                </li>
                <li>
                  <strong>IEBC Act</strong>
                  <br />
                  <span className="govuk-body-s">Defines the powers, structure and mandate of the Independent Electoral and Boundaries Commission.</span>
                </li>
                <li>
                  <strong>Election Campaign Financing Act</strong>
                  <br />
                  <span className="govuk-body-s">Regulates campaign spending limits and requires disclosure of political donations.</span>
                </li>
              </ul>

              <h3 className="govuk-heading-m govuk-!-margin-top-6">Regulations and codes</h3>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <strong>Electoral Code of Conduct Regulations</strong>
                  <br />
                  <span className="govuk-body-s">Enforces ethical conduct during campaigns, including prohibitions on bribery, violence and hate speech.</span>
                </li>
                <li>
                  <strong>IEBC Regulations and Guidelines</strong>
                  <br />
                  <span className="govuk-body-s">Operational rules covering voting procedures, tallying and result transmission.</span>
                </li>
              </ul>

              <div className="govuk-inset-text govuk-!-margin-top-6">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  These laws form the legal foundation of Kenya's electoral system and may be amended by Parliament or interpreted by the courts.
                </p>
              </div>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <LastUpdated published="2026-01-01" lastUpdated="2026-07-02" />

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/elections/political-parties" className="govuk-link">
                      Political parties
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections/coalitions" className="govuk-link">
                      Political coalitions
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections/registered-voters" className="govuk-link">
                      Registered voters and polling stations
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections/iebc-offices" className="govuk-link">
                      IEBC constituency offices
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/institutions/iebc" className="govuk-link">
                      Independent Electoral and Boundaries Commission
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/institutions/orpp" className="govuk-link">
                      Office of the Registrar of Political Parties
                    </Link>
                  </li>
                  <li>
                    <Link href="/constitution" className="govuk-link">
                      Constitution of Kenya
                    </Link>
                  </li>
                  <li>
                    <Link href="/elections" className="govuk-link">
                      All elections
                    </Link>
                  </li>
                </ul>
              </nav>

              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  IEBC is responsible for managing elections and referenda in Kenya, and for registering voters.
                </p>
              </div>
            </aside>
          </div>
        </div>
      

      <style>{`
        .app-next-election-panel {
          background-color: #00703c;
          color: #ffffff;
          padding: 20px;
          border-left: 5px solid #005a30;
        }

        .app-next-election-panel h2,
        .app-next-election-panel p {
          color: #ffffff;
        }

        .app-next-election-panel .govuk-heading-l {
          color: #ffffff;
          font-size: 2rem;
          line-height: 1.2;
        }

        .app-next-election-panel .govuk-body {
          color: #ffffff;
        }
      `}</style>
    
  
    </>
);
}