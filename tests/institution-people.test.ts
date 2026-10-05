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
  it("orders current people by institution level, then assigned order, before position priority", () => {
    const levels = [
      { id: "commissioners", name: "Commissioners", sort_order: 2 },
      { id: "chair", name: "Chair and Vice Chair", sort_order: 1 },
    ];
    const services = [
      { ...role, id: "commissioner", personId: "p2", name: "Commissioner", priority: 1, levelId: "commissioners", levelOrder: 2, personOrder: 1 },
      { ...role, id: "vice-chair", personId: "p3", name: "Vice Chair", priority: 9, levelId: "chair", levelOrder: 1, personOrder: 2 },
      { ...role, id: "chair", personId: "p1", name: "Chair", priority: 99, levelId: "chair", levelOrder: 1, personOrder: 1 },
      { ...role, id: "unassigned", personId: "p4", name: "Unassigned", priority: 2 },
    ];
    const result = groupInstitutionPeople(services, false, today, levels);
    expect(result.current.map((person) => person[0].name)).toEqual([
      "Chair",
      "Vice Chair",
      "Commissioner",
      "Unassigned",
    ]);
    expect(result.currentByLevel.map((level) => level.name)).toEqual([
      "Chair and Vice Chair",
      "Commissioners",
      "Other current roles",
    ]);
  });
  it("shows a person with concurrent roles only once under their highest assigned level", () => {
    const result = groupInstitutionPeople(
      [
        { ...role, id: "senior-role", personId: "multi", name: "Multi-role official", title: "Chair", levelId: "senior", levelOrder: 1, personOrder: 1 },
        { ...role, id: "junior-role", personId: "multi", name: "Multi-role official", title: "Commissioner", levelId: "junior", levelOrder: 2, personOrder: 1 },
      ],
      false,
      today,
      [
        { id: "senior", name: "Senior level", sort_order: 1 },
        { id: "junior", name: "Junior level", sort_order: 2 },
      ],
    );
    expect(result.current).toHaveLength(1);
    expect(result.currentByLevel[0].people).toHaveLength(1);
    expect(result.currentByLevel).toHaveLength(1);
    expect(result.currentByLevel[0].name).toBe("Senior level");
  });
  it("groups current officials under their ordered subcategories", () => {
    const result = groupInstitutionPeople(
      [
        { ...role, id: "chair", personId: "chair", name: "Chair", levelId: "leadership", levelOrder: 1, personOrder: 1 },
        { ...role, id: "vice-chair", personId: "vice-chair", name: "Vice Chair", levelId: "leadership-team", levelOrder: 2, personOrder: 1 },
        { ...role, id: "commissioner", personId: "commissioner", name: "Commissioner", levelId: "commissioners", levelOrder: 3, personOrder: 1 },
      ],
      false,
      today,
      [
        { id: "commissioners", name: "Commissioners", sort_order: 2 },
        { id: "leadership-team", name: "Deputy Chair", sort_order: 2, parent_level_id: "leadership" },
        { id: "leadership", name: "Leadership", sort_order: 1 },
      ],
    );

    expect(result.currentByLevel.map((level) => level.name)).toEqual([
      "Leadership",
      "Commissioners",
    ]);
    expect(result.currentByLevel[0].people[0][0].name).toBe("Chair");
    expect(result.currentByLevel[0].subcategories).toEqual([
      {
        id: "leadership-team",
        name: "Deputy Chair",
        people: [[expect.objectContaining({ name: "Vice Chair" })]],
      },
    ]);
    expect(result.currentByLevel[1].people[0][0].name).toBe("Commissioner");
  });
});
