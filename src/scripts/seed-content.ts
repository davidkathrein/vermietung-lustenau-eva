import 'dotenv/config'

import path from 'node:path'

import { getPayload } from 'payload'

import type { Page } from '../payload-types'
import config from '../payload.config'

const payload = await getPayload({ config })
type Layout = Page['layout']
const newlyCreatedPages = new Set<number>()
const rich = (value: string) => ({ root: { type: 'root', version: 1, format: '', indent: 0, direction: 'ltr', children: [{ type: 'paragraph', version: 1, format: '', indent: 0, direction: 'ltr', children: [{ type: 'text', version: 1, format: 0, mode: 'normal', style: '', detail: 0, text: value }] }] } })

async function seedImage(filename: string, germanAlt: string, englishAlt: string): Promise<number> {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
  if (existing.docs[0]) return existing.docs[0].id
  const created = await payload.create({ collection: 'media', locale: 'de', filePath: path.resolve(process.cwd(), 'public/seed-media', filename), data: { alt: germanAlt } })
  await payload.update({ collection: 'media', id: created.id, locale: 'en', data: { alt: englishAlt } })
  return created.id
}

const photos = {
  hero: await seedImage('hero-concept.jpg', 'Heller Wohnbereich mit Holztisch und Sofa', 'Bright living area with a wooden table and sofa'),
  apartments: [
    [
      await seedImage('apartment-1-concept.jpg', 'Heller Raum mit langem Tisch für Seminare', 'Bright room with a long table for seminars'),
      await seedImage('apartment-1-seminar-opposite.jpg', 'Seminarraum mit Blick über den langen Holztisch', 'Seminar room viewed across the long wooden table'),
      await seedImage('apartment-1-seminar-side.jpg', 'Seminarraum mit Sitzbereich im Hintergrund', 'Seminar room with a sitting area beyond'),
    ],
    [
      await seedImage('apartment-2-concept.jpg', 'Ruhiges Schlafzimmer mit Doppelbett', 'Calm bedroom with a double bed'),
      await seedImage('apartment-2-bedroom-opposite.jpg', 'Doppelbett im hellen Schlafzimmer', 'Double bed in the bright bedroom'),
      await seedImage('apartment-2-living-dining.jpg', 'Wohn- und Essbereich mit rundem Holztisch', 'Living and dining area with a round wooden table'),
    ],
    [
      await seedImage('apartment-3-concept.jpg', 'Gemütlicher Wohnbereich mit grünem Sofa', 'Comfortable living area with a green sofa'),
      await seedImage('apartment-3-living-opposite.jpg', 'Wohnbereich mit grünem Sofa und Bücherregal', 'Living area with a green sofa and bookshelves'),
      await seedImage('apartment-3-kitchen-dining.jpg', 'Kleine Küche mit Essplatz am Fenster', 'Small kitchen with a dining nook by the window'),
    ],
  ],
}

async function addMissingGalleryImages(id: number, imageIDs: number[]) {
  const accommodation = await payload.findByID({ collection: 'accommodations', id, locale: 'de', depth: 0 })
  const gallery = accommodation.gallery ?? []
  const existingIDs = new Set(gallery.map(({ image }) => typeof image === 'number' ? image : image?.id))
  // Once an editor replaces the seed gallery, later builds must not restore concept photos.
  if (gallery.length > 0 && !existingIDs.has(imageIDs[0])) return
  const missing = imageIDs.filter((image) => !existingIDs.has(image))
  if (missing.length) {
    await payload.update({
      collection: 'accommodations',
      id,
      locale: 'de',
      draft: accommodation._status === 'draft',
      data: { gallery: [...gallery, ...missing.map((image) => ({ image }))] },
    })
  }
}

async function addMissingPageImages(id: number, imagesByIndex: Record<number, number>) {
  if (!newlyCreatedPages.has(id)) return
  for (const locale of ['de', 'en'] as const) {
    const saved = await payload.findByID({ collection: 'pages', id, locale, fallbackLocale: false, depth: 0 })
    let changed = false
    const layout = saved.layout.map((block, index) => {
      const image = imagesByIndex[index]
      if (!image || !('image' in block) || block.image) return block
      changed = true
      return { ...block, image }
    }) as Layout
    if (changed) {
      await payload.update({ collection: 'pages', id, locale, data: { layout, _status: 'published' } })
    }
  }
}

