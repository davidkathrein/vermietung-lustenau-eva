import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const CalendarHealth: CollectionConfig = {
  slug: 'calendar-health',
  labels: { singular: { de: 'Kalenderstatus', en: 'Calendar health' }, plural: { de: 'Kalenderstatus', en: 'Calendar health' } },
  admin: { useAsTitle: 'key', defaultColumns: ['key', 'consecutiveFailures', 'lastSuccessAt', 'alertedAt'] },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'accommodation', type: 'relationship', relationTo: 'accommodations', required: true, index: true },
    { name: 'provider', type: 'select', required: true, options: ['airbnb', 'booking'] },
    { name: 'consecutiveFailures', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'lastSuccessAt', type: 'date' },
    { name: 'lastFailureAt', type: 'date' },
    { name: 'alertedAt', type: 'date' },
  ],
}
