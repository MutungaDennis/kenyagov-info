// sanity/schemaTypes/institutionContent.ts
import { defineType, defineField } from 'sanity';

export const institutionContent = defineType({
  name: 'institutionContent',
  title: 'Institution Content',
  type: 'document',

  fields: [
    defineField({
      name: 'institutionSlug',
      title: 'Institution Slug (must match Supabase exactly)',
      type: 'slug',
      validation: (Rule) => Rule.required(),
    }),

    // --- YOUR EXISTING RICH CONTENT & CONTACT FIELDS ---
    defineField({
      name: 'whatItDoes',
      title: 'What it does (Rich Text)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'headquarters',
      title: 'Headquarters',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Official Website URL',
      type: 'url',
    }),
    defineField({
      name: 'email',
      title: 'Official Email',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Official Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'physicalAddress',
      title: 'Physical Address',
      type: 'text',
      rows: 4,
    }),

    // --- YOUR EXISTING LEGAL FIELDS ---
    defineField({
      name: 'legalBasis',
      title: 'Legal Basis',
      type: 'string',
    }),
    defineField({
      name: 'legalReference',
      title: 'Legal Reference',
      type: 'string',
    }),

    // ========================================================
    // NEW DIPLOMATIC & SCALING EXTENSIONS (Appended Safely)
    // ========================================================
    defineField({
      name: 'contentType',
      title: 'Content Variance Type',
      type: 'string',
      options: {
        list: [
          { title: 'Standard Ministry / Agency', value: 'standard' },
          { title: 'Diplomatic / Foreign Mission', value: 'diplomatic' },
          { title: 'Devolved County Entity', value: 'county' },
        ]
      },
      initialValue: 'standard',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'servicesCharter',
      title: 'Public Service Delivery Charter (Rich Text)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Step-by-step descriptive guides for citizens (e.g. passport renewal steps abroad, visa processes).',
    }),
    defineField({
      name: 'consularHoursDescription',
      title: 'Consular Section Specific Hours',
      type: 'string',
      description: 'e.g., "Visa Applications: Mon-Wed 0900hrs - 1200hrs; Collection: Fri 1400hrs"',
      hidden: ({ document }) => document?.contentType !== 'diplomatic',
    }),
    defineField({
      name: 'localPublicHolidays',
      title: 'Hosted Country Local Public Holidays',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'holidayItem',
          fields: [
            { name: 'name', title: 'Holiday Name', type: 'string', validation: Rule => Rule.required() },
            { name: 'dateObserved', title: 'Date Observed', type: 'string', description: 'e.g., "November 1st" or "4th Thursday of November"', validation: Rule => Rule.required() }
          ]
        }
      ],
      description: 'Host nation holidays when the mission is closed outside of standard Kenyan public holidays.',
      hidden: ({ document }) => document?.contentType !== 'diplomatic',
    }),
    defineField({
      name: 'coverBannerImage',
      title: 'Hero Cover Banner Image',
      type: 'image',
      options: { hotspot: true },
      description: 'High-resolution image of the embassy complex, flag, or ministry building layout.',
    }),
    defineField({
      name: 'downloadableDocuments',
      title: 'Downloadable Application Forms & PDF Briefs',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'downloadItem',
          title: 'Document Attachment',
          fields: [
            { name: 'documentName', title: 'Document Friendly Name', type: 'string', description: 'e.g., "Passport Renewal Form 19"', validation: Rule => Rule.required() },
            { name: 'fileAsset', title: 'PDF / Document Attachment', type: 'file', validation: Rule => Rule.required() }
          ]
        }
      ]
    }),
    defineField({
      name: 'governingActs',
      title: 'Governing Statutory Acts of Parliament',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'actOfParliament' }] }],
      description: 'Link this institution directly to the enabling legislation from your existing legal schemas.',
    })
  ],
});
