// sanity/schemaTypes/governmentPublication.ts
import { defineType, defineField } from 'sanity';
import { constitutionPortableText } from './portableTextConstitution';

export default defineType({
  name: 'governmentPublication',
  title: 'Government Publication / Policy Document',
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
      description: 'e.g. "Vision 2030" or "Sessional Paper No. 10 of 1965"',
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
      name: 'referenceNumber',
      title: 'Reference Number',
      type: 'string',
      description: 'e.g. "Sessional Paper No. 1 of 2012"',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'yearPublished',
      title: 'Year Published',
      type: 'number',
      validation: Rule => Rule.required().min(1960).max(2030),
    }),
    defineField({
      name: 'issuingBody',
      title: 'Issuing Body / Institution',
      type: 'string',
      description: 'e.g. "Ministry of Devolution", "Presidential Taskforce"',
      validation: Rule => Rule.required(),
    }),
    
    // --- Classification ---
    defineField({
      name: 'functionalCategory',
      title: 'Functional Category',
      type: 'string',
      options: {
        list: [
          { title: 'Investigative & Advisory (Task Force/Commission Reports)', value: 'investigative_advisory' },
          { title: 'Policy Formulation (Sessional Papers)', value: 'policy_formulation' },
          { title: 'Strategic Planning (Development Plans, MTPs)', value: 'strategic_planning' },
          { title: 'Statutory & Legislative (Bills, Acts, Notices)', value: 'statutory_legislative' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'archivalCategory',
      title: 'KNADS Archival Category',
      type: 'string',
      options: {
        list: [
          { title: 'National Documentation Service', value: 'national_documentation_service' },
          { title: 'Government Press / Kenya Gazette', value: 'government_press' },
          { title: 'Other Public Records', value: 'other' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'historicalEra',
      title: 'Historical Era',
      type: 'string',
      options: {
        list: [
          { title: 'Post-Independence (1963–1979)', value: 'post_independence' },
          { title: 'Market Liberalization (1980–2009)', value: 'market_liberalization' },
          { title: 'Constitution 2010 Era (2010–Present)', value: 'constitution_2010' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),

    // --- Content ---
    defineField({
      name: 'summary',
      title: 'Brief Summary',
      type: 'text',
      rows: 3,
      description: 'A 2-3 sentence plain-English explanation for list views and SEO.',
    }),
    defineField({
      name: 'fullText',
      title: 'Full Document Text',
      type: 'array',
      of: constitutionPortableText, // ✅ Reuses your robust table, list, and link support
      description: 'Paste the structured text. Supports paragraphs, lists, and tables.',
    }),
    defineField({
      name: 'plainSummary',
      title: 'Plain English Summary (Optional)',
      type: 'array',
      of: constitutionPortableText,
      description: 'Simplified breakdown of the document for citizens.',
    }),

    // --- 5-Star Assets & Links ---
    defineField({
      name: 'officialPdf',
      title: 'Official PDF Document',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'Upload the official consolidated PDF.',
    }),
    defineField({
      name: 'officialExternalUrl',
      title: 'Official External Source URL',
      type: 'url',
      description: 'e.g., Link to Kenya Law, KNADS, or Ministry website.',
    }),

    // --- Relational ---
    defineField({
      name: 'relatedDocuments',
      title: 'Related Documents / Laws',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'governmentPublication' }, { type: 'actOfParliament' }] },
      ],
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords / Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  preview: {
    select: {
      title: 'shortTitle',
      reference: 'referenceNumber',
      year: 'yearPublished',
      category: 'functionalCategory',
    },
    prepare(selection: any) {
      const { title, reference, year, category } = selection;
      return {
        title: title || 'Untitled Document',
        subtitle: `${reference || ''} • ${year || ''} • ${category ? category.replace(/_/g, ' ') : ''}`,
      };
    },
  },
});