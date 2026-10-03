import { describe, it, expect } from "vitest";
import { detailToForm, formToPayload } from "@/components/admin/services/types";

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
  it("uses the edited text instead of silently restoring the old rich-text body", () => {
    const form = detailToForm({ body });
    form.bodyText = "Changed guidance";
    expect(formToPayload(form).body).toBeUndefined();
    expect(formToPayload(form).bodyParagraphs).toEqual(["Changed guidance"]);
  });
});
