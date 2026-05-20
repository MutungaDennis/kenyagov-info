import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import LastUpdated from "@/components/govuk/LastUpdated";

export const metadata = {
  title: "General Elections in Kenya",
  description:
    "Information about Kenya's General Elections including voter registration, voting process, timelines, and legal framework.",
};

function getNextGeneralElectionDate() {
  // Kenya general elections: held every 5 years (next expected 2027)
  // Constitution: second Tuesday of August every 5 years
  const year = 2027;
  return `August ${year}`;
}

export default function GeneralElectionsPage() {
  const nextElection = getNextGeneralElectionDate();

  return (
    <main className="govuk-width-container">
      {/* BREADCRUMBS */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Politics", href: "/politics" },
          { text: "Elections", href: "/politics/elections" },
          { text: "General Elections", href: "/politics/elections/general" },
        ]}
      />

      {/* TITLE */}
      <h1 className="govuk-heading-xl">General Elections in Kenya</h1>

      {/* NEXT ELECTION CARD */}
      <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6">
        <h2 className="govuk-panel__title">Next General Election</h2>
        <div className="govuk-panel__body">
          {nextElection}
          <br />
          <span className="govuk-body-s">
            Held on the second Tuesday of August every 5 years (Constitution of Kenya, 2010)
          </span>
        </div>
      </div>

      {/* INTRO */}
      <p className="govuk-body-l">
        General Elections in Kenya are conducted by the Independent Electoral and
        Boundaries Commission (IEBC) and determine the President, Members of
        Parliament, Governors, and County Assembly representatives.
      </p>

      {/* KEY SECTIONS GRID */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">

          {/* VOTER REGISTRATION */}
          <section className="govuk-!-margin-top-6">
            <h2 className="govuk-heading-l">Voter Registration</h2>

            <p className="govuk-body">
              To vote, citizens must be registered with IEBC and possess a valid
              National ID or passport.
            </p>

            <div className="govuk-accordion" data-module="govuk-accordion" id="voter-registration">
              <div className="govuk-accordion__section">
                <div className="govuk-accordion__section-header">
                  <h3 className="govuk-accordion__section-heading">
                    <span className="govuk-accordion__section-button">
                      How to register as a voter
                    </span>
                  </h3>
                </div>
                <div className="govuk-accordion__section-content">
                  <ol className="govuk-list govuk-list--number">
                    <li>Visit an IEBC registration center</li>
                    <li>Present your National ID or passport</li>
                    <li>Provide biometric data (fingerprints & photo)</li>
                    <li>Confirm polling station</li>
                    <li>Receive voter acknowledgment slip</li>
                  </ol>
                </div>
              </div>

              <div className="govuk-accordion__section">
                <div className="govuk-accordion__section-header">
                  <h3 className="govuk-accordion__section-heading">
                    <span className="govuk-accordion__section-button">
                      Check voter registration status
                    </span>
                  </h3>
                </div>
                <div className="govuk-accordion__section-content">
                  <p className="govuk-body">
                    Citizens can verify registration status through IEBC voter verification
                    systems or SMS services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ELECTION TIMELINES */}
          <section className="govuk-!-margin-top-9">
            <h2 className="govuk-heading-l">Election Timelines & Key Milestones</h2>

            <ul className="govuk-list govuk-list--bullet">
              <li>Voter registration updates and verification</li>
              <li>Candidate nominations by political parties</li>
              <li>IEBC clearance of candidates</li>
              <li>Campaign period (regulated by law)</li>
              <li>Election day (second Tuesday of August)</li>
              <li>Announcement of results</li>
            </ul>

            <p className="govuk-hint">
              Election laws are ideally enacted or reviewed at least one year before
              the General Election.
            </p>
          </section>

          {/* CANDIDATES & PARTIES */}
          <section className="govuk-!-margin-top-9">
            <h2 className="govuk-heading-l">Candidates & Political Parties</h2>

            <p className="govuk-body">
              Kenya operates a multi-party democratic system. Candidates may run
              for office through registered political parties or as independents.
            </p>

            <div className="govuk-accordion" data-module="govuk-accordion">
              <div className="govuk-accordion__section">
                <h3 className="govuk-accordion__section-heading">
                  <span className="govuk-accordion__section-button">
                    Offices elected during General Elections
                  </span>
                </h3>
                <div className="govuk-accordion__section-content">
                  <ul className="govuk-list govuk-list--bullet">
                    <li>President</li>
                    <li>Members of National Assembly</li>
                    <li>Senators</li>
                    <li>County Governors</li>
                    <li>County Assembly Members (MCAs)</li>
                  </ul>
                </div>
              </div>

              <div className="govuk-accordion__section">
                <h3 className="govuk-accordion__section-heading">
                  <span className="govuk-accordion__section-button">
                    Eligibility requirements
                  </span>
                </h3>
                <div className="govuk-accordion__section-content">
                  <ul className="govuk-list govuk-list--bullet">
                    <li>Must be a Kenyan citizen</li>
                    <li>Must be registered voter</li>
                    <li>Must meet IEBC clearance requirements</li>
                    <li>No disqualifying criminal convictions</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* VOTING PROCESS */}
          <section className="govuk-!-margin-top-9">
            <h2 className="govuk-heading-l">How Voting Works</h2>

            <ol className="govuk-list govuk-list--number">
              <li>Go to your assigned polling station</li>
              <li>Present your ID or passport</li>
              <li>Biometric verification</li>
              <li>Receive ballot papers</li>
              <li>Vote in secret ballot booth</li>
              <li>Place ballots in correct boxes</li>
              <li>Ink marking to prevent double voting</li>
            </ol>

            <p className="govuk-body">
              Presidential election requires a candidate to win:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>50% + 1 of valid votes</li>
              <li>At least 25% of votes in at least half of counties</li>
            </ul>
          </section>

          {/* RESULTS */}
          <section className="govuk-!-margin-top-9">
            <h2 className="govuk-heading-l">Results & Transparency</h2>

            <p className="govuk-body">
              IEBC is responsible for tallying and announcing official results.
              Results are transmitted from polling stations to constituency and national tallying centers.
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>Polling station results forms (Form 34A)</li>
              <li>Constituency tally (Form 34B)</li>
              <li>National presidential results (Form 34C)</li>
            </ul>
          </section>

          {/* LEGAL FRAMEWORK */}
