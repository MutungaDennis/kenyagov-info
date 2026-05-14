// sanity/schemaTypes/constitutionArticle.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'constitutionArticle',
  title: 'Constitution Article',
  type: 'document',
  fields: [
    defineField({
      name: 'chapter',
      title: 'Chapter Number',
      type: 'number',
      validation: Rule => Rule.required().min(0).max(18),
    }),
    defineField({
      name: 'chapterTitle',
      title: 'Chapter Title',
      type: 'string',
    }),
    defineField({
      name: 'articleNumber',
      title: 'Article Number',
      type: 'number',
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'articleTitle',
      title: 'Article Title (Short)',
      type: 'string',
    }),

    // Core Content
    defineField({
      name: 'officialText',
      title: 'Official Constitutional Text',
      type: 'text',
      description: 'Exact text from the Constitution',
    }),
    defineField({
      name: 'amplifiedText',
      title: 'Amplified / Plain English Version',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Simplified explanation for citizens',
    }),

    // Metadata & Linking
    defineField({
      name: 'userIntents',
      title: 'User Intent Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          'Land Rights', 'Freedom of Speech', 'Access to Information',
          'Business Rights', 'Devolution', 'Education Rights', 'Health Rights'
        ]
      }
    }),
    defineField({
      name: 'relatedActs',
      title: 'Related Acts of Parliament',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'actOfParliament'}]}]
    }),
    defineField({
      name: 'relatedJudgments',
      title: 'Key Court Judgments',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'courtPronouncement'}]}]
    }),
  ],
  preview: {
    select: {
      chapter: 'chapter',
      article: 'articleNumber',
      title: 'articleTitle'
    },
    prepare: ({chapter, article, title}) => ({
      title: `Chapter ${chapter} • Article ${article}`,
      subtitle: title
    })
  }
})