'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function CountiesPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
        ]}
      />

      {/* Reduced padding wrapper to pull content upwards */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced from heading-xl to heading-l to maintain global uniformity */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-3">Counties of Kenya</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Kenya is divided into 47 counties established under Chapter 11 of the 2010 Constitution. 
              These units of devolved government handle local service delivery, infrastructure development, and regional resource management.
            </p>

            {/* Replaced bulky button wrappers with clean, task-focused GOV.UK navigation lists */}
            <h2 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-2">Find county services and leadership</h2>
            <ul className="govuk-list govuk-list--spaced govuk-!-margin-bottom-6">
              <li>
                <Link href="/counties/all" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  View all 47 counties
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  Browse a full list of counties, capitals, codes, and administrative headquarters.
                </p>
              </li>
              <li>
                <Link href="/counties/governors" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">
                  Find current County Governors and Deputies
                </Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 govuk-text-secondary">
                  See a complete register of elected leadership and political party affiliations.
                </p>
              </li>
            </ul>

            {/* Inset Text is strictly used for factual emphasis, removing marketing tone */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              Devolution transferred core public service delivery functions and national financial resources from the national government to local county governments.
            </div>

            {/* Quick Factual Summary Layout Grid */}
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">47 Counties</h3>
                <p className="govuk-body-s">Administrative units mapped across former district boundaries.</p>
              </div>
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">5-Year Terms</h3>
                <p className="govuk-body-s">Governors and County Assemblies are elected concurrently.</p>
              </div>
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-2">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Constitution 2010</h3>
                <p className="govuk-body-s">Governed by the provisions of Chapter 11 on Devolved Government.</p>
              </div>
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">County Government Responsibilities</h2>
            <p className="govuk-body">
              Under the Fourth Schedule of the Constitution, county governments manage key local public infrastructure and amenities including:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>Health services including county referral hospitals, local dispensaries, and pharmacy networks</li>
              <li>Agriculture development, local livestock management, and fisheries protection</li>
              <li>County public roads, localized transport lines, and street lighting installations</li>
              <li>Pre-primary child education (ECD centres) and village polytechnic centers</li>
              <li>Water provision infrastructure, waste sanitation systems, and local environment services</li>
              <li>Trade regulation, licensing systems, and marketplace development</li>
              <li>County spatial planning and land usage approvals</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Devolution Information Guides</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/counties/devolution" className="govuk-link">
                  Understanding Devolution in Kenya
                </Link>
              </li>
              <li>
                <Link href="/counties/performance" className="govuk-link">
                  County Performance and Budget Rankings
                </Link>
              </li>
            </ul>

            
          </div>
        </div>
      </main>
    </div>
  );
}
