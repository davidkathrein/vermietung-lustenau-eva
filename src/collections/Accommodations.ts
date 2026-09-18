import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Accommodations: CollectionConfig = {
  slug: 'accommodations',
  labels: {
    singular: { de: 'Wohnung', en: 'Apartment' },
    plural: { de: 'Wohnungen', en: 'Apartments' },
  },
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
    { name: 'translationPanel', type: 'ui', admin: { components: { Field: '/components/translation/TranslationPanel' } } },
    { name: 'slug', type: 'text', label: { de: 'Kurzname', en: 'Slug' }, required: true, unique: true, index: true },
    { name: 'name', type: 'text', label: { de: 'Name', en: 'Name' }, required: true, localized: true },
    { name: 'teaser', type: 'textarea', label: { de: 'Kurzbeschreibung', en: 'Short description' }, required: true, localized: true },
    { name: 'description', type: 'textarea', label: { de: 'Beschreibung', en: 'Description' }, localized: true },
    { name: 'sleeps', type: 'number', label: { de: 'Schlafplätze', en: 'Sleeps' }, required: true, min: 1, max: 20 },
    { name: 'bedSetup', type: 'text', label: { de: 'Betten', en: 'Beds' }, localized: true },
    { name: 'sizeSqm', type: 'number', label: { de: 'Größe in m²', en: 'Size in m²' }, min: 1 },
    { name: 'seminarCapable', type: 'checkbox', label: { de: 'Als Seminarraum nutzbar', en: 'Available as seminar room' }, defaultValue: false },
    {
      name: 'seminarCapacity',
      type: 'number',
      label: { de: 'Seminarplätze', en: 'Seminar capacity' },
      min: 1,
      admin: { condition: (_, siblingData) => siblingData.seminarCapable === true },
    },
    {
      name: 'gallery',
      type: 'array',
      label: { de: 'Bilder', en: 'Gallery' },
      fields: [
        { name: 'image', type: 'upload', label: { de: 'Bild', en: 'Image' }, relationTo: 'media', required: true },
        { name: 'caption', type: 'text', label: { de: 'Bildunterschrift', en: 'Caption' }, localized: true },
      ],
    },
    { name: 'floorplan', type: 'upload', label: { de: 'Grundriss', en: 'Floor plan' }, relationTo: 'media' },
    {
      name: 'ical',
      type: 'group',
      label: { de: 'Kalenderlinks', en: 'Calendar links' },
      admin: { description: { de: 'Diese privaten Links bleiben auf dem Server und erscheinen nicht im öffentlichen API.', en: 'These private links stay on the server and are not exposed by the public API.' } },
      fields: [
        { name: 'airbnb', type: 'text', label: 'Airbnb', access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) } },
        { name: 'booking', type: 'text', label: 'Booking.com', access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) } },
      ],
    },
    { name: 'sortOrder', type: 'number', label: { de: 'Reihenfolge', en: 'Sort order' }, defaultValue: 0 },
    { name: 'published', type: 'checkbox', label: { de: 'Veröffentlicht', en: 'Published' }, defaultValue: false, index: true },
  ],
}
