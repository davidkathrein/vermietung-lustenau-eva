import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Accommodations: CollectionConfig = {
  slug: 'accommodations',
  labels: { singular: 'Wohnung', plural: 'Wohnungen' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sleeps', 'seminarCapable', 'published'],
  },
  access: {
    read: ({ req }) => req.user ? true : { published: { equals: true } },
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'teaser', type: 'textarea', required: true, localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'sleeps', type: 'number', required: true, min: 1, max: 20 },
    { name: 'bedSetup', type: 'text', localized: true },
    { name: 'sizeSqm', type: 'number', min: 1 },
    { name: 'seminarCapable', type: 'checkbox', defaultValue: false },
    {
      name: 'seminarCapacity',
      type: 'number',
      min: 1,
      admin: { condition: (_, siblingData) => siblingData.seminarCapable === true },
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', localized: true },
      ],
    },
    { name: 'floorplan', type: 'upload', relationTo: 'media' },
    {
      name: 'ical',
      type: 'group',
      label: 'Kalenderlinks',
      admin: { description: 'Diese privaten Links bleiben auf dem Server und erscheinen nicht im öffentlichen API.' },
      fields: [
        { name: 'airbnb', type: 'text', access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) } },
        { name: 'booking', type: 'text', access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) } },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'published', type: 'checkbox', defaultValue: false, index: true },
  ],
}
