// sanity/schemaTypes/reportMandate.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'reportMandate',
  title: 'Constitutional & Statutory Report Mandate',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Report Title',
      type: 'string',
      description: 'e.g. "State of the Nation Address 2026" or "Annual Report on the State of National Security 2024/25"',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),

    // Who prepares the report
    defineField({
      name: 'reportingBody',
      title: 'Reporting Body',
      type: 'string',
      options: {
        list: [
          'Attorney-General',
          'Auditor-General',
          'Cabinet Secretary',
          'Central Bank of Kenya (CBK)',
          'Commission on Administrative Justice (CAJ)',
          'Commission on Revenue Allocation (CRA)',
          'Controller of Budget',
          'County Governor',
          'Director of Public Prosecutions (DPP)',
          'Ethics and Anti-Corruption Commission (EACC)',
          'Inspector-General of Police',
          'Judicial Service Commission (JSC)',
          'Kenya National Commission on Human Rights (KNCHR)',
          'National Gender and Equality Commission (NGEC)',
          'National Security Advisory Council',
          'National Treasury',
          'Parliamentary Service Commission (PSC)',
          'Public Service Commission (PSC)',
          'Salaries and Remuneration Commission (SRC)',
          'Teachers Service Commission (TSC)',
          'The President',
          'Other'
        ],
      },
      validation: Rule => Rule.required(),
    }),

    // Who receives the report
    defineField({
      name: 'receivingBodies',
      title: 'Receiving Bodies',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'National Assembly',
          'Senate',
          'The President',
          'Cabinet',
          'County Assemblies',
          'Public / Citizens',
          'Judiciary',
        ]
      },
      validation: Rule => Rule.required().min(1),
    }),

    // Person who actually delivers / presents the report (optional)
    defineField({
      name: 'deliveredBy',
      title: 'Delivered / Presented By (Optional)',
      type: 'string',
      description: 'Name and title of the individual, e.g. "H.E. President William Ruto" or "Auditor-General Nancy Gathungu"',
    }),

    // Date fields
    defineField({
      name: 'reportDate',
      title: 'Report Date',
      type: 'date',
      description: 'Date the report was officially released or presented',
    }),

    defineField({
      name: 'financialYear',
      title: 'Financial Year / Period',
      type: 'string',
      description: 'e.g. 2024/25, 2025/26',
      placeholder: '2025/26',
    }),

    defineField({
      name: 'frequency',
      title: 'Frequency of Submission',
      type: 'string',
      options: {
        list: [
          { title: 'Annual', value: 'annual' },
          { title: 'Semi-Annual', value: 'semi-annual' },
          { title: 'Quarterly', value: 'quarterly' },
          { title: 'Monthly', value: 'monthly' },
          { title: 'Ad-hoc / As Needed', value: 'ad-hoc' },
          { title: 'Upon Request', value: 'upon-request' },
          { title: 'One-time / Special', value: 'one-time' },
        ]
      },
      validation: Rule => Rule.required(),
    }),

    // Constitutional & Legal Links
    defineField({
      name: 'constitutionalBasis',
      title: 'Constitutional Basis',
      type: 'reference',
      to: [{ type: 'constitutionArticle' }],
    }),

    defineField({
      name: 'relatedAct',
      title: 'Related Act of Parliament',
      type: 'reference',
      to: [{ type: 'actOfParliament' }],
    }),

    // Access & Document
    defineField({
      name: 'officialLink',
      title: 'Official Link',
      type: 'url',
      description: 'Direct link to the report on a government website',
    }),

    defineField({
      name: 'reportDocument',
      title: 'Report Document (PDF)',
      type: 'file',
      options: {
        accept: '.pdf,.doc,.docx',
      },
      description: 'Upload the actual report file',
    }),

    defineField({
      name: 'description',
      title: 'Description & Purpose',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    defineField({
      name: 'isMandatory',
      title: 'Is this submission Mandatory?',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      reportingBody: 'reportingBody',
      reportDate: 'reportDate',
      financialYear: 'financialYear',
    },
    prepare(selection: any) {
      const { title, reportingBody, reportDate, financialYear } = selection;
      const dateInfo = reportDate 
        ? new Date(reportDate).getFullYear() 
        : (financialYear || '');
      return {
        title: title,
        subtitle: `${reportingBody} ${dateInfo ? `(${dateInfo})` : ''}`,
      };
    },
  },
});