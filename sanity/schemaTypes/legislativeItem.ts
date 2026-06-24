import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'legislativeItem',
  title: 'Legislative Item (Bill / Question / Petition / Motion)',
  type: 'document',
  fieldsets: [
    { name: 'core', title: 'Core Information', options: { collapsible: true, collapsed: false } },
    { name: 'tracking', title: 'Lifecycle & Status Tracking', options: { collapsible: true, collapsed: false } },
    { name: 'links', title: 'Links to Debates & Documents', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Official Title',
      type: 'string',
      description: 'Full official title as published by Parliament',
      validation: (Rule) => Rule.required(),
      fieldset: 'core',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
      fieldset: 'core',
    }),
    defineField({
      name: 'itemType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Bill', value: 'bill' },
          { title: 'Motion', value: 'motion' },
          { title: 'Public Petition', value: 'petition' },
          { title: 'Legislative Proposal', value: 'proposal' },
          { title: 'Question (Oral/Written)', value: 'question' },
        ],
      },
      validation: (Rule) => Rule.required(),
      fieldset: 'core',
    }),
    defineField({
      name: 'sponsorLeaderId',
      title: 'Sponsor / Primary Member (Supabase ID)',
      type: 'string',
      description: 'Link to the leader who sponsored or asked this item',
      fieldset: 'core',
    }),

    // Tracking
    defineField({
      name: 'currentStatus',
      title: 'Current Status',
      type: 'string',
      options: {
        list: [
          { title: 'First Reading', value: 'first-reading' },
          { title: 'Second Reading', value: 'second-reading' },
          { title: 'Committee Stage', value: 'committee-stage' },
          { title: 'Third Reading', value: 'third-reading' },
          { title: 'Assented / Enacted', value: 'assented' },
          { title: 'Rejected / Lapsed / Withdrawn', value: 'lapsed' },
        ],
      },
      fieldset: 'tracking',
    }),
    defineField({
      name: 'stageHistory',
      title: 'Stage History',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'stage', title: 'Stage', type: 'string' },
            { name: 'date', title: 'Date', type: 'date' },
            { name: 'linkedSitting', title: 'Linked Hansard Sitting', type: 'reference', to: [{ type: 'hansardSitting' }] },
            { name: 'notes', title: 'Notes', type: 'text', rows: 2 },
          ],
        },
      ],
      description: 'Chronological journey of this item through Parliament',
      fieldset: 'tracking',
    }),

    // Links
    defineField({
      name: 'associatedSittings',
      title: 'Debated in These Sittings',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'hansardSitting' }] }],
      description: 'Link to Hansard sittings where this item was discussed',
      fieldset: 'links',
    }),
    defineField({
      name: 'summary',
      title: 'Plain English Summary',
      type: 'text',
      rows: 5,
      description: 'What is this bill/question/petition actually about? (Citizen language)',
      fieldset: 'core',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'itemType',
      status: 'currentStatus',
    },
    prepare({ title, type, status }) {
      return {
        title: title || 'Untitled Item',
        subtitle: `${type} • ${status}`,
      }
    },
  },
})