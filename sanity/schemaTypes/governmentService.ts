// sanity/schemaTypes/governmentService.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'governmentService',
  title: 'Government Service Guide',
  type: 'document',
  fields: [
    // --- 1. METADATA & IDENTIFICATION ---
    defineField({
      name: 'title',
      title: 'Action-Oriented Title (GOV.UK Style)',
      type: 'string',
      description: 'Must begin with a verb. e.g., "Apply for a police clearance certificate" or "Set up a business". Avoid acronyms.',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Root URL Slug',
      type: 'slug',
      description: 'The flat URL path string. e.g., "apply-marriage-certificate". This ensures the page is served directly at citizenguide.ke/[slug].',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'High-Level Service Summary',
      type: 'text',
      rows: 2,
      description: 'A 2-3 sentence introductory lead paragraph explaining what the service achieves and who qualifies.',
      validation: Rule => Rule.required(),
    }),

    // --- NEW: POPULARITY TRACKING ENGINE ---
    defineField({
      name: 'popularityWeight',
      title: 'Popularity Score / Weight',
      type: 'number',
      description: 'Set a numeric value (e.g., 100 for high-traffic items, 10 for rare items) to rank services on your directory hub. Defaults to 0.',
      initialValue: 0,
      validation: Rule => Rule.min(0).integer(),
    }),

    // --- 2. KEY SERVICE METRICS ---
    defineField({
      name: 'processingTime',
      title: 'Estimated Processing Time',
      type: 'string',
      description: 'e.g., "3 to 6 weeks", "2 working days", "Instant".',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'baseCostLabel',
      title: 'Starting / Flat Cost Label',
      type: 'string',
      description: 'e.g., "Ksh 1,050 flat fee", "From Ksh 950 to Ksh 10,750".',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'executionMode',
      title: 'Service Execution Mode',
      type: 'string',
      options: {
        list: [
          { title: '100% Digital (Completely online, no office visits)', value: 'online' },
          { title: 'Hybrid (Online application followed by physical biometrics/interview)', value: 'hybrid' },
          { title: '100% Manual (Physical form filing at agency offices)', value: 'manual' }
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required(),
    }),

    // --- 3. TIMELINE & CRITICAL PREREQUISITES ---
    defineField({
      name: 'timelineGuidance',
      title: 'Application Timeline Planning',
      type: 'string',
      description: 'When should they start? e.g., "At least 1 to 3 months before your wedding day" or "Before starting driving lessons".',
    }),
    defineField({
      name: 'beforeYouStart',
      title: 'Before You Start (Deal-Breakers)',
      type: 'array',
      description: 'Absolute core requirements or eligibility rules. List items clearly.',
      of: [{ type: 'string' }],
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'requiredDocuments',
      title: 'Required Documents & Scans Checklist',
      type: 'array',
      description: 'Explicit list of items they must prepare or scan. e.g., "Original National ID Card (Passports not accepted)".',
      of: [{ type: 'string' }],
      validation: Rule => Rule.required().min(1),
    }),

    // --- 4. EXPANDED FINANCIALS & LOCATIONS ---
    defineField({
      name: 'feesTable',
      title: 'Detailed Cost Breakdown Matrix',
      type: 'array',
      description: 'Itemized pricing breakdown for different sub-types, notices, or convenience charges.',
      of: [
        {
          type: 'object',
          name: 'feeItem',
          title: 'Fee Structure Item',
          fields: [
            { name: 'itemName', title: 'Fee Element / Condition', type: 'string', description: 'e.g., "Civil Marriage Ceremony Fee", "Smart DL Biometric Generation"' },
            { name: 'amount', title: 'Cost in KES', type: 'string', description: 'e.g., "Ksh 3,300", "Free"' }
          ]
        }
      ]
    }),
    defineField({
      name: 'physicalVisits',
      title: 'Physical Attendance Steps',
      type: 'array',
      description: 'Only required if execution mode is Hybrid or Manual. Outline exactly where they go and why.',
      of: [
        {
          type: 'object',
          name: 'visitDetail',
          title: 'In-Person Step',
          fields: [
            { name: 'purpose', title: 'Purpose of Visit', type: 'string', description: 'e.g., "Biometric Fingerprint Capture" or "Original Document Verification Interview"' },
            { name: 'locations', title: 'Physical Venue Options', type: 'text', rows: 2, description: 'e.g., "DCI Headquarters Kiambu Road or select Huduma Centres nationwide."' }
          ]
        }
      ]
    }),

    // --- 5. REFERENCE FILES & DOCUMENT DOWNLOADS ---
    defineField({
      name: 'downloadableResources',
      title: 'Downloadable Forms & Reference Templates',
      type: 'array',
      description: 'Option to attach official PDFs, layout blueprints, or sample blank affidavits for reference.',
      of: [
        {
          type: 'object',
          name: 'downloadableFile',
          title: 'Reference Document',
          fields: [
            { name: 'label', title: 'Document Download Label', type: 'string', description: 'e.g., "Download Blank C24 Fingerprint Sheet Template"' },
            { name: 'fileUpload', title: 'Upload PDF File', type: 'file', options: { accept: '.pdf' } }
          ]
        }
      ]
    }),

    // --- 6. COMMON PITFALLS & FAQS ---
    defineField({
      name: 'commonMistakes',
      title: 'Common Mistakes to Avoid',
      type: 'array',
      description: 'Crucial callout blocks explaining frequent entry mistakes that cause immediate eCitizen portal rejections.',
      of: [
        {
          type: 'object',
          name: 'mistakeItem',
          title: 'Common Rejection Trigger',
          fields: [
            { name: 'errorTitle', title: 'What is the mistake?', type: 'string', description: 'e.g., "Single-sided C24 printing"' },
            { name: 'errorFix', title: 'How to avoid/fix it', type: 'text', rows: 2, description: 'e.g., "Ensure the form is printed double-sided on a single A4 sheet, or DCI officers will reject it."' }
          ]
        }
      ]
    }),
    defineField({
      name: 'faqs',
      title: 'Frequently Asked Questions (FAQs)',
      type: 'array',
      description: 'Interactive question and answer accordions addressing consumer edge cases.',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Pair',
          fields: [
            { name: 'question', title: 'Question Heading', type: 'string' },
            { name: 'answer', title: 'Detailed Answer Content', type: 'text', rows: 3 }
          ]
        }
      ]
    }),

    // --- 7. TRANSACTION OUTBOUND REDIRECTION ---
    defineField({
      name: 'ecitizenUrl',
      title: 'Target Transaction Portal URL',
      type: 'url',
      description: 'The exact external eCitizen agency link triggered when clicking "Start now ►". e.g., https://ecitizen.go.ke',
      validation: Rule => Rule.required().uri({
        scheme: ['http', 'https']
      })
    })
  ],

  // --- STUDIO PREVIEW ENGINE ---
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      mode: 'executionMode',
      weight: 'popularityWeight'
    },
    prepare({ title, slug, mode, weight }) {
      const modeLabels: Record<string, string> = {
        online: '⚡ Digital',
        hybrid: '🤝 Hybrid',
        manual: '📄 Manual'
      }
      return {
        title: title,
        subtitle: `/${slug || ''} • ${modeLabels[mode] || mode || ''} (Score: ${weight || 0})`
      }
    }
  }
})
