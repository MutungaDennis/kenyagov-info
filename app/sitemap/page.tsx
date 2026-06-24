'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function SitemapPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Sitemap", href: "/sitemap" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Sitemap</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              A comprehensive directory of all sections, registers, and public information pages available on CitizenGuide.KE.
            </p>

            {/* Category 1: Services Directory */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Public Services Indices</h2>
            <ul className="govuk-list govuk-list--spaced" >
              <li>
                <Link href="/services" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">All Services</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Central hub for civil registration pathways and common informational guides.</p>
              </li>
              <li><Link href="/services/id" className="govuk-link">Births, Deaths, National IDs &amp; Care</Link></li>
              <li><Link href="/services/passport" className="govuk-link">Passports, Visas &amp; Travel Abroad</Link></li>
              <li><Link href="/services/tax" className="govuk-link">Money, KRA Payments &amp; Taxes</Link></li>
              <li><Link href="/services/driving" className="govuk-link">Driving Licences &amp; Vehicle Registration</Link></li>
              <li><Link href="/services/housing" className="govuk-link">Affordable Housing Portal Access</Link></li>
            </ul>

            {/* Category 2: Government Organs & The Executive */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Government Leadership &amp; Organs</h2>
            <ul className="govuk-list govuk-list--spaced" >
              <li>
                <Link href="/executive" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">The Executive Hub</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Overview of the national cabinet, state dockets, and ministries.</p>
              </li>
              <li>
                <Link href="/executive/presidency" className="govuk-link govuk-!-font-weight-bold">The Presidency Directory</Link>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-1 govuk-!-margin-left-4">
                  <li><Link href="/executive/presidency/president" className="govuk-link">Office of the President</Link></li>
                  <li><Link href="/executive/presidency/deputy-president" className="govuk-link">Office of the Deputy President</Link></li>
                  <li><Link href="/executive/presidency/cabinet-office" className="govuk-link">The Cabinet Office &amp; Secretariat</Link></li>
                  <li><Link href="/executive/presidency/cabinet-decisions" className="govuk-link">Register of Cabinet Decisions</Link></li>
                  <li><Link href="/executive/presidency/executive-orders" className="govuk-link">Presidential Executive Orders</Link></li>
                  <li><Link href="/executive/presidency/international-visits" className="govuk-link">Register of International Visits</Link></li>
                  <li><Link href="/executive/presidency/state-house-administration" className="govuk-link">State House Administration</Link></li>
                  <li><Link href="/executive/presidency/national-security-council" className="govuk-link">National Security Council (NSC)</Link></li>
                </ul>
              </li>
              <li><Link href="/executive/ministries" className="govuk-link">Ministries &amp; State Departments Directory</Link></li>
              <li><Link href="/legislature" className="govuk-link">The Legislature (National Assembly &amp; Senate)</Link></li>
              <li><Link href="/judiciary" className="govuk-link">The Judiciary (Supreme Court &amp; Judicial Registers)</Link></li>
            </ul>

            {/* Category 3: Local & Devolved Units */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Counties &amp; Devolved Units</h2>
            <ul className="govuk-list govuk-list--spaced" >
              <li>
                <Link href="/counties" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Devolved Counties Hub</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Explore economic blocs, devolution guides, and county performance metrics.</p>
              </li>
              <li><Link href="/counties/all" className="govuk-link">All 47 Counties Register</Link></li>
              <li><Link href="/counties/governors" className="govuk-link">County Governors &amp; Deputies Registry</Link></li>
              <li><Link href="/counties/wards" className="govuk-link">Administrative Wards &amp; Constituencies Lookup</Link></li>
              <li><Link href="/counties/devolution" className="govuk-link">Understanding Devolution in Kenya</Link></li>
              <li><Link href="/counties/performance" className="govuk-link">County Performance and Rankings Dashboard</Link></li>
            </ul>

            {/* Category 4: Platform Integrity & Legal Utilities */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Platform Framework &amp; Legal Notices</h2>
            <ul className="govuk-list govuk-list--spaced" >
              <li><Link href="/about" className="govuk-link">About CitizenGuide.KE</Link></li>
              <li><Link href="/help" className="govuk-link">Help and Support Center</Link></li>
              <li><Link href="/accessibility" className="govuk-link">Accessibility Statement</Link></li>
              <li><Link href="/contact" className="govuk-link">Contact Verification Desk</Link></li>
              <li><Link href="/privacy" className="govuk-link">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="govuk-link">Cookies Policy</Link></li>
              <li><Link href="/terms" className="govuk-link">Terms and Conditions</Link></li>
              <li><Link href="/open-data" className="govuk-link">Open Data &amp; Machine-Readable Disclosures</Link></li>
              <li><Link href="/search" className="govuk-link">Global Search Portal 🔍</Link></li>
            </ul>

          
          </div>
        </div>
      </main>
    </div>
  );
}
