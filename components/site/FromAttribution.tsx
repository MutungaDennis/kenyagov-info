import Link from "next/link";

type Body = {
  name: string;
  href?: string;
};

type Props = {
  bodies: Body[];
  published?: string;
  updated?: string;
};

/**
 * GOV.UK “From” + last updated pattern for guidance pages.
 */
export default function FromAttribution({
  bodies,
  published,
  updated,
}: Props) {
  if (!bodies.length && !published && !updated) return null;

  return (
    <div className="govuk-!-margin-bottom-4 app-from-attribution">
      {bodies.length > 0 && (
        <p className="govuk-body-s govuk-!-margin-bottom-1">
          <span className="govuk-!-font-weight-bold">From: </span>
          {bodies.map((body, index) => (
            <span key={`${body.name}-${index}`}>
              {index > 0 ? ", " : null}
              {body.href ? (
                <Link href={body.href} className="govuk-link">
                  {body.name}
                </Link>
              ) : (
                body.name
              )}
            </span>
          ))}
        </p>
      )}
      {(published || updated) && (
        <p className="govuk-body-s govuk-!-margin-bottom-0 govuk-!-color-grey">
          {published ? <>Published {published}</> : null}
          {published && updated ? " · " : null}
          {updated ? <>Last updated {updated}</> : null}
        </p>
      )}
    </div>
  );
}
