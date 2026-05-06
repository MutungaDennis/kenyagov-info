'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'officials',
      title: 'Government Officials',
      description: 'Add, edit, or delete government officials',
      href: '/admin/officials',
    },
    {
      id: 'counties',
      title: 'Counties',
      description: 'Manage county information',
      href: '/admin/counties',
    },
    {
      id: 'positions',
      title: 'Positions',
      description: 'Manage government positions',
      href: '/admin/positions',
    },
    {
      id: 'parties',
      title: 'Political Parties',
      description: 'Manage political parties',
      href: '/admin/parties',
    },
    {
      id: 'entities',
      title: 'Government Entities',
      description: 'Manage ministries, agencies, and institutions',
      href: '/admin/entities',
    },
  ];

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Admin Dashboard</h1>
            <p className="govuk-body-l">
              Manage Kenya government information database
            </p>
            
            <div className="govuk-inset-text" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <strong>Note:</strong> This admin area allows you to add, edit, and delete government data.
              All changes are stored in Supabase and will be reflected across the website.
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-top-6">Data Management</h2>
            
            <div className="govuk-grid-row">
              {sections.map((section) => (
                <div key={section.id} className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
                  <div className="govuk-card" style={{ height: '100%' }}>
                    <div className="govuk-card__content">
                      <h3 className="govuk-heading-m govuk-!-margin-top-0">
                        <Link href={section.href} className="govuk-link">
                          {section.title}
                        </Link>
                      </h3>
                      <p className="govuk-body-s">{section.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible govuk-!-margin-top-9" />

            <h2 className="govuk-heading-m govuk-!-margin-top-9">Quick Stats</h2>
            <p className="govuk-body">
              Database summary will appear here with counts of officials, counties, positions, etc.
            </p>

            <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible govuk-!-margin-top-9" />

            <h2 className="govuk-heading-m govuk-!-margin-top-9">Database Sync</h2>
            <p className="govuk-body">
              This admin panel manages data stored in Supabase. Changes made here will be immediately
              available across the website for public users.
            </p>

            <div className="govuk-button-group">
              <button className="govuk-button">
                Export Data
              </button>
              <button className="govuk-button govuk-button--secondary">
                Sync with External Source
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
