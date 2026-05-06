'use client';

import Link from 'next/link';
import { Position } from '@/lib/supabase/officials';

interface PositionHierarchyProps {
  positions: Position[];
}

export function PositionHierarchy({ positions }: PositionHierarchyProps) {
  // Group positions by level
  const positionsByLevel = positions.reduce(
    (acc, pos) => {
      if (!acc[pos.level]) {
        acc[pos.level] = [];
      }
      acc[pos.level].push(pos);
      return acc;
    },
    {} as Record<string, Position[]>
  );

  const levels = ['National', 'County', 'Independent'].filter(level => positionsByLevel[level]);

  return (
    <div>
      <h2 className="govuk-heading-m govuk-!-margin-bottom-4">Position Directory</h2>
      
      <div className="govuk-grid-row">
        {levels.map((level) => (
          <div key={level} className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
            <h3 className="govuk-heading-s">{level} Positions</h3>
            <ul className="govuk-list govuk-list--bullet">
              {positionsByLevel[level]?.map((pos) => (
                <li key={pos.code}>
                  <Link
                    href={`/officials?position=${pos.code}`}
                    className="govuk-link"
                  >
                    {pos.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
