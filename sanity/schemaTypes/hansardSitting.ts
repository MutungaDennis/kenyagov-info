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
    // WHO IS IN THE CHAIR FOR THIS SITTING
    // ============================================
    defineField({
      name: 'presidingOfficer',
      title: 'Presiding officer (this sitting)',
      type: 'object',
      description:
        'Who chairs the sitting. When the Speaker is absent, the Deputy Speaker presides; if both are absent, the House elects a Temporary Speaker (a Member).',
      fields: [
        defineField({
          name: 'role',
          title: 'Chair role',
          type: 'string',
          options: {
            list: [
              { title: 'The Speaker', value: 'speaker' },
              { title: 'The Deputy Speaker', value: 'deputy-speaker' },
              { title: 'The Temporary Speaker (elected Member)', value: 'temporary-speaker' },
            ],
          },
          initialValue: 'speaker',
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'displayName',
          title: 'Name as shown in Hansard',
          type: 'string',
          description: 'e.g. Hon. Moses Wetang\'ula or Hon. [Member elected Temporary Speaker]',
        }),
        defineField({
          name: 'supabaseLeaderId',
          title: 'Supabase Leader ID',
          type: 'string',
          description: 'Link to leaders table — especially for Temporary / Deputy Speakers who are MPs.',
        }),
        defineField({
          name: 'notes',
          title: 'Notes',
          type: 'string',
          description: 'Optional, e.g. "Speaker absent; Temporary Speaker elected at 2:45 p.m."',
        }),
      ],
    }),

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

            defineField({
              name: 'type',
              title: 'Entry Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Spoken Contribution (MP speech)', value: 'spoken' },
                  { title: 'Hon. Members (group / chamber response)', value: 'members' },
                  { title: 'Procedural Note (Laughter, consultations, Chair changes, etc.)', value: 'procedural' },
                  { title: 'Section Header (main order of business)', value: 'header' },
                  { title: 'Mini Header (under a section header)', value: 'mini-header' },
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
              description: 'e.g. Hon., The Speaker, The Temporary Speaker, Leader of the Majority Party',
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

            defineField({
              name: 'isChairContribution',
              title: 'Speaking as Chair (exclude from member stats)',
              type: 'boolean',
              description:
                'Tick when this intervention is made as Speaker / Deputy Speaker / Temporary Speaker in the chair. Chair turns do not count toward the member\'s Hansard contribution total (they speak far more often than floor members).',
              initialValue: false,
            }),

            defineField({ name: 'startTime', title: 'Start Time (e.g. 10:23)', type: 'string' }),

            // Section header (main) or mini-header title, or topic tag on spoken rows
            defineField({
              name: 'sectionHeader',
              title: 'Section / mini-header title',
              type: 'string',
              description:
                'Main: "REQUESTS FOR STATEMENTS". Mini: "IMPORTATION OF REFINED SUGAR INTO THE COUNTRY". Optional topic tag on spoken rows.',
            }),

            defineField({
              name: 'speech',
              title: 'Content / Speech',
              type: 'array',
              of: [
                { type: 'block' },
                {
                  type: 'object',
                  name: 'hansardTable',
                  title: 'Schedule / estimate table',
                  fields: [
                    defineField({
                      name: 'caption',
                      title: 'Caption',
                      type: 'string',
                      description: 'e.g. FIRST SCHEDULE (S. 3, 4)',
                    }),
                    defineField({
                      name: 'headers',
                      title: 'Column headers',
                      type: 'array',
                      of: [{ type: 'string' }],
                    }),
                    defineField({
                      name: 'rows',
                      title: 'Rows',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          fields: [
                            defineField({
                              name: 'cells',
                              title: 'Cells',
                              type: 'array',
                              of: [{ type: 'string' }],
                            }),
                          ],
                          preview: {
                            select: { cells: 'cells' },
                            prepare({ cells }) {
                              const c = Array.isArray(cells) ? cells : [];
                              return { title: c.slice(0, 3).join(' · ') || 'Row' };
                            },
                          },
                        },
                      ],
                    }),
                  ],
                  preview: {
                    select: { caption: 'caption', headers: 'headers' },
                    prepare({ caption, headers }) {
                      const h = Array.isArray(headers) ? headers.join(', ') : '';
                      return {
                        title: caption || 'Table',
                        subtitle: h,
                      };
                    },
                  },
                },
              ],
              description:
                'Spoken words, procedural notes, and optional schedule tables. In admin, paste Markdown tables or wrap with [[TABLE]] … [[/TABLE]].',
            }),
          ],
          preview: {
            select: {
              order: 'order',
              type: 'type',
              section: 'sectionHeader',
              speaker: 'speakerName',
              leaderId: 'supabaseLeaderId',
              chair: 'isChairContribution',
            },
            prepare({ order, type, section, speaker, leaderId, chair }) {
              const typeLabel =
                type === 'spoken' ? '🗣️' :
                type === 'members' ? '👥' :
                type === 'procedural' ? '📝' :
                type === 'mini-header' ? '▸' : '📌';
              const who =
                type === 'members'
                  ? (speaker || 'Hon. Members')
                  : speaker || (leaderId ? `leader:${String(leaderId).slice(0, 8)}` : '');
              const chairMark = chair ? ' [Chair]' : '';
              return {
                title: `${order}. ${typeLabel} ${who || section || ''}`.trim() + chairMark,
                subtitle: section && who ? section : undefined,
              };
            },
          },
        },
      ],
      description: 'All speeches, procedural notes, section headers, and mini-headers in chronological order.',
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