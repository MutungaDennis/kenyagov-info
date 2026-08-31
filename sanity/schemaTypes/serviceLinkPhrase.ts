import { defineType, defineField } from "sanity";

/**
 * Glossary phrase → destinations for bulk-linking service guide body text.
 * Separate from constitutionLinkPhrase.
 */
export default defineType({
  name: "serviceLinkPhrase",
  title: "Service Link Phrase",
  type: "document",
  fields: [
    defineField({
      name: "phrase",
      title: "Phrase to match",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
      description: 'e.g. "eCitizen", "Huduma Centre", "National ID"',
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
      description: "e.g. /ecitizen or /services/categories/driving-transport",
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
      name: "scopeServiceSlugs",
      title: "Limit to service slugs (empty = all)",
      type: "array",
      of: [{ type: "string" }],
      description:
        "If set, phrase only applies when applying to these service slugs.",
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
      description:
        "Lower runs first among equal-length phrases; longest phrase always wins",
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
