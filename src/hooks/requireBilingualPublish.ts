import type { CollectionBeforeChangeHook } from 'payload'

import { sourceIsComplete } from '../lib/translation-review'

export function requireBilingualPublish(collection: 'pages' | 'accommodations'): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, operation }) => {
    if (data._status !== 'published') return data
    const currentLocale = req.locale === 'en' ? 'en' : 'de'
    const otherLocale = currentLocale === 'de' ? 'en' : 'de'
    if (operation === 'create' || !originalDoc?.id) throw new Error('Save both languages as drafts before publishing.')
    const savedCurrent = await req.payload.findByID({ collection, id: originalDoc.id, locale: currentLocale, fallbackLocale: false, draft: true, depth: 0, req })
    const current = { ...savedCurrent, ...data } as Record<string, unknown>
    if (!sourceIsComplete(collection, current)) throw new Error(`Complete all required ${currentLocale.toUpperCase()} fields and SEO metadata before publishing.`)
    const other = await req.payload.findByID({ collection, id: originalDoc.id, locale: otherLocale, fallbackLocale: false, draft: true, depth: 0, req: { ...req, locale: otherLocale } })
    if (!sourceIsComplete(collection, other as unknown as Record<string, unknown>)) throw new Error(`Complete all required ${otherLocale.toUpperCase()} fields and SEO metadata before publishing.`)
    return data
  }
}
