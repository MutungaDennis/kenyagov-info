/** Native date format — avoids date-fns in the Worker bundle (CF Free size). */
function formatDayMonthYear(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

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
  const formattedLastUpdated = formatDayMonthYear(lastUpdated);
  
  const formattedPublished = published 
    ? formatDayMonthYear(published) 
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