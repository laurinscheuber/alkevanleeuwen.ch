// Dies ist die Schema-Definition für das "Projekt".
// Fügen Sie diese Datei zu Ihrem Sanity Studio hinzu usually in 'schemas/project.js'
// und importieren Sie sie in 'schemas/index.js' oder 'sanity.config.js'.

export default {
  name: 'project',
  title: 'Projekt',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      description: 'Eine kurze Beschreibung des Projekts.'
    },
    {
      name: 'availability',
      title: 'Verfügbarkeit',
      type: 'string',
      description: 'z.B. "Sofort verfügbar", "Auf Anfrage", "Vermietet"',
      options: {
        list: [
          { title: 'Sofort verfügbar', value: 'Sofort verfügbar' },
          { title: 'Auf Anfrage', value: 'Auf Anfrage' },
          { title: 'Vermietet', value: 'Vermietet' },
          { title: 'Verkauft', value: 'Verkauft' }
        ],
      }
    },
    {
      name: 'mainImage',
      title: 'Hauptbild',
      type: 'image',
      options: {
        hotspot: true,
      }
    },
    {
      name: 'date',
      title: 'Datum / Veranstaltungstermin',
      type: 'datetime',
      description: 'Optional: Falls es sich um eine Veranstaltung oder einen Termin handelt.'
    }
  ]
}
