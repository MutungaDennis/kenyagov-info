import type { ReactNode } from "react";

type Props = {
  /** Banner title (default: Important / Success) */
  title?: string;
  /** Main heading inside the content */
  heading?: ReactNode;
  /** Extra body content under the heading */
  children?: ReactNode;
  /** "important" (default blue) or "success" (green) */
  type?: "important" | "success";
  /** Stable id for aria-labelledby */
  titleId?: string;
  className?: string;
};

/**
 * GOV.UK Notification banner.
 * @see https://design-system.service.gov.uk/components/notification-banner/
 */
export default function GovUKNotificationBanner({
  title,
  heading,
  children,
  type = "important",
  titleId = "govuk-notification-banner-title",
  className = "",
}: Props) {
  const isSuccess = type === "success";
  const titleText = title ?? (isSuccess ? "Success" : "Important");

  const classes = [
    "govuk-notification-banner",
    isSuccess ? "govuk-notification-banner--success" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role={isSuccess ? "alert" : "region"}
      aria-labelledby={titleId}
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id={titleId}>
          {titleText}
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        {heading && (
          <p className="govuk-notification-banner__heading">{heading}</p>
        )}
        {children}
      </div>
    </div>
  );
}
