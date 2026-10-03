import { describe, expect, it } from "vitest";
import { parseInstitutionOffice } from "@/lib/institutions/offices";

const validOffice = {
  office_name: "IEBC Kiambu County Office",
  office_type: "County office",
  geographic_level: "County",
  county: "Kiambu",
  physical_address: "Kiambu town",
  start_date: "2020-01-01",
  latitude: -1.1714,
  longitude: 36.8356,
};

describe("institution office data", () => {
  it("normalizes an office record with optional local contacts", () => {
    const result = parseInstitutionOffice(validOffice);
    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.office_name).toBe("IEBC Kiambu County Office");
      expect(result.data.county).toBe("Kiambu");
      expect(result.data.is_active).toBe(true);
    }
  });

  it("requires an office name and valid coordinates", () => {
    expect(parseInstitutionOffice({ ...validOffice, office_name: " " })).toEqual({
      error: "Enter an office name.",
    });
    expect(parseInstitutionOffice({ ...validOffice, latitude: 91 })).toEqual({
      error: "Enter a valid latitude.",
    });
  });

  it("validates dates, contact email and safe website protocols", () => {
    expect(parseInstitutionOffice({ ...validOffice, start_date: "2024-02-31" })).toEqual({
      error: "Enter a valid office start date.",
    });
    expect(parseInstitutionOffice({ ...validOffice, end_date: "2019-01-01" })).toEqual({
      error: "The office end date must not be earlier than its start date.",
    });
    expect(parseInstitutionOffice({ ...validOffice, email: "not-an-email" })).toEqual({
      error: "Enter a valid office email address.",
    });
    expect(parseInstitutionOffice({ ...validOffice, website_url: "javascript:alert(1)" })).toEqual({
      error: "Office website URLs must start with http:// or https://.",
    });
  });

  it("requires coordinate pairs and marks dated closures as inactive", () => {
    expect(parseInstitutionOffice({ ...validOffice, longitude: "" })).toEqual({
      error: "Enter both latitude and longitude coordinates, or leave both blank.",
    });
    const result = parseInstitutionOffice({
      ...validOffice,
      end_date: "2024-01-01",
    });
    expect("data" in result && result.data.is_active).toBe(false);
  });
});
