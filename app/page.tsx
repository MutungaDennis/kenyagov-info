import Link from "next/link";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function Home() {
  return (
    <div className="govuk-width-container">
      {/* Beta Banner */}
      <div className="govuk-phase-banner">
        <p className="govuk-phase-banner__content">
          <strong className="govuk-tag govuk-phase-banner__content__tag">BETA</strong>
          <span className="govuk-phase-banner__text">
            This website is in early development. Your feedback helps us improve it. 
            <Link href="/feedback" className="govuk-link">Give feedback</Link>
          </span>
        </p>
      </div>

      {/* Hero Section */}
      <section className="govuk-grid-row govuk-!-margin-top-9 govuk-!-margin-bottom-9">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
            CitizenGuide.KE
          </h1>
          <p className="govuk-body-l">
            Your independent guide to Kenyan government institutions, leaders, 
            counties, public services, and the laws that govern us.
          </p>

          {/* Main Search */}
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="main-search">
              Search government entities, services or laws
            </label>
            <div className="govuk-input__wrapper">
              <input
                className="govuk-input govuk-input--width-full"
                id="main-search"
                type="text"
                placeholder="e.g. KRA, Constitution Article 47, Birth certificate, Nairobi County..."
              />
              <button className="govuk-button govuk-!-margin-left-2" data-module="govuk-button">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Popular Services */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Popular Services</h2>
          <p className="govuk-body">Common services accessed by Kenyans</p>

          <ul className="govuk-list govuk-list--spaced">
            <li><Link href="/services/business" className="govuk-link">Starting a business</Link></li>
            <li><Link href="/services/id" className="govuk-link">National ID, Birth, Death & Marriage Certificates</Link></li>
            <li><Link href="/services/driving" className="govuk-link">Driving licence and vehicle registration</Link></li>
            <li><Link href="/services/passport" className="govuk-link">Passport application</Link></li>
            <li><Link href="/services/tax" className="govuk-link">Taxes and iTax services</Link></li>
            <li><Link href="/services/housing" className="govuk-link">Affordable housing registration</Link></li>
            <li><Link href="/services/education" className="govuk-link">HELB loans and university placement</Link></li>
            <li><Link href="/services/voting" className="govuk-link">Voter registration (IEBC)</Link></li>
          </ul>
        </div>

        {/* Featured */}
        <div className="govuk-grid-column-one-third">
          <h2 className="govuk-heading-m">Featured</h2>
          <div className="govuk-panel govuk-panel--info govuk-!-margin-bottom-6">
            <h3 className="govuk-panel__title">2027 General Election</h3>
            <p className="govuk-body">Voter registration and candidate nomination updates</p>
            <Link href="/featured/election" className="govuk-link">Learn more →</Link>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* National Government Structure */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Structure of the National Government</h2>
          <p className="govuk-body">The three arms of government plus independent constitutional bodies</p>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/executive">The Executive</Link></h3>
              <p className="govuk-card__description">Presidency, Ministries and State Departments</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/legislature">The Legislature</Link></h3>
              <p className="govuk-card__description">National Assembly and Senate</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/judiciary">The Judiciary</Link></h3>
              <p className="govuk-card__description">Courts and Judicial Service Commission</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third govuk-!-margin-top-6">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/independent-bodies">Constitutional & Independent Institutions</Link></h3>
              <p className="govuk-card__description">Commissions, Offices and Independent Bodies</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* County Governments Structure */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Structure of County Governments</h2>
          <p className="govuk-body">Devolution in action — County Executive and County Assemblies</p>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/counties">County Executives</Link></h3>
              <p className="govuk-card__description">Governors, Deputy Governors and County Administrations</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/county-assemblies">County Assemblies</Link></h3>
              <p className="govuk-card__description">County Assemblies and MCAs</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Legal Framework */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Legal Framework</h2>
          <p className="govuk-body">Key laws and documents that govern Kenya</p>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/constitution">The Constitution of Kenya 2010</Link></h3>
              <p className="govuk-card__description">The supreme law of the land</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/acts/parliament">Parliament Acts</Link></h3>
              <p className="govuk-card__description">National Assembly & Senate Bills and Acts</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/laws/county">County Assembly Laws</Link></h3>
              <p className="govuk-card__description">Laws passed by the 47 County Assemblies</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third govuk-!-margin-top-6">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/judgments">Court Pronouncements</Link></h3>
              <p className="govuk-card__description">Key judgments from Supreme Court, Court of Appeal & High Court</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Current Leaders - Using Cards for Better Click Experience */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Current Leaders</h2>
          <p className="govuk-body">Elected and appointed public office holders</p>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/leaders/executive">National Executive</Link></h3>
              <p className="govuk-card__description">President, Deputy President & Cabinet Secretaries</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/leaders/parliament">Parliament</Link></h3>
              <p className="govuk-card__description">Members of Parliament & Senators</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/leaders/county">County Leadership</Link></h3>
              <p className="govuk-card__description">Governors, Deputy Governors, Women Representatives & MCAs</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third govuk-!-margin-top-6">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title"><Link href="/leaders/commissions">Independent Offices</Link></h3>
              <p className="govuk-card__description">Constitutional Commissions, CEOs & Directors General</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      <GovUKFeedback />
    </div>
  );
}