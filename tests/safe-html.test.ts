import { describe, expect, it } from "vitest";
import { safeHtml, escapeHtml } from "@/lib/safe-html";

describe("editorial HTML", () => {
  it("removes active content, event handlers and encoded script URLs", () => {
    const result = safeHtml('<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="jav&#x61;script:alert(1)">link</a><svg onload="alert(1)"></svg>');
    expect(result).not.toMatch(/script|onerror|onload|svg/i);
    expect(result).toContain("link");
  });
  it("preserves legal tables and editorial link markers", () => {
    const result = safeHtml('<table><tr><th scope="col">Law</th><td colspan="2"><span data-constitution-inline-link="reference">Text</span></td></tr></table>');
    expect(result).toContain('colspan="2"');
    expect(result).toContain('data-constitution-inline-link="reference"');
  });
  it("renders fallback text as text, not markup", () => {
    expect(safeHtml(`<p>${escapeHtml('<img src=x onerror=alert(1)>')}</p>`)).toBe('<p>&lt;img src=x onerror=alert(1)&gt;</p>');
  });
});
