"use client";

import { useTransition } from "react";

type Props = {
  id: string;
  label?: string;
  action: (id: string) => Promise<{ success: boolean; error?: string }>;
};

export default function DeleteRowButton({
  id,
  label = "Delete",
  action,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="govuk-button govuk-button--warning govuk-!-margin-bottom-0"
      style={{ fontSize: "14px", padding: "6px 12px" }}
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Delete this record permanently? This cannot be undone.",
          )
        ) {
          return;
        }
        startTransition(async () => {
          const result = await action(id);
          if (!result.success) {
            alert(result.error || "Could not delete the record.");
          }
        });
      }}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
