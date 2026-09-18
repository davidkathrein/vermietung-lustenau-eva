import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: {
    singular: { de: 'Anfrage', en: 'Inquiry' },
    plural: { de: 'Anfragen', en: 'Inquiries' },
  },
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
      label: { de: 'Art', en: 'Type' },
      required: true,
      options: [
        { label: { de: 'Übernachtung', en: 'Stay' }, value: 'stay' },
        { label: { de: 'Seminar', en: 'Seminar' }, value: 'seminar' },
      ],
    },
    {
      name: 'accommodations',
      type: 'relationship',
      label: { de: 'Wohnungen', en: 'Apartments' },
      relationTo: 'accommodations',
      hasMany: true,
      required: true,
    },
    { name: 'arrival', type: 'date', label: { de: 'Anreise', en: 'Arrival' }, required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'departure', type: 'date', label: { de: 'Abreise', en: 'Departure' }, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'name', type: 'text', label: { de: 'Name', en: 'Name' }, required: true },
    { name: 'email', type: 'email', label: { de: 'E-Mail', en: 'Email' }, required: true },
    { name: 'phone', type: 'text', label: { de: 'Telefon', en: 'Phone' } },
    { name: 'guests', type: 'number', label: { de: 'Gäste', en: 'Guests' }, min: 1 },
    { name: 'message', type: 'textarea', label: { de: 'Nachricht', en: 'Message' } },
    {
      name: 'status',
      type: 'select',
      label: { de: 'Status', en: 'Status' },
      required: true,
      defaultValue: 'new',
      options: [
        { label: { de: 'Neu', en: 'New' }, value: 'new' },
        { label: { de: 'In Bearbeitung', en: 'Reviewing' }, value: 'reviewing' },
        { label: { de: 'Angebot gesendet', en: 'Offer sent' }, value: 'offered' },
        { label: { de: 'Abgeschlossen', en: 'Closed' }, value: 'closed' },
      ],
    },
  ],
}
