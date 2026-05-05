import React from "react";

type SummaryItem = {
  key: string;
  value: React.ReactNode;
  action?: React.ReactNode;
};

type Props = {
  items: SummaryItem[];
};

export default function GovUKSummaryList({ items }: Props) {
  return (
    <dl className="govuk-summary-list">
      {items.map((item, index) => (
        <div key={index} className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{item.key}</dt>
          <dd className="govuk-summary-list__value">{item.value}</dd>
          {item.action && (
            <dd className="govuk-summary-list__actions">{item.action}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}