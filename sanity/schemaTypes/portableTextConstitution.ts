import { defineArrayMember, defineField } from "sanity";

/**
 * Portable Text for Constitution articles — supports:
 * - constitutionRef: link to another chapter/article
 * - internalPage: CitizenGuide path (/government/...)
 * - externalUrl: official external site
 * - entityLink: primary internal + optional official ↗
 */
/** Tabular schedule content (Fifth Schedule, etc.) */
export const constitutionTableType = defineArrayMember({
  name: "constitutionTable",
  title: "Table",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "headers",
      title: "Column headers",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "cells",
              title: "Cells",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare: ({ cells }) => ({
              title: Array.isArray(cells) ? cells.join(" | ") : "Row",
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { caption: "caption", headers: "headers" },
    prepare: ({ caption, headers }) => ({
      title: caption || "Constitution table",
      subtitle: Array.isArray(headers) ? headers.join(" · ") : "",
    }),
  },
});

export const constitutionPortableText = [
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "Heading", value: "h3" },
    ],
    lists: [
      { title: "Bullet", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      decorators: [
        { title: "Strong", value: "strong" },
        { title: "Emphasis", value: "em" },
      ],
      annotations: [
        {
          name: "constitutionRef",
          title: "Constitution cross-reference",
          type: "object",
          fields: [
            defineField({
              name: "chapter",
              title: "Chapter number",
              type: "number",
              validation: (Rule) => Rule.required().min(0).max(18),
            }),
            defineField({
              name: "article",
              title: "Article number (optional)",
              type: "number",
              description: "Leave empty to link to the chapter page",
            }),
          ],
        },
        {
          name: "internalPage",
          title: "Internal CitizenGuide page",
          type: "object",
          fields: [
            defineField({
              name: "href",
              title: "Path",
              type: "string",
              description: "Must start with / e.g. /government/legislature",
              validation: (Rule) =>
                Rule.required().custom((v) =>
                  typeof v === "string" && v.startsWith("/")
                    ? true
                    : "Path must start with /",
                ),
            }),
          ],
        },
        {
          name: "externalUrl",
          title: "External official URL",
          type: "object",
          fields: [
            defineField({
              name: "href",
              title: "URL",
              type: "url",
              validation: (Rule) =>
                Rule.required().uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "title",
              title: "Destination name",
              type: "string",
              description: "e.g. Parliament of Kenya (for accessibility)",
            }),
          ],
        },
        {
          name: "entityLink",
          title: "Entity (internal + optional official ↗)",
          type: "object",
          fields: [
            defineField({
              name: "internalHref",
              title: "Internal path",
              type: "string",
              description:
                "CitizenGuide path, e.g. /government/legislature or /constitution/chapter/8",
            }),
            defineField({
              name: "externalHref",
              title: "Official external URL (optional)",
              type: "url",
              validation: (Rule) =>
                Rule.uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "externalLabel",
              title: "Official site name",
              type: "string",
              description: "Shown in accessibility label for ↗",
            }),
          ],
          validation: (Rule) =>
            Rule.custom((v: { internalHref?: string; externalHref?: string } | undefined) => {
              if (!v) return true;
              if (!v.internalHref && !v.externalHref) {
                return "Provide an internal path and/or an official URL";
              }
              if (v.internalHref && !v.internalHref.startsWith("/")) {
                return "Internal path must start with /";
              }
              return true;
            }),
        },
      ],
    },
  }),
  constitutionTableType,
];
