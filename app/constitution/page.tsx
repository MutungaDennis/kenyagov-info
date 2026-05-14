import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function ConstitutionPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Constitution", href: "/constitution" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">The Constitution of Kenya 2010</h1>
            <p className="govuk-body-l">
              The supreme law of Kenya. This page gives you easy access to every chapter and article with plain English explanations.
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="govuk-grid-row govuk-!-margin-top-9">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="const-search">
                Search the Constitution
              </label>
              <input
                className="govuk-input govuk-input--width-full"
                id="const-search"
                type="text"
                placeholder="e.g. Article 35, Land rights, Devolution, Freedom of speech..."
              />
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* Important Chapters */}
        <h2 className="govuk-heading-l">Key Chapters</h2>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-card govuk-card--clickable">
              <div className="govuk-card__content">
                <h3 className="govuk-card__title">
                  <Link href="/constitution/4" className="govuk-link">Chapter 4 – Bill of Rights</Link>
                </h3>
                <p className="govuk-card__description">
                  Your fundamental rights and freedoms
                </p>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-card govuk-card--clickable">
              <div className="govuk-card__content">
                <h3 className="govuk-card__title">
                  <Link href="/constitution/11" className="govuk-link">Chapter 11 – Devolved Government</Link>
                </h3>
                <p className="govuk-card__description">
                  Powers of counties and devolution
                </p>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-card govuk-card--clickable">
              <div className="govuk-card__content">
                <h3 className="govuk-card__title">
                  <Link href="/constitution/12" className="govuk-link">Chapter 12 – Public Finance</Link>
                </h3>
                <p className="govuk-card__description">
                  How public money is raised and spent
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* All Chapters */}
        <h2 className="govuk-heading-l">All Chapters</h2>

        <div className="govuk-grid-row">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((chapter) => (
            <div key={chapter} className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
              <Link 
                href={`/constitution/${chapter}`}
                className="govuk-link govuk-link--no-visited-state"
              >
                <div className="govuk-card">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">Chapter {chapter}</h3>
                    <p className="govuk-body-s">Browse all articles</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

        {/* Popular Articles */}
        <h2 className="govuk-heading-l">Most Accessed Articles</h2>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <Link href="/constitution/4/35" className="govuk-link">
              Article 35 – Access to Information
            </Link>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link href="/constitution/4/40" className="govuk-link">
              Article 40 – Protection of Right to Property
            </Link>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link href="/constitution/4/43" className="govuk-link">
              Article 43 – Economic and Social Rights
            </Link>
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}