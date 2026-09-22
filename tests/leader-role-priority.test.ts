import { describe, expect, it } from "vitest";
import {
  compareCurrentRoles,
  resolvePrimaryRole,
  sortRolesChronologically,
  type LeaderRoleLike,
} from "@/lib/leaders/display";
import { normalizeDisplayPriority } from "@/lib/leaders/display-priority";

const role = (
  id: string,
  title: string,
  display_priority: number | null,
  term_start_date = "2022-01-01",
  term_end_date: string | null = null,
): LeaderRoleLike => ({
  id,
  title,
  display_priority,
  term_start_date,
  term_end_date,
  status: term_end_date ? "Former" : "Active",
});

describe("leader role public prominence", () => {
  it("puts priority 1 before larger explicit priorities", () => {
    expect([role("b", "Governor", 4), role("a", "Chair", 1)].sort(compareCurrentRoles)[0].id).toBe("a");
  });

  it("puts every explicit priority before automatic roles", () => {
    expect(resolvePrimaryRole([role("a", "President", null), role("b", "Member", 9)]).role?.id).toBe("b");
  });

  it("uses title prominence when equal explicit priorities are duplicated", () => {
    expect(resolvePrimaryRole([role("a", "Committee Member", 2), role("b", "Governor", 2)]).role?.id).toBe("b");
  });

  it("uses the existing title prominence when all priorities are automatic", () => {
    expect(resolvePrimaryRole([role("a", "Board Member", null), role("b", "Senator", null)]).role?.id).toBe("b");
  });

  it("uses newest start date after equal priority and title prominence", () => {
    expect(resolvePrimaryRole([role("a", "Chairperson", 3, "2020-01-01"), role("b", "Chairperson", 3, "2024-01-01")]).role?.id).toBe("b");
  });

  it("uses title and ID as stable final tie-breakers", () => {
    expect(resolvePrimaryRole([role("z", "Member", 5), role("a", "Member", 5)]).role?.id).toBe("a");
  });

  it("never lets an ended priority-one role beat a current role", () => {
    expect(resolvePrimaryRole([role("former", "President", 1, "2020-01-01", "2024-01-01"), role("current", "Member", null)]).role?.id).toBe("current");
  });

  it("keeps former roles in reverse chronological order after current roles", () => {
    const sorted = sortRolesChronologically([
      role("old", "Minister", 1, "2010-01-01", "2012-01-01"),
      role("current", "Member", null),
      role("recent", "Minister", null, "2020-01-01", "2023-01-01"),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["current", "recent", "old"]);
  });
});

describe("display priority validation", () => {
  it.each([null, undefined, "", "  "])("normalizes %s to automatic", (value) => {
    expect(normalizeDisplayPriority(value)).toBeNull();
  });

  it.each([1, "10", 999])("accepts %s", (value) => {
    expect(normalizeDisplayPriority(value)).toBe(Number(value));
  });

  it.each([0, -1, 1000, 1.5, "x", "2.5"])("rejects %s", (value) => {
    expect(() => normalizeDisplayPriority(value)).toThrow(/whole number from 1 to 999/);
  });
});
