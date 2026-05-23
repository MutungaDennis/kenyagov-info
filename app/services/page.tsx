import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function ServicesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Compact Typography Header Section */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2" style={{ fontSize: "32px" }}>
              Services and Information
            </h1>
            <p className="govuk-body" style={{ fontSize: "17px", color: "#2b2b2b", lineHeight: "1.4" }}>
              The central index directory for the most common civic and national public services in Kenya.
            </p>
          </div>
        </div>

        {/* eCitizen Unified Highlight Banner */}
        <div className="govuk-grid-row govuk-!-margin-top-4">
          <div className="govuk-grid-column-full">
            <div 
              className="govuk-inset-text" 
              style={{ 
                borderLeftColor: '#1d70b8', 
                backgroundColor: '#f3f2f1', 
                padding: '12px',
                fontSize: '15px',
                marginTop: '10px',
                marginBottom: '15px'
              }}
            >
              Most public processes are now <strong>unified</strong> on the official{' '}
              <a 
                href="https://www.ecitizen.go.ke" 
                className="govuk-link govuk-link--no-underline" 
                style={{ fontWeight: "bold" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                eCitizen Portal
              </a>. 
              Register a single identity profile to access applications from all primary ministries, departments, and county agencies.
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />
        {/* Core Services Link Matrix - Card-Free Text Based Layout */}
        <div 
          className="services-flex-directory-grid"
          style={{ display: "flex", flexWrap: "wrap", gap: "28px 24px", width: "100%", marginTop: "20px" }}
        >
          
          {/* Category 1: Citizenship & Civil Registration */}
          <div className="services-directory-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Citizenship &amp; Civil Registration
            </h2>
            <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-font-size-16">
                <Link href="/services/national-id" className="govuk-link govuk-link--no-underline">National ID Card (New &amp; Replacement)</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/passport" className="govuk-link govuk-link--no-underline">Passport Application &amp; Renewal</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/birth-death" className="govuk-link govuk-link--no-underline">Birth, Death &amp; Marriage Certificates</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/good-conduct" className="govuk-link govuk-link--no-underline">Good Conduct Certificate</Link>
              </li>
            </ul>
          </div>

          {/* Category 2: Driving & Transport */}
          <div className="services-directory-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Driving &amp; Transport
            </h2>
            <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-font-size-16">
                <Link href="/services/driving" className="govuk-link govuk-link--no-underline">Smart Driving Licence</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/ntsa" className="govuk-link govuk-link--no-underline">Vehicle Registration &amp; Logbook</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/inspection" className="govuk-link govuk-link--no-underline">Vehicle Inspection &amp; PSV Licensing</Link>
              </li>
            </ul>
          </div>

          {/* Category 3: Taxes & Business */}
          <div className="services-directory-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Taxes &amp; Business
            </h2>
            <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-font-size-16">
                <Link href="/services/tax" className="govuk-link govuk-link--no-underline">KRA PIN, Returns &amp; Tax Compliance</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/business" className="govuk-link govuk-link--no-underline">Business Registration (BRS)</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/lands" className="govuk-link govuk-link--no-underline">Land Searches &amp; ArdhiSasa</Link>
              </li>
            </ul>
          </div>

          {/* Category 4: Health */}
          <div className="services-directory-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Health
            </h2>
            <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-font-size-16">
                <Link href="/services/sha" className="govuk-link govuk-link--no-underline">Social Health Authority (SHA)</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/nhif" className="govuk-link govuk-link--no-underline">NHIF Contributions &amp; Claims</Link>
              </li>
            </ul>
          </div>

          {/* Category 5: Education & Housing */}
          <div className="services-directory-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Education &amp; Housing
            </h2>
            <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-font-size-16">
                <Link href="/services/helb" className="govuk-link govuk-link--no-underline">HELB Loans &amp; Clearance</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/education" className="govuk-link govuk-link--no-underline">KUCCPS University &amp; TVET Placement</Link>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/housing" className="govuk-link govuk-link--no-underline">Affordable Housing (Boma Yangu)</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Informational Footer Segment */}
        <div className="govuk-!-margin-top-8 govuk-!-margin-bottom-6" style={{ borderTop: "1px solid #b1b4b6", paddingTop: "20px" }}>
          <p className="govuk-body-s govuk-!-text-colour-dark-grey" style={{ lineHeight: "1.5" }}>
            Can’t find the specific service guidelines you need? Use the search bar above or navigate directly to the primary transactional{' '}
            <a 
              href="https://ecitizen.go.ke" 
              className="govuk-link govuk-link--no-underline" 
              style={{ fontWeight: "bold" }}
              target="_blank" 
              rel="noreferrer"
            >
              eCitizen Portal
            </a>.
          </p>
        </div>

        <GovUKFeedback />
      </main>

      {/* Global CSS Layout Overrides safe for modern multi-device deployment */}
      <style dangerouslySetInnerHTML={{__html: `
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        .services-flex-directory-grid { display: flex; flex-wrap: wrap; gap: 24px; width: 100%; }
        .services-directory-block { flex: 1 1 100%; box-sizing: border-box; }

        @media (min-width: 32.0625rem) {
          .services-directory-block { flex: 1 1 45%; }
        }

        @media (min-width: 48.0625rem) {
          .services-directory-block { flex: 1 1 30%; }
        }
      `}} />
    </div>
  );
}
