import { defineArrayMember, defineField } from "sanity";

/**
 * Portable Text for government service guides — internal / external / entity links.
 * No constitution chapter refs (those stay on constitution content).
 */
export const servicePortableText = [
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
          name: "internalPage",
          title: "Internal CitizenGuide page",
          type: "object",
          fields: [
            defineField({
              name: "href",
              title: "Path",
              type: "string",
              description: "Must start with / e.g. /ecitizen or /services",
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
            }),
          ],
          validation: (Rule) =>
            Rule.custom(
              (
                v:
                  | { internalHref?: string; externalHref?: string }
                  | undefined,
              ) => {
                if (!v) return true;
                if (!v.internalHref && !v.externalHref) {
                  return "Provide an internal path and/or an official URL";
                }
                if (v.internalHref && !v.internalHref.startsWith("/")) {
                  return "Internal path must start with /";
                }
                return true;
              },
            ),
        },
        {
          name: "serviceRef",
          title: "Related service guide",
          type: "object",
          fields: [
            defineField({
              name: "service",
              title: "Service",
              type: "reference",
              to: [{ type: "governmentService" }],
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    },
  }),
];
