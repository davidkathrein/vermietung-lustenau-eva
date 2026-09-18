import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const SlugRedirects: CollectionConfig = {
  slug: 'slug-redirects',
  labels: { singular: { de: 'Weiterleitung', en: 'Redirect' }, plural: { de: 'Weiterleitungen', en: 'Redirects' } },
  admin: { useAsTitle: 'fromPath', defaultColumns: ['fromPath', 'targetCollection', 'targetId'] },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'fromPath', type: 'text', required: true, unique: true, index: true },
    { name: 'targetCollection', type: 'select', required: true, options: ['pages', 'accommodations'] },
    { name: 'targetId', type: 'number', required: true, min: 1 },
  ],
}
