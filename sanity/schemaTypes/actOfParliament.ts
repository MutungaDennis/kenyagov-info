// sanity/schemaTypes/actOfParliament.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'actOfParliament',
  title: 'Act of Parliament',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Official Act Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'shortTitle',
      title: 'Short Title / Common Name',
      type: 'string',
    }),
    defineField({
      name: 'citation',
      title: 'Legal Citation (e.g. Act No. 6 of 2012)',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Year Enacted / Amended',
      type: 'number',
    }),
    defineField({
      name: 'status',
      title: 'Current Status',
      type: 'string',
      options: {
        list: ['Active', 'Amended', 'Repealed', 'Pending'],
      },
      initialValue: 'Active',
    }),
    defineField({
      name: 'summary',
      title: 'Plain English Summary',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'officialText',
      title: 'Full Act Text / Key Sections',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'pdfUrl',
      title: 'Official PDF Link (Kenya Law Reports)',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      status: 'status',
    },
    prepare: ({ title, year, status }) => ({
      title: title,
      subtitle: `${year} • ${status}`,
    }),
  },
});