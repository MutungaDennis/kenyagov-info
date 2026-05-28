'use client';

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


export default function DevolutionPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "Devolution", href: "/counties/devolution" },
        ]}
      />

      {/* Tightened page padding wrapper to pull layout upwards */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Reduced from heading-xl to heading-l to maintain site uniformity */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-3">Devolution in Kenya</h1>
            
            {/* Reduced from body-l to body to clean up mobile layouts */}
            <p className="govuk-body govuk-!-margin-bottom-4">
              Devolution was established under Chapter 11 of the Constitution of Kenya 2010. 
              It decentralized statutory powers, financial resources, and administrative decision-making from the national executive to 47 elected county governments.
            </p>

            {/* Inset text strictly formatted for factual statutory quotation */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              &ldquo;Devolution shall ensure the participation of people in the exercise of powers of the State&rdquo; &mdash; Article 174(c) of the Constitution of Kenya
            </div>

            {/* Sub-headings lowered to heading-m to keep typography hierarchical */}
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Objects of Devolution</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Article 174 of the Constitution outlines the official objectives of the decentralized structure:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>Promote democratic and accountable exercise of power</li>
              <li>Foster national unity by recognizing socio-cultural diversity</li>
              <li>Give powers of local self-governance to the public</li>
              <li>Recognize the right of local communities to manage their own affairs</li>
              <li>Protect and promote the interests of minority and marginalized communities</li>
              <li>Promote social and economic development and proximate public services</li>
              <li>Ensure equitable sharing of national and local fiscal resources</li>
              <li>Facilitate the decentralization of state organs and institutions</li>
              <li>Enhance institutional checks, balances, and the separation of powers</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Principles of Devolved Government</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              Article 175 requires all 47 county administrative structures to operate based on:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>Democratic principles and structures</li>
              <li>Clear separation of powers between county executives and assemblies</li>
              <li>Institutional accountability, fiscal responsibility, and public transparency</li>
              <li>Reliable and equitable pathways for resource sharing</li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Key Statutory Legislation</h2>
            <p className="govuk-body govuk-!-margin-bottom-3">
              The practical execution of devolution is operationalized by specific pieces of national legislation:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>
                <strong>County Governments Act (No. 17 of 2012)</strong> &mdash; Provides the legal framework for county human resources, operations, and public participation methods.
              </li>
              <li>
                <strong>Public Finance Management Act (No. 18 of 2012)</strong> &mdash; Controls county revenue allocations, tracking oversight, budget implementation, and public audit timelines.
              </li>
              <li>
                <strong>Intergovernmental Relations Act (No. 2 of 2012)</strong> &mdash; Governs dispute resolution channels and coordination frameworks between national ministries and county teams.
              </li>
              <li>
                <strong>Urban Areas and Cities Act (No. 13 of 2011)</strong> &mdash; Dictates the classification and administration criteria for towns, municipalities, and city boards.
              </li>
              <li>
                <strong>Annual Division of Revenue Act</strong> &mdash; Statutorily determines the exact vertical financial division of revenue between national and county governments.
              </li>
            </ul>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Current Implementation Status</h2>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Devolution has completed over a decade of active implementation across Kenya. While local infrastructure deployment and healthcare access measurements have expanded across rural hubs, administrative challenges persist regarding local revenue collection gaps, capacity limits, and system inter-coordination.
            </p>

            
          </div>
        </div>
      </main>
    </div>
  );
}
