/**
 * @deprecated Prefer ChevronLinkList for hub topic listings.
 * Kept as a thin single-item wrapper for any remaining call sites.
 */
import ChevronLinkList from "@/components/site/ChevronLinkList";

interface DashboardCardProps {
  title: string;
  href: string;
  description: string;
  metaText?: string;
}

export default function GovUKDashboardCard({
  title,
  href,
  description,
  metaText,
}: DashboardCardProps) {
  return (
    <ChevronLinkList
      items={[
        {
          title,
          href,
          description,
          meta: metaText,
        },
      ]}
    />
  );
}
