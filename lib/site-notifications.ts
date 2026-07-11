/**
 * Site-wide notifications (elections, outages, maintenance).
 *
 * Set `enabled: true` on an item to show it site-wide under the phase banner.
 * Keep this file the single source of truth — no CMS required for Phase 4.
 */

export type SiteNotification = {
  id: string;
  enabled: boolean;
  type?: "important" | "success";
  title?: string;
  heading: string;
  /** Optional body (plain text or simple HTML via React in consumer) */
  body?: string;
  /** Optional primary link */
  href?: string;
  linkText?: string;
};

/**
 * Active site notices. Disable items with `enabled: false` instead of deleting,
 * so you can re-enable for election periods or planned maintenance.
 */
export const SITE_NOTIFICATIONS: SiteNotification[] = [
  {
    id: "elections-2027",
    enabled: false,
    type: "important",
    title: "Important",
    heading: "2027 general election information is being updated",
    body: "Find voter registration, polling stations, parties and IEBC guidance.",
    href: "/elections",
    linkText: "View elections and voting",
  },
  // Example (disabled): maintenance window
  // {
  //   id: "maintenance",
  //   enabled: false,
  //   type: "important",
  //   heading: "Scheduled maintenance this weekend",
  //   body: "Some pages may be unavailable on Saturday 02:00–04:00 EAT.",
  // },
];

export function getActiveSiteNotifications(): SiteNotification[] {
  return SITE_NOTIFICATIONS.filter((n) => n.enabled);
}
