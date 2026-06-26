import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'hansardSitting',
  title: 'Hansard Sitting',
  type: 'document',
  icon: () => '🗣️',

  fields: [
    defineField({
      name: 'title',
      title: 'Sitting Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(10).max(200),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'houseType',
      title: 'House',
      type: 'string',
      options: {
        list: [
          { title: 'National Assembly', value: 'national-assembly' },
          { title: 'Senate', value: 'senate' },
          { title: 'County Assembly', value: 'county-assembly' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'county',
      title: 'County',
      type: 'string',
      hidden: ({ parent }) => parent?.houseType !== 'county-assembly',
    }),

    defineField({
      name: 'sittingDate',
      title: 'Sitting Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sittingPeriod',
      title: 'Sitting Period',
      type: 'string',
      options: {
        list: [
          { title: 'Morning Sitting', value: 'Morning Sitting' },
          { title: 'Afternoon Sitting', value: 'Afternoon Sitting' },
          { title: 'Evening Sitting', value: 'Evening Sitting' },
          { title: 'Special Sitting', value: 'Special Sitting' },
        ],
      },
      initialValue: 'Morning Sitting',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'parliamentaryTerm',
      title: 'Parliamentary Term',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'youtubeUrl',
      title: 'YouTube Video URL',
      type: 'url',
    }),

    defineField({
      name: 'officialHansardUrl',
      title: 'Official Hansard PDF / Page URL',
      type: 'url',
    }),

    defineField({
      name: 'editorialSummary',
      title: 'Editorial Summary',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Short 2–4 paragraph citizen-friendly summary',
    }),

    // ============================================
    // CLEANED CONTRIBUTIONS ARRAY
    // ============================================
    defineField({
      name: 'contributions',
      title: 'Contributions / Speeches',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'order',
              title: 'Order',
              type: 'number',
              description: 'Sequential order of the contribution in the sitting',
              validation: (Rule) => Rule.required().min(1),
            }),

            // === ONLY LINK TO SUPABASE ===
            defineField({
              name: 'supabaseLeaderId',
              title: 'Supabase Leader ID',
              type: 'string',
              description: 'UUID from the leaders table in Supabase. This is the single source of truth for speaker name, title, constituency, party, and role.',
            }),

            defineField({
              name: 'startTime',
              title: 'Start Time (optional)',
              type: 'string',
              description: 'e.g. "10:23" or "2:15 PM" if timestamped from video or Hansard',
            }),

            defineField({
              name: 'sectionHeader',
              title: 'Section / Order of Business',
              type: 'string',
              description: 'e.g. "THE FINANCE BILL, 2026 – SECOND READING"',
            }),

            defineField({
              name: 'speech',
              title: 'Full Speech / Contribution',
              type: 'array',
              of: [{ type: 'block' }],
              description: 'The complete spoken words. Preserve original paragraphs. Include procedural notes like (Laughter), (Applause), or interjections in [square brackets].',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              order: 'order',
              supabaseLeaderId: 'supabaseLeaderId',
              section: 'sectionHeader',
            },
            prepare({ order, supabaseLeaderId, section }) {
              return {
                title: `${order}. ${supabaseLeaderId ? 'Linked Speaker' : 'Unlinked Speaker'}`,
                subtitle: section || '',
              }
            },
          },
        },
      ],
      description: 'All individual speeches and contributions from this sitting. Speaker details are resolved from Supabase using supabaseLeaderId.',
    }),

    // Key Events / Highlights
    defineField({
      name: 'keyEvents',
      title: 'Key Events / Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Short scannable highlights (e.g. "Sugar importation statement requested", "Equalisation Fund debate dominates sitting"). Max 8–10 items.',
    }),

    // Debate Sections (for navigation + accordions)
    defineField({
      name: 'debateSections',
      title: 'Debate Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Short Description',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'order',
              title: 'Display Order',
              type: 'number',
              initialValue: 1,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              description: 'description',
            },
            prepare({ title, description }) {
              return {
                title: title || 'Untitled section',
                subtitle: description || '',
              }
            },
          },
        },
      ],
      description: 'High-level structure of the sitting (used for navigation and mobile accordions)',
    }),

    defineField({
      name: 'topics',
      title: 'Topics / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    defineField({
      name: 'documents',
      title: 'Additional Documents',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Document Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'File or Page URL', type: 'url', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'fileType',
              title: 'File Type',
              type: 'string',
              options: {
                list: [
                  { title: 'PDF', value: 'PDF' },
                  { title: 'Word Document', value: 'DOCX' },
                  { title: 'Other', value: 'Other' },
                ],
              },
            }),
          ],
        },
      ],
    }),

    defineField({
      name: 'isActive',
      title: 'Show on Public Site',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      houseType: 'houseType',
      sittingDate: 'sittingDate',
      sittingPeriod: 'sittingPeriod',
    },
    prepare({ title, houseType, sittingDate, sittingPeriod }) {
      const dateStr = sittingDate
        ? new Date(sittingDate).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })
        : ''
      return {
        title: title || 'Untitled Sitting',
        subtitle: `${houseType} • ${dateStr} • ${sittingPeriod || ''}`,
      }
    },
  },

  orderings: [
    {
      title: 'Sitting Date (newest first)',
      name: 'sittingDateDesc',
      by: [{ field: 'sittingDate', direction: 'desc' }],
    },
  ],
})