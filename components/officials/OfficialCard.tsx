'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OfficialWithRelations, PoliticalParty } from '@/lib/supabase/officials';

interface OfficialCardProps {
  official: OfficialWithRelations;
  showParty?: boolean;
}

export function OfficialCard({ official, showParty = true }: OfficialCardProps) {
  const party = official.political_parties as PoliticalParty | undefined;
  const position = official.positions?.title || 'Official';
  const county = official.counties?.name;

  return (
    <div className="govuk-!-margin-bottom-6 pb-6 border-b border-gray-200 last:border-b-0">
      <div className="flex gap-4">
        {official.image_url && (
          <div className="flex-shrink-0 w-16 h-16 relative">
            <Image
              src={official.image_url}
              alt={official.full_name}
              fill
              className="object-cover rounded"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
            <Link 
              href={`/officials/${official.id}`}
              className="govuk-link"
            >
              {official.full_name}
            </Link>
          </h3>
          <p className="govuk-body govuk-!-margin-bottom-1 font-medium">
            {position}
          </p>
          
          {(county || showParty) && (
            <p className="govuk-body-s text-gray-600 govuk-!-margin-bottom-2">
              {county && <span>{county}</span>}
              {county && showParty && party && ' • '}
              {showParty && party && (
                <span 
                  style={{ 
                    color: party.color_code || 'inherit',
                    fontWeight: 500 
                  }}
                >
                  {party.abbreviation || party.name}
                </span>
              )}
            </p>
          )}
          
          {official.bio && (
            <p className="govuk-body-s text-gray-600 line-clamp-2">
              {official.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
