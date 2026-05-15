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

    // === NEW: Support for Parts ===
    defineField({
      name: 'partNumber',
      title: 'Part Number (if any)',
      type: 'number',
      description: 'Leave empty if the chapter has no parts (e.g. Chapter 1, 2, 3)',
    }),
    defineField({
      name: 'partTitle',
      title: 'Part Title',
      type: 'string',
      description: 'e.g. "GENERAL PROVISIONS RELATING TO THE BILL OF RIGHTS"',
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
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Exact text from the Constitution (supports line breaks & formatting)',
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
      title: 'User Intent Tags / Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          // === MOST SEARCHED / FOUNDATIONAL ===
          'Preamble', 'Sovereignty of the People', 'National Values', 'Rule of Law',
          'Human Dignity', 'Unity and Peace', 'God and Heritage',

          // Chapter 1
          'Supremacy of Constitution', 'Defence of Constitution', 'Sovereign Power', 
          'Public Participation',

          // Chapter 2
          'The Republic', 'National Symbols', 'Official Languages', 'State and Religion', 
          'National Values and Principles',

          // Chapter 3
          'Citizenship', 'Dual Citizenship', 'National ID', 'Passport', 'Immigration',

          // Chapter 4 - Bill of Rights (Highest Priority)
          'Bill of Rights', 'Fundamental Freedoms', 'Right to Life', 'Equality', 
          'Non-discrimination', 'Freedom of Speech', 'Freedom of Media', 
          'Access to Information', 'Freedom of Association', 'Right to Property',
          'Economic and Social Rights', 'Right to Health', 'Right to Education',
          'Right to Housing', 'Right to Clean Environment', 'Children Rights',
          'Youth Rights', 'Persons with Disabilities', 'Fair Trial',

          // Chapter 5
          'Land Rights', 'Public Land', 'Community Land', 'Private Property', 
          'Environment Protection', 'Natural Resources', 'Climate Change',

          // Chapter 6
          'Leadership and Integrity', 'Code of Conduct', 'Anti-Corruption', 
          'Declaration of Wealth', 'Ethics and Accountability',

          // Chapters 7 - 12
          'Electoral System', 'IEBC', 'Political Rights', 'Parliament', 'Legislation',
          'National Assembly', 'Senate', 'President', 'Executive Authority', 
          'Judiciary', 'Judicial Independence', 'Devolution', 'County Government',
          'Governor', 'County Assembly', 'Public Finance', 'Revenue Allocation',

          // Chapters 13 - 18
          'Public Service', 'National Security', 'KDF', 'Police', 
          'Constitutional Commissions', 'Independent Offices', 
          'Constitutional Amendment', 'Referendum', 'Transitional Provisions'
        ]
      }
    }),

    defineField({
      name: 'relatedActs',
      title: 'Related Acts of Parliament',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'actOfParliament' }] }]
    }),

    defineField({
      name: 'relatedJudgments',
      title: 'Key Court Judgments',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'courtPronouncement' }] }]
    }),
  ],
  preview: {
    select: {
      chapter: 'chapter',
      part: 'partNumber',
      article: 'articleNumber',
      title: 'articleTitle'
    },
    prepare: ({chapter, part, article, title}) => ({
      title: chapter === 0 
        ? 'Preamble' 
        : part 
          ? `Chapter ${chapter} • Part ${part} • Article ${article}` 
          : `Chapter ${chapter} • Article ${article}`,
      subtitle: title
    })
  }
})