async function removePageBlock(id: number, blockType: Layout[number]['blockType']) {
  const pages = await Promise.all((['de', 'en'] as const).map(async (locale) => ({
    locale,
    page: await payload.findByID({ collection: 'pages', id, locale, fallbackLocale: false, depth: 0 }),
  })))

  for (const { locale, page } of pages) {
    const layout = page.layout.filter((block) => block.blockType !== blockType)
    if (layout.length === page.layout.length) continue
    await payload.update({ collection: 'pages', id, locale, data: { layout, _status: 'published' } })
  }
}

function withIds(layout: Layout, reference: Layout): Layout {
  return layout.map((block, index) => {
    const saved = reference[index] as Record<string, unknown> | undefined
    const next = { ...block, id: saved?.id }
    for (const key of ['items', 'actions'] as const) {
      const rows = (block as Record<string, unknown>)[key]
      const savedRows = saved?.[key]
      if (Array.isArray(rows) && Array.isArray(savedRows)) (next as Record<string, unknown>)[key] = rows.map((row, rowIndex) => ({ ...row, id: savedRows[rowIndex]?.id }))
    }
    return next
  }) as Layout
}

async function page(internalName: string, de: { slug: string; title: string; description: string; layout: Layout }, en: { slug: string; title: string; description: string; layout: Layout }) {
  const found = await payload.find({ collection: 'pages', where: { internalName: { equals: internalName } }, limit: 1, depth: 0 })
  if (found.docs[0]) return found.docs[0]
  const created = await payload.create({ collection: 'pages', locale: 'de', draft: true, data: { internalName, slug: de.slug, title: de.title, seo: { metaTitle: de.title, metaDescription: de.description }, layout: de.layout } })
  newlyCreatedPages.add(created.id)
  const translated = withIds(en.layout, created.layout)
  await payload.update({ collection: 'pages', id: created.id, locale: 'en', draft: true, data: { slug: en.slug, title: en.title, seo: { metaTitle: en.title, metaDescription: en.description }, layout: translated } })
  await payload.update({ collection: 'pages', id: created.id, locale: 'de', data: { _status: 'published' } })
  await payload.update({ collection: 'pages', id: created.id, locale: 'en', data: { slug: en.slug, title: en.title, seo: { metaTitle: en.title, metaDescription: en.description }, layout: translated, _status: 'published' } })
  return payload.findByID({ collection: 'pages', id: created.id, locale: 'de', depth: 0 })
}

const settings = await payload.findGlobal({ slug: 'site-settings', locale: 'de' })
if (!settings.siteName) {
  await payload.updateGlobal({ slug: 'site-settings', locale: 'de', data: { siteName: 'Wohnen in Lustenau', operatorName: 'Eva Kathrein', streetAddress: 'Maria-Theresien-Straße 94', postalCode: '6890', city: 'Lustenau', country: 'Österreich' } })
  await payload.updateGlobal({ slug: 'site-settings', locale: 'en', data: { siteName: 'Stay in Lustenau', country: 'Austria' } })
}
const englishSettings = await payload.findGlobal({ slug: 'site-settings', locale: 'en', fallbackLocale: false })
if (englishSettings.siteName === 'Stay in Lustenau' && englishSettings.country === 'Österreich') {
  await payload.updateGlobal({ slug: 'site-settings', locale: 'en', data: { country: 'Austria' } })
}

