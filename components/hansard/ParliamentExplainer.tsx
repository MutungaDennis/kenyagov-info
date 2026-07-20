import Link from "next/link";

type Variant = "hub" | "members" | "member" | "sitting";

type Props = {
  variant?: Variant;
  /** Optional member name for member variant */
  memberName?: string;
};

/**
 * Short citizen-facing explainers for Hansard / parliament pages.
 * Keeps accountability language consistent without repeating long essays.
 */
export default function ParliamentExplainer({
  variant = "hub",
  memberName,
}: Props) {
  if (variant === "hub") {
    return (
      <div className="govuk-inset-text">
        <h2 className="govuk-heading-s">How to hold Parliament to account</h2>
        <ol className="govuk-list govuk-list--number">
          <li>
            <Link
              href="/government/legislature/hansard/members"
              className="govuk-link"
            >
              Find your MP or Senator
            </Link>{" "}
            and open their Hansard record.
          </li>
          <li>
            Check their <strong>speaking pulse</strong> — when they contributed
            on the floor while in office.
          </li>
          <li>
            Read individual sittings to see <strong>what</strong> they said, not
            only how often.
          </li>
          <li>
            Follow{" "}
            <Link
              href="/government/legislature/tracker/bills"
              className="govuk-link"
            >
              bills
            </Link>{" "}
            and{" "}
            <Link
              href="/government/legislature/tracker/questions"
              className="govuk-link"
            >
              questions
            </Link>{" "}
            for law-making and oversight beyond speeches.
          </li>
        </ol>
        <p className="govuk-body-s govuk-!-margin-bottom-0">
          This site structures public Hansard for reading. Official PDFs remain
          the authoritative record where linked. We do not process applications
          or speak for Parliament.
        </p>
      </div>
    );
  }

  if (variant === "members") {
    return (
      <details className="govuk-details govuk-!-margin-bottom-5">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">
            What you can track for each member
          </span>
        </summary>
        <div className="govuk-details__text">
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <strong>Floor contributions</strong> — speeches in debate (not
              when they were moderating as Speaker / Temporary Speaker).
            </li>
            <li>
              <strong>Activity pulse</strong> — a calendar of speaking days
              while they held office (including by-election start dates when we
              have term records).
            </li>
            <li>
              <strong>Full speech list</strong> — search by keyword or date and
              open the sitting day.
            </li>
          </ul>
          <p className="govuk-body-s govuk-!-margin-bottom-0">
            Coverage depends on sittings published and linked on CitizenGuide.
            Missing days do not always mean the member was silent.
          </p>
        </div>
      </details>
    );
  }

  if (variant === "member") {
    return (
      <details className="govuk-details govuk-!-margin-bottom-5">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">
            How to read {memberName ? `${memberName}'s` : "this"} Hansard record
          </span>
        </summary>
        <div className="govuk-details__text">
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <strong>Floor contributions</strong> count speeches in debate.
              Moderating the House (Speaker, Deputy, Temporary Speaker) is
              listed separately and is not treated as a debate score.
            </li>
            <li>
              <strong>Pulse</strong> shows activity <em>while in office</em> for
              the year you select. Use the year tabs for continuous terms or
              mid-term starts (for example after a by-election).
            </li>
            <li>
              <strong>Blank squares</strong> mean no floor speech linked that
              day — not proof that the House sat and they skipped, unless we
              also have a full sitting calendar.
            </li>
            <li>
              Always open the <strong>sitting</strong> to read context. Official
              Hansard PDFs, when linked, remain authoritative.
            </li>
          </ul>
          <p className="govuk-body-s govuk-!-margin-bottom-0">
            Find another member:{" "}
            <Link
              href="/government/legislature/hansard/members"
              className="govuk-link"
            >
              Search MPs and Senators
            </Link>
            {" · "}
            <Link href="/find-your-representatives" className="govuk-link">
              Find your representatives
            </Link>
          </p>
        </div>
      </details>
    );
  }

  // sitting
  return (
    <div className="govuk-inset-text govuk-!-margin-bottom-5">
      <h2 className="govuk-heading-s">About this sitting record</h2>
      <p className="govuk-body-s">
        This is a structured Hansard of the day&apos;s proceedings — speakers in
        order, with roles such as Temporary Speaker labelled when known. Select
        a linked member name to open their contribution history and activity
        pulse.
      </p>
      <p className="govuk-body-s govuk-!-margin-bottom-0">
        Prefer the official PDF when provided.{" "}
        <Link
          href="/government/legislature/hansard/members"
          className="govuk-link"
        >
          Track a member
        </Link>
        {" · "}
        <Link href="/government/legislature" className="govuk-link">
          About Parliament
        </Link>
      </p>
    </div>
  );
}
