'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function CookiesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Cookies policy", href: "/cookies" },
        ]}
      />

      {/* Reduced padding wrapper to pull directory modules above the fold */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Scaled down heading size for strict site-wide uniformity */}
            <h1 className="govuk-header__heading govuk-heading-l govuk-!-margin-bottom-2">Cookies</h1>
            <p className="govuk-body-s govuk-!-margin-bottom-4">Last updated: May 2026</p>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">What are cookies?</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Cookies are small encrypted text files located in your browser directories. They are placed on your computer or mobile device by websites you visit to store configuration data and remember your preferences.
            </p>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">How we use cookies</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              CitizenGuide.KE limits its cookie storage footprint strictly to system functionality and anonymous platform telemetry. We do not place cookies for behavioral tracking or advertising profiles.
            </p>
          </div>
        </div>

        {/* Section 3: Semantic, Mobile Responsive Data Table */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            {/* Mobile Safe Horizontal Scroll Layer Wrapper to ensure full responsiveness */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
              <table className="govuk-table" style={{ minWidth: '750px' }}>
                <caption className="govuk-table__caption govuk-visually-hidden">Inventory of active cookies set by CitizenGuide.KE detailing their purpose and lifespan.</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '220px' }}>Cookie Name</th>
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Purpose</th>
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '130px' }}>Classification</th>
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '110px' }}>Duration</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '14px' }}>govuk-cookies-preferences</code>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">Remembers your choices regarding optional analytical tracking cookies.</td>
                    <td className="govuk-table__cell govuk-body-s">
                      <strong className="govuk-tag govuk-tag--green">Essential</strong>
                    </td>
                    <td className="govuk-table__cell govuk-body-s">1 year</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '14px' }}>session-id</code>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">Maintains your current active browsing state, such as keeping interactive dropdown lists or side menus uniform.</td>
                    <td className="govuk-table__cell govuk-body-s">
                      <strong className="govuk-tag govuk-tag--green">Essential</strong>
                    </td>
                    <td className="govuk-table__cell govuk-body-s">Session</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '14px' }}>_ga / _ga_xxxxxx</code>
                    </th>
                    <td className="govuk-table__cell govuk-body-s">Collects anonymous network analytics (pages opened, click counts, search delays) to optimize server memory allocation.</td>
                    <td className="govuk-table__cell govuk-body-s">
                      <span className="govuk-tag govuk-tag--grey">Optional</span>
                    </td>
                    <td className="govuk-table__cell govuk-body-s">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-3">Your cookie choices</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              You can evaluate, intercept, or completely wipe stored tracking files by accessing your specific browser privacy configurations. Please note that restricting mandatory functional cookies might alter configuration loading layouts on subsequent site visits.
            </p>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Third-party tracking cookies</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              This digital resource features numerous external link connections pointing to official Kenyan state portals (such as the national <a href="https://ecitizen.go.ke" target="_blank" rel="noreferrer" className="govuk-link">eCitizen Gateway</a> or regulatory treasury desks). Once you access these third-party nodes, they may deploy independent cookies or script trackers which operate outside our structural framework.
            </p>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Further information</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              To inspect detailed privacy explanations, learn about data protection standards under the GDPR, or read steps on removing tracking records across multiple web browsers, access the independent educational clearinghouse at <a href="https://www.allaboutcookies.org" className="govuk-link" target="_blank" rel="noreferrer">All About Cookies</a>.
            </p>

            <p className="govuk-body govuk-!-margin-top-6" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              If you have queries regarding our local data minimization methods, file a verification request via our <Link href="/contact" className="govuk-link">Contact desk</Link>.
            </p>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}