const units = [
  { deSlug: 'wohnung-1', enSlug: 'apartment-1-seminar-room', sleeps: 4, seminar: true, seminarCapacity: 10,
    de: { name: 'Wohnung 1 / Seminarraum', teaser: 'Eine flexible Wohnung für bis zu vier Gäste – oder ein ruhiger Seminarraum für bis zu zehn Personen.', description: 'Wohnung 1 lässt sich für Aufenthalte oder ganztägige Seminare anfragen. Beide Nutzungen teilen sich denselben Kalender und können nicht gleichzeitig stattfinden.', beds: 'Doppelbett und Ausziehcouch' },
    en: { name: 'Apartment 1 / Seminar room', teaser: 'A flexible apartment for up to four guests – or a quiet seminar room for up to ten people.', description: 'Apartment 1 can be requested for stays or full-day seminars. Both uses share the same calendar and cannot take place at the same time.', beds: 'Double bed and sofa bed' } },
  { deSlug: 'wohnung-2', enSlug: 'apartment-2', sleeps: 4, seminar: false, seminarCapacity: 0,
    de: { name: 'Wohnung 2', teaser: 'Ein unkomplizierter Rückzugsort für bis zu vier Personen mit Platz zum Ankommen und Bleiben.', description: 'Wohnung 2 eignet sich für kurze Aufenthalte ebenso wie für ein paar entspannte Tage in Lustenau.', beds: 'Doppelbett und Ausziehcouch' },
    en: { name: 'Apartment 2', teaser: 'An easy-going retreat for up to four guests, with space to settle in and stay a while.', description: 'Apartment 2 suits short visits as well as a few relaxed days in Lustenau.', beds: 'Double bed and sofa bed' } },
  { deSlug: 'wohnung-3', enSlug: 'apartment-3', sleeps: 3, seminar: false, seminarCapacity: 0,
    de: { name: 'Wohnung 3', teaser: 'Kompakt und gemütlich für bis zu drei Personen – ein guter Ausgangspunkt für die Region.', description: 'Wohnung 3 bietet einen persönlichen Ort zum Ausruhen nach einem Tag zwischen Rhein, Bodensee und Bergen.', beds: 'Doppelbett und Ausziehcouch' },
    en: { name: 'Apartment 3', teaser: 'Compact and welcoming for up to three guests – a comfortable base for exploring the region.', description: 'Apartment 3 offers a personal place to rest after a day between the Rhine, Lake Constance and the mountains.', beds: 'Double bed and sofa bed' } },
] as const

for (const [index, unit] of units.entries()) {
  const found = await payload.find({ collection: 'accommodations', locale: 'de', where: { slug: { equals: unit.deSlug } }, limit: 1, depth: 0 })
  if (found.docs[0]) {
    const legacy = found.docs[0]
    if (legacy._status === 'draft' && !legacy.description && legacy.name === `Wohnung ${index + 1}`) {
      await payload.update({ collection: 'accommodations', id: legacy.id, locale: 'de', draft: true, data: { name: unit.de.name, teaser: unit.de.teaser, description: unit.de.description } })
      await payload.update({ collection: 'accommodations', id: legacy.id, locale: 'en', draft: true, data: { slug: unit.enSlug, name: unit.en.name, teaser: unit.en.teaser, description: unit.en.description, bedSetup: unit.en.beds } })
      await payload.update({ collection: 'accommodations', id: legacy.id, locale: 'de', data: { _status: 'published' } })
    }
    await addMissingGalleryImages(legacy.id, photos.apartments[index])
    continue
  }
  const created = await payload.create({ collection: 'accommodations', locale: 'de', draft: true, data: { slug: unit.deSlug, name: unit.de.name, teaser: unit.de.teaser, description: unit.de.description, sleeps: unit.sleeps, bedSetup: unit.de.beds, seminarCapable: unit.seminar, seminarCapacity: unit.seminar ? unit.seminarCapacity : undefined, sortOrder: index + 1, published: true, gallery: photos.apartments[index].map((image) => ({ image })) } })
  await payload.update({ collection: 'accommodations', id: created.id, locale: 'en', draft: true, data: { slug: unit.enSlug, name: unit.en.name, teaser: unit.en.teaser, description: unit.en.description, bedSetup: unit.en.beds } })
  await payload.update({ collection: 'accommodations', id: created.id, locale: 'de', data: { _status: 'published' } })
}

