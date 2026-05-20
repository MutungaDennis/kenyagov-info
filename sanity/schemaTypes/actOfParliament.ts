// sanity/schemaTypes/actOfParliament.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'actOfParliament',
  title: 'Act of Parliament',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Official Full Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'shortTitle',
      title: 'Short Title / Common Name',
      type: 'string',
      description: 'e.g. "Data Protection Act" or "Marriage Act"',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'shortTitle', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'citation',
      title: 'Legal Citation',
      type: 'string',
      description: 'e.g. Act No. 24 of 2019',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'capNumber',
      title: 'Chapter Number (Cap.)',
      type: 'string',
      description: 'e.g. Cap. 63 (if assigned)',
    }),
    defineField({
      name: 'yearEnacted',
      title: 'Year Enacted',
      type: 'number',
      validation: Rule => Rule.required().min(1897).max(2026),
    }),
    defineField({
      name: 'dateOfAssent',
      title: 'Date of Assent',
      type: 'date',
    }),
    defineField({
      name: 'dateOfCommencement',
      title: 'Date of Commencement',
      type: 'date',
    }),

    defineField({
  name: 'status',
  title: 'Current Status',
  type: 'string',
  options: {
    list: [
      { title: 'Active / In Force', value: 'active' },
      { title: 'Amended', value: 'amended' },
      { title: 'Repealed', value: 'repealed' },
      { title: 'Pending', value: 'pending' },
    ]
  },
  initialValue: 'active',
}),

defineField({
  name: 'houseOfOrigin',
  title: 'House of Origin',
  type: 'string',
  description: 'Which House of Parliament introduced the Bill that became this Act?',
  options: {
    list: [
      {
        title: 'National Assembly',
        value: 'nationalAssembly',
      },
      {
        title: 'Senate',
        value: 'senate',
      },
    ],
    layout: 'radio',
  },
  validation: Rule => Rule.required(),
}),

    // Link to Constitution
    defineField({
      name: 'constitutionalBasis',
      title: 'Linked Constitutional Article(s)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'constitutionArticle' }] }],
      description: 'Which Article(s) of the Constitution required or enabled this Act?',
    }),

    defineField({
      name: 'globalSummary',
      title: 'Overall Act Summary (Plain English)',
      type: 'text',
      rows: 4,
    }),

    // Hierarchical Sections
    // ==============================
// PARTS, SECTIONS & SCHEDULES
// ==============================
defineField({
  name: 'parts',
  title: 'Parts, Sections & Schedules',
  type: 'array',

  of: [
    // =====================================================
    // PARTS OF ACT
    // =====================================================
    {
      type: 'object',
      name: 'part',
      title: 'Part of Act',

      fields: [
        defineField({
          name: 'partNumber',
          title: 'Part Number',
          type: 'string'
        }),

        defineField({
          name: 'partTitle',
          title: 'Part Title',
          type: 'string'
        }),

        defineField({
          name: 'sections',
          title: 'Sections',
          type: 'array',

          of: [
            {
              type: 'object',
              name: 'section',

              fields: [
                defineField({
                  name: 'sectionNumber',
                  title: 'Section Number',
                  type: 'string'
                }),

                defineField({
                  name: 'sectionTitle',
                  title: 'Section Title',
                  type: 'string'
                }),

                defineField({
                  name: 'officialText',
                  title: 'Official Legal Text',
                  type: 'array',
                  of: [{ type: 'block' }]
                }),

                defineField({
                  name: 'plainSummary',
                  title: 'Plain English Summary',
                  type: 'text',
                  rows: 3
                }),
              ]
            }
          ]
        }),
      ]
    },

    // =====================================================
    // SCHEDULES
    // =====================================================
    {
      type: 'object',
      name: 'schedule',
      title: 'Schedule',

      fields: [
        defineField({
          name: 'scheduleNumber',
          title: 'Schedule Number',
          type: 'string',
          description:
            'e.g. First Schedule, Second Schedule'
        }),

        defineField({
          name: 'scheduleTitle',
          title: 'Schedule Title',
          type: 'string'
        }),

        defineField({
          name: 'relatedSection',
          title: 'Related Section',
          type: 'string',
          description:
            'e.g. Section 29'
        }),

        defineField({
          name: 'introText',
          title: 'Introductory Text',
          type: 'array',
          of: [{ type: 'block' }]
        }),

        // =========================================
        // SCHEDULE ITEMS
        // =========================================
        defineField({
          name: 'items',
          title: 'Schedule Items',
          type: 'array',

          of: [
            {
              type: 'object',
              name: 'scheduleItem',

              fields: [
                defineField({
                  name: 'itemNumber',
                  title: 'Item Number',
                  type: 'string'
                }),

                defineField({
                  name: 'itemTitle',
                  title: 'Item Title',
                  type: 'string'
                }),

                defineField({
                  name: 'officialText',
                  title: 'Official Legal Text',
                  type: 'array',
                  of: [{ type: 'block' }]
                }),

                defineField({
                  name: 'plainSummary',
                  title: 'Plain English Summary',
                  type: 'text',
                  rows: 3
                }),
              ]
            }
          ]
        }),
      ]
    }
  ]
}),

    // Subsidiary Legislation
    defineField({
      name: 'subsidiaryLegislation',
      title: 'Subsidiary Legislation (Regulations, Rules, etc.)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'legalNoticeNumber', title: 'Legal Notice No.', type: 'string' }),
            defineField({ name: 'year', title: 'Year', type: 'number' }),
            defineField({ name: 'pdfUrl', title: 'PDF Link', type: 'url' }),
          ]
        }
      ]
    }),

    // Document Upload
    defineField({
      name: 'pdfDocument',
      title: 'Official PDF Document',
      type: 'file',
      options: {
        accept: '.pdf',
      },
      description: 'Upload the official consolidated PDF of the Act',
    }),

    defineField({
      name: 'officialKenyaLawUrl',
      title: 'Official Kenya Law Reports URL',
      type: 'url',
    }),

    defineField({
      name: 'amendments',
      title: 'Major Amendments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'amendingAct', title: 'Amending Act', type: 'string' }),
            defineField({ name: 'year', title: 'Year', type: 'number' }),
            defineField({ name: 'notes', title: 'Notes on Changes', type: 'text' }),
          ]
        }
      ]
    }),
  ],

  preview: {
    select: {
      title: 'shortTitle',
      citation: 'citation',
      year: 'yearEnacted',
      status: 'status',
    },
    prepare(selection: any) {
      const { title, citation, year, status } = selection;
      return {
        title: title || 'Untitled Act',
        subtitle: `${citation || ''} • ${year || ''} • ${status || ''}`,
      };
    },
  },
});