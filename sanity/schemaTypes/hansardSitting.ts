import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'hansardSitting',
  title: 'Hansard Sitting',
  type: 'document',
  icon: () => '🗣️',

  fields: [
    // === BASIC METADATA (keep as is) ===
    defineField({ name: 'title', title: 'Sitting Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
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
      },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'county', title: 'County (for County Assemblies only)', type: 'string', hidden: ({ parent }) => parent?.houseType !== 'county-assembly' }),
    defineField({ name: 'sittingDate', title: 'Sitting Date', type: 'date', validation: Rule => Rule.required() }),
    defineField({ name: 'sittingPeriod', title: 'Sitting Period', type: 'string', options: { list: ['Morning Sitting', 'Afternoon Sitting', 'Evening Sitting', 'Special Sitting'] } }),
    defineField({ name: 'parliamentaryTerm', title: 'Parliamentary Term', type: 'string' }),
    defineField({ name: 'youtubeUrl', title: 'YouTube Video URL', type: 'url' }),
    defineField({ name: 'officialHansardUrl', title: 'Official Hansard PDF URL', type: 'url' }),
    defineField({ name: 'editorialSummary', title: 'Editorial Summary (Citizen-friendly)', type: 'array', of: [{ type: 'block' }] }),

    // ============================================
    // IMPROVED CONTRIBUTIONS ARRAY
    // ============================================
    defineField({
      name: 'contributions',
      title: 'Contributions & Proceedings',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'order',
              title: 'Order',
              type: 'number',
              validation: Rule => Rule.required().min(1),
            }),

            // === NEW: Entry Type ===
            defineField({
              name: 'type',
              title: 'Entry Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Spoken Contribution (MP speech)', value: 'spoken' },
                  { title: 'Procedural Note (Laughter, consultations, Chair changes, etc.)', value: 'procedural' },
                  { title: 'Section Header (Papers, Bill, Motion, Adjournment, etc.)', value: 'header' },
                ],
              },
              initialValue: 'spoken',
              validation: Rule => Rule.required(),
            }),

            // Canonical speaker link — Supabase leaders.id (UUID). Public UI resolves name/party/photo from this.
            defineField({
              name: 'supabaseLeaderId',
              title: 'Supabase Leader ID',
              type: 'string',
              description:
                'UUID from Supabase leaders table. Preferred for spoken contributions — keeps Hansard linked to member profiles.',
            }),

            // Denormalized display fields (fallback when unlinked or for Studio preview)
            defineField({
              name: 'speakerName',
              title: 'Speaker Name (display)',
              type: 'string',
              description: 'Display name as it appears in the Hansard. Prefer linking via Supabase Leader ID.',
            }),
            defineField({
              name: 'speakerTitle',
              title: 'Speaker Title / Honorific',
              type: 'string',
              description: 'e.g. Hon., The Speaker, Leader of the Majority Party',
            }),
            defineField({
              name: 'constituency',
              title: 'Constituency (at time of speech)',
              type: 'string',
            }),
            defineField({
              name: 'party',
              title: 'Party (at time of speech)',
              type: 'string',
            }),
            defineField({
              name: 'role',
              title: 'Role / Organisation',
              type: 'string',
              description: 'Optional role label from the sitting (e.g. Cabinet Secretary, Whip).',
            }),

            defineField({ name: 'startTime', title: 'Start Time (e.g. 10:23)', type: 'string' }),

            // Section header (used for both headers and grouping spoken contributions)
            defineField({
              name: 'sectionHeader',
              title: 'Section / Order of Business',
              type: 'string',
              description: 'e.g. "PAPERS LAID", "THE SUPPLEMENTARY APPROPRIATION BILL – Second Reading"',
            }),

            defineField({
              name: 'speech',
              title: 'Content / Speech',
              type: 'array',
              of: [{ type: 'block' }],
              description: 'Full spoken words OR procedural note. Use (Laughter), (Applause), [interjections] in square brackets.',
              validation: Rule => Rule.required(),
            }),
          ],
          preview: {
            select: {
              order: 'order',
              type: 'type',
              section: 'sectionHeader',
              speaker: 'speakerName',
              leaderId: 'supabaseLeaderId',
            },
            prepare({ order, type, section, speaker, leaderId }) {
              const typeLabel = type === 'spoken' ? '🗣️' : type === 'procedural' ? '📝' : '📌';
              const who = speaker || (leaderId ? `leader:${String(leaderId).slice(0, 8)}` : '');
              return {
                title: `${order}. ${typeLabel} ${who || section || ''}`.trim(),
                subtitle: section && who ? section : undefined,
              };
            },
          },
        },
      ],
      description: 'All speeches, procedural notes, and section headers in chronological order.',
    }),

    // ============================================
    // DEBATE SECTIONS (for navigation + accordions)
    // ============================================
    defineField({
      name: 'debateSections',
      title: 'Debate Sections (for Navigation & Accordions)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              validation: Rule => Rule.required(),
              description: 'e.g. "PAPERS LAID", "SECOND READING: SUPPLEMENTARY APPROPRIATION BILL"',
            }),
            defineField({
              name: 'startOrder',
              title: 'Starts at Contribution #',
              type: 'number',
              validation: Rule => Rule.required().min(1),
            }),
            defineField({
              name: 'endOrder',
              title: 'Ends at Contribution #',
              type: 'number',
              validation: Rule => Rule.required().min(1),
            }),
            defineField({
              name: 'sectionType',
              title: 'Section Type (for styling)',
              type: 'string',
              options: {
                list: [
                  { title: 'Procedural', value: 'procedural' },
                  { title: 'Papers / Reports', value: 'papers' },
                  { title: 'Questions & Statements', value: 'questions' },
                  { title: 'Bill', value: 'bill' },
                  { title: 'Committee Stage', value: 'committee' },
                  { title: 'Motion', value: 'motion' },
                  { title: 'Adjournment', value: 'adjournment' },
                ],
              },
            }),
          ],
          preview: {
            select: { title: 'title', start: 'startOrder', end: 'endOrder' },
            prepare({ title, start, end }) {
              return { title: title, subtitle: `Contributions ${start} – ${end}` };
            },
          },
        },
      ],
      description: 'High-level structure used for sidebar navigation and mobile accordions. Define the major parts of the sitting here.',
    }),

    // Other fields (keyEvents, topics, documents, isActive) — keep as they are
    defineField({ name: 'keyEvents', title: 'Key Events / Highlights', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'topics', title: 'Topics / Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'isActive', title: 'Show on Public Site', type: 'boolean', initialValue: true }),
  ],

  preview: {
    select: { title: 'title', houseType: 'houseType', sittingDate: 'sittingDate' },
    prepare({ title, houseType, sittingDate }) {
      return {
        title: title,
        subtitle: `${houseType} • ${sittingDate}`,
      };
    },
  },
})