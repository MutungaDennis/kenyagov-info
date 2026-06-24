'use client';

import React from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function ConstitutionAndNationalValuesPage() {
  return (
    <div className="govuk-width-container">
      {/* GOV.UK Navigation Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "Constitution & National Values", href: "/society-and-culture/constitution-and-national-values" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER SECTION */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-two-thirds">
            {/* <span className="govuk-caption-xl">Civic Education &amp; Governance</span> */}
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              The Constitution and National Values
            </h1>
            <p className="govuk-body-l">
              An educational overview of Kenya’s constitutional identity, core principles of governance, and the shared values that shape civic life in the Republic.
            </p>
          </div>
        </div>

        

        {/* MAIN BODY AND ASIDE LAYOUT MATRIX */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* 1. INTRODUCTION */}
            <section id="introduction" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">1. Introduction to the Constitution</h2>
              <p className="govuk-body">
                Promulgated on 27 August 2010, the Constitution of Kenya is the supreme law of the Republic. It binds all sovereign organs, state officers, public institutions, and citizens across the territory. 
              </p>
              <p className="govuk-body">
                The Constitution sets up the primary framework for governance, safeguards fundamental human rights through a comprehensive Bill of Rights, divides state authority between national and devolved governments, and provides the baseline values that preserve national cohesion.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 2. NATIONAL VALUES AND PRINCIPLES OF GOVERNANCE */}
            <section id="national-values" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">2. National Values and Principles of Governance</h2>
              <p className="govuk-body">
                Enshrined under <strong>Article 10 of the Constitution</strong>, these mandatory values guide all state organs, state officers, public entities, and individual citizens whenever they apply or interpret the law, or enact public policy decisions.
              </p>
              
              <p className="govuk-body-s" style={{ color: "#505a5f" }}>
                Select a heading below to explore specific constitutional value parameters in plain language:
              </p>

              {/* Accessible Expanders Pattern */}
              <details className="govuk-details govuk-!-margin-bottom-2" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Patriotism and National Unity</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Encourages continuous personal devotion to the development, security, and cultural heritage of Kenya, while prioritizing shared nationhood over individual or ethnic interests.
                  </p>
                </div>
              </details>

              <details className="govuk-details govuk-!-margin-bottom-2" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Sharing and Devolution of Power</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Prevents the concentration of absolute authority in a single centralized entity by dispersing functional responsibilities and funds across the 47 distinct county governments.
                  </p>
                </div>
              </details>

              <details className="govuk-details govuk-!-margin-bottom-2" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Rule of Law and Democracy</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Establishes that every individual, regardless of rank or status, is equally subject to the law. Governance must be executed through democratically elected representatives and open popular participation.
                  </p>
                </div>
              </details>

              <details className="govuk-details govuk-!-margin-bottom-2" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Human Dignity, Equity, and Social Justice</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Demands that all public systems protect the inherent self-worth of citizens, provide fair distribution of national resources, and remove structural barriers that disadvantage marginalized communities.
                  </p>
                </div>
              </details>

              <details className="govuk-details govuk-!-margin-bottom-2" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Good Governance, Integrity, and Accountability</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    Requires public administration workflows to be transparent, free from corruption, and answerable to the electorate through accurate institutional checks and balance monitoring.
                  </p>
                </div>
              </details>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
            {/* 3. NATIONAL IDENTITY */}
            <section id="national-identity" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">3. National Identity and Diversity</h2>
              <p className="govuk-body">
                The Constitution recognizes Kenya’s cultural diversity as the bedrock of its national identity. It balances a single, shared citizenship model with deep respect for varying ethnic traditions and linguistic heritages.
              </p>
              <p className="govuk-body">
                To explore localized data subsets linked directly to this national framework, consult our informational registries:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <Link href="/society-and-culture/national-symbols" className="govuk-link"><strong>Official National Symbols Registry</strong></Link> — Textual records of the flag, motto, pledge, and emblems.
                </li>
                <li>
                  <Link href="/society-and-culture/languages" className="govuk-link"><strong>Languages and Dialects Guidance</strong></Link> — Understanding Kiswahili as the national language alongside English and indigenous idioms.
                </li>
                <li>
                  <Link href="/society-and-culture/communities" className="govuk-link"><strong>Communities and Social Identity Hub</strong></Link> — Demographic Overviews of Kenya&apos;s distinct cultural communities.
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 4. STRUCTURE OF GOVERNMENT */}
            <section id="government-structure" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">4. Structure of Government</h2>
              <p className="govuk-body">
                To guarantee structured checks and balances, the state administration is functionally divided into three independent branches, alongside a devolved administrative tier:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>The Executive:</strong> Comprises the President, Deputy President, and the Cabinet. It is tasked with the execution of national laws and state policy.
                </li>
                <li>
                  <strong>The Legislature:</strong> A bicameral parliament consisting of the National Assembly and the Senate, responsible for legislative enactments and oversight of public expenditure.
                </li>
                <li>
                  <strong>The Judiciary:</strong> Comprises the courts, headed by the Chief Justice. It is completely independent and possesses exclusive authority to interpret legal matrices.
                </li>
                <li>
                  <strong>Devolved Government:</strong> Splits administrative tasks down into 47 distinct County Governments, each consisting of a County Executive headed by a Governor, and a legislative County Assembly.
                </li>
              </ul>
              <p className="govuk-body govuk-!-margin-top-2">
                For detailed structural lists of administrative offices or independent regulators, see our <Link href="/government" className="govuk-link">Government Portal</Link> or the <Link href="/institutions" className="govuk-link">Public Institutions Directory</Link>.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 5. RIGHTS AND FREEDOMS */}
            <section id="bill-of-rights" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">5. Fundamental Rights and Freedoms</h2>
              <p className="govuk-body">
                Chapter Four of the Constitution contains a comprehensive Bill of Rights. This serves as a structural shield to protect individual liberties and group rights from unlawful institutional interference. Core components include:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><strong>Equality and Non-discrimination:</strong> Guarantees equal treatment before the law regardless of race, sex, religion, or social origin.</li>
                <li><strong>Freedom of Expression and Media:</strong> Safeguards speech, academic exploration, and journalistic independence, excluding speech that incites violence.</li>
                <li><strong>Freedom of Religion and Conscience:</strong> Establishes that there is no state-mandated religion, granting every citizen the right to worship freely.</li>
                <li><strong>Socio-Economic Rights:</strong> Outlines baseline targets regarding health services, clean water, adequate housing, food security, and education.</li>
                <li><strong>Specific Protection Rights:</strong> Contains tailored protections for children, youth, persons with disabilities, and historically marginalized groups.</li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 6. CIVIC RESPONSIBILITIES */}
            <section id="civic-responsibilities" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">6. Civic Responsibilities</h2>
              <p className="govuk-body">
                A robust constitutional democracy relies directly on active civic participation and personal responsibility. Key public duties for Kenyan citizens include:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><strong>Respecting the Constitution:</strong> Upholding, defending, and continuously obeying the statutory laws of the land.</li>
                <li><strong>Taxation Compliance:</strong> Diligently paying required national and county taxes to fund essential infrastructure and social security services.</li>
                <li><strong>Democratic Engagement:</strong> Registering to vote and peacefully participating in general elections or localized referendums.</li>
                <li><strong>Respecting Others:</strong> Tolerating diverse opinions and protecting the individual freedoms of neighbors and fellow citizens.</li>
                <li><strong>Environmental Safeguards:</strong> Actively cooperating with conservation targets to preserve natural resources for future generations.</li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
            {/* 7. PUBLIC PARTICIPATION */}
            <section id="public-participation" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">7. Public Participation</h2>
              <p className="govuk-body">
                Public participation is a mandatory constitutional requirement for all legislative enactments and public policy processes in Kenya. 
              </p>
              <p className="govuk-body">
                Government ministries, parliamentary committees, and county executives are legally required to provide timely data notifications and host public forums before passing laws, national budgets, or project plans. Citizens can influence governance through several mechanisms:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><strong>Town Hall Forums:</strong> Attending county budgeting meetings to influence local development priorities.</li>
                <li><strong>Written Memoranda:</strong> Submitting comments to Parliamentary Clerks regarding pending legislative bills.</li>
                <li><strong>Citizen Petitions:</strong> Lodging formal petitions to state assemblies to request investigations into public service delivery issues.</li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 8. DEVOLUTION */}
            <section id="devolution" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">8. Devolution and Local Service Delivery</h2>
              <p className="govuk-body">
                Devolution splits government functions between the National Government and 47 distinct County Governments. Its main goal is to bring public services closer to the people and ensure fair resource distribution across the country.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>National Responsibilities:</strong> Manages foreign policy, national defense, the judicial system, immigration, and macro-economic planning.
                </li>
                <li>
                  <strong>County Responsibilities:</strong> Controls local agricultural programs, county health facilities, pre-primary education, local transport, and waste management systems.
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 9. CONSTITUTIONAL COMMISSIONS AND INDEPENDENT OFFICES */}
            <section id="commissions" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">9. Constitutional Commissions and Independent Offices</h2>
              <p className="govuk-body">
                Chapter Fifteen of the Constitution establishes autonomous commissions and independent offices. These entities are independent of executive control and are designed to safeguard democratic governance, protect human rights, and ensure financial accountability:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><strong>IEBC:</strong> Co-ordinates national registration exercises and executes transparent elections.</li>
                <li><strong>KNCHR:</strong> Evaluates civil liberty status frameworks and tracks compliance with human rights treaties.</li>
                <li><strong>EACC:</strong> Investigates economic crimes and enforces public leadership integrity parameters.</li>
                <li><strong>CRA:</strong> Recommends formulas for sharing national revenues between national and county governments.</li>
                <li><strong>NCIC:</strong> Promotes national cohesion and mitigates ethnic discrimination patterns.</li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 10. CONSTITUTIONAL HISTORY TIMELINE */}
            <section id="history" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">10. Concise Constitutional History</h2>
              <p className="govuk-body">
                Kenya’s legal identity has evolved through three major historical constitutional phases:
              </p>
              
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-table__caption--s">Key Eras in Kenya&apos;s Constitutional Evolution</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header" style={{ width: "25%" }}>Year / Milestone</th>
                    <th scope="col" className="govuk-table__header">Historical Framework and Civic Impact</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>15 Dec 1963</th>
                    <td className="govuk-table__cell"><strong>The Independence Constitution:</strong> Drafted during the Lancaster House Conferences, establishing a regional governance system that was later centralized.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>1964 – 2008</th>
                    <td className="govuk-table__cell"><strong>The Centralization and Reform Era:</strong> A long series of legal amendments alternated governance styles, leading to multi-party democracy in 1991 and eventual demands for holistic structural overhauls.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>27 Aug 2010</th>
                    <td className="govuk-table__cell"><strong>The Modern Constitution:</strong> Ratified by over 67% of voters in a national referendum, this framework introduces deep institutional separation of powers, devolution, and the modern Article 10 governance values.</td>
                  </tr>
                </tbody>
              </table>
            </section>

          </div>

          {/* SIDEBAR NAVIGATION COLUMN */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div className="society-top-border">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related Guidance</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/national-symbols" className="govuk-link">
                    <strong>National Symbols Registry</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/civic-values" className="govuk-link">
                    <strong>Public Participation Frameworks</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/institutions" className="govuk-link">
                    <strong>Independent Commissions Directory</strong>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FEEDBACK & FOOTER METADATA */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <LastUpdated published="2026-05-22" lastUpdated="2026-05-22" />
            
          </div>
        </div>

      </main>
    </div>
  );
}
