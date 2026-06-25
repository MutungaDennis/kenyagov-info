import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'paper',
  title: 'Parliamentary Paper / Report',
  type: 'document',
  icon: () => '📄',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(200),
      description: 'Official title of the paper or report',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'URL-friendly identifier (auto-generated from title)',
    }),

    defineField({
      name: 'referenceNumber',
      title: 'Reference Number',
      type: 'string',
      description: 'e.g. "Sessional Paper No. 3 of 2025", "PAC Report 2024/25", or "Budget Paper No. 1 of 2026"',
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
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      description: 'The House before which the paper was laid',
    }),

    defineField({
      name: 'county',
      title: 'County',
      type: 'string',
      description: 'Only required for County Assembly papers',
      hidden: ({ parent }) => parent?.house !== 'county-assembly',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context?.parent?.house === 'county-assembly' && !value) {
            return 'County is required for County Assembly papers'
          }
          return true
        }),
    }),

    defineField({
      name: 'paperType',
      title: 'Paper Type',
      type: 'string',
      options: {
        list: [
          { title: 'Sessional Paper', value: 'Sessional Paper' },
          { title: 'Committee Report', value: 'Committee Report' },
          { title: 'Annual Report', value: 'Annual Report' },
          { title: 'White Paper', value: 'White Paper' },
          { title: 'Budget Paper', value: 'Budget Paper' },
          { title: 'Audit Report', value: 'Audit Report' },
          { title: 'Policy Paper', value: 'Policy Paper' },
          { title: 'Other Official Document', value: 'Other' },
        ],
      },
      description: 'Category of the parliamentary paper',
    }),

    defineField({
      name: 'presentedBy',
      title: 'Presented By',
      type: 'string',
      description: 'Minister, Committee Chairperson, or other presenter',
    }),

    defineField({
      name: 'laidDate',
      title: 'Date Laid / Presented',
      type: 'date',
      validation: (Rule) => Rule.required(),
      description: 'Date the paper was formally laid before the House',
    }),

    defineField({
      name: 'status',
      title: 'Current Status',
      type: 'string',
      options: {
        list: [
          { title: 'Laid', value: 'Laid' },
          { title: 'Under Consideration', value: 'Under Consideration' },
          { title: 'Referred to Committee', value: 'Referred to Committee' },
          { title: 'Debated', value: 'Debated' },
          { title: 'Adopted', value: 'Adopted' },
          { title: 'Approved', value: 'Approved' },
          { title: 'Passed', value: 'Passed' },
          { title: 'Accepted', value: 'Accepted' },
          { title: 'Rejected', value: 'Rejected' },
          { title: 'Withdrawn', value: 'Withdrawn' },
          { title: 'Lapsed', value: 'Lapsed' },
          { title: 'Declined', value: 'Declined' },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'Laid',
    }),

    defineField({
      name: 'parliamentaryTerm',
      title: 'Parliamentary Term',
      type: 'string',
      description: 'e.g. "13th Parliament (2022–2027)" or "2022–2027"',
    }),

    defineField({
      name: 'summary',
      title: 'Short Summary',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Brief summary shown on listing cards (2–3 short paragraphs max)',
    }),

    defineField({
      name: 'topics',
      title: 'Topics / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Keywords for filtering and search (e.g. Budget, Health, Education, Audit)',
    }),

    defineField({
      name: 'fullText',
      title: 'Full Text / Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Complete content of the paper or report (for detail page). Use for shorter documents or key excerpts.',
    }),

    defineField({
      name: 'documents',
      title: 'Documents & Attachments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Document Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'File URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'fileType',
              title: 'File Type',
              type: 'string',
              options: {
                list: [
                  { title: 'PDF', value: 'PDF' },
                  { title: 'Word Document', value: 'DOCX' },
                  { title: 'Excel Spreadsheet', value: 'XLSX' },
                  { title: 'Other', value: 'Other' },
                ],
              },
            }),
            defineField({
              name: 'uploadedAt',
              title: 'Uploaded / Published Date',
              type: 'datetime',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              fileType: 'fileType',
            },
            prepare({ title, fileType }) {
              return {
                title: title || 'Untitled document',
                subtitle: fileType || 'File',
              }
            },
          },
        },
      ],
      description: 'Attach PDFs, committee reports, or supporting documents',
    }),

    defineField({
      name: 'isActive',
      title: 'Show on Public Site',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to hide this paper from the public tracker without deleting it',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      referenceNumber: 'referenceNumber',
      house: 'house',
      status: 'status',
      paperType: 'paperType',
    },
    prepare({ title, referenceNumber, house, status, paperType }) {
      const houseLabel =
        house === 'national-assembly'
          ? 'National Assembly'
          : house === 'senate'
          ? 'Senate'
          : house === 'county-assembly'
          ? 'County Assembly'
          : house

      return {
        title: referenceNumber ? `${referenceNumber} — ${title}` : title,
        subtitle: `${houseLabel} • ${paperType || 'Paper'} • ${status}`,
      }
    },
  },

  orderings: [
    {
      title: 'Date Laid (newest first)',
      name: 'laidDateDesc',
      by: [{ field: 'laidDate', direction: 'desc' }],
    },
    {
      title: 'Reference Number',
      name: 'referenceNumber',
      by: [{ field: 'referenceNumber', direction: 'asc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
})