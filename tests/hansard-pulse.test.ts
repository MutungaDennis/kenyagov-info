import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ContributionHeatmap from "@/components/hansard/ContributionHeatmap";

describe("member contribution pulse", () => {
  it("offers equivalent dated table links and does not represent missing records as attendance", () => {
    vi.stubGlobal("React", React);
    const html = renderToStaticMarkup(React.createElement(ContributionHeatmap, { days: [{ date: "2026-09-02", count: 3 }, { date: "2026-09-04", count: 99 }], memberPath: "/government/legislature/hansard/member/example", rangeStart: "2026-09-01", rangeEnd: "2026-09-03", pulseYear: 2026, yearOptions: [2026] }));
    vi.unstubAllGlobals();
    expect(html).toContain("Daily contributions - accessible table");
    expect(html).toContain("dateFrom=2026-09-02&amp;dateTo=2026-09-02");
    expect(html).toContain("#member-contributions");
    expect(html).not.toContain("dateFrom=2026-09-04");
    expect(html).toContain("not an attendance or performance score");
    expect(html).not.toContain('role="img"');
    expect(html).toContain('scope="row"');
  });
});
