import { describe, expect, it } from "vitest";
import { groupInstitutionPeople, serviceGroup, type InstitutionService } from "@/lib/institutions/people-model";

describe("institution service history", () => {
  const today = "2026-09-22";
  const role: InstitutionService = { id: "1", personId: "p1", name: "Person", href: null, image: null, title: "Director", start: "2020-01-01", end: null, status: "Active", priority: 1 };
  it("does not present expired, future or suspended roles as current", () => {
    expect(serviceGroup(role, false, today)).toBe("current");
    expect(serviceGroup({ ...role, end: "2025-12-31" }, false, today)).toBe("former");
    expect(serviceGroup({ ...role, start: "2027-01-01" }, false, today)).toBe("other");
    expect(serviceGroup({ ...role, status: "Suspended" }, false, today)).toBe("other");
    expect(serviceGroup(role, true, today)).toBe("former");
  });
  it("removes duplicate roles while retaining a person's earlier service", () => {
    const result = groupInstitutionPeople([role, { ...role, id: "duplicate" }, { ...role, id: "previous", start: "2010-01-01", end: "2014-01-01", status: "Former" }], false, today);
    expect(result.current[0]).toHaveLength(1);
    expect(result.former[0][0].id).toBe("previous");
  });
});
