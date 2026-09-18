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
    {
      name: 'footer', type: 'group', label: { de: 'Footer', en: 'Footer' },
      fields: [
        { name: 'title', type: 'text', label: { de: 'Titel', en: 'Title' }, localized: true, admin: { description: { de: 'Leer lassen, um den Website-Namen zu verwenden.', en: 'Leave empty to use the website name.' } } },
        { name: 'description', type: 'textarea', label: { de: 'Kurztext', en: 'Short text' }, localized: true },
        { name: 'apartmentsHeading', type: 'text', label: { de: 'Überschrift Wohnungen', en: 'Apartments heading' }, localized: true },
        { name: 'linksHeading', type: 'text', label: { de: 'Überschrift weitere Links', en: 'Other links heading' }, localized: true },
        { name: 'links', type: 'array', label: { de: 'Weitere Links', en: 'Other links' }, maxRows: 12, fields: [linkField('link', true)] },
        { name: 'contactHeading', type: 'text', label: { de: 'Überschrift Kontakt', en: 'Contact heading' }, localized: true },
        { name: 'copyrightText', type: 'text', label: { de: 'Copyright-Text', en: 'Copyright text' }, localized: true, admin: { description: { de: 'Das aktuelle Jahr und © werden automatisch ergänzt.', en: 'The current year and © are added automatically.' } } },
      ],
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
