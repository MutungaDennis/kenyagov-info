// sanity/schemaTypes/culturalEvent.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'culturalEvent',
  title: 'Cultural Event',
  type: 'document',
  fields: [
    // ==========================================
    // MANDATORY FIELDS
    // ==========================================
    defineField({
      name: 'name',
      title: 'Event Name',
      type: 'string',
      description: 'e.g. "Maralal Camel Derby", "Lamu Cultural Festival", "Great Wildebeest Migration"',
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
      description: 'A brief one-line summary shown in previews and listings (max 200 characters)',
      validation: (Rule: any) => Rule.required().max(200),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailed description of the event, its history, and what happens',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'significance',
      title: 'Cultural / Historical Significance',
      type: 'text',
      rows: 4,
      description: 'Why this event matters culturally, historically, or nationally',
    }),

    // ==========================================
    // TIMING INFORMATION
    // ==========================================
    defineField({
      name: 'timingType',
      title: 'Timing Type',
      type: 'string',
      options: {
        list: [
          { title: 'Fixed Date (e.g. 12 December)', value: 'fixed-date' },
          { title: 'Seasonal (e.g. July–August)', value: 'seasonal' },
          { title: 'Approximate (e.g. Easter Weekend)', value: 'approximate' },
          { title: 'Periodic (e.g. every 7 years)', value: 'periodic' },
          { title: 'Variable (changes each year)', value: 'variable' },
        ]
      },
      validation: (Rule: any) => Rule.required(),
      description: 'How the event timing is determined',
    }),
    defineField({
      name: 'specificDate',
      title: 'Specific Date (for fixed-date events)',
      type: 'date',
      description: 'Use only for events with a fixed annual date (e.g. Madaraka Day: 1 June)',
      hidden: ({ parent }: any) => parent?.timingType !== 'fixed-date',
    }),
    defineField({
      name: 'startMonth',
      title: 'Start Month',
      type: 'string',
      options: {
        list: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
      },
      hidden: ({ parent }: any) => !['seasonal', 'approximate'].includes(parent?.timingType),
    }),
    defineField({
      name: 'endMonth',
      title: 'End Month (optional)',
      type: 'string',
      options: {
        list: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
      },
      description: 'Leave blank if event happens in a single month',
      hidden: ({ parent }: any) => !['seasonal', 'approximate'].includes(parent?.timingType),
    }),
    defineField({
      name: 'approximatePeriod',
      title: 'Approximate Period Description',
      type: 'string',
      description: 'e.g. "Easter Weekend", "First weekend of August", "Long rains season"',
      hidden: ({ parent }: any) => parent?.timingType !== 'approximate',
    }),
    defineField({
      name: 'frequency',
      title: 'Frequency',
      type: 'string',
      options: {
        list: [
          { title: 'Annual', value: 'annual' },
          { title: 'Biennial (every 2 years)', value: 'biennial' },
          { title: 'Every 3 years', value: 'triennial' },
          { title: 'Every 7 years', value: 'septennial' },
          { title: 'Every 14 years', value: 'quadridecennial' },
          { title: 'Continuous / Ongoing', value: 'continuous' },
          { title: 'One-off / Irregular', value: 'irregular' },
        ]
      },
      initialValue: 'annual',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'nextExpectedYear',
      title: 'Next Expected Year (for periodic events)',
      type: 'number',
      description: 'The next year this event is expected to take place',
      hidden: ({ parent }: any) => parent?.timingType !== 'periodic',
    }),

    // ==========================================
    // LOCATION
    // ==========================================
    defineField({
      name: 'venue',
      title: 'Venue / Location Name',
      type: 'string',
      description: 'e.g. "Maasai Mara National Reserve", "Nyayo Stadium", "Lamu Old Town"',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'county',
      title: 'County',
      type: 'string',
      description: 'The county where the event takes place',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'isRotating',
      title: 'Rotating Location',
      type: 'boolean',
      description: 'Tick if the event moves between different counties each year (e.g. Madaraka Day)',
      initialValue: false,
    }),

    // ==========================================
    // ORGANISATION
    // ==========================================
    defineField({
      name: 'quarter',
      title: 'Quarter',
      type: 'string',
      options: {
        list: [
          { title: 'Q1 (January – March)', value: 'Q1' },
          { title: 'Q2 (April – June)', value: 'Q2' },
          { title: 'Q3 (July – September)', value: 'Q3' },
          { title: 'Q4 (October – December)', value: 'Q4' },
        ]
      },
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'eventCategory',
      title: 'Event Category',
      type: 'string',
      options: {
        list: [
          { title: 'Cultural Festival', value: 'cultural-festival' },
          { title: 'Traditional Ceremony', value: 'traditional-ceremony' },
          { title: 'National Celebration', value: 'national-celebration' },
          { title: 'Sports & Recreation', value: 'sports' },
          { title: 'Natural Phenomenon', value: 'natural-phenomenon' },
          { title: 'Arts & Music', value: 'arts-music' },
          { title: 'Historical Commemoration', value: 'historical' },
          { title: 'Religious / Spiritual', value: 'religious' },
        ]
      },
      validation: (Rule: any) => Rule.required(),
    }),

    // ==========================================
    // ASSOCIATIONS
    // ==========================================
    defineField({
      name: 'culturalGroups',
      title: 'Associated Cultural Communities',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. ["Samburu", "Turkana", "Pokot"] for Maralal Camel Derby',
    }),
    defineField({
      name: 'organiser',
      title: 'Organising Body',
      type: 'string',
      description: 'e.g. "National Museums of Kenya", "County Government of Lamu"',
    }),

    // ==========================================
    // MEDIA & LINKS
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
    defineField({
      name: 'officialWebsite',
      title: 'Official Website URL',
      type: 'url',
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
          { title: 'Active (happens regularly)', value: 'active' },
          { title: 'Upcoming (next occurrence known)', value: 'upcoming' },
          { title: 'Discontinued / No longer held', value: 'discontinued' },
          { title: 'Suspended (temporarily paused)', value: 'suspended' },
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
      quarter: 'quarter',
      media: 'mainImage',
    },
    prepare(selection: any) {
      const { title, subtitle, county, quarter, media } = selection;
      return {
        title: title,
        subtitle: `${county} • ${quarter}${subtitle ? ` — ${subtitle}` : ''}`,
        media: media,
      };
    },
  },

  orderings: [
    {
      title: 'Quarter',
      name: 'quarterOrder',
      by: [
        { field: 'quarter', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
    {
      title: 'Event Name',
      name: 'nameOrder',
      by: [
        { field: 'name', direction: 'asc' },
      ],
    },
  ],
})