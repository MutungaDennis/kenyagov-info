import type { ReactNode } from "react";
import GovUKBreadcrumbs, { type Crumb } from "@/components/govuk/Breadcrumbs";

type Props = {
  /** Breadcrumb trail; last item is current page (no link needed). */
  breadcrumbs: Crumb[];
  /** Optional caption above the H1 (e.g. section name) */
  caption?: string;
  title: string;
  /** Lead paragraph (govuk-body-l) */
  lead?: ReactNode;
  /** Extra content under the lead (still in two-thirds column) */
  children?: ReactNode;
  /** Use full width instead of two-thirds */
  fullWidth?: boolean;
};

/**
 * Standard hub / list page intro:
 * breadcrumbs → caption → H1 → lead
 */
export default function PageIntro({
  breadcrumbs,
  caption,
  title,
  lead,
  children,
  fullWidth = false,
}: Props) {
  const columnClass = fullWidth
    ? "govuk-grid-column-full"
    : "govuk-grid-column-two-thirds";

  return (
    <>
      <GovUKBreadcrumbs items={breadcrumbs} />

      <div className="govuk-grid-row">
        <div className={columnClass}>
          {caption && <span className="govuk-caption-xl">{caption}</span>}
          <h1 className="govuk-heading-xl">{title}</h1>
          {lead && (
            <p className="govuk-body-l govuk-!-margin-bottom-6">{lead}</p>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
