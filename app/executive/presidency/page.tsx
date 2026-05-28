'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


export default function PresidencyPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">The Presidency</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official register, leadership profiles, administrative disclosures, and policy decisions for the executive office of the republic.
            </p>

            <GovUKSummaryList
              items={[
                { key: "Constitutional Role", value: "Head of State and Government, Commander-in-Chief of the Defence Forces" },
                { key: "Current President", value: "H.E. Dr. William Samoei Ruto, CGH" },
                { key: "Current Deputy President", value: "H.E. Prof. Kithure Kindiki, EGH" },
                { key: "Mandate Timeline", value: "5-year executive terms under Article 136 of the Constitution" },
              ]}
            />

            {/* SECTION 1: Leadership Profiles Links */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Executive Leadership Profiles</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/executive/presidency/president" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  Office of the President
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Biography, speeches, press dispatches, constitutional duties, and direct advisers to President William Ruto.
                </p>
              </li>
              <li>
                <Link href="/executive/presidency/deputy-president" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  Office of the Deputy President
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Institutional mandate, leadership profile, and official functions of Deputy President Kithure Kindiki.
                </p>
              </li>
            </ul>

            {/* SECTION 2: Official Records and Legislation */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Official Registers and Disclosures</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/executive/presidency/cabinet-decisions" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  Register of Cabinet Decisions
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Access official dispatches, statutory resolutions, and sector-wide national policy approvals passed during Cabinet sessions.
                </p>
              </li>
              <li>
                <Link href="/executive/presidency/executive-orders" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  Presidential Executive Orders
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Review formal policy directives, ministerial re-organizations, and state department institutional assignments.
                </p>
              </li>
              <li>
                <Link href="/executive/presidency/international-visits" className="govuk-link govuk-!-font-size-19">
                  Register of International Visits
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Track diplomatic itineraries, overseas summits, bilateral outcomes, and global speeches delivered by the President.
                </p>
              </li>
            </ul>

            {/* SECTION 3: Organs and Secretariats */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Presidency Organs and Executive Offices</h2>
            <p className="govuk-body">
              The daily administrative duties and national security advice for the Presidency are supported by specialized institutions:
            </p>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/executive/presidency/cabinet-office" className="govuk-link">
                  The Cabinet Office and Secretariat
                </Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Manages Cabinet agendas, tracks the execution of state policies, and archives official decisions.</span>
              </li>
              <li>
                <Link href="/executive/presidency/state-house-administration" className="govuk-link">
                  State House Administration and Budget
                </Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Details the operational structure, staff register, fiscal allocations, and advisory desks inside State House.</span>
              </li>
              <li>
                <Link href="/executive/presidency/national-security-council" className="govuk-link">
                  National Security Council (NSC)
                </Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Tracks high-level defensive coordination policies under Article 240 of the Constitution.</span>
              </li>
            </ul>

            
          </div>
        </div>
      </main>
    </div>
  );
}
