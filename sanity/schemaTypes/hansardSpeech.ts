import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hansardSpeech',
  title: 'Hansard Speech / Contribution',
  type: 'document',
  fieldsets: [
    { name: 'context', title: 'Sitting & Section Context', options: { collapsible: true, collapsed: false } },
    { name: 'speaker', title: 'Speaker Information', options: { collapsible: true, collapsed: false } },
    { name: 'content', title: 'Speech Content', options: { collapsible: true, collapsed: false } },
  ],
  fields: [
    defineField({
      name: 'sitting',
      title: 'Parent Sitting',
      type: 'reference',
      to: [{ type: 'hansardSitting' }],
      validation: (Rule) => Rule.required(),
      fieldset: 'context',
    }),
    defineField({
      name: 'sectionHeader',
      title: 'Section / Order of Business',
      type: 'string',
      description: 'e.g. "THE FINANCE BILL, 2026 – SECOND READING"',
      fieldset: 'context',
    }),
    defineField({
      name: 'sectionSlug',
      title: 'Section Anchor',
      type: 'slug',
      options: { source: 'sectionHeader' },
      fieldset: 'context',
    }),

    // Speaker
    defineField({
      name: 'supabaseLeaderId',
      title: 'Supabase Leader ID',
      type: 'string',
      description: 'Exact UUID from your Supabase leaders table. Critical for member profiles & metrics.',
      fieldset: 'speaker',
    }),
    defineField({
      name: 'speakerLabel',
      title: 'Speaker Display Name',
      type: 'string',
      description: 'e.g. "Hon. Kimani Ichung\'wah (Kikuyu, UDA)" or "The Speaker (Hon. Moses Wetang\'ula)"',
      validation: (Rule) => Rule.required(),
      fieldset: 'speaker',
    }),
    defineField({
      name: 'party',
      title: 'Political Party (at time of speech)',
      type: 'string',
      fieldset: 'speaker',
    }),

    // Content
    defineField({
      name: 'speechContent',
      title: 'Speech Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Verbatim or cleaned transcript. Use Portable Text for formatting.',
      validation: (Rule) => Rule.required(),
      fieldset: 'content',
    }),
    defineField({
      name: 'videoTimestamp',
      title: 'Video Timestamp (seconds)',
      type: 'number',
      description: 'Seconds from start of YouTube video. Enables "Jump to video" buttons.',
      fieldset: 'content',
    }),
    defineField({
      name: 'topics',
      title: 'Topics / Subjects Mentioned',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key topics in this specific speech (for search & member topic analysis)',
      fieldset: 'content',
    }),
    defineField({
      name: 'isKeyContribution',
      title: 'Mark as Key Contribution',
      type: 'boolean',
      description: 'Highlight important interventions (used in summaries and leader profiles)',
      initialValue: false,
      fieldset: 'content',
    }),
  ],
  preview: {
    select: {
      speaker: 'speakerLabel',
      sitting: 'sitting.title',
      timestamp: 'videoTimestamp',
    },
    prepare({ speaker, sitting, timestamp }) {
      const time = timestamp ? ` @ ${Math.floor(timestamp / 60)}m` : ''
      return {
        title: speaker || 'Unknown Speaker',
        subtitle: `${sitting || ''}${time}`,
      }
    },
  },
})