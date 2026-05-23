import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function StartingBusiness() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
          { text: "Starting a Business", href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Compact Document Title Header Panel */}
        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m" style={{ color: "#505a5f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Business Registration Service (BRS)
          </span>
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2" style={{ fontSize: "32px" }}>
            Starting a Business in Kenya
          </h1>
          <p className="govuk-body" style={{ fontSize: "17px", color: "#2b2b2b", lineHeight: "1.4" }}>
            A comprehensive statutory guide to choosing a legal structure, completing mandatory Registrar of Companies forms, and establishing post-registration tax compliance.
          </p>
        </div>

        {/* Clean, Accessible External Gateway Link with Arrow Anchor Indicator */}
        <div className="govuk-!-margin-bottom-6">
          <p className="govuk-body" style={{ margin: 0 }}>
            <a 
              href="https://ecitizen.go.ke" 
              target="_blank" 
              rel="noreferrer" 
              className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold"
              style={{ fontSize: "16px", display: "inline-flex", alignItems: "center" }}
            >
              Start your business application on the eCitizen Portal ↗
            </a>
          </p>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        {/* ================= 1. BUSINESS STRUCTURES ================= */}
        <section className="govuk-!-margin-top-4 govuk-!-margin-bottom-6" style={{ maxWidth: "48rem" }}>
          <h2 className="govuk-heading-m" style={{ fontSize: "22px", color: "#0b0c0c", marginBottom: "8px" }}>
            1. Choose the right business structure
          </h2>
          <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-4">
            The legal framework you choose under the Companies Act impacts your personal liability, share distribution capacity, and annual tax filing structures.
          </p>

          {/* High Density Minimal Content Stacking */}
          <div className="govuk-!-margin-bottom-4">
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>
              Sole Proprietorship (Business Name)
            </h3>
            <p className="govuk-body-s govuk-!-margin-bottom-1" style={{ lineHeight: "1.4", color: "#2b2b2b" }}>
              The simplest legal configuration owned and run by a single individual. Quick to set up but introduces <strong>unlimited personal liability</strong>—your private assets stay legally exposed to cover business losses or debts.
            </p>
          </div>

          <div className="govuk-!-margin-bottom-4">
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>
              Private Limited Company (Ltd)
            </h3>
            <p className="govuk-body-s govuk-!-margin-bottom-1" style={{ lineHeight: "1.4", color: "#2b2b2b" }}>
              Establishes an independent corporate entity separate from its owners. Offers <strong>limited liability protection</strong>—shareholders are only liable for the financial value of their unpaid shares.
            </p>
          </div>

          {/* Alternative Statutory Categories Bullet List with Future-Proofed Links */}
          <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2" style={{ fontSize: "15px", color: "#505a5f" }}>
            Alternative Corporate Categories
          </h3>
          <ul className="govuk-list govuk-list--bullet" style={{ fontSize: "15px", paddingLeft: "15px", color: "#2b2b2b" }}>
            <li className="govuk-!-margin-bottom-1">
              <Link href="/services/business/llp" className="govuk-link govuk-link--no-underline">Limited Liability Partnership (LLP)</Link>: Combines traditional partnership flexibility with corporate limited liability shields.
            </li>
            <li className="govuk-!-margin-bottom-1">
              <Link href="/services/business/limited-by-guarantee" className="govuk-link govuk-link--no-underline">Company Limited by Guarantee</Link>: Configured for non-profit entities, foundations, and trusts. Features no initial share capital.
            </li>
            <li className="govuk-!-margin-bottom-1">
              <Link href="/services/business/foreign-branch" className="govuk-link govuk-link--no-underline">Branch of a Foreign Company</Link>: Allows international corporations to set up local operations without establishing a new domestic company.
            </li>
          </ul>

          <div className="govuk-!-margin-top-4">
            <Link href="/services/business/compare" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-14">
              Compare all business structures in detail →
            </Link>
          </div>
        </section>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-6 govuk-!-margin-bottom-6" />
        {/* ================= 2. REGISTRATION STEPS ================= */}
        <section className="govuk-!-margin-top-4" style={{ maxWidth: "48rem" }}>
          <h2 className="govuk-heading-m" style={{ fontSize: "22px", color: "#0b0c0c", marginBottom: "8px" }}>
            2. Step-by-step registration process
          </h2>
          <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-4">
            Follow these mandatory statutory steps on the digital registry portal to complete your filing.
          </p>

          <ol className="govuk-list govuk-list--number" style={{ paddingLeft: "15px", fontSize: "16px", color: "#2b2b2b" }}>
            <li className="govuk-!-margin-bottom-4">
              <strong>Name Search and Reservation</strong><br />
              Submit up to three unique name choices via the BRS portal on eCitizen. The system verifies your entries against active registries to avoid conflict or restricted terms.
              <p className="govuk-body-s govuk-!-margin-top-1" style={{ color: "#505a5f" }}>
                <strong>Fee:</strong> KSh 150 per submission • <strong>Timeline:</strong> 1 to 2 working days. Approved names are locked to your profile for 30 days.
              </p>
            </li>

            <li className="govuk-!-margin-bottom-4">
              <strong>Complete Statutory Registration Forms</strong><br />
              For private limited companies, you must completely fill out and digitally sign the standard electronic corporate formation declarations:
              <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-1" style={{ fontSize: "14px", color: "#505a5f", paddingLeft: "15px" }}>
                <li><strong>Form CR1:</strong> Application for Registration of a Limited Company.</li>
                <li><strong>Form CR2:</strong> Model <Link href="/services/business/articles-of-association" className="govuk-link govuk-link--no-underline">Articles of Association</Link> agreements.</li>
                <li><strong>Form CR8:</strong> Notice of Residential Address of Directors.</li>
                <li><strong>Statement of Nominal Capital:</strong> Capital structure allocations and share definitions.</li>
              </ul>
            </li>

            <li className="govuk-!-margin-bottom-4">
              <strong>Upload Identifications and Submit Pay</strong><br />
              Provide crisp scans of National IDs or Passports for all directors/shareholders, KRA PIN certificates, and recent passport-size photographs. Pay the baseline statutory incorporation fee (KSh 10,650 for standard limited companies) via eCitizen payment integrations.
            </li>

            <li className="govuk-!-margin-bottom-4">
              <strong>Download Registration Certificates</strong><br />
              Once verified by the Registrar of Companies, approved document download tokens are dispatched. Access your dashboard to secure your official digital Certificate of Incorporation and <Link href="/services/business/cr12" className="govuk-link govuk-link--no-underline">Form CR12</Link> (Official Shareholder Registry Document).
            </li>
          </ol>
        </section>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-6 govuk-!-margin-bottom-6" />

        {/* ================= 3. AFTER REGISTRATION ================= */}
        <section className="govuk-!-margin-top-4" style={{ maxWidth: "48rem" }}>
          <h2 className="govuk-heading-m" style={{ fontSize: "22px", color: "#0b0c0c", marginBottom: "8px" }}>
            3. Next steps after registration
          </h2>
          <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-4">
            You must secure your tax registrations and local permits before commencing commercial operations to avoid statutory penalties.
          </p>

          <div className="govuk-!-margin-bottom-4">
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>
              Tax Obligations &amp; iTax Setup
            </h3>
            <p className="govuk-body-s govuk-!-margin-bottom-1" style={{ lineHeight: "1.4", color: "#2b2b2b" }}>
              Register your newly generated entity on the KRA iTax portal to secure a dedicated Company KRA PIN.
            </p>
            <ul className="govuk-list govuk-list--bullet" style={{ fontSize: "14px", color: "#505a5f", paddingLeft: "15px" }}>
              <li><strong>Value Added Tax (VAT):</strong> Mandatory 16% tracking if your annual sales cross KSh 5 Million.</li>
              <li><Link href="/services/tax/turnover-tax" className="govuk-link govuk-link--no-underline">Turnover Tax (ToT)</Link>: 3% on gross sales for small enterprises earning between KSh 1M and KSh 25M annually.</li>
            </ul>
          </div>

          <div className="govuk-!-margin-bottom-4">
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>
              County Business Permits
            </h3>
            <p className="govuk-body-s govuk-!-margin-bottom-1" style={{ lineHeight: "1.4", color: "#2b2b2b" }}>
              Secure a <Link href="/services/business/unified-permit" className="govuk-link govuk-link--no-underline">Unified Business Permit (UBP)</Link> from your respective County Revenue authority. This single documentation token wraps together your standard trading operations clearance, public health safety certificates, and fire audit tokens into one yearly fee ledger.
            </p>
          </div>

          <div className="govuk-!-margin-bottom-4">
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>
              National Health &amp; Pension Funds
            </h3>
            <p className="govuk-body-s govuk-!-margin-bottom-0" style={{ lineHeight: "1.4", color: "#2b2b2b" }}>
              Register as an active employer with the National Social Security Fund (NSSF) and enroll workers with the Social Health Authority (SHA) to process statutory monthly payroll deductions seamlessly.
            </p>
          </div>
        </section>

        <GovUKFeedback />
      </main>

      {/* Global CSS Layout Overrides safe for Next App Architecture */}
      <style dangerouslySetInnerHTML={{__html: `
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        ol.govuk-list--number { list-style-type: decimal !important; }
        ul.govuk-list--bullet { list-style-type: disc !important; }
      `}} />
    </div>
  );
}
