'use client';

import Link from 'next/link';
import GovUKBackLink from '@/components/govuk/BackLink';


export default function AdminDashboard() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/" />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Admin Dashboard</h1>
            <p className="govuk-body-l">
              Manage content, institutions, leaders and data for KenyaGovInfo.KE
            </p>

            <div className="govuk-inset-text govuk-!-margin-top-6">
              All changes made here are saved in Supabase and will appear live on the website.
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Core Management</h2>

            <div className="govuk-grid-row">
              {/* Government Institutions */}
              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                <div className="govuk-card govuk-card--clickable">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">
                      <Link href="/admin/institutions" className="govuk-link">
                        Government Institutions
                      </Link>
                    </h3>
                    <p className="govuk-card__description">
                      Manage ministries, state departments, SAGAs, commissions and all public bodies
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Leaders */}
              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                <div className="govuk-card govuk-card--clickable">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">
                      <Link href="/admin/leaders" className="govuk-link">
                        Current Leaders
                      </Link>
                    </h3>
                    <p className="govuk-card__description">
                      Manage President, Cabinet Secretaries, Governors, MPs, Senators and other leaders
                    </p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                <div className="govuk-card govuk-card--clickable">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">
                      <Link href="/admin/services" className="govuk-link">
                        Public Services
                      </Link>
                    </h3>
                    <p className="govuk-card__description">
                      Manage popular services, guides and how-to information
                    </p>
                  </div>
                </div>
              </div>

              {/* Counties */}
              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                <div className="govuk-card govuk-card--clickable">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">
                      <Link href="/admin/counties" className="govuk-link">
                        County Governments
                      </Link>
                    </h3>
                    <p className="govuk-card__description">
                      Manage 47 counties, governors and county institutions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Additional Management</h2>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
                <div className="govuk-card">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">
                      <Link href="/admin/constitutional-bodies" className="govuk-link">
                        Constitutional Bodies
                      </Link>
                    </h3>
                    <p className="govuk-card__description">IEBC, EACC, CRA, PSC, etc.</p>
                  </div>
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
                <div className="govuk-card">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">
                      <Link href="/admin/security" className="govuk-link">
                        Security Agencies
                      </Link>
                    </h3>
                    <p className="govuk-card__description">KDF, NPS, NIS and related bodies</p>
                  </div>
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
                <div className="govuk-card">
                  <div className="govuk-card__content">
                    <h3 className="govuk-card__title">
                      <Link href="/admin/public-finance" className="govuk-link">
                        Public Finance
                      </Link>
                    </h3>
                    <p className="govuk-card__description">Budget, MTEF sectors and reports</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible govuk-!-margin-top-9" />

            <h2 className="govuk-heading-m">System Overview</h2>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <div className="govuk-panel">
                  <strong>Institutions:</strong> <span className="govuk-!-font-size-24">142</span>
                </div>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-panel">
                  <strong>Leaders:</strong> <span className="govuk-!-font-size-24">218</span>
                </div>
              </div>
              <div className="govuk-grid-column-one-third">
                <div className="govuk-panel">
                  <strong>Services:</strong> <span className="govuk-!-font-size-24">87</span>
                </div>
              </div>
            </div>

            <div className="govuk-button-group govuk-!-margin-top-9">
              <button className="govuk-button">Export All Data</button>
              <button className="govuk-button govuk-button--secondary">Run Data Sync</button>
              <button className="govuk-button govuk-button--warning">Clear Cache</button>
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
}