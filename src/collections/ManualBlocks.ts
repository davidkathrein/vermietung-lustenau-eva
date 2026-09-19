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
    description: { de: 'Sperrt Tage auf der Website und im privaten Kalenderexport. Plattformen übernehmen importierte Kalender mit Verzögerung.', en: 'Blocks dates on the website and in the private calendar export. Platforms import calendars with a delay.' },
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
    { name: 'inquiry', type: 'relationship', relationTo: 'inquiries', label: { de: 'Zugehörige Anfrage', en: 'Related inquiry' }, index: true },
    { name: 'usage', type: 'select', label: { de: 'Nutzung', en: 'Usage' }, defaultValue: 'manual', options: [
      { label: { de: 'Manuelle Sperre', en: 'Manual block' }, value: 'manual' },
      { label: { de: 'Übernachtung', en: 'Stay' }, value: 'stay' },
      { label: { de: 'Seminar', en: 'Seminar' }, value: 'seminar' },
    ] },
    { name: 'active', type: 'checkbox', label: { de: 'Aktiv', en: 'Active' }, defaultValue: true, index: true },
  ],
}
