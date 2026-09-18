import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: { de: 'Benutzer', en: 'User' }, plural: { de: 'Benutzer', en: 'Users' } },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
