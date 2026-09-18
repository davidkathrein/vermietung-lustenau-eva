import type { GlobalConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { linkField } from '../fields/link'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { de: 'Website-Einstellungen', en: 'Website settings' },
  access: { read: () => true, update: adminOnly },
  fields: [
    { name: 'translationPanel', type: 'ui', admin: { components: { Field: '/components/translation/TranslationPanel' } } },
    { name: 'siteName', type: 'text', label: { de: 'Website-Name', en: 'Website name' }, localized: true },
    {
      name: 'navigation', type: 'array', label: { de: 'Hauptnavigation', en: 'Main navigation' }, maxRows: 8,
      fields: [linkField('link', true)],
    },
    { name: 'operatorName', type: 'text', label: { de: 'Betreiberin', en: 'Operator' } },
    { name: 'contactEmail', type: 'email', label: { de: 'Kontakt-E-Mail', en: 'Contact email' } },
    { name: 'contactPhone', type: 'text', label: { de: 'Kontakttelefon', en: 'Contact phone' } },
    { name: 'streetAddress', type: 'text', label: { de: 'Straße und Hausnummer', en: 'Street address' } },
    { name: 'postalCode', type: 'text', label: { de: 'Postleitzahl', en: 'Postal code' } },
    { name: 'city', type: 'text', label: { de: 'Ort', en: 'City' } },
    { name: 'country', type: 'text', label: { de: 'Land', en: 'Country' }, localized: true },
  ],
}
