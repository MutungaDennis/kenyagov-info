import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import ServiceClientView from "@/app/[slug]/ServiceClientView";
import { detailToForm, formToPayload } from "@/components/admin/services/types";

describe("public service pathway chooser", () => {
  it("shows radio options and withholds the generic portal until a route is selected", () => {
    const markup = renderToStaticMarkup(
      React.createElement(ServiceClientView, {
        service: {
          title: "Register a birth",
          summary: "Choose the route that matches the birth circumstances.",
          executionMode: "online",
          pathwayQuestion: "Where was the child born?",
          pathways: [
            {
              title: "In a hospital",
              summary: "The hospital issued a birth notification.",
              details: "Use the standard registration route.",
              portalUrl: "https://official.example/hospital",
            },
            {
              title: "At home",
              summary: "The birth happened outside a medical facility.",
              details: "Get local confirmation before applying.",
              portalUrl: "https://official.example/home",
            },
          ],
          transactionPortals: [
            { portalLabel: "Generic start", portalUrl: "https://official.example" },
          ],
        },
      }),
    );

    expect(markup.match(/type="radio"/g)).toHaveLength(2);
    expect(markup).toContain("Where was the child born?");
    expect(markup).toContain("In a hospital");
    expect(markup).toContain("At home");
    expect(markup).not.toContain('href="https://official.example"');
    expect(markup).not.toContain("Generic start");
  });
});

describe("migrated service editing", () => {
  const body = [{ _type: "block", _key: "paragraph", children: [{ _type: "span", text: "Apply here", marks: ["official"] }], markDefs: [{ _key: "official", _type: "link", href: "https://example.org" }] }, { _type: "table", rows: [{ cells: ["Fee", "100"] }] }];
  it("preserves rich text, table blocks and downloaded-file metadata when editing unrelated fields", () => {
    const form = detailToForm({ title: "Old title", body, downloadableResources: [{ label: "Form", sourceUrl: "", fileUrl: "https://example.org/form.pdf", fileSize: 1024 }] });
    form.title = "New title";
    const payload = formToPayload(form);
    expect(payload.body).toEqual(body);
    expect(payload.downloadableResources[0].fileSize).toBe(1024);
    expect(payload.downloadableResources[0].fileUrl).toBe("https://example.org/form.pdf");
  });
  it("preserves the pathway question, guidance and official links while editing", () => {
    const pathways = [
      {
        title: "Born in a hospital",
        summary: "The hospital issued a birth notification.",
        details: "Use the standard registration process.",
        portalUrl: "https://ecitizen.go.ke/register",
      },
      {
        title: "Born at home",
        summary: "The birth took place outside a medical facility.",
        details: "Get confirmation from the local administration first.",
        portalUrl: "https://ecitizen.go.ke/late-registration",
      },
    ];
    const form = detailToForm({
      pathwayQuestion: "Where was the child born?",
      pathways,
    });

    expect(form.pathwayQuestion).toBe("Where was the child born?");
    expect(formToPayload(form).pathwayQuestion).toBe("Where was the child born?");
    expect(formToPayload(form).pathways).toEqual(pathways);
  });

  it("uses the edited text instead of silently restoring the old rich-text body", () => {
    const form = detailToForm({ body });
    form.bodyText = "Changed guidance";
    expect(formToPayload(form).body).toBeUndefined();
    expect(formToPayload(form).bodyParagraphs).toEqual(["Changed guidance"]);
  });
});
