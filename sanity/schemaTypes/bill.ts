import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'bill',
  title: 'Bill',
  type: 'document',
  icon: () => '📜',
  fields: [
    defineField({
      name: 'title',
      title: 'Bill Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(10).max(200),
      description: 'Official title of the Bill (e.g. "The Data Protection (Amendment) Bill, 2025")',
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
      name: 'billNumber',
      title: 'Bill Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Official bill number e.g. "Bill No. 15 of 2025" or "Senate Bill No. 7 of 2024"',
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
      description: 'Which house is considering this bill',
    }),

    defineField({
      name: 'county',
      title: 'County (if County Assembly Bill)',
      type: 'string',
      hidden: ({ parent }) => parent?.house !== 'county-assembly',
      description: 'Name of the county (only required for County Assembly bills)',
    }),

    defineField({
      name: 'parliamentaryTerm',
      title: 'Parliamentary Term',
      type: 'string',
      initialValue: '13th Parliament',
      description: 'e.g. "13th Parliament", "12th Parliament", or specific County Assembly term',
    }),

    defineField({
      name: 'billType',
      title: 'Bill Type',
      type: 'string',
      options: {
        list: [
          { title: 'Government Bill', value: 'government' },
          { title: "Private Member's Bill", value: 'private-member' },
          { title: 'Committee Bill', value: 'committee' },
          { title: 'Appropriation / Finance Bill', value: 'finance' },
          { title: 'Constitutional Amendment Bill', value: 'constitutional-amendment' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'government',
    }),

    defineField({
      name: 'sponsor',
      title: 'Sponsor / Mover',
      type: 'string',
      description: 'Name of the MP, Senator, or Member who introduced the bill (or "Government" / "Ministry of ...")',
    }),

    defineField({
      name: 'introducedDate',
      title: 'Date Introduced / First Reading',
      type: 'date',
      validation: (Rule) => Rule.required(),
      description: 'Date the bill was formally introduced in the house',
    }),

    defineField({
      name: 'status',
      title: 'Current Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published / First Reading', value: 'first-reading' },
          { title: 'Second Reading', value: 'second-reading' },
          { title: 'Committee Stage', value: 'committee-stage' },
          { title: 'Third Reading', value: 'third-reading' },
          { title: 'Passed by House', value: 'passed-house' },
          { title: 'Awaiting Assent', value: 'awaiting-assent' },
          { title: 'Assented (Law)', value: 'assented' },
          { title: 'Enacted', value: 'enacted' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Withdrawn', value: 'withdrawn' },
          { title: 'Lapsed', value: 'lapsed' },
          { title: 'Referred Back', value: 'referred-back' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'first-reading',
    }),

    defineField({
      name: 'lastActionDate',
      title: 'Date of Last Action',
      type: 'date',
      description: 'Most recent date something happened with this bill (reading, committee report, etc.)',
    }),

    defineField({
      name: 'summary',
      title: 'Short Summary',
      type: 'array',
      of: [{ type: 'block' }],
      description: '2-4 paragraph plain-language summary of what the bill does (shown on listing pages)',
    }),

    defineField({
      name: 'topics',
      title: 'Topics / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Key topics for filtering and search (e.g. "Data Protection", "Finance", "Health", "Environment")',
    }),

    // === Timeline / Legislative History ===
    defineField({
      name: 'timeline',
      title: 'Legislative Timeline',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'stage',
              title: 'Stage',
              type: 'string',
              options: {
                list: [
                  'First Reading',
                  'Second Reading',
                  'Committee Stage',
                  'Third Reading',
                  'Passed',
                  'Assent',
                  'Enacted',
                  'Rejected',
                  'Withdrawn',
                  'Lapsed',
                  'Other',
                ],
              },
            }),
            defineField({
              name: 'date',
              title: 'Date',
              type: 'date',
            }),
            defineField({
              name: 'outcome',
              title: 'Outcome / Notes',
              type: 'string',
              description: 'e.g. "Passed with amendments", "Referred to Committee on Finance"',
            }),
            defineField({
              name: 'hansardUrl',
              title: 'Hansard Link (optional)',
              type: 'url',
            }),
          ],
          preview: {
            select: {
              title: 'stage',
              subtitle: 'date',
            },
          },
        },
      ],
      description: 'Chronological history of the bill through the legislative process',
    }),

    // === Documents ===
    defineField({
      name: 'documents',
      title: 'Documents',
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
              name: 'file',
              title: 'PDF / Document',
              type: 'file',
              options: {
                accept: '.pdf,.doc,.docx',
              },
            }),
            defineField({
              name: 'url',
              title: 'External URL (if hosted elsewhere)',
              type: 'url',
            }),
            defineField({
              name: 'type',
              title: 'Document Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Bill as Introduced', value: 'introduced' },
                  { title: 'Committee Report', value: 'committee-report' },
                  { title: 'Amendment Sheet', value: 'amendments' },
                  { title: 'Act / Law (Gazetted)', value: 'act' },
                  { title: 'Explanatory Memorandum', value: 'explanatory-memo' },
                  { title: 'Other', value: 'other' },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'type',
            },
          },
        },
      ],
      description: 'Attach PDFs of the bill text, amendments, committee reports, and final Act',
    }),

    defineField({
      name: 'relatedBills',
      title: 'Related Bills',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'bill' }],
        },
      ],
      description: 'Link to other bills that are connected (e.g. amendments to this Act, or companion bills)',
    }),

    defineField({
      name: 'keywords',
      title: 'Search Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Additional keywords to improve search (optional)',
    }),

    defineField({
      name: 'isActive',
      title: 'Show on Public Tracker',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide this bill from the public tracker (useful for drafts)',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'billNumber',
      status: 'status',
      house: 'house',
    },
    prepare({ title, subtitle, status, house }) {
      const houseLabel =
        house === 'national-assembly'
          ? 'NA'
          : house === 'senate'
          ? 'Senate'
          : 'County Assembly'

      return {
        title: `${subtitle || ''} — ${title}`,
        subtitle: `${houseLabel} • ${status || 'No status'}`,
      }
    },
  },

  orderings: [
    {
      title: 'Introduced Date, Newest First',
      name: 'introducedDateDesc',
      by: [{ field: 'introducedDate', direction: 'desc' }],
    },
    {
      title: 'Last Action Date, Newest First',
      name: 'lastActionDateDesc',
      by: [{ field: 'lastActionDate', direction: 'desc' }],
    },
    {
      title: 'Bill Number',
      name: 'billNumber',
      by: [{ field: 'billNumber', direction: 'asc' }],
    },
  ],
})
