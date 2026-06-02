// sanity/schemaTypes/governmentCategory.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'governmentCategory',
  title: 'Government Category Hub',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Title',
      type: 'string',
      description: 'e.g., Driving and transport, Businesses and self-employed',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'The URL path for this browse folder. It will generate automatically based on the title.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Category Description',
      type: 'text',
      rows: 3,
      description: 'A brief 1-2 sentence overview of what users will find in this section.',
    }),
    defineField({
      name: 'subTopics',
      title: 'Sub-Topics Clusters',
      type: 'array',
      description: 'Group individual services together into clear, user-friendly chronological sections.',
      of: [
        {
          type: 'object',
          name: 'subTopicCluster',
          title: 'Sub-Topic Cluster',
          fields: [
            defineField({
              name: 'heading',
              title: 'Sub-Topic Heading',
              type: 'string',
              description: 'e.g., "Learning to drive" or "Managing your licence"',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'services',
              title: 'Assigned Services',
              type: 'array',
              description: 'Add references to the specific individual services that fit under this header.',
              of: [
                {
                  type: 'reference',
                  // This references the next schema document we will create
                  to: [{ type: 'governmentService' }] 
                }
              ],
              validation: Rule => Rule.required().min(1),
            })
          ],
          preview: {
            select: {
              title: 'heading',
              services: 'services'
            },
            prepare({ title, services }) {
              const serviceCount = services ? services.length : 0
              return {
                title: title,
                subtitle: `${serviceCount} linked service${serviceCount === 1 ? '' : 's'}`
              }
            }
          }
        }
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      subTopics: 'subTopics'
    },
    prepare({ title, slug, subTopics }) {
      const topicCount = subTopics ? subTopics.length : 0
      return {
        title: title,
        subtitle: `📁 /services/${slug || ''} • ${topicCount} topic cluster${topicCount === 1 ? '' : 's'}`
      }
    }
  }
})
