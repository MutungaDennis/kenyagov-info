import Link from "next/link";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function Home() {
  return (
    <div className="govuk-width-container">
      {/* Hero Section */}
      <section className="govuk-grid-row govuk-!-margin-top-9 govuk-!-margin-bottom-9">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
            KenyaGovInfo.KE
          </h1>
          <p className="govuk-body-l">
            Your independent guide to Kenyan government institutions, leaders, 
            counties, public services and public finance.
          </p>

          {/* Main Search */}
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="main-search">
              Search government entities, leaders or services
            </label>
            <div className="govuk-input__wrapper">
              <input
                className="govuk-input govuk-input--width-full"
                id="main-search"
                type="text"
                placeholder="e.g. Ministry of Health, Johnson Sakaja, Birth certificate, KRA, Nairobi County..."
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
            <li><Link href="/services/passport" className="govuk-link">Passport application and renewal</Link></li>
            <li><Link href="/services/tax" className="govuk-link">Taxes and KRA services</Link></li>
          </ul>
        </div>

        <div className="govuk-grid-column-one-third">
          <h2 className="govuk-heading-m">Featured</h2>
          <div className="govuk-panel govuk-panel--info">
            <h3 className="govuk-panel__title">2027 General Election</h3>
            <p className="govuk-body">Voter registration is ongoing. Check your status with IEBC.</p>
            <Link href="/services/voting" className="govuk-link">Check Voter Status →</Link>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Government Institutions */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Government Institutions</h2>
          <p className="govuk-body">Browse ministries, commissions, agencies, counties and other public bodies</p>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/institutions/executive">The Executive</Link>
              </h3>
              <p className="govuk-card__description">Presidency, Ministries and State Departments</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/institutions/legislature">The Legislature</Link>
              </h3>
              <p className="govuk-card__description">National Assembly and Senate</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/institutions/judiciary">The Judiciary</Link>
              </h3>
              <p className="govuk-card__description">Courts and Judicial Service Commission</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third govuk-!-margin-top-6">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/constitutional-bodies">Constitutional Bodies</Link>
              </h3>
              <p className="govuk-card__description">Commissions, Independent Offices and Oversight Bodies</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third govuk-!-margin-top-6">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/institutions/state-corporations">State Corporations & SAGAs</Link>
              </h3>
              <p className="govuk-card__description">Parastatals and semi-autonomous agencies</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third govuk-!-margin-top-6">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/counties">County Governments</Link>
              </h3>
              <p className="govuk-card__description">47 County Governments and their institutions</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Additional Major Sections */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/security">Security Agencies</Link>
              </h3>
              <p className="govuk-card__description">KDF, National Police, NIS and related bodies</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/intergovernmental-relations">Intergovernmental Relations</Link>
              </h3>
              <p className="govuk-card__description">Council of Governors, IGTRC, IBEC and Summit</p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-card govuk-card--clickable">
            <div className="govuk-card__content">
              <h3 className="govuk-card__title">
                <Link href="/public-finance">Public Finance</Link>
              </h3>
              <p className="govuk-card__description">Budget, Expenditure, COFOG and MTEF Sectors</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Current Leaders */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Current Leaders</h2>
          <p className="govuk-body">Elected and appointed public office holders</p>
        </div>

        <div className="govuk-grid-column-one-third">
          <h3 className="govuk-heading-m">National Leadership</h3>
          <ul className="govuk-list">
            <li><Link href="/leaders/executive" className="govuk-link">President & Deputy President</Link></li>
            <li><Link href="/leaders/executive" className="govuk-link">Cabinet Secretaries</Link></li>
            <li><Link href="/leaders/legislature" className="govuk-link">Parliament (MPs & Senators)</Link></li>
          </ul>
        </div>

        <div className="govuk-grid-column-one-third">
          <h3 className="govuk-heading-m">County Leadership</h3>
          <ul className="govuk-list">
            <li><Link href="/leaders/county-executive" className="govuk-link">Governors & Deputy Governors</Link></li>
            <li><Link href="/leaders/county-assembly" className="govuk-link">MCAs & Women Representatives</Link></li>
          </ul>
        </div>

        <div className="govuk-grid-column-one-third">
          <h3 className="govuk-heading-m">Other Leadership</h3>
          <ul className="govuk-list">
            <li><Link href="/leaders/constitutional-bodies" className="govuk-link">Constitutional Bodies</Link></li>
            <li><Link href="/leaders/security" className="govuk-link">Security Agencies</Link></li>
          </ul>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Additional Important Sections */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <Link href="/about-government" className="govuk-link govuk-!-font-weight-bold">
            About Government →
          </Link>
        </div>
        <div className="govuk-grid-column-one-third">
          <Link href="/search" className="govuk-link govuk-!-font-weight-bold">
            Advanced Search →
          </Link>
        </div>
        <div className="govuk-grid-column-one-third">
          <Link href="/open-data" className="govuk-link govuk-!-font-weight-bold">
            Open Data & Budgets →
          </Link>
        </div>
      </div>

      <GovUKFeedback />
    </div>
  );
}