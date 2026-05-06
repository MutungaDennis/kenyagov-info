import { format } from 'date-fns';

type LastUpdatedProps = {
  lastUpdated: string | Date;     // ISO string or Date object
  published?: string | Date;      // Optional published date
  className?: string;
};

export default function LastUpdated({ 
  lastUpdated, 
  published, 
  className = "" 
}: LastUpdatedProps) {
  const formattedLastUpdated = format(new Date(lastUpdated), "d MMMM yyyy");
  
  const formattedPublished = published 
    ? format(new Date(published), "d MMMM yyyy") 
    : null;

  return (
    <div className={`govuk-!-margin-top-8 govuk-!-margin-bottom-8 ${className}`}>
      <p className="govuk-body-s govuk-!-margin-bottom-1">
        {formattedPublished && (
          <>Published: <strong>{formattedPublished}</strong> • </>
        )}
        Last updated: <strong>{formattedLastUpdated}</strong>
      </p>
      <p className="govuk-body-s govuk-!-margin-bottom-0">
        This information is regularly reviewed to ensure accuracy.
      </p>
    </div>
  );
}