const apartments = await page('apartments', {
  slug: 'wohnungen', title: 'Unsere Wohnungen', description: 'Drei Wohnungen in Lustenau für kurze und längere Aufenthalte. Wohnung 1 kann auch als Seminarraum genutzt werden.',
  layout: [
    { blockType: 'hero', eyebrow: 'Wohnen in Lustenau', headline: 'Ein Ort zum Ankommen.', intro: 'Drei Wohnungen mit persönlichem Charakter. Finden Sie den Raum, der zu Ihrem Aufenthalt passt.' },
    { blockType: 'accommodationOverview', eyebrow: 'Die Räume', headline: 'Drei Wohnungen. Viele Möglichkeiten.', intro: 'Wohnung 1 steht zusätzlich für Seminare zur Verfügung. Alle Termine werden über denselben Belegungskalender geprüft.' },
    { blockType: 'inquiry', eyebrow: 'Ihre Anfrage', headline: 'Fragen Sie Ihren Wunschtermin an.', intro: 'Wir prüfen die Verfügbarkeit persönlich und melden uns bei Ihnen.', mode: 'both' },
  ] as Layout,
}, {
  slug: 'apartments', title: 'Our apartments', description: 'Three apartments in Lustenau for short and longer stays. Apartment 1 is also available as a seminar room.',
  layout: [
    { blockType: 'hero', eyebrow: 'Stay in Lustenau', headline: 'A place to arrive.', intro: 'Three apartments with their own character. Find the space that suits your stay.' },
    { blockType: 'accommodationOverview', eyebrow: 'The spaces', headline: 'Three apartments. Many possibilities.', intro: 'Apartment 1 is also available for seminars. All dates are checked against the same availability calendar.' },
    { blockType: 'inquiry', eyebrow: 'Your inquiry', headline: 'Ask about your preferred dates.', intro: 'We check availability personally and get back to you.', mode: 'both' },
  ] as Layout,
})

const contact = await page('contact', {
  slug: 'kontakt', title: 'Kontakt und Anfrage', description: 'Fragen Sie eine Wohnung oder den Seminarraum in Lustenau unverbindlich an.',
  layout: [
    { blockType: 'inquiry', eyebrow: 'Unverbindlich', headline: 'Ihre Anfrage', intro: 'Eine Anfrage ist noch keine Buchung. Wir melden uns mit einer persönlichen Rückmeldung.', mode: 'both' },
  ] as Layout,
}, {
  slug: 'contact', title: 'Contact and inquiry', description: 'Send a no-obligation inquiry for an apartment or the seminar room in Lustenau.',
  layout: [
    { blockType: 'inquiry', eyebrow: 'No obligation', headline: 'Your inquiry', intro: 'An inquiry is not yet a booking. We will reply personally.', mode: 'both' },
  ] as Layout,
})

await removePageBlock(contact.id, 'hero')

