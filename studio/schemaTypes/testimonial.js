export default {
  name: 'testimonial',
  title: 'Bewertung',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'text',
      title: 'Bewertungstext',
      type: 'text',
      validation: (Rule) => Rule.required().max(500),
    },
    {
      name: 'rating',
      title: 'Bewertung (Sterne)',
      type: 'number',
      description: '1 bis 5 Sterne',
      validation: (Rule) => Rule.min(1).max(5).integer(),
    },
    {
      name: 'date',
      title: 'Datum',
      type: 'date',
    },
    {
      name: 'featured',
      title: 'Auf Startseite anzeigen',
      type: 'boolean',
      initialValue: true,
    },
  ],
}
