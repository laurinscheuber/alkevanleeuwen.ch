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
      type: 'array',
      of: [{type: 'block'}],
      description: 'Eine ausführliche Beschreibung des Projekts.'
    },
    {
      name: 'slug',
      title: 'Slug (URL-Pfad)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
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
