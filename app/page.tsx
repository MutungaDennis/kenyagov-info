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
            The best place to find information about Kenyan government institutions, 
            ministries, commissions, counties and public services.
          </p>

          {/* Main Search */}
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--m" htmlFor="main-search">
              Search government entities and services
            </label>
            <div className="govuk-input__wrapper">
              <input
                className="govuk-input govuk-input--width-full"
                id="main-search"
                type="text"
                placeholder="e.g. KRA, Birth certificate, Nairobi County, IEBC, Driving licence..."
              />
              <button className="govuk-button govuk-!-margin-left-2" data-module="govuk-button">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Services and Information */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Services and Information</h2>
          <p className="govuk-body">Common services Kenyans access from government institutions</p>

          <ul className="govuk-list govuk-list--spaced">
            <li><Link href="/services/business" className="govuk-link">Starting a business</Link></li>
            <li><Link href="/services/id" className="govuk-link">National ID, Birth, Death & Marriage Certificates</Link></li>
            <li><Link href="/services/driving" className="govuk-link">Driving licence and vehicle registration</Link></li>
            <li><Link href="/services/passport" className="govuk-link">Passport application and renewal</Link></li>
            <li><Link href="/services/tax" className="govuk-link">Taxes and KRA services</Link></li>
            <li><Link href="/services/housing" className="govuk-link">Affordable housing registration</Link></li>
            <li><Link href="/services/education" className="govuk-link">HELB loans and university admissions</Link></li>
            <li><Link href="/services/voting" className="govuk-link">Voter registration and IEBC services</Link></li>
          </ul>
        </div>

        {/* Featured */}
        <div className="govuk-grid-column-one-third">
          <h2 className="govuk-heading-m">Featured</h2>
          <div className="govuk-panel govuk-panel--info">
            <h3 className="govuk-panel__title">2027 General Election</h3>
            <p className="govuk-body">Voter registration and candidate nomination updates from IEBC</p>
            <Link href="/featured/election" className="govuk-link">Learn more →</Link>
          </div>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Structure of Government */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Structure of Government</h2>
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
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* County Governments */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">County Governments</h2>
          <p className="govuk-body">47 County Governments — Devolution in action</p>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <Link href="/counties" className="govuk-button govuk-button--secondary">
            Browse all 47 Counties →
          </Link>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Leaders / Political Office Holders */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">Current Leaders</h2>
          <p className="govuk-body">Elected and appointed public office holders</p>
        </div>

        <div className="govuk-grid-column-one-third">
          <h3 className="govuk-heading-m">National Leadership</h3>
          <ul className="govuk-list">
            <li><Link href="/leaders/president" className="govuk-link">President & Deputy President</Link></li>
            <li><Link href="/leaders/cabinet" className="govuk-link">Cabinet Secretaries</Link></li>
            <li><Link href="/leaders/assembly" className="govuk-link">Members of Parliament (MPs)</Link></li>
            <li><Link href="/leaders/senate" className="govuk-link">Senators</Link></li>
          </ul>
        </div>

        <div className="govuk-grid-column-one-third">
          <h3 className="govuk-heading-m">County Leadership</h3>
          <ul className="govuk-list">
            <li><Link href="/leaders/governors" className="govuk-link">Governors & Deputy Governors</Link></li>
            <li><Link href="/leaders/women-reps" className="govuk-link">Women Representatives</Link></li>
            <li><Link href="/leaders/mcas" className="govuk-link">MCAs</Link></li>
          </ul>
        </div>

        <div className="govuk-grid-column-one-third">
          <h3 className="govuk-heading-m">Independent Offices</h3>
          <ul className="govuk-list">
            <li><Link href="/leaders/commissions" className="govuk-link">Constitutional Commissions Chairs</Link></li>
            <li><Link href="/leaders/ceos" className="govuk-link">CEOs & Directors General</Link></li>
          </ul>
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl" />

      {/* Feedback Component */}
      <GovUKFeedback />
    </div>
  );
}