import Link from "next/link";
import GovUKNotificationBanner from "@/components/govuk/NotificationBanner";
import { getActiveSiteNotifications } from "@/lib/site-notifications";

/**
 * Renders enabled site-wide notices from lib/site-notifications.
 * Mounted in the page template under the phase banner.
 */
export default function SiteNotifications() {
  const notices = getActiveSiteNotifications();
  if (!notices.length) return null;

  return (
    <>
      {notices.map((notice) => (
        <GovUKNotificationBanner
          key={notice.id}
          type={notice.type ?? "important"}
          title={notice.title}
          titleId={`site-notification-${notice.id}-title`}
          heading={notice.heading}
          className="govuk-!-margin-top-4"
        >
          {notice.body && <p className="govuk-body">{notice.body}</p>}
          {notice.href && notice.linkText && (
            <p className="govuk-body">
              <Link
                href={notice.href}
                className="govuk-notification-banner__link"
              >
                {notice.linkText}
              </Link>
            </p>
          )}
        </GovUKNotificationBanner>
      ))}
    </>
  );
}
