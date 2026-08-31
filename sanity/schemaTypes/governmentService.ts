// sanity/schemaTypes/governmentService.ts 
import { defineType, defineField } from 'sanity'
import { servicePortableText } from './portableTextService'

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
    defineField({
      name: 'body',
      title: 'Additional guidance (rich text)',
      type: 'array',
      of: servicePortableText,
      description:
        'Optional GOV.UK-style guidance paragraphs with linkable phrases (eCitizen, agencies, etc.).',
    }),
    defineField({
      name: 'status',
      title: 'Publication status',
      type: 'string',
      initialValue: 'published',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'reviewedAt',
      title: 'Last reviewed',
      type: 'date',
      description: 'Shown on the public page as “Last reviewed”.',
    }),
    defineField({
      name: 'moreInformationUrl',
      title: 'More information URL (non-transactional)',
      type: 'url',
      description:
        'Official page for further reading — not the Start now transaction portal.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'relatedLinks',
      title: 'Related links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'relatedLink',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'href',
              title: 'URL or path',
              type: 'string',
              description: 'https://… or /internal-path',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        },
      ],
    }),

    // --- PROVIDING INSTITUTIONS (Supabase institutions, denormalised) ---
    defineField({
      name: 'providingInstitutions',
      title: 'Providing institutions',
      type: 'array',
      description:
        'Live institutions from the CitizenGuide institutions directory (Supabase). Preferred over legacy Sanity ministries.',
      of: [
        {
          type: 'object',
          name: 'providingInstitution',
          fields: [
            { name: 'institutionId', title: 'Institution ID', type: 'string' },
            { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'slug', title: 'Slug', type: 'string' },
            { name: 'shortName', title: 'Short name', type: 'string' },
            { name: 'parentName', title: 'Parent institution name', type: 'string' },
          ],
          preview: {
            select: { title: 'name', subtitle: 'parentName' },
          },
        },
      ],
    }),

    // --- Legacy Sanity ministries (optional fallback) ---
    defineField({
      name: 'providingBodies',
      title: 'Providing Government Bodies / Departments (legacy)',
      type: 'array',
      description: 'Legacy Sanity ministry references. Prefer providing institutions above.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'governmentMinistry' }]
        }
      ],
    }),

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

    // --- ENHANCED GOV.UK FIELD: MULTI-POINT TIMELINE PLANNING ---
    defineField({
      name: 'timelineGuidancePoints',
      title: 'Application Timeline Planning Points',
      type: 'array',
      description: 'Chronological or conditional milestone guidelines. e.g., ["Submit notice 21 days before wedding", "Execute within 90 days of approval"].',
      of: [{ type: 'string' }],
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
// --- STEP BY STEP INSTRUCTIONS ---
    defineField({
      name: 'steps',
      title: 'Step-by-Step Application Process',
      type: 'array',
      description: 'A chronological, clear roadmap mapping exactly how a citizen progresses from start to finish.',
      of: [
        {
          type: 'object',
          name: 'stepItem',
          title: 'Procedural Stage',
          fields: [
            { name: 'stepNumber', title: 'Step Number', type: 'number', validation: Rule => Rule.required().min(1).integer() },
            { name: 'stepTitle', title: 'Action Name / Heading', type: 'string', description: 'e.g., "Submit Application and Pay on eCitizen"', validation: Rule => Rule.required() },
            { name: 'stepDescription', title: 'Explicit Process Guidelines', type: 'text', rows: 2, description: 'Explain options, URLs, or background processing.', validation: Rule => Rule.required() }
          ]
        }
      ]
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

    // --- ENHANCED FIELD: DOWNLOADABLE RESOURCES WITH SOURCE URL OPTION ---
    defineField({
      name: 'downloadableResources',
      title: 'Downloadable Forms & Reference Templates',
      type: 'array',
      description: 'Attach official PDFs or provide external verification links for reference layouts.',
      of: [
        {
          type: 'object',
          name: 'downloadableFile',
          title: 'Reference Document',
          fields: [
            { name: 'label', title: 'Document Download Label', type: 'string', description: 'e.g., "Download Blank C24 Fingerprint Sheet Template"', validation: Rule => Rule.required() },
            { name: 'fileUpload', title: 'Upload PDF File', type: 'file', options: { accept: '.pdf' } },
            { 
              name: 'sourceUrl', 
              title: 'Original Document Source URL (Optional)', 
              type: 'url', 
              description: 'The official governmental page where this resource was originally obtained from. e.g., https://lands.go.ke',
              validation: Rule => Rule.uri({ scheme: ['http', 'https'] })
            }
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
    // --- SELF-REFERENTIAL RELATED SERVICES RELATIONSHIP ---
    defineField({
      name: 'relatedServices',
      title: 'Related Services Links',
      type: 'array',
      description: 'Select other contextual services that sit adjacent to this one (e.g. linking "Replace a Lost ID" on a Passport application guide).',
      of: [
        {
          type: 'reference',
          to: [{ type: 'governmentService' }]
        }
      ]
    }),

    // --- ENHANCED FIELD: MULTIPLE TARGET TRANSACTION PORTAL URLS ---
    defineField({
      name: 'transactionPortals',
      title: 'Target Transaction Portal Links',
      type: 'array',
      description: 'The official digital destinations triggered for execution. Provide at least one transaction link.',
      of: [
        {
          type: 'object',
          name: 'portalItem',
          title: 'Portal Access Destination',
          fields: [
            { 
              name: 'portalLabel', 
              title: 'Button or Link Label', 
              type: 'string', 
              description: 'e.g., "Start on Ardhisasa", "Pay on Nairobi eCitizen"', 
              validation: Rule => Rule.required() 
            },
            { 
              name: 'portalUrl', 
              title: 'Direct Portal URL', 
              type: 'url', 
              description: 'e.g., https://lands.go.ke', 
              validation: Rule => Rule.required().uri({ scheme: ['http', 'https'] }) 
            }
          ]
        }
      ],
      validation: Rule => Rule.required().min(1)
    })
  ],

  // --- STUDIO PREVIEW ENGINE ---
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      mode: 'executionMode',
      weight: 'popularityWeight',
      agencies: 'providingBodies' // Updated to track your new string array field key
    },
    prepare({ title, slug, mode, weight, agencies }) {
      const modeLabels: Record<string, string> = {
        online: '⚡ Digital',
        hybrid: '🤝 Hybrid',
        manual: '📄 Manual'
      }
      
      // Formats array elements neatly inside the studio sidebar subtitles segment
      const bodiesLabel = agencies && agencies.length > 0 
        ? agencies.join(', ') 
        : 'No Agencies Specified';

      return {
        title: title,
        subtitle: `${bodiesLabel} • ${modeLabels[mode] || mode || ''} (Score: ${weight || 0})`
      }
    }
  }
})