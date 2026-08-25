import { defineType, defineField } from "sanity";
import { constitutionPortableText } from "./portableTextConstitution";

export default defineType({
  name: "constitutionSchedule",
  title: "Constitution Schedule",
  type: "document",
  fields: [
    defineField({
      name: "scheduleNumber",
      title: "Schedule number (1–6)",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(6),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        maxLength: 64,
      },
      validation: (Rule) => Rule.required(),
      description: "first | second | third | fourth | fifth | sixth",
    }),
    defineField({
      name: "fullTitle",
      title: "Full title",
      type: "string",
      description: 'e.g. "FIRST SCHEDULE"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Short title",
      type: "string",
      description: 'e.g. "Counties"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "citation",
      title: "Constitutional citation",
      type: "string",
      description: 'e.g. "Article 6 (1)"',
    }),
    defineField({
      name: "officialText",
      title: "Official schedule text",
      type: "array",
      of: constitutionPortableText,
      description:
        "Include hierarchical clauses and tables (use Table block or paste markdown tables via admin).",
    }),
    defineField({
      name: "amplifiedText",
      title: "Plain English summary (optional)",
      type: "array",
      of: constitutionPortableText,
    }),
  ],
  orderings: [
    {
      title: "Schedule number",
      name: "scheduleNumberAsc",
      by: [{ field: "scheduleNumber", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      number: "scheduleNumber",
      fullTitle: "fullTitle",
      title: "title",
    },
    prepare: ({ number, fullTitle, title }) => ({
      title: fullTitle || `Schedule ${number}`,
      subtitle: title,
    }),
  },
});
