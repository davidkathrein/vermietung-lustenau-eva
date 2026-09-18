import type { GlobalConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Website-Einstellungen',
  access: { read: () => true, update: adminOnly },
  fields: [
    { name: 'siteName', type: 'text', localized: true },
    { name: 'heroTitle', type: 'text', localized: true },
    { name: 'heroText', type: 'textarea', localized: true },
    { name: 'operatorName', type: 'text' },
    { name: 'contactEmail', type: 'email' },
    { name: 'contactPhone', type: 'text' },
    { name: 'streetAddress', type: 'text' },
    { name: 'postalCode', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'country', type: 'text' },
  ],
}
