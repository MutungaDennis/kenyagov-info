"use client";

import { useId, useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
  /** Start expanded (optional) */
  expanded?: boolean;
};

type Props = {
  id?: string;
  items: AccordionItem[];
  /** Heading level for section titles (default 2) */
  headingLevel?: 2 | 3 | 4;
};

/**
 * GOV.UK Accordion (React-controlled, Design System markup).
 * Matches the enhanced structure from govuk-frontend without custom colours.
 * @see https://design-system.service.gov.uk/components/accordion/
 */
export default function GovUKAccordion({
  id,
  items,
  headingLevel = 2,
}: Props) {
  const autoId = useId().replace(/:/g, "");
  const accordionId = id ?? `accordion-${autoId}`;
  const HeadingTag = `h${headingLevel}` as "h2" | "h3" | "h4";

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.expanded) initial[item.id] = true;
    });
    return initial;
  });

  const allOpen = items.length > 0 && items.every((item) => open[item.id]);

  const toggle = (itemId: string) => {
    setOpen((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleAll = () => {
    if (allOpen) {
      setOpen({});
    } else {
      const next: Record<string, boolean> = {};
      items.forEach((item) => {
        next[item.id] = true;
      });
      setOpen(next);
    }
  };

  if (!items.length) return null;

  return (
    <div className="govuk-accordion" data-module="govuk-accordion" id={accordionId}>
      <div className="govuk-accordion__controls">
        <button
          type="button"
          className="govuk-accordion__show-all"
          aria-expanded={allOpen}
          onClick={toggleAll}
        >
          <span
            className={[
              "govuk-accordion-nav__chevron",
              allOpen ? "" : "govuk-accordion-nav__chevron--down",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <span className="govuk-accordion__show-all-text">
            {allOpen ? "Hide all sections" : "Show all sections"}
          </span>
        </button>
      </div>

      {items.map((item, index) => {
        const isOpen = !!open[item.id];
        const headingId = `${accordionId}-heading-${index + 1}`;
        const contentId = `${accordionId}-content-${index + 1}`;
        const sectionClass = [
          "govuk-accordion__section",
          isOpen ? "govuk-accordion__section--expanded" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={item.id} className={sectionClass}>
            <div className="govuk-accordion__section-header">
              <HeadingTag className="govuk-accordion__section-heading">
                <button
                  type="button"
                  className="govuk-accordion__section-button"
                  id={headingId}
                  aria-controls={contentId}
                  aria-expanded={isOpen}
                  onClick={() => toggle(item.id)}
                >
                  <span className="govuk-accordion__section-heading-text" id={`${headingId}-text`}>
                    <span className="govuk-accordion__section-heading-text-focus">
                      {item.title}
                    </span>
                  </span>
                  <span className="govuk-visually-hidden govuk-accordion__section-heading-divider">
                    ,{" "}
                  </span>
                  <span className="govuk-accordion__section-toggle" data-nosnippet>
                    <span className="govuk-accordion__section-toggle-focus">
                      <span
                        className={[
                          "govuk-accordion-nav__chevron",
                          isOpen ? "" : "govuk-accordion-nav__chevron--down",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      <span className="govuk-accordion__section-toggle-text">
                        {isOpen ? "Hide" : "Show"}
                        <span className="govuk-visually-hidden"> this section</span>
                      </span>
                    </span>
                  </span>
                </button>
              </HeadingTag>
            </div>
            <div
              id={contentId}
              className="govuk-accordion__section-content"
              aria-labelledby={headingId}
              hidden={!isOpen}
            >
              {typeof item.content === "string" ? (
                <p className="govuk-body">{item.content}</p>
              ) : (
                item.content
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
