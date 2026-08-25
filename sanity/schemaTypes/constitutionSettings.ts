import { defineType, defineField } from "sanity";

/**
 * Singleton (fixed id: constitutionSettings) controlling Plain English visibility
 * on the public Constitution pages.
 */
export default defineType({
  name: "constitutionSettings",
  title: "Constitution Settings",
  type: "document",
  fields: [
    defineField({
      name: "showPlainEnglishGlobal",
      title: "Show Plain English Explanation (all chapters)",
      type: "boolean",
      initialValue: true,
      description:
        "Master switch. When off, Plain English is hidden on every chapter unless a chapter override turns it back on.",
    }),
    defineField({
      name: "chapterPlainEnglish",
      title: "Per-chapter Plain English overrides",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "chapter",
              title: "Chapter number",
              type: "number",
              validation: (Rule) => Rule.required().min(0).max(18),
            }),
            defineField({
              name: "showPlainEnglish",
              title: "Show Plain English for this chapter",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { chapter: "chapter", show: "showPlainEnglish" },
            prepare: ({ chapter, show }) => ({
              title: `Chapter ${chapter}`,
              subtitle: show ? "Plain English ON" : "Plain English OFF",
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Constitution Settings",
      subtitle: "Plain English visibility",
    }),
  },
});
