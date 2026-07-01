// sanity/schemaTypes/presidentialTrip.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'presidentialTrip',
  title: "President's Foreign Trips",
  type: 'document',
  fields: [
    // ==========================================
    // MANDATORY FIELDS (Compulsory)
    // ==========================================
    defineField({
      name: 'title',
      title: 'Trip Title / Event Name',
      type: 'string',
      description: 'e.g. "State Visit to the United States" or "UN Climate Change Conference (COP31)"',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required().custom((slug: any) => {
        if (!slug?.current) return 'Slug is required';
        return true;
      }),
      description: 'URL-friendly identifier. Must be unique.',
    }),
    defineField({
      name: 'destinationCountry',
      title: 'Destination Country',
      type: 'string',
      description: 'The primary host nation visited',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'tripType',
      title: 'Trip Type',
      type: 'string',
      options: {
        list: [
          { title: 'State Visit', value: 'state-visit' },
          { title: 'Official Visit', value: 'official-visit' },
          { title: 'Working Visit', value: 'working-visit' },
          { title: 'Summit / International Conference', value: 'summit' },
          { title: 'Regional / EAC Mission', value: 'regional-mission' },
        ]
      },
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'departureDate',
      title: 'Departure Date',
      type: 'date',
      description: 'The date the President departed Kenya',
      validation: (Rule: any) => Rule.required(),
    }),

    // ==========================================
    // OPTIONAL FIELDS
    // ==========================================
    defineField({
      name: 'returnDate',
      title: 'Return Date',
      type: 'date',
      description: 'The date the President returned to Kenya',
      validation: (Rule: any) => Rule.custom((returnDate: any, context: any) => {
        const departureDate = (context.document as any)?.departureDate;
        if (returnDate && departureDate && new Date(returnDate) < new Date(departureDate)) {
          return 'Return date cannot be earlier than the departure date';
        }
        return true;
      }),
    }),

    // === Speeches Delivered During the Trip ===
    defineField({
      name: 'speeches',
      title: 'Speeches Delivered During the Trip',
      type: 'array',
      description: 'List out individual addresses, remarks, and statements made during this itinerary',
      of: [
        {
          type: 'object',
          name: 'speechItem',
          title: 'Speech / Statement',
          fields: [
            {
              name: 'title',
              title: 'Speech Title',
              type: 'string',
              description: 'e.g., "Remarks at the Launch of African Carbon Markets Initiative (ACMI)"',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'deliveryDate',
              title: 'Date Delivered',
              type: 'date',
              initialValue: (context: any) => (context.document as any)?.departureDate,
            },
            {
              name: 'forum',
              title: 'Forum / Panel / Group Addressed',
              type: 'string',
              description: 'e.g., "Inauguration Summit of the International High Level Panel on Water Investment for Africa"',
            },
            {
              name: 'speechText',
              title: 'Speech Summary / Full Text Outline',
              type: 'text',
              rows: 4,
              description: 'A brief breakdown or text extract of the primary points spoken',
            },
            {
              name: 'speechDocument',
              title: 'Official Speech PDF',
              type: 'file',
              options: { accept: '.pdf' },
              description: 'Upload the official transcript PDF file for this specific address',
            }
          ],
          preview: {
            select: {
              title: 'title',
              forum: 'forum',
            },
            prepare(selection: any) {
              const { title, forum } = selection;
              return {
                title: title || 'Untitled Speech',
                subtitle: forum ? `Forum: ${forum}` : 'General Plenary Address',
              };
            }
          }
        }
      ]
    }),

    defineField({
      name: 'destinationCities',
      title: 'Destination Cities',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Specific cities visited during the trip (e.g. Washington D.C., New York)',
    }),
    defineField({
      name: 'purpose',
      title: 'Purpose & Objectives',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailed explanation of the dynamic goals of this visit',
    }),
    defineField({
      name: 'focusSectors',
      title: 'Focus Sectors',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Trade & Investment',
          'Climate Change & Environment',
          'Regional Security & Defense',
          'Technology & Innovation',
          'Education & Bilateral Relations',
          'Healthcare Support',
          'Infrastructure & Energy',
        ]
      }
    }),
    defineField({
      name: 'accompanyingMinistries',
      title: 'Accompanying Ministries',
      type: 'array',
      description: 'Link to the ministries that travelled in the presidential delegation',
      of: [{ type: 'reference', to: [{ type: 'governmentMinistry' }] }],
    }),
    defineField({
      name: 'outcomes',
      title: 'Key Outcomes & MoUs Signed',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'agreement',
          title: 'Agreement / MoU',
          fields: [
            { 
              name: 'title', 
              title: 'Agreement Title', 
              type: 'string' 
            },
            { 
              name: 'details', 
              title: 'Brief Summary', 
              type: 'text', 
              rows: 2 
            }
          ]
        }
      ],
      description: 'List bilateral frameworks, treaties, or MoUs formalised during the trip',
    }),
    defineField({
      name: 'financialCommitments',
      title: 'Financial Commitments Secured (KES/USD)',
      type: 'string',
      description: 'Value of any loans, grants, or investments officially signed (e.g. "$250 Million Grant")',
    }),
    defineField({
      name: 'officialLink',
      title: 'Official Press Release / Statement Link',
      type: 'url',
      description: 'Link to the state house brief or official communiqué',
    }),
    defineField({
      name: 'tripDocument',
      title: 'Official Report / Joint Communiqué (PDF)',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'Upload the text or reports submitted post-visit',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      country: 'destinationCountry',
      date: 'departureDate',
    },
    prepare(selection: any) {
      const { title, country, date } = selection;
      const year = date ? ` (${new Date(date).getFullYear()})` : '';
      return {
        title: title,
        subtitle: `${country}${year}`,
      };
    },
  },
})