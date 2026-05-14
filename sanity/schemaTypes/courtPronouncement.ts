// sanity/schemaTypes/courtPronouncement.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'courtPronouncement',
  title: 'Court Pronouncement / Judgment',
  type: 'document',
  fields: [
    defineField({
      name: 'caseName',
      title: 'Case Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'caseNumber',
      title: 'Case Number / Petition No.',
      type: 'string',
    }),
    defineField({
      name: 'court',
      title: 'Court Level',
      type: 'string',
      options: {
        list: [
          'Supreme Court',
          'Court of Appeal',
          'High Court',
          'Employment and Labour Relations Court',
          'Environment and Land Court'
        ]
      },
    }),
    defineField({
      name: 'judgmentDate',
      title: 'Judgment Date',
      type: 'date',
    }),
    defineField({
      name: 'summary',
      title: 'Plain English Summary of Ruling',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'keyHolding',
      title: 'Key Legal Holding',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'pdfUrl',
      title: 'Full Judgment PDF Link',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      caseName: 'caseName',
      date: 'judgmentDate',
    },
    prepare: ({ caseName, date }) => ({
      title: caseName,
      subtitle: date ? new Date(date).toLocaleDateString() : '',
    }),
  },
});