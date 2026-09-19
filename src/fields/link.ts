import type { Field } from 'payload'

export const linkFields = (required = false): Field[] => [
  { name: 'label', type: 'text', label: { de: 'Beschriftung', en: 'Label' }, localized: true, required },
  {
    name: 'kind',
    type: 'select',
    label: { de: 'Link-Art', en: 'Link type' },
    required,
    defaultValue: 'internal',
    options: [
      { label: { de: 'Interner Inhalt', en: 'Internal content' }, value: 'internal' },
      { label: { de: 'Webadresse', en: 'Web address' }, value: 'url' },
      { label: { de: 'E-Mail', en: 'Email' }, value: 'email' },
      { label: { de: 'Telefon', en: 'Phone' }, value: 'phone' },
      { label: { de: 'Seitenanker', en: 'Page anchor' }, value: 'anchor' },
    ],
  },
  {
    name: 'reference',
    type: 'relationship',
    relationTo: ['pages', 'accommodations'],
    label: { de: 'Interne Seite oder Wohnung', en: 'Internal page or apartment' },
    admin: { condition: (_, siblingData) => siblingData.kind === 'internal' },
  },
  {
    name: 'url',
    type: 'text',
    label: { de: 'Webadresse', en: 'Web address' },
    validate: (value: unknown) => !value || (typeof value === 'string' && /^https?:\/\//i.test(value)) || 'Nur http- oder https-Adressen sind erlaubt.',
    admin: { condition: (_, siblingData) => siblingData.kind === 'url' },
  },
  { name: 'email', type: 'email', label: { de: 'E-Mail-Adresse', en: 'Email address' }, admin: { condition: (_, siblingData) => siblingData.kind === 'email' } },
  { name: 'phone', type: 'text', label: { de: 'Telefonnummer', en: 'Phone number' }, admin: { condition: (_, siblingData) => siblingData.kind === 'phone' } },
  { name: 'anchor', type: 'text', label: { de: 'Anker-ID', en: 'Anchor ID' }, admin: { condition: (_, siblingData) => siblingData.kind === 'anchor' } },
  { name: 'newTab', type: 'checkbox', label: { de: 'In neuem Tab öffnen', en: 'Open in new tab' }, defaultValue: false },
]

export const linkField = (name = 'link', required = false): Field => ({
  name,
  type: 'group',
  label: { de: 'Link', en: 'Link' },
  required,
  fields: linkFields(required),
})
