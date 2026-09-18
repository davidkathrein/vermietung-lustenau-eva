import config from '@payload-config'
import { getPayload } from 'payload'

import type { Accommodation, Page } from '@/payload-types'

import type { SiteLocale } from './locale'
import { apartmentBase } from './locale'

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
