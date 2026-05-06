'use client';

import { OfficialWithRelations } from '@/lib/supabase/officials';
import { OfficialCard } from './OfficialCard';

interface OfficialsListProps {
  officials: OfficialWithRelations[];
  isLoading?: boolean;
  showParty?: boolean;
  emptyMessage?: string;
}

export function OfficialsList({
  officials,
  isLoading = false,
  showParty = true,
  emptyMessage = 'No officials found. Try adjusting your search or filters.',
}: OfficialsListProps) {
  if (isLoading) {
    return (
      <div className="govuk-body-s govuk-!-margin-bottom-6">
        <p>Loading officials...</p>
      </div>
    );
  }

  if (officials.length === 0) {
    return (
      <div className="govuk-inset-text">
        <p className="govuk-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <p className="govuk-body-s govuk-!-margin-bottom-6">
        Showing {officials.length} official{officials.length !== 1 ? 's' : ''}
      </p>

      <ul className="govuk-list">
        {officials.map((official) => (
          <li key={official.id}>
            <OfficialCard official={official} showParty={showParty} />
          </li>
        ))}
      </ul>
    </>
  );
}
