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

    // Rich Content
    defineField({
      name: 'whatItDoes',
      title: 'What it does (Rich Text)',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    // Contact Information
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

    // Legal Information
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
  ],
});