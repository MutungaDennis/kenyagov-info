import { z } from "zod";

export const schoolEditSchema = z.object({
  official_name: z.string().trim().min(2).max(250),
  ownership: z.enum(["public", "private", "community", "faith_based", "other", "unknown"]),
  main_tier: z.enum(["primary", "junior", "senior_secondary", "ecde"]).nullable(),
  description: z.string().trim().max(10000).nullable(),
  is_published: z.boolean().optional(),
  short_name: z.string().trim().max(100).nullable().optional(),
  operational_status: z.enum(["operational", "temporarily_closed", "closed", "merged", "unknown"]).nullable().optional(),
  physical_address: z.string().trim().max(1000).nullable().optional(),
  postal_address: z.string().trim().max(500).nullable().optional(),
  public_phone: z.string().trim().max(100).nullable().optional(),
  public_email: z.email().max(254).nullable().optional(),
  website_url: z.url().refine(value => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS address").nullable().optional(),
  total_enrollment: z.number().int().min(0).max(1000000).nullable().optional(),
  total_teachers: z.number().int().min(0).max(100000).nullable().optional(),
}).strict();

export const schoolDeleteSchema = z.object({
  confirmation: z.string().min(2).max(250),
}).strict();
