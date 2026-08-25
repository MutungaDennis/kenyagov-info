import { defineType, defineField } from "sanity";

/**
 * Glossary phrase → destinations for bulk-linking Constitution text.
 */
export default defineType({
  name: "constitutionLinkPhrase",
  title: "Constitution Link Phrase",
  type: "document",
  fields: [
    defineField({
      name: "phrase",
      title: "Phrase to match",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
      description: 'e.g. "National Assembly" or "Independent Electoral and Boundaries Commission"',
    }),
    defineField({
      name: "matchMode",
      title: "Match mode",
      type: "string",
      initialValue: "caseInsensitive",
      options: {
        list: [
          { title: "Case-insensitive", value: "caseInsensitive" },
          { title: "Exact case", value: "exact" },
        ],
      },
    }),
    defineField({
      name: "internalHref",
      title: "Internal CitizenGuide path",
      type: "string",
      description: "e.g. /government/legislature or /constitution/chapter/8/article/95",
    }),
    defineField({
      name: "externalHref",
      title: "Official external URL",
      type: "url",
      validation: (Rule) => Rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "externalLabel",
      title: "Official site label",
      type: "string",
    }),
    defineField({
      name: "constitutionChapter",
      title: "Or: Constitution chapter (cross-ref)",
      type: "number",
      description: "If set (with optional article), applies constitutionRef instead of entityLink",
    }),
    defineField({
      name: "constitutionArticle",
      title: "Constitution article (optional)",
      type: "number",
    }),
    defineField({
      name: "scopeChapters",
      title: "Limit to chapters (empty = all)",
      type: "array",
      of: [{ type: "number" }],
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      initialValue: 100,
      description: "Lower runs first among equal-length phrases; longest phrase always wins",
    }),
  ],
  preview: {
    select: {
      title: "phrase",
      internal: "internalHref",
      external: "externalHref",
      enabled: "enabled",
    },
    prepare: ({ title, internal, external, enabled }) => ({
      title: title || "Untitled phrase",
      subtitle: [
        enabled === false ? "DISABLED" : null,
        internal || null,
        external ? "↗" : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
