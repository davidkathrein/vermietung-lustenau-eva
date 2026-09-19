import type { CollectionAfterChangeHook } from 'payload'

import { apartmentBase } from '../lib/locale'

export function recordSlugRedirect(collection: 'pages' | 'accommodations'): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req }) => {
    const oldSlug = previousDoc?.slug
    const newSlug = doc.slug
    if (!oldSlug || !newSlug || oldSlug === newSlug || previousDoc?._status !== 'published') return doc
    const locale = req.locale === 'en' ? 'en' : 'de'
    const fromPath = collection === 'pages'
      ? previousDoc.internalName === 'homepage' ? `/${locale}` : `/${locale}/${oldSlug}`
      : `/${locale}/${apartmentBase(locale)}/${oldSlug}`
    const existing = await req.payload.find({ collection: 'slug-redirects', where: { fromPath: { equals: fromPath } }, limit: 1, depth: 0, req })
    const data = { fromPath, targetCollection: collection, targetId: doc.id } as const
    if (existing.docs[0]) await req.payload.update({ collection: 'slug-redirects', id: existing.docs[0].id, data, req })
    else await req.payload.create({ collection: 'slug-redirects', data, req })
    return doc
  }
}
