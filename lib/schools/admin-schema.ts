import { z } from "zod";

export const schoolEditSchema = z.object({
  official_name: z.string().trim().min(2).max(250),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase, hyphen-separated GOV.UK-style URL").optional(),
  ownership: z.enum(["public", "private", "community", "faith_based", "other", "unknown"]),
  main_tier: z.enum(["comprehensive", "primary", "junior", "senior_secondary", "ecde"]).nullable(),
  description: z.string().trim().max(10000).nullable(),
  is_published: z.boolean().optional(),
  short_name: z.string().trim().max(100).nullable().optional(),
  operational_status: z.enum(["operational", "temporarily_closed", "closed", "merged", "unknown"]).nullable().optional(),
  institution_type: z.enum(["regular", "special", "rehabilitation", "ecde_centre", "hospital_school", "other"]).nullable().optional(),
  moe_category: z.string().trim().max(100).nullable().optional(),
  gender_type: z.enum(["boys", "girls", "mixed", "unknown"]).nullable().optional(),
  accommodation_type: z.enum(["day", "boarding", "day_and_boarding", "unknown"]).nullable().optional(),
  registration_status: z.enum(["registered", "provisional", "unverified", "unknown"]).nullable().optional(),
  sponsor_name: z.string().trim().max(250).nullable().optional(),
  special_needs_status: z.enum(["regular", "integrated_sne", "exclusive_sne", "special_unit", "unknown"]).nullable().optional(),
  sne_categories: z.array(z.string().trim().min(1).max(150)).max(100).nullable().optional(),
  county: z.string().trim().max(100).nullable().optional(),
  county_code: z.number().int().min(1).max(500).nullable().optional(),
  sub_county: z.string().trim().max(150).nullable().optional(),
  sub_county_id: z.uuid().nullable().optional(),
  constituency: z.string().trim().max(150).nullable().optional(),
  constituency_id: z.uuid().nullable().optional(),
  ward: z.string().trim().max(150).nullable().optional(),
  ward_id: z.uuid().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  nemis_code: z.string().trim().max(100).nullable().optional(),
  knec_code: z.string().trim().max(100).nullable().optional(),
  tsc_code: z.string().trim().max(100).nullable().optional(),
  water_source: z.string().trim().max(250).nullable().optional(),
  power_source: z.string().trim().max(250).nullable().optional(),
  internet_connectivity: z.string().trim().max(250).nullable().optional(),
  verification_status: z.enum(["unverified", "source_confirmed", "cross_source_match", "institution_verified", "disputed"]).nullable().optional(),
  physical_address: z.string().trim().max(1000).nullable().optional(),
  postal_address: z.string().trim().max(500).nullable().optional(),
  public_phone: z.string().trim().max(100).nullable().optional(),
  public_email: z.email().max(254).nullable().optional(),
  website_url: z.url().refine(value => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS address").nullable().optional(),
  total_enrollment: z.number().int().min(0).max(1000000).nullable().optional(),
  total_teachers: z.number().int().min(0).max(100000).nullable().optional(),
}).strict();

export const schoolPatchSchema = schoolEditSchema.partial().strict();

export const schoolCreateSchema = schoolEditSchema.extend({
  county_code: z.number().int().min(1).max(500),
  is_published: z.boolean().default(false),
}).strict();

export const schoolDeleteSchema = z.object({
  confirmation: z.string().min(2).max(250),
}).strict();
