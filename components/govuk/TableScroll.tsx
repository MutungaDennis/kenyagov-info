import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Accessible name for the scroll region (required when table is wide) */
  caption?: string;
  className?: string;
};

/**
 * GOV.UK-style responsive table wrapper: horizontal scroll on small screens
 * without blowing out the page width.
 * @see https://design-system.service.gov.uk/styles/layout/
 */
export default function TableScroll({
  children,
  caption = "Scrollable table",
  className = "",
}: Props) {
  return (
    <div
      className={`app-table-scroll ${className}`.trim()}
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
