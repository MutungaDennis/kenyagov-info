import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'petition',
  title: 'Petition',
  type: 'document',
  description: 'Parliamentary petitions submitted to the National Assembly, Senate, or County Assemblies',
  
  fields: [
    defineField({
      name: 'title',
      title: 'Petition Title / Subject',
      type: 'string',
      description: 'Official subject or short title of the petition',
      validation: (Rule) => Rule.required().min(10).max(200),
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
      name: 'petitionNumber',
      title: 'Petition Number',
      type: 'string',
      description: 'e.g. "Petition No. 18 of 2025" or "Petition No. 7 of 2024 (County Assembly)"',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'house',
      title: 'House / Legislature',
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
      title: 'County (for County Assembly petitions only)',
      type: 'string',
      description: 'Official county name, e.g. "Nairobi City County", "Mombasa County". Leave blank for National Assembly or Senate petitions.',
      hidden: ({ parent }) => parent?.house !== 'county-assembly',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.house === 'county-assembly' && !value) {
            return 'County name is required for County Assembly petitions'
          }
          return true
        }),
    }),

    defineField({
      name: 'petitioner',
      title: 'Petitioner / Petitioner Group',
      type: 'string',
      description: 'Name of the individual, organisation, or group that submitted the petition',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'presentedDate',
      title: 'Date Presented / Submitted',
      type: 'date',
      description: 'Date the petition was formally presented in the House',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Current Status',
      type: 'string',
      options: {
        list: [
          { title: 'Under Consideration', value: 'under-consideration' },
          { title: 'Referred to Committee', value: 'referred-to-committee' },
          { title: 'Responded by Government', value: 'responded' },
          { title: 'Granted / Successful', value: 'granted' },
          { title: 'Rejected / Declined', value: 'rejected' },
          { title: 'Withdrawn by Petitioner', value: 'withdrawn' },
          { title: 'Lapsed', value: 'lapsed' },
          { title: 'Closed', value: 'closed' },
          { title: 'Pending', value: 'pending' },
          { title: 'Awaiting Government Response', value: 'awaiting-response' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'under-consideration',
    }),

    defineField({
      name: 'parliamentaryTerm',
      title: 'Parliamentary Term',
      type: 'string',
      description: 'e.g. "13th Parliament (2022–2027)" or "2022–2027 Term"',
      initialValue: '13th Parliament (2022–2027)',
    }),

    defineField({
      name: 'summary',
      title: 'Short Summary (for listings)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Brief 1–2 paragraph summary shown on the Petitions Tracker cards',
    }),

    defineField({
      name: 'topics',
      title: 'Topics / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Key topics for filtering and search (e.g. "Healthcare", "Environment", "Youth Employment")',
    }),

    defineField({
      name: 'responseDate',
      title: 'Date of Government / House Response',
      type: 'date',
      description: 'Date the petition received an official response (if applicable)',
    }),

    defineField({
      name: 'fullText',
      title: 'Full Petition Text',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Complete original text of the petition (for the detail page)',
    }),

    defineField({
      name: 'governmentResponse',
      title: 'Government / House Response',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Official response from the Government, Ministry, or the House (for the detail page)',
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
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Document URL',
              type: 'url',
              description: 'Link to PDF, scanned document, or external file',
            }),
            defineField({
              name: 'fileType',
              title: 'File Type',
              type: 'string',
              options: {
                list: [
                  { title: 'PDF', value: 'PDF' },
                  { title: 'Word Document', value: 'DOCX' },
                  { title: 'Image / Scan', value: 'Image' },
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
              subtitle: 'fileType',
            },
          },
        },
      ],
      description: 'Petition text, committee reports, government replies, or supporting documents',
    }),

    defineField({
      name: 'isActive',
      title: 'Show on Public Website',
      type: 'boolean',
      description: 'Toggle OFF to hide this petition from the public tracker (useful for drafts or sensitive cases)',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'petitionNumber',
      status: 'status',
      date: 'presentedDate',
      house: 'house',
    },
    prepare(selection) {
      const { title, subtitle, status, date, house } = selection
      const houseLabel =
        house === 'national-assembly'
          ? 'NA'
          : house === 'senate'
          ? 'Senate'
          : 'County Assembly'

      return {
        title: title || 'Untitled Petition',
        subtitle: `${subtitle || ''} • ${houseLabel} • ${status || ''}`,
        media: undefined,
      }
    },
  },

  orderings: [
    {
      title: 'Presented Date, Newest First',
      name: 'presentedDateDesc',
      by: [{ field: 'presentedDate', direction: 'desc' }],
    },
    {
      title: 'Status (A–Z)',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
    {
      title: 'Petition Number',
      name: 'petitionNumberAsc',
      by: [{ field: 'petitionNumber', direction: 'asc' }],
    },
  ],
})
