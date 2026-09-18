import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { pageBlocks } from '../blocks/pageBlocks'
import { requireBilingualPublish } from '../hooks/requireBilingualPublish'
import { recordSlugRedirect } from '../hooks/recordSlugRedirect'

const previewURL = (id: unknown, locale: unknown): string => {
  const search = new URLSearchParams({ collection: 'pages', locale: locale === 'en' ? 'en' : 'de' })
  if (id != null) search.set('id', String(id))
  return `/api/preview?${search}`
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: { de: 'Seite', en: 'Page' }, plural: { de: 'Seiten', en: 'Pages' } },
  admin: {
    useAsTitle: 'internalName',
    defaultColumns: ['internalName', 'slug', '_status', 'updatedAt'],
    livePreview: { url: ({ data, locale }) => previewURL(data?.id, locale), breakpoints: [
      { label: 'Mobil', name: 'mobile', width: 390, height: 844 },
      { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
      { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
    ] },
    preview: (data, { locale }) => previewURL(data?.id, locale),
  },
  access: {
    read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  versions: { drafts: { autosave: { interval: 30000 } }, maxPerDoc: 30 },
  hooks: { beforeChange: [requireBilingualPublish('pages')], afterChange: [recordSlugRedirect('pages')] },
  fields: [
    { name: 'translationPanel', type: 'ui', admin: { components: { Field: '/components/translation/TranslationPanel' } } },
    { name: 'internalName', type: 'text', label: { de: 'Interner Name', en: 'Internal name' }, required: true, unique: true },
    { name: 'slug', type: 'text', label: { de: 'URL-Segment', en: 'URL segment' }, localized: true, required: true, unique: true, index: true, validate: (value: unknown) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value !== '__preview' || 'Bitte nur Kleinbuchstaben, Zahlen und Bindestriche verwenden.' },
    { name: 'title', type: 'text', label: { de: 'Seitentitel', en: 'Page title' }, localized: true, required: true },
    {
      name: 'seo', type: 'group', label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', label: { de: 'Meta-Titel', en: 'Meta title' }, localized: true, required: true },
        { name: 'metaDescription', type: 'textarea', label: { de: 'Meta-Beschreibung', en: 'Meta description' }, localized: true, required: true },
        { name: 'image', type: 'upload', relationTo: 'media', label: { de: 'Social-Media-Bild', en: 'Social image' } },
      ],
    },
    { name: 'layout', type: 'blocks', label: { de: 'Seiteninhalt', en: 'Page content' }, blocks: pageBlocks, required: true, minRows: 1 },
  ],
}