const internal = (label: string, id: number) => ({ label, kind: 'internal' as const, reference: { relationTo: 'pages' as const, value: id } })
const homepage = await page('homepage', {
  slug: 'homepage', title: 'Wohnen in Lustenau', description: 'Drei persönlich geführte Wohnungen in Lustenau. Für Aufenthalte im Rheintal und Seminare in Wohnung 1.',
  layout: [
    { blockType: 'hero', eyebrow: 'Lustenau · Vorarlberg', headline: 'Ankommen. Durchatmen. Bleiben.', intro: 'Drei Wohnungen für Tage, die sich nach mehr als einem Zwischenstopp anfühlen.', actions: [{ link: internal('Wohnungen entdecken', apartments.id) }, { link: internal('Anfrage senden', contact.id) }] },
    { blockType: 'content', eyebrow: 'Willkommen', headline: 'Ein Zuhause auf Zeit.', intro: 'Mit Raum für Ruhe, Begegnung und neue Eindrücke.', body: rich('In Lustenau wohnen Sie zwischen Bodensee, Rhein und den Bergen Vorarlbergs. Unsere drei Wohnungen bieten einen persönlichen Ausgangspunkt für Ihre Zeit in der Region.') },
    { blockType: 'accommodationOverview', eyebrow: 'Die Wohnungen', headline: 'Finden Sie Ihren Lieblingsplatz.', intro: 'Drei Wohnungen für unterschiedliche Aufenthalte. Wohnung 1 kann auch als Seminarraum angefragt werden.' },
    { blockType: 'cta', eyebrow: 'Gut zu wissen', headline: 'Sie planen einen Seminartag?', intro: 'Wohnung 1 lässt sich alternativ als Seminarraum nutzen. Aufenthalt und Seminar werden gemeinsam im Kalender abgeglichen.', action: internal('Seminar anfragen', contact.id) },
    { blockType: 'faq', eyebrow: 'Fragen und Antworten', headline: 'Das Wichtigste auf einen Blick.', items: [
      { question: 'Ist meine Anfrage bereits eine Buchung?', answer: rich('Nein. Wir prüfen Ihren Wunschtermin und melden uns persönlich mit einer Rückmeldung.') },
      { question: 'Kann Wohnung 1 gleichzeitig als Seminarraum und Wohnung genutzt werden?', answer: rich('Nein. Es ist derselbe Raum. Ein bestätigter Termin blockiert beide Nutzungen.') },
    ] },
  ] as Layout,
}, {
  slug: 'homepage', title: 'Stay in Lustenau', description: 'Three personally managed apartments in Lustenau for stays in the Rhine Valley and seminars in Apartment 1.',
  layout: [
    { blockType: 'hero', eyebrow: 'Lustenau · Vorarlberg', headline: 'Arrive. Unwind. Stay.', intro: 'Three apartments for days that feel like more than a stopover.', actions: [{ link: internal('Explore apartments', apartments.id) }, { link: internal('Send an inquiry', contact.id) }] },
    { blockType: 'content', eyebrow: 'Welcome', headline: 'A home for a while.', intro: 'With room to rest, connect and discover.', body: rich('In Lustenau, you stay between Lake Constance, the Rhine and the mountains of Vorarlberg. Our three apartments are a personal starting point for your time in the region.') },
    { blockType: 'accommodationOverview', eyebrow: 'The apartments', headline: 'Find your favourite place.', intro: 'Three apartments for different kinds of stays. Apartment 1 can also be requested as a seminar room.' },
    { blockType: 'cta', eyebrow: 'Good to know', headline: 'Planning a seminar day?', intro: 'Apartment 1 can alternatively be used as a seminar room. Stays and seminars are checked against the same calendar.', action: internal('Ask about seminars', contact.id) },
    { blockType: 'faq', eyebrow: 'Questions and answers', headline: 'The essentials at a glance.', items: [
      { question: 'Is my inquiry already a booking?', answer: rich('No. We check your preferred dates and respond personally.') },
      { question: 'Can Apartment 1 be used for a stay and a seminar at the same time?', answer: rich('No. It is the same physical space. A confirmed booking blocks both uses.') },
    ] },
  ] as Layout,
})

await addMissingPageImages(apartments.id, { 0: photos.hero })
await addMissingPageImages(homepage.id, { 0: photos.hero, 1: photos.apartments[2][0] })

const latest = await payload.findGlobal({ slug: 'site-settings', locale: 'de', depth: 0 })
if (!latest.navigation?.length) {
  const deNav = [{ link: internal('Wohnungen', apartments.id) }, { link: internal('Kontakt', contact.id) }]
  await payload.updateGlobal({ slug: 'site-settings', locale: 'de', data: { navigation: deNav } })
  const german = await payload.findGlobal({ slug: 'site-settings', locale: 'de', depth: 0 })
  await payload.updateGlobal({ slug: 'site-settings', locale: 'en', data: { navigation: [
    { ...german.navigation?.[0], link: { ...german.navigation?.[0]?.link, label: 'Apartments' } },
    { ...german.navigation?.[1], link: { ...german.navigation?.[1]?.link, label: 'Contact' } },
  ] } })
}

payload.logger.info('Bilingual content seed complete; existing curated records were preserved')
// Payload retains database handles in standalone scripts; every write above has completed.
process.exit(0)
