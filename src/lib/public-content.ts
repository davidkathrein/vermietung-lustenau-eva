import config from '@payload-config'
import { getPayload } from 'payload'

import type { Accommodation, Page } from '@/payload-types'

import type { LocalizedRoute, SiteLocale } from './locale'
import { accommodationPath, apartmentBase, pagePath } from './locale'

export async function getPublicPageBySlug(locale: SiteLocale, slug: string): Promise<Page | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages', locale, fallbackLocale: false, depth: 2, limit: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  })
  return result.docs[0] ?? null
}

export async function getPublicHomepage(locale: SiteLocale): Promise<Page | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages', locale, fallbackLocale: false, depth: 2, limit: 1,
    where: { internalName: { equals: 'homepage' }, _status: { equals: 'published' } },
  })
  return result.docs[0] ?? null
}

export async function getPublicContactPage(locale: SiteLocale): Promise<Page | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages', locale, fallbackLocale: false, depth: 0, limit: 1,
    where: { internalName: { equals: 'contact' }, _status: { equals: 'published' } },
  })
  return result.docs[0] ?? null
}

export async function getPublicAccommodationBySlug(locale: SiteLocale, slug: string): Promise<Accommodation | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'accommodations', locale, fallbackLocale: false, depth: 2, limit: 1,
    where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }, { _status: { equals: 'published' } }] },
  })
  return result.docs[0] ?? null
}

export async function getPublicAccommodations(locale: SiteLocale): Promise<Accommodation[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'accommodations', locale, fallbackLocale: false, depth: 2, limit: 20, sort: 'sortOrder',
    where: { published: { equals: true }, _status: { equals: 'published' } },
  })
  return result.docs
}

export async function getPublicSettings(locale: SiteLocale) {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings', locale, fallbackLocale: false, depth: 2 })
}

export async function getPublicLocalizedRoutes(): Promise<LocalizedRoute[]> {
  const payload = await getPayload({ config })
  const [germanPages, englishPages, germanAccommodations, englishAccommodations] = await Promise.all([
    payload.find({ collection: 'pages', locale: 'de', fallbackLocale: false, depth: 0, limit: 100, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'pages', locale: 'en', fallbackLocale: false, depth: 0, limit: 100, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'accommodations', locale: 'de', fallbackLocale: false, depth: 0, limit: 100, where: { and: [{ published: { equals: true } }, { _status: { equals: 'published' } }] } }),
    payload.find({ collection: 'accommodations', locale: 'en', fallbackLocale: false, depth: 0, limit: 100, where: { and: [{ published: { equals: true } }, { _status: { equals: 'published' } }] } }),
  ])

  const englishPagesByID = new Map(englishPages.docs.map((page) => [page.id, page]))
  const englishAccommodationsByID = new Map(englishAccommodations.docs.map((unit) => [unit.id, unit]))
  const routes: LocalizedRoute[] = []

  for (const page of germanPages.docs) {
    const englishPage = englishPagesByID.get(page.id)
    if (!englishPage) continue
    routes.push({
      de: pagePath('de', page.internalName, page.slug),
      en: pagePath('en', englishPage.internalName, englishPage.slug),
    })
  }

  for (const unit of germanAccommodations.docs) {
    const englishUnit = englishAccommodationsByID.get(unit.id)
    if (!englishUnit) continue
    routes.push({
      de: accommodationPath('de', unit.slug),
      en: accommodationPath('en', englishUnit.slug),
    })
  }

  return routes
}

export async function getRedirectTarget(path: string, locale: SiteLocale): Promise<string | null> {
  const payload = await getPayload({ config })
  const found = await payload.find({ collection: 'slug-redirects', where: { fromPath: { equals: path } }, limit: 1, depth: 0 })
  const redirect = found.docs[0]
  if (!redirect) return null
  if (redirect.targetCollection === 'pages') {
    const page = await payload.findByID({ collection: 'pages', id: redirect.targetId, locale, fallbackLocale: false, depth: 0 }).catch(() => null)
    if (!page || page._status !== 'published') return null
    return page.internalName === 'homepage' ? `/${locale}` : `/${locale}/${page.slug}`
  }
  const unit = await payload.findByID({ collection: 'accommodations', id: redirect.targetId, locale, fallbackLocale: false, depth: 0 }).catch(() => null)
  if (!unit || !unit.published || unit._status !== 'published') return null
  return `/${locale}/${apartmentBase(locale)}/${unit.slug}`
}
