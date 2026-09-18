import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Anfrage', plural: 'Anfragen' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['createdAt', 'kind', 'email', 'arrival', 'departure', 'status'],
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Übernachtung', value: 'stay' },
        { label: 'Seminar', value: 'seminar' },
      ],
    },
    {
      name: 'accommodations',
      type: 'relationship',
      relationTo: 'accommodations',
      hasMany: true,
      required: true,
    },
    { name: 'arrival', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'departure', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'guests', type: 'number', min: 1 },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Neu', value: 'new' },
        { label: 'In Bearbeitung', value: 'reviewing' },
        { label: 'Angebot gesendet', value: 'offered' },
        { label: 'Abgeschlossen', value: 'closed' },
      ],
    },
  ],
}
