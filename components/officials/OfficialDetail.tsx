'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OfficialWithRelations } from '@/lib/supabase/officials';

interface OfficialDetailProps {
  official: OfficialWithRelations;
}

export function OfficialDetail({ official }: OfficialDetailProps) {
  const party = official.political_parties;
  const position = official.positions;
  const county = official.counties;
  const constituency = official.constituencies;
  const ward = official.wards;

  return (
    <article className="govuk-!-margin-bottom-8">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          {official.image_url && (
            <div className="mb-6">
              <Image
                src={official.image_url}
                alt={official.full_name}
                width={200}
                height={200}
                className="w-full rounded"
              />
            </div>
          )}
        </div>
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
            {official.full_name}
          </h1>
          
          {position && (
            <p className="govuk-heading-m text-blue-600 govuk-!-margin-bottom-1">
              {position.title}
            </p>
          )}

          {/* Political Party */}
          {party && (
            <div className="govuk-!-margin-bottom-4">
              <p className="govuk-body-s govuk-!-margin-bottom-1">
                <strong>Political Party:</strong>
              </p>
              <p 
                className="govuk-body"
                style={{ 
                  color: party.color_code || 'inherit',
                  fontWeight: 500 
                }}
              >
                {party.name}
                {party.abbreviation && ` (${party.abbreviation})`}
              </p>
            </div>
          )}

          {/* Location Information */}
          {(county || constituency || ward) && (
            <div className="govuk-!-margin-bottom-4">
              <p className="govuk-body-s govuk-!-margin-bottom-1">
                <strong>Location:</strong>
              </p>
              <ul className="govuk-list govuk-list--bullet">
                {county && (
                  <li>
                    <Link href={`/officials?county=${county.code}`} className="govuk-link">
                      {county.name}
                    </Link>
                  </li>
                )}
                {constituency && (
                  <li>
                    {constituency.name} (Constituency)
                  </li>
                )}
                {ward && (
                  <li>
                    {ward.name} (Ward)
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Contact Information */}
          {(official.email || official.phone || official.office_address) && (
            <div className="govuk-!-margin-bottom-4">
              <p className="govuk-body-s govuk-!-margin-bottom-1">
                <strong>Contact Information:</strong>
              </p>
              <ul className="govuk-list">
                {official.email && (
                  <li>
                    <strong>Email:</strong> <a href={`mailto:${official.email}`} className="govuk-link">{official.email}</a>
                  </li>
                )}
                {official.phone && (
                  <li>
                    <strong>Phone:</strong> <a href={`tel:${official.phone}`} className="govuk-link">{official.phone}</a>
                  </li>
                )}
                {official.office_address && (
                  <li>
                    <strong>Office Address:</strong> {official.office_address}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Term Information */}
          {(official.start_date || official.end_date) && (
            <div className="govuk-!-margin-bottom-4">
              <p className="govuk-body-s govuk-!-margin-bottom-1">
                <strong>Term:</strong>
              </p>
              <p className="govuk-body">
                {official.start_date && `From ${new Date(official.start_date).toLocaleDateString()}`}
                {official.end_date && ` to ${new Date(official.end_date).toLocaleDateString()}`}
                {official.is_active && ' (Active)'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Biography */}
      {official.bio && (
        <div className="govuk-!-margin-top-8 govuk-!-margin-bottom-8">
          <h2 className="govuk-heading-m">Biography</h2>
          <p className="govuk-body">{official.bio}</p>
        </div>
      )}
    </article>
  );
}
