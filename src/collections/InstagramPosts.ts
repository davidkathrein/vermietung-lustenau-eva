import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  labels: { singular: { de: 'Instagram-Beitrag', en: 'Instagram post' }, plural: { de: 'Instagram-Beiträge', en: 'Instagram posts' } },
  admin: { useAsTitle: 'externalId', defaultColumns: ['externalId', 'publishedAt', 'visible'], components: { beforeList: ['/components/instagram/InstagramSyncControl'] } },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'translationPanel', type: 'ui', admin: { components: { Field: '/components/translation/TranslationPanel' } } },
    { name: 'externalId', type: 'text', label: { de: 'Instagram-ID', en: 'Instagram ID' }, required: true, unique: true, index: true },
    { name: 'permalink', type: 'text', label: { de: 'Beitragslink', en: 'Post URL' }, required: true },
    { name: 'caption', type: 'textarea', label: { de: 'Beitragstext', en: 'Caption' }, localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', label: { de: 'Bild', en: 'Image' } },
    { name: 'publishedAt', type: 'date', label: { de: 'Veröffentlicht am', en: 'Published at' } },
    { name: 'visible', type: 'checkbox', label: { de: 'Später öffentlich anzeigen', en: 'Show publicly later' }, defaultValue: false },
  ],
}
