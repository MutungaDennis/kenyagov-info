import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hansardSitting',
  title: 'Hansard Sitting',
  type: 'document',
  fieldsets: [
    { name: 'metadata', title: 'Sitting Metadata', options: { collapsible: true, collapsed: false } },
    { name: 'media', title: 'Media & Sources', options: { collapsible: true, collapsed: true } },
    { name: 'editorial', title: 'Editorial Summary (Citizen TL;DR)', options: { collapsible: true, collapsed: false } },
    { name: 'content', title: 'Debate Structure', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Sitting Title',
      type: 'string',
      description: 'Auto-generated or custom: e.g. "National Assembly – Thursday, 18 June 2026 (Morning Sitting)"',
      validation: (Rule) => Rule.required(),
      fieldset: 'metadata',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
      fieldset: 'metadata',
    }),
    defineField({
      name: 'houseType',
      title: 'Legislative House',
      type: 'string',
      options: {
        list: [
          { title: 'National Assembly', value: 'national-assembly' },
          { title: 'Senate', value: 'senate' },
          { title: 'County Assembly', value: 'county-assembly' },
        ],
      },
      validation: (Rule) => Rule.required(),
      fieldset: 'metadata',
    }),
    defineField({
      name: 'countyName',
      title: 'County Name',
      type: 'string',
      description: 'Only required for County Assemblies (e.g. "Nairobi", "Mombasa")',
      hidden: ({ document }) => document?.houseType !== 'county-assembly',
      fieldset: 'metadata',
    }),
    defineField({
      name: 'sittingDate',
      title: 'Sitting Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
      fieldset: 'metadata',
    }),
    defineField({
      name: 'sittingPeriod',
      title: 'Sitting Period',
      type: 'string',
      options: {
        list: [
          { title: 'Morning Sitting', value: 'morning' },
          { title: 'Afternoon Sitting', value: 'afternoon' },
          { title: 'Evening Sitting', value: 'evening' },
          { title: 'Special Sitting', value: 'special' },
        ],
      },
      validation: (Rule) => Rule.required(),
      fieldset: 'metadata',
    }),
    defineField({
      name: 'parliamentaryTerm',
      title: 'Parliamentary Term',
      type: 'string',
      description: 'e.g. "13th Parliament (2022–2027)"',
      validation: (Rule) => Rule.required(),
      fieldset: 'metadata',
    }),

    // Media
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube Plenary Video URL',
      type: 'url',
      description: 'Official or reliable recording of the sitting',
      fieldset: 'media',
    }),
    defineField({
      name: 'officialPdf',
      title: 'Official Hansard PDF',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'The authoritative printed/official version from Parliament',
      fieldset: 'media',
    }),

    // Editorial (NZ-style citizen summary)
    defineField({
      name: 'editorialSummary',
      title: 'Editorial Summary (TL;DR)',
      type: 'array',
      of: [{ type: 'block' }],
      description: '3–6 clear, citizen-friendly bullet points. What actually happened today that matters to Kenyans?',
      fieldset: 'editorial',
    }),
    defineField({
      name: 'keyEvents',
      title: 'Key Events / Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Short, scannable highlights (e.g. "Finance Bill passed Second Reading", "Motion on IEBC rejected")',
      fieldset: 'editorial',
    }),
    defineField({
      name: 'topics',
      title: 'Main Topics Covered',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags for search & filtering (e.g. Finance, Health, Education, IEBC, Budget)',
      fieldset: 'editorial',
    }),

    // Content structure
    defineField({
      name: 'sections',
      title: 'Debate Sections',
      type: 'array',
      description: 'High-level structure of the day (used for navigation and mobile accordions)',
      of: [
        {
          type: 'object',
          name: 'section',
          fields: [
            { name: 'sectionHeader', title: 'Section Header', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'sectionSlug', title: 'Anchor Slug', type: 'slug', options: { source: 'sectionHeader' } },
            { name: 'order', title: 'Display Order', type: 'number', initialValue: 0 },
            { name: 'speechCount', title: 'Number of Speeches', type: 'number', initialValue: 0 },
          ],
          preview: {
            select: { title: 'sectionHeader', subtitle: 'speechCount' },
            prepare({ title, subtitle }) {
              return { title, subtitle: `${subtitle || 0} speeches` }
            },
          },
        },
      ],
      fieldset: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'sittingDate',
      house: 'houseType',
    },
    prepare({ title, date, house }) {
      return {
        title: title || 'Untitled Sitting',
        subtitle: `${house} • ${date}`,
      }
    },
  },
})