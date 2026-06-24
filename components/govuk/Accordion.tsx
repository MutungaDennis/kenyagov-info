"use client";

import { useState, ReactNode } from "react";

type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type Props = {
  id?: string;
  items: AccordionItem[];
};

export default function GovUKAccordion({
  id = "govuk-accordion",
  items,
}: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (itemId: string) => {
    setOpen((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const openAll = () => {
    const all: Record<string, boolean> = {};
    items.forEach((i) => (all[i.id] = true));
    setOpen(all);
  };

  const closeAll = () => {
    setOpen({});
  };

  return (
    <div className="govuk-accordion" id={id}>
      
      {/* ================= CONTROLS ================= */}
      <div className="govuk-accordion__controls govuk-!-margin-bottom-3">
        <button
          type="button"
          className="govuk-button govuk-button--secondary govuk-!-margin-right-2"
          onClick={openAll}
        >
          Show all
        </button>

        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={closeAll}
        >
          Hide all
        </button>
      </div>

      {/* ================= ITEMS ================= */}
      {items.map((item, index) => {
        const isOpen = !!open[item.id];

        return (
          <div
            key={item.id}
            className="govuk-accordion__section govuk-!-margin-bottom-3"
          >
            {/* HEADER */}
            <div className="govuk-accordion__section-header">

              <h2 className="govuk-accordion__section-heading">
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${id}-content-${index}`}
                  className="govuk-accordion__section-button govuk-!-text-align-left accordion-button-full"
                >
                  
                  {/* TITLE BAR ONLY (YELLOW) */}
                  <div className="accordion-title-bar">
                    <div className="govuk-heading-m govuk-!-margin-bottom-1">
                      {item.title}
                    </div>

                    {/* SHOW / HIDE STATE */}
                    <div className="govuk-body-s govuk-!-margin-bottom-0">
                      {isOpen ? (
                        <span>
                          Hide <span style={{ marginLeft: 6 }}>▲</span>
                        </span>
                      ) : (
                        <span>
                          Show <span style={{ marginLeft: 6 }}>▼</span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </h2>
            </div>

            {/* CONTENT */}
            <div
              id={`${id}-content-${index}`}
              className="govuk-accordion__section-content govuk-!-padding-3"
              hidden={!isOpen}
              style={{
                borderLeft: "4px solid #FFEB3B",
                backgroundColor: "#fffdf0",
              }}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}