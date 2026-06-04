// sanity/schemaTypes/governmentMinistry.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'governmentMinistry',
  title: 'Government Ministry / Department',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Official Name',
      type: 'string',
      description: 'e.g., "Ministry of Lands, Public Works, Housing and Urban Development" or "State Department for Lands and Physical Planning".',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Internal Identifier Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'parentMinistry',
      title: 'Parent Ministry (Leave blank if this is the umbrella Ministry)',
      type: 'reference',
      description: 'If you are registering a State Department, select its overarching parent Ministry here.',
      to: [{ type: 'governmentMinistry' }],
      options: {
        filter: ({ document }) => {
          if (!document?._id) return {}
          return {
            filter: '!(_id in [$id, "drafts." + $id])',
            params: { id: document._id.replace('drafts.', '') }
          }
        }
      }
    }),
  ],
  preview: {
    select: {
      title: 'name',
      parentName: 'parentMinistry.name',
    },
    prepare({ title, parentName }) {
      return {
        title: title,
        subtitle: parentName ? `🏢 State Department under: ${parentName}` : '🏛️ Primary Umbrella Ministry',
      }
    }
  }
})
