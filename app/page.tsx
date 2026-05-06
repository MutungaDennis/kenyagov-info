import Link from "next/link";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function Home() {
  return (
    <>
      {/* Hero Banner */}
      <section 
        className="text-white py-16 md:py-24"
        style={{ backgroundColor: '#1d70b8' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">KenyaGovInfo.KE</h1>
          
          <p className="text-lg md:text-xl mb-8 leading-relaxed">
            The best place to find information about Kenyan government institutions, 
            ministries, commissions, counties and public services.
          </p>

          <label className="block text-white font-bold text-base mb-3">Search government entities and services</label>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. KRA, Birth certificate, Nairobi County..."
              className="flex-1 px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1d70b8]"
            />
            <button 
              className="px-6 py-3 font-bold text-white transition-colors whitespace-nowrap"
              style={{ backgroundColor: '#003087' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00266b'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#003087'}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="govuk-width-container">

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
    </>
  );
}
