import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function CookiesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Cookies", href: "/cookies" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Cookies</h1>
            <p className="govuk-body-s">Last updated: May 2026</p>

            <h2 className="govuk-heading-l">What are cookies?</h2>
            <p className="govuk-body">
              Cookies are small text files that websites place on your device to store information about your visit.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">How we use cookies</h2>
            <p className="govuk-body">
              KenyaGovInfo.KE uses only a small number of cookies. We do not use cookies for advertising.
            </p>

            {/* Enhanced GOV.UK Table */}
            <div className="govuk-table-wrapper">
              <table className="govuk-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>govuk-cookies-preferences</td>
                    <td>Remembers your cookie consent choices</td>
                    <td>Settings</td>
                    <td><strong>Essential</strong></td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>session-id</td>
                    <td>Maintains your current browsing session (e.g. open menus)</td>
                    <td>Functionality</td>
                    <td><strong>Essential</strong></td>
                    <td>Session (deleted when you close the browser)</td>
                  </tr>
                  <tr>
                    <td>_ga / _ga_xxxxxx</td>
                    <td>Anonymous statistics on how visitors use the website (helps us improve it)</td>
                    <td>Analytics</td>
                    <td>Analytics (Optional)</td>
                    <td>2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Your choices</h2>
            <p className="govuk-body">
              You can control cookies through your browser settings. 
              Note that disabling essential cookies may affect the functionality of this website.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">Third-party cookies</h2>
            <p className="govuk-body">
              This site contains links to external websites (e.g. eCitizen). 
              Those websites may set their own cookies, which we cannot control.
            </p>

            <h2 className="govuk-heading-l govuk-!-margin-top-12">More information</h2>
            <p className="govuk-body">
              You can learn more about cookies and how to manage them at{' '}
              <a href="https://www.allaboutcookies.org" className="govuk-link" target="_blank">All About Cookies</a>.
            </p>

            <p className="govuk-body govuk-!-margin-top-9">
              If you have any questions about our cookie usage, please{' '}
              <Link href="/contact" className="govuk-link">contact us</Link>.
            </p>

          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}