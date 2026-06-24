import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hansardDivision',
  title: 'Hansard Division / Vote',
  type: 'document',
  fields: [
    defineField({
      name: 'sitting',
      title: 'Sitting',
      type: 'reference',
      to: [{ type: 'hansardSitting' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'divisionTitle',
      title: 'Division Title',
      type: 'string',
      description: 'e.g. "Second Reading – The Finance Bill, 2026"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'divisionDate',
      title: 'Date of Division',
      type: 'date',
    }),
    defineField({
      name: 'votes',
      title: 'Votes Recorded',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'supabaseLeaderId', title: 'Leader ID (Supabase)', type: 'string' },
            {
              name: 'vote',
              title: 'Vote',
              type: 'string',
              options: {
                list: [
                  { title: 'AYE (Yes)', value: 'aye' },
                  { title: 'NO', value: 'no' },
                  { title: 'ABSTAIN', value: 'abstain' },
                  { title: 'ABSENT', value: 'absent' },
                ],
              },
            },
          ],
          preview: {
            select: { leader: 'supabaseLeaderId', vote: 'vote' },
            prepare({ leader, vote }) {
              return { title: `${leader} — ${vote?.toUpperCase()}` }
            },
          },
        },
      ],
      description: 'Record of how each member voted. Use this to calculate alignment scores.',
    }),
    defineField({
      name: 'result',
      title: 'Division Result',
      type: 'string',
      options: {
        list: [
          { title: 'Passed', value: 'passed' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'divisionTitle',
      result: 'result',
    },
    prepare({ title, result }) {
      return { title: title || 'Division', subtitle: result }
    },
  },
})