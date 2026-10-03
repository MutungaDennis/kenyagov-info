export type InstitutionOffice = {
  id: string;
  institution_id: string;
  office_name: string;
  office_type: string;
  geographic_level: string | null;
  county: string | null;
  constituency: string | null;
  sub_county: string | null;
  physical_address: string | null;
  postal_address: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  latitude: number | null;
  longitude: number | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
};

export type InstitutionOfficeInput = Omit<
  InstitutionOffice,
  "id" | "institution_id" | "is_active" | "sort_order"
> & {
  is_active?: boolean;
  sort_order?: number;
};

export function parseInstitutionOffice(
  input: unknown,
): { data: InstitutionOfficeInput } | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Office details must be an object." };
  }

  const body = input as Record<string, unknown>;
  const text = (key: string, maxLength: number): string | null => {
    const value = String(body[key] ?? "").trim();
    return value ? value.slice(0, maxLength) : null;
  };
  const officeName = text("office_name", 200);
  if (!officeName) return { error: "Enter an office name." };

  const officeType = text("office_type", 80) || "Branch office";
  const geographicLevel = text("geographic_level", 80);
  const startDate = text("start_date", 10);
  const endDate = text("end_date", 10);
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const isValidDate = (value: string) => {
    if (!datePattern.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (startDate && !isValidDate(startDate)) return { error: "Enter a valid office start date." };
  if (endDate && !isValidDate(endDate)) return { error: "Enter a valid office end date." };
  if (startDate && endDate && endDate < startDate) {
    return { error: "The office end date must not be earlier than its start date." };
  }

  const coordinate = (key: "latitude" | "longitude", min: number, max: number) => {
    const raw = String(body[key] ?? "").trim();
    if (!raw) return { value: null, error: null };
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max) {
      return { value: null, error: `Enter a valid ${key}.` };
    }
    return { value, error: null };
  };
  const latitude = coordinate("latitude", -90, 90);
  const longitude = coordinate("longitude", -180, 180);
  if (latitude.error) return { error: latitude.error };
  if (longitude.error) return { error: longitude.error };
  if ((latitude.value == null) !== (longitude.value == null)) {
    return { error: "Enter both latitude and longitude coordinates, or leave both blank." };
  }

  const email = text("email", 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid office email address." };
  }
  const websiteUrl = text("website_url", 500);
  if (websiteUrl) {
    try {
      const parsedUrl = new URL(websiteUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return { error: "Office website URLs must start with http:// or https://." };
      }
    } catch {
      return { error: "Enter a valid office website URL." };
    }
  }

  return {
    data: {
      office_name: officeName,
      office_type: officeType,
      geographic_level: geographicLevel,
      county: text("county", 120),
      constituency: text("constituency", 120),
      sub_county: text("sub_county", 120),
      physical_address: text("physical_address", 1000),
      postal_address: text("postal_address", 500),
      phone: text("phone", 100),
      email,
      website_url: websiteUrl,
      latitude: latitude.value,
      longitude: longitude.value,
      start_date: startDate,
      end_date: endDate,
      notes: text("notes", 4000),
      is_active: endDate ? false : body.is_active !== false,
      sort_order: Number.isInteger(body.sort_order) ? Number(body.sort_order) : 0,
    },
  };
}
