import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const ManualBlocks: CollectionConfig = {
  slug: 'manual-blocks',
  labels: { singular: 'Manuelle Sperre', plural: 'Manuelle Sperren' },
  admin: {
    useAsTitle: 'reason',
    defaultColumns: ['accommodation', 'startDate', 'endDate', 'reason'],
    description: 'Sperrt die Tage im Website-Kalender. Airbnb und Booking.com müssen separat gesperrt werden.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [({ data, originalDoc }) => {
      const start = String(data.startDate ?? originalDoc?.startDate ?? '').slice(0, 10)
      const end = String(data.endDate ?? originalDoc?.endDate ?? '').slice(0, 10)
      if (end <= start) throw new Error('Das Enddatum muss nach dem Startdatum liegen.')
      return data
    }],
  },
  fields: [
    { name: 'accommodation', type: 'relationship', relationTo: 'accommodations', required: true, index: true },
    { name: 'startDate', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' }, description: 'Erster gesperrter Tag' } },
    { name: 'endDate', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' }, description: 'Erster wieder freier Tag (ausschließlich)' } },
    { name: 'reason', type: 'text', required: true },
  ],
}
