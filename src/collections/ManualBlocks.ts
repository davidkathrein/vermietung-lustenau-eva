import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const ManualBlocks: CollectionConfig = {
  slug: 'manual-blocks',
  labels: {
    singular: { de: 'Manuelle Sperre', en: 'Manual block' },
    plural: { de: 'Manuelle Sperren', en: 'Manual blocks' },
  },
  admin: {
    useAsTitle: 'reason',
    defaultColumns: ['accommodation', 'startDate', 'endDate', 'reason'],
    description: { de: 'Sperrt die Tage im Website-Kalender. Airbnb und Booking.com müssen separat gesperrt werden.', en: 'Blocks dates in the website calendar. Airbnb and Booking.com must be blocked separately.' },
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
    { name: 'accommodation', type: 'relationship', label: { de: 'Wohnung', en: 'Apartment' }, relationTo: 'accommodations', required: true, index: true },
    { name: 'startDate', type: 'date', label: { de: 'Beginn', en: 'Start date' }, required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' }, description: { de: 'Erster gesperrter Tag', en: 'First blocked day' } } },
    { name: 'endDate', type: 'date', label: { de: 'Ende', en: 'End date' }, required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' }, description: { de: 'Erster wieder freier Tag (ausschließlich)', en: 'First free day (exclusive)' } } },
    { name: 'reason', type: 'text', label: { de: 'Grund', en: 'Reason' }, required: true },
  ],
}
