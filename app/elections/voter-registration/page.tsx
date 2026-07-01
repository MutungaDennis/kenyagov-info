import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import LastUpdated from "@/components/govuk/LastUpdated";
import Link from "next/link";

export default function VoterRegistrationPage() {
  return (
    <main className="govuk-width-container">

      {/* BREADCRUMBS */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Politics", href: "/politics" },
          { text: "Elections", href: "/politics/elections" },
          { text: "Voter registration", href: "/politics/elections/voter-registration" },
        ]}
      />

      {/* TITLE */}
      <h1 className="govuk-heading-xl">Voter registration in Kenya</h1>

      <p className="govuk-body-l">
        Registering as a voter allows you to take part in Kenya’s general elections,
        by-elections, referendums, and other democratic processes managed by the IEBC.
      </p>

      {/* ACTION BOX */}
      <div className="govuk-inset-text">
        <p className="govuk-body">
          You must be registered with the{" "}
          <Link className="govuk-link" href="https://www.iebc.or.ke">
            Independent Electoral and Boundaries Commission (IEBC)
          </Link>{" "}
          before you can vote.
        </p>
      </div>

      {/* WHO CAN REGISTER */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Who can register</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li>Must be a Kenyan citizen (by birth or registration)</li>
          <li>Must be 18 years or older</li>
          <li>Must possess a valid National ID card or Kenyan passport</li>
          <li>Must not be registered in more than one polling station</li>
          <li>Must be of sound mind as defined by law</li>
        </ul>
      </section>

      {/* HOW TO REGISTER */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">How to register as a voter</h2>

        <ol className="govuk-list govuk-list--number">
          <li>Visit the nearest registration centre</li>
          <li>Present your National ID or passport</li>
          <li>Provide biometric data (fingerprints and photo)</li>
          <li>Confirm your polling station location</li>
          <li>Receive your voter registration slip</li>
          <li>Verify your details after registration</li>
        </ol>
      </section>

      {/* REGISTRATION CHANNELS */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Where you can register</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li>
            <Link className="govuk-link" href="/politics/elections/iebc-offices">
              IEBC constituency offices nationwide
            </Link>
          </li>
          <li>Mobile registration centres during voter drives</li>
          <li>Designated public institutions (schools, halls, stadiums)</li>
          <li>Special diaspora registration centres (where applicable)</li>
        </ul>
      </section>

      {/* REQUIRED DOCUMENTS */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">What you need to register</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li>Original National ID card OR valid Kenyan passport</li>
          <li>Physical presence at registration centre</li>
          <li>Personal contact details (recommended)</li>
        </ul>
      </section>

      {/* CHECK REGISTRATION */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">How to check your registration status</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li>SMS verification (where available)</li>
          <li>
            <Link
              className="govuk-link"
              href="https://verify.iebc.or.ke/"
              target="_blank"
            >
              IEBC online voter verification portal
            </Link>
          </li>
          <li>Visit your local IEBC office</li>
        </ul>

        <p className="govuk-body">
          Always confirm your polling station before election day.
        </p>
      </section>

      {/* SPECIAL CASES */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Special voter categories</h2>

        <h3 className="govuk-heading-m">First-time voters</h3>
        <p className="govuk-body">
          Citizens turning 18 should register early to avoid missing election deadlines.
        </p>

        <h3 className="govuk-heading-m">Students and relocated voters</h3>
        <p className="govuk-body">
          You may register at your current residence or home constituency.
        </p>

        <h3 className="govuk-heading-m">Diaspora voters</h3>
        <p className="govuk-body">
          Registration is done at designated Kenyan embassies and consulates where IEBC services are available.
        </p>
      </section>

      {/* COMMON ISSUES */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Common issues and solutions</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li><strong>Lost details:</strong> Re-check via IEBC verification portal</li>
          <li><strong>Wrong polling station:</strong> Request transfer at IEBC office</li>
          <li><strong>Not found:</strong> Verify using ID number at IEBC system</li>
        </ul>
      </section>

      {/* LEGAL FRAMEWORK */}
      <section className="govuk-!-margin-top-9">
        <h2 className="govuk-heading-l">Legal framework</h2>

        <ul className="govuk-list govuk-list--bullet">
          <li>Article 38 – Political Rights</li>
          <li>Article 82 – Voter registration laws</li>
          <li>Article 83 – Continuous registration</li>
          <li>IEBC Act</li>
          <li>Elections Act (2011)</li>
        </ul>
      </section>

      {/* IMPORTANT NOTICE */}
      <div className="govuk-inset-text govuk-!-margin-top-9">
        <p className="govuk-body">
          Register early to avoid missing verification deadlines before elections.
        </p>
      </div>

      {/* LAST UPDATED */}
      <LastUpdated
        lastUpdated={new Date().toISOString()}
        published={new Date().toISOString()}
      />

      {/* FEEDBACK */}
      <GovUKFeedback />
    </main>
  );
}