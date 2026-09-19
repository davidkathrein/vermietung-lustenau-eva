import type { CollectionConfig, TextFieldValidation } from 'payload'

const validateAlt: TextFieldValidation = (value, { data }) =>
  Boolean((data as { decorative?: boolean } | undefined)?.decorative) ||
  (typeof value === 'string' && Boolean(value.trim())) ||
  'Für nicht dekorative Bilder ist ein Alternativtext erforderlich.'

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
      localized: true,
      validate: validateAlt,
    },
    { name: 'caption', type: 'text', label: { de: 'Bildunterschrift', en: 'Caption' }, localized: true },
    {
      name: 'decorative',
      type: 'checkbox',
      defaultValue: false,
      label: { de: 'Dekoratives Bild', en: 'Decorative image' },
      admin: {
        description: {
          de: 'Dekorative Bilder dürfen einen leeren Alternativtext haben. Ein vorhandener Alternativtext bleibt gespeichert.',
          en: 'Decorative images may have an empty alt text. Existing alt text remains saved.',
        },
      },
    },
    { name: 'altTextGenerator', type: 'ui', admin: { components: { Field: '/components/media/AltTextGenerator' } } },
  ],
  upload: {
    imageSizes: [
      {
        name: 'ai',
        width: 768,
        height: 768,
        fit: 'inside',
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 78 } },
        admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true },
      },
    ],
  },
}
