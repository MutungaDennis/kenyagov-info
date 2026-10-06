import { describe, expect, it } from "vitest";
import {
  chamberLabel,
  committeeMembershipStatus,
  committeePositionLabel,
  isCommitteeMemberTitle,
  isCurrentParliamentaryTerm,
  isNationalAssemblySpeakerTitle,
  isValidCommitteeDate,
  parliamentaryChamberForInstitution,
} from "@/lib/legislature/committees";

describe("parliamentary committees", () => {
  it("recognises elected and nominated members by their House role, not seat type", () => {
    expect(isCommitteeMemberTitle("national_assembly", "Member of Parliament")).toBe(true);
    expect(isCommitteeMemberTitle("national_assembly", "Nominated Member of Parliament")).toBe(true);
    expect(isCommitteeMemberTitle("national_assembly", "County Woman Representative")).toBe(true);
    expect(isCommitteeMemberTitle("senate", "Nominated Senator")).toBe(true);
    expect(isCommitteeMemberTitle("senate", "Senator")).toBe(true);
  });

  it("does not assign a member to a different chamber based on a similar title", () => {
    expect(isCommitteeMemberTitle("senate", "Member of Parliament")).toBe(false);
    expect(isCommitteeMemberTitle("national_assembly", "Senator")).toBe(false);
  });

  it("allows the National Assembly Speaker to be assigned as a committee leader, not as Senate membership", () => {
    expect(isNationalAssemblySpeakerTitle("national_assembly", "Speaker of the National Assembly")).toBe(true);
    expect(isNationalAssemblySpeakerTitle("national_assembly", "Speaker")).toBe(true);
    expect(isNationalAssemblySpeakerTitle("senate", "Speaker of the National Assembly")).toBe(false);
    expect(isNationalAssemblySpeakerTitle("national_assembly", "Committee Clerk")).toBe(false);
    expect(isNationalAssemblySpeakerTitle("senate", "Speaker of the Senate")).toBe(true);
    expect(isNationalAssemblySpeakerTitle("national_assembly", "Speaker of the Senate")).toBe(false);
  });

  it("uses dates and explicit inactive statuses while retaining roles with an unrecorded status", () => {
    expect(isCurrentParliamentaryTerm({ start: null, end: null, status: null }, "2026-10-05")).toBe(true);
    expect(isCurrentParliamentaryTerm({ start: null, end: "2026-10-04", status: "Active" }, "2026-10-05")).toBe(false);
    expect(isCurrentParliamentaryTerm({ start: "2026-10-06", end: null, status: "Active" }, "2026-10-05")).toBe(false);
    expect(isCurrentParliamentaryTerm({ start: null, end: null, status: "Former" }, "2026-10-05")).toBe(false);
  });

  it("classifies dated committee service and validates real calendar dates", () => {
    expect(committeeMembershipStatus("2026-10-06", null, "2026-10-05")).toBe("upcoming");
    expect(committeeMembershipStatus("2026-10-05", null, "2026-10-05")).toBe("current");
    expect(committeeMembershipStatus(null, "2026-10-04", "2026-10-05")).toBe("former");
    expect(committeeMembershipStatus(null, null, "2026-10-05")).toBe("current");

    expect(isValidCommitteeDate(null)).toBe(true);
    expect(isValidCommitteeDate("2024-02-29")).toBe(true);
    expect(isValidCommitteeDate("2026-02-29")).toBe(false);
    expect(isValidCommitteeDate("2026-04-31")).toBe(false);
    expect(isValidCommitteeDate("0000-01-01")).toBe(false);
  });

  it("uses clear House and committee-position labels", () => {
    expect(chamberLabel("national_assembly")).toBe("National Assembly");
    expect(chamberLabel("senate")).toBe("Senate");
    expect(committeePositionLabel("chairperson")).toBe("Chairperson");
    expect(committeePositionLabel("vice_chairperson")).toBe("Vice-Chairperson");
    expect(committeePositionLabel("member")).toBe("Member");
  });

  it("identifies National Assembly and Senate institution records from their names or slugs", () => {
    expect(parliamentaryChamberForInstitution("national-assembly-of-kenya", null)).toBe("national_assembly");
    expect(parliamentaryChamberForInstitution(null, "The Senate of Kenya")).toBe("senate");
    expect(parliamentaryChamberForInstitution("public-service-commission", "Public Service Commission")).toBeNull();
  });
});
