// sanity/schemaTypes/heritageSite.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'heritageSite',
  title: 'Heritage Site',
  type: 'document',
  fields: [
    // ==========================================
    // MANDATORY FIELDS
    // ==========================================
    defineField({
      name: 'name',
      title: 'Site Name',
      type: 'string',
      description: 'e.g. "Lamu Old Town", "Fort Jesus", "Mount Kenya National Park"',
      validation: (Rule: any) => Rule.required().min(3).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
      description: 'URL-friendly identifier. Must be unique.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'A brief one-line summary shown in listings (max 200 characters)',
      validation: (Rule: any) => Rule.required().max(200),
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailed description of the site, its history, and significance',
      validation: (Rule: any) => Rule.required(),
    }),

    // ==========================================
    // CLASSIFICATION
    // ==========================================
    defineField({
      name: 'category',
      title: 'Site Category',
      type: 'string',
      options: {
        list: [
          { title: 'UNESCO World Heritage (Cultural)', value: 'unesco-cultural' },
          { title: 'UNESCO World Heritage (Natural)', value: 'unesco-natural' },
          { title: 'National Monument', value: 'national-monument' },
          { title: 'National Museum', value: 'national-museum' },
          { title: 'Archaeological Site', value: 'archaeological' },
        ]
      },
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'region',
      title: 'Geographic Region',
      type: 'string',
      options: {
        list: [
          { title: 'Coastal', value: 'coastal' },
          { title: 'Nairobi / Central', value: 'nairobi-central' },
          { title: 'Rift Valley', value: 'rift-valley' },
          { title: 'Nyanza / Western', value: 'nyanza-western' },
          { title: 'Northern / Eastern', value: 'northern-eastern' },
        ]
      },
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'county',
      title: 'County',
      type: 'string',
      description: 'The county where the site is located',
      validation: (Rule: any) => Rule.required(),
    }),

    // ==========================================
    // DESIGNATION DETAILS
    // ==========================================
    defineField({
      name: 'designationYear',
      title: 'Year of Designation',
      type: 'number',
      description: 'Year the site was officially gazetted or inscribed (e.g. 2001 for Lamu Old Town)',
    }),
    defineField({
      name: 'designatingBody',
      title: 'Designating Body',
      type: 'string',
      description: 'e.g. "UNESCO", "National Museums of Kenya", "Ministry of Sports, Culture and Heritage"',
    }),
    defineField({
      name: 'unescoInscriptionNumber',
      title: 'UNESCO Inscription Number',
      type: 'string',
      description: 'Official UNESCO reference number (for UNESCO sites only)',
      hidden: ({ parent }: any) => !parent?.category?.startsWith('unesco'),
    }),

    // ==========================================
    // HISTORICAL CONTEXT
    // ==========================================
    defineField({
      name: 'historicalPeriod',
      title: 'Historical Period / Era',
      type: 'string',
      description: 'e.g. "15th century", "Prehistoric (2.5 million years ago)", "Colonial era (1895-1963)"',
    }),
    defineField({
      name: 'historicalSignificance',
      title: 'Historical & Cultural Significance',
      type: 'text',
      rows: 6,
      description: 'Why this site matters historically, culturally, or scientifically',
    }),
    defineField({
      name: 'associatedCommunities',
      title: 'Associated Cultural Communities',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. ["Swahili", "Bajuni"] for Lamu Old Town',
    }),

    // ==========================================
    // LOCATION & ACCESS
    // ==========================================
    defineField({
      name: 'specificLocation',
      title: 'Specific Location / Address',
      type: 'string',
      description: 'Detailed location within the county (e.g. "Off Nkrumah Road, Mombasa")',
    }),
    defineField({
      name: 'coordinates',
      title: 'GPS Coordinates',
      type: 'object',
      fields: [
        { name: 'latitude', title: 'Latitude', type: 'number' },
        { name: 'longitude', title: 'Longitude', type: 'number' },
      ],
      description: 'GPS coordinates for mapping',
    }),

    // ==========================================
    // VISITOR INFORMATION
    // ==========================================
    defineField({
      name: 'visitorInfo',
      title: 'Visitor Information',
      type: 'object',
      fields: [
        {
          name: 'openingHours',
          title: 'Opening Hours',
          type: 'string',
          description: 'e.g. "Daily 8:00 AM - 6:00 PM"',
        },
        {
          name: 'admissionFee',
          title: 'Admission Fee',
          type: 'string',
          description: 'e.g. "KES 1,200 (adults), KES 600 (children)"',
        },
        {
          name: 'accessibility',
          title: 'Accessibility Information',
          type: 'text',
          rows: 2,
          description: 'Wheelchair access, guided tours, facilities for visitors with disabilities',
        },
        {
          name: 'facilities',
          title: 'Facilities',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'e.g. ["Parking", "Restrooms", "Gift shop", "Café", "Guided tours"]',
        },
      ],
    }),

    // ==========================================
    // MEDIA
    // ==========================================
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for screen readers',
        }
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt Text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ]
        }
      ],
    }),

    // ==========================================
    // LINKS & RESOURCES
    // ==========================================
    defineField({
      name: 'officialWebsite',
      title: 'Official Website URL',
      type: 'url',
    }),
    defineField({
      name: 'unescoLink',
      title: 'UNESCO Listing Page',
      type: 'url',
      hidden: ({ parent }: any) => !parent?.category?.startsWith('unesco'),
    }),
    defineField({
      name: 'externalLinks',
      title: 'External Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'externalLink',
          fields: [
            { name: 'title', title: 'Link Title', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
          ]
        }
      ],
    }),

    // ==========================================
    // STATUS
    // ==========================================
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active (open to visitors)', value: 'active' },
          { title: 'Under Restoration', value: 'restoration' },
          { title: 'Restricted Access', value: 'restricted' },
          { title: 'Closed / Not Accessible', value: 'closed' },
        ]
      },
      initialValue: 'active',
      validation: (Rule: any) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'shortDescription',
      county: 'county',
      category: 'category',
      media: 'mainImage',
    },
    prepare(selection: any) {
      const { title, subtitle, county, category, media } = selection;
      const categoryLabel = category?.replace('-', ' ') || 'Heritage site';
      return {
        title: title,
        subtitle: `${county} • ${categoryLabel}`,
        media: media,
      };
    },
  },

  orderings: [
    {
      title: 'Category',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
    {
      title: 'Region',
      name: 'regionOrder',
      by: [
        { field: 'region', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
    {
      title: 'Site Name',
      name: 'nameOrder',
      by: [
        { field: 'name', direction: 'asc' },
      ],
    },
  ],
})