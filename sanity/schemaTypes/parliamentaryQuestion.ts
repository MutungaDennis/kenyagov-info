import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'parliamentaryQuestion',
  title: 'Parliamentary Question',
  type: 'document',
  description: 'Parliamentary questions asked in the National Assembly, Senate, or County Assemblies',
  fields: [
    defineField({
      name: 'title',
      title: 'Question Subject / Title',
      type: 'string',
      description: 'Short, clear title or subject of the question (e.g. "Status of the Affordable Housing Programme")',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'questionNumber',
      title: 'Question Number',
      type: 'string',
      description: 'Official question number, e.g. "Question No. 245 of 2025" or "Oral Question 12/2025"',
    }),
    defineField({
      name: 'house',
      title: 'House',
      type: 'string',
      options: {
        list: [
          { title: 'National Assembly', value: 'national-assembly' },
          { title: 'Senate', value: 'senate' },
          { title: 'County Assembly', value: 'county-assembly' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'national-assembly',
    }),
    defineField({
      name: 'county',
      title: 'County',
      type: 'string',
      description: 'Only required when House = County Assembly',
      hidden: ({ parent }) => parent?.house !== 'county-assembly',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { house?: string }
          if (parent?.house === 'county-assembly' && !value) {
            return 'County is required for County Assembly questions'
          }
          return true
        }),
    }),
    defineField({
      name: 'askedBy',
      title: 'Asked By',
      type: 'string',
      description: 'Name of the Member who asked the question (MP, Senator, or MCA)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'directedTo',
      title: 'Directed To',
      type: 'string',
      description: 'Minister, Principal Secretary, Department, County Executive, or specific office',
    }),
    defineField({
      name: 'askedDate',
      title: 'Asked Date',
      type: 'date',
      description: 'Date the question was formally asked / submitted',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answeredDate',
      title: 'Answered Date',
      type: 'date',
      description: 'Date the question was officially answered (leave blank if still pending)',
    }),
    defineField({
      name: 'status',
      title: 'Current Status',
      type: 'string',
      options: {
        list: [
          { title: 'Answered', value: 'answered' },
          { title: 'Unanswered / Pending', value: 'unanswered' },
          { title: 'Deferred', value: 'deferred' },
          { title: 'Withdrawn by Member', value: 'withdrawn' },
          { title: 'Lapsed', value: 'lapsed' },
          { title: 'Oral Question', value: 'oral' },
          { title: 'Written Question', value: 'written' },
          { title: 'Supplementary Question Pending', value: 'supplementary-pending' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'unanswered',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parliamentaryTerm',
      title: 'Parliamentary Term',
      type: 'string',
      description: 'e.g. "13th Parliament (2022–2027)" or "County Assembly Term 2022–2027"',
    }),
    defineField({
      name: 'summary',
      title: 'Short Summary (for cards)',
      type: 'array',
      of: [{ type: 'block' }],
      description: '2–4 sentence summary shown on the Questions Tracker listing page',
    }),
    defineField({
      name: 'topics',
      title: 'Topics / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Key topics for filtering and search (e.g. Health, Education, Infrastructure)',
    }),
    defineField({
      name: 'hansardUrl',
      title: 'Hansard or Video Link',
      type: 'url',
      description: 'Direct link to the Hansard record or YouTube video of the sitting',
    }),

    // === Extended fields for detail page (future-proof) ===
    defineField({
      name: 'fullQuestionText',
      title: 'Full Question Text',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Complete original text of the question (for the detail page)',
    }),
    defineField({
      name: 'answerText',
      title: 'Official Answer / Response',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Full text of the answer given by the Minister/Department',
    }),
    defineField({
      name: 'documents',
      title: 'Attached Documents',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Document Title',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'File URL',
              type: 'url',
            }),
            defineField({
              name: 'fileType',
              title: 'File Type',
              type: 'string',
              options: {
                list: ['PDF', 'DOCX', 'Image', 'Other'],
              },
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'fileType',
            },
          },
        },
      ],
      description: 'Supporting documents, written answers, or related papers',
    }),
    defineField({
      name: 'isActive',
      title: 'Show on Public Tracker',
      type: 'boolean',
      description: 'Toggle to hide this question from the public website',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      questionNumber: 'questionNumber',
      askedBy: 'askedBy',
      status: 'status',
      house: 'house',
    },
    prepare({ title, questionNumber, askedBy, status, house }) {
      const houseLabel =
        house === 'national-assembly'
          ? 'NA'
          : house === 'senate'
          ? 'Senate'
          : house === 'county-assembly'
          ? 'County'
          : ''

      return {
        title: title || 'Untitled Question',
        subtitle: `${questionNumber || ''} • ${askedBy || 'Unknown'} • ${status || ''} • ${houseLabel}`,
      }
    },
  },
  orderings: [
    {
      title: 'Asked Date (Newest First)',
      name: 'askedDateDesc',
      by: [{ field: 'askedDate', direction: 'desc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
})