<section className="govuk-!-margin-top-9" id="legal-framework">
  <h2 className="govuk-heading-l">Legal Framework</h2>

  <p className="govuk-body">
    Elections in Kenya are governed by the Constitution of Kenya (2010) and a set of
    supporting laws that define how voting, representation, and electoral oversight are conducted.
  </p>

  {/* CONSTITUTION */}
  <h3 className="govuk-heading-m">Constitution of Kenya (2010)</h3>

  <ul className="govuk-list govuk-list--bullet">
    <li>
      <a href="/laws/constitution/article-38" className="govuk-link">
        Article 38 — Political Rights
      </a>
      <br />
      Guarantees every citizen the right to free, fair, and regular elections under universal suffrage.
    </li>

    <li>
      <a href="/laws/constitution/article-81" className="govuk-link">
        Article 81 — General Principles of the Electoral System
      </a>
      <br />
      Requires elections to be free from violence, ensure gender equity (two-thirds rule), and fair representation for persons with disabilities.
    </li>

    <li>
      <a href="/laws/constitution/article-82" className="govuk-link">
        Article 82 — Legislation on Elections
      </a>
      <br />
      Directs Parliament to enact laws governing voter registration, delimitation of boundaries, and election procedures.
    </li>

    <li>
      <a href="/laws/constitution/article-86" className="govuk-link">
        Article 86 — Voting Systems
      </a>
      <br />
      Requires IEBC to ensure voting is simple, accurate, verifiable, secure, accountable, and transparent.
    </li>

    <li>
      <a href="/laws/constitution/article-88" className="govuk-link">
        Article 88 — Independent Electoral and Boundaries Commission (IEBC)
      </a>
      <br />
      Establishes IEBC as the body responsible for conducting and supervising elections.
    </li>

    <li>
      <a href="/laws/constitution/article-101" className="govuk-link">
        Article 101 — Election of Members of Parliament
      </a>
      <br />
      Sets parliamentary elections for the second Tuesday of August every five years.
    </li>

    <li>
      <a href="/laws/constitution/article-136" className="govuk-link">
        Article 136 — Presidential Elections
      </a>
      <br />
      Establishes election timing and requires a winner to obtain 50% + 1 of valid votes.
    </li>

    <li>
      <a href="/laws/constitution/article-177" className="govuk-link">
        Articles 177 & 180 — County Elections
      </a>
      <br />
      Provide legal basis for election of Governors and Members of County Assemblies (MCAs).
    </li>
  </ul>

  {/* STATUTES */}
  <h3 className="govuk-heading-m govuk-!-margin-top-6">
    Statutory Legal Framework
  </h3>

  <ul className="govuk-list govuk-list--bullet">

    <li>
      <a href="/laws/elections-act-2011" className="govuk-link">
        Elections Act (2011)
      </a>
      <br />
      Governs voter registration, candidate nominations, election procedures, dispute resolution, and use of KIEMS technology.
    </li>

    <li>
      <a href="/laws/political-parties-act" className="govuk-link">
        Political Parties Act (Cap. 7D)
      </a>
      <br />
      Regulates formation, registration, funding, and internal democracy of political parties.
    </li>

    <li>
      <a href="/laws/iebc-act" className="govuk-link">
        IEBC Act
      </a>
      <br />
      Defines powers, structure, and operational mandate of the Independent Electoral and Boundaries Commission.
    </li>

    <li>
      <a href="/laws/campaign-financing-act" className="govuk-link">
        Election Campaign Financing Act
      </a>
      <br />
      Regulates campaign spending limits and requires disclosure of political donations.
    </li>
  </ul>

  {/* REGULATIONS */}
  <h3 className="govuk-heading-m govuk-!-margin-top-6">
    Electoral Regulations & Codes
  </h3>

  <ul className="govuk-list govuk-list--bullet">

    <li>
      <a href="/laws/electoral-code-of-conduct" className="govuk-link">
        Electoral Code of Conduct Regulations
      </a>
      <br />
      Enforces ethical conduct during campaigns including prohibition of bribery, violence, and hate speech.
    </li>

    <li>
      <a href="/laws/iebc-regulations" className="govuk-link">
        IEBC Regulations & Guidelines
      </a>
      <br />
      Operational rules covering voting procedures, tallying, and result transmission.
    </li>
  </ul>

  {/* NOTE */}
  <div className="govuk-inset-text govuk-!-margin-top-6">
    <p className="govuk-body-s">
      These laws form the legal foundation of Kenya’s electoral system and may be amended by Parliament
      or interpreted by courts. This platform provides simplified access for civic understanding.
    </p>
  </div>
</section>

          {/* LAST UPDATED (IMPORTANT POSITION) */}
          <LastUpdated
            lastUpdated={new Date().toISOString()}
            published={new Date("2026-01-01").toISOString()}
          />

          {/* FEEDBACK */}
          <GovUKFeedback />
        </div>

        {/* SIDEBAR */}
        <div className="govuk-grid-column-one-third">
          <aside className="govuk-inset-text">
            <h3 className="govuk-heading-s">Quick links</h3>
            <ul className="govuk-list">
              <li><a href="/politics/political-parties">Political parties</a></li>
              <li><a href="/politics/elections">All elections</a></li>
              <li><a href="/politics/elections/results">Past results</a></li>
              <li><a href="/politics/civic-education">Civic education</a></li>
            </ul>
          </aside>

          <aside className="govuk-inset-text">
            <h3 className="govuk-heading-s">Did you know?</h3>
            <p className="govuk-body-s">
              Kenya’s General Elections are held every 5 years under strict constitutional timelines.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}