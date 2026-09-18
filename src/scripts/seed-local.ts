import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../payload.config'

const payload = await getPayload({ config })

const settings = await payload.findGlobal({ slug: 'site-settings', locale: 'de' })
if (!settings.siteName) {
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'de',
    data: {
      siteName: 'Wohnen in Lustenau',
      heroTitle: 'Drei Wohnungen in Lustenau',
      heroText: 'Kurzzeitwohnen und ein flexibler Raum für Seminare.',
      operatorName: 'Eva Kathrein',
      streetAddress: 'Maria-Theresien-Straße 94',
      postalCode: '6890',
      city: 'Lustenau',
      country: 'Österreich',
    },
  })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      siteName: 'Stay in Lustenau',
      heroTitle: 'Three apartments in Lustenau',
      heroText: 'Short stays and a flexible room for seminars.',
    },
  })
}

const units = [
  {
    slug: 'wohnung-1',
    sleeps: 4,
    seminarCapable: true,
    de: { name: 'Wohnung 1', teaser: 'Für bis zu vier Personen. Alternativ als ganztägiger Seminarraum für bis zu zehn Teilnehmende nutzbar.' },
    en: { name: 'Apartment 1', teaser: 'For up to four guests. Alternatively available as a full-day seminar room for up to ten participants.' },
  },
  {
    slug: 'wohnung-2',
    sleeps: 4,
    seminarCapable: false,
    de: { name: 'Wohnung 2', teaser: 'Für bis zu vier Personen mit Doppelbett, Ausziehcouch und kleiner Küche.' },
    en: { name: 'Apartment 2', teaser: 'For up to four guests with a double bed, sofa bed, and small kitchen.' },
  },
  {
    slug: 'wohnung-3',
    sleeps: 3,
    seminarCapable: false,
    de: { name: 'Wohnung 3', teaser: 'Für bis zu drei Personen mit Doppelbett, Ausziehcouch und kleiner Küche.' },
    en: { name: 'Apartment 3', teaser: 'For up to three guests with a double bed, sofa bed, and small kitchen.' },
  },
] as const

for (const [index, unit] of units.entries()) {
  const existing = await payload.find({
    collection: 'accommodations',
    where: { slug: { equals: unit.slug } },
    limit: 1,
  })
  if (existing.totalDocs > 0) continue

  const created = await payload.create({
    collection: 'accommodations',
    locale: 'de',
    data: {
      slug: unit.slug,
      name: unit.de.name,
      teaser: unit.de.teaser,
      sleeps: unit.sleeps,
      bedSetup: 'Doppelbett und Ausziehcouch',
      seminarCapable: unit.seminarCapable,
      seminarCapacity: unit.seminarCapable ? 10 : undefined,
      sortOrder: index + 1,
      published: true,
    },
  })
  await payload.update({
    collection: 'accommodations',
    id: created.id,
    locale: 'en',
    data: {
      name: unit.en.name,
      teaser: unit.en.teaser,
      bedSetup: 'Double bed and sofa bed',
    },
  })
}

payload.logger.info('Local example content is ready')
await payload.db.destroy?.()
