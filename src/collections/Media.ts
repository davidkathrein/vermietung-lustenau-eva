import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: { de: 'Medium', en: 'Media file' }, plural: { de: 'Medien', en: 'Media' } },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'translationPanel', type: 'ui', admin: { components: { Field: '/components/translation/TranslationPanel' } } },
    {
      name: 'alt',
      type: 'text',
      label: { de: 'Alternativtext', en: 'Alt text' },
      required: true,
      localized: true,
    },
  ],
  upload: true,
}
