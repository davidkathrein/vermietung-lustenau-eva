import type { Accommodation, Page } from '@/payload-types'

import { accommodationPath, pagePath, type SiteLocale } from './locale'

export type LinkValue = {
  label?: string | null
  kind?: string | null
  reference?: { relationTo: 'pages' | 'accommodations'; value: number | Page | Accommodation } | null
  url?: string | null
  email?: string | null
  phone?: string | null
  anchor?: string | null
  newTab?: boolean | null
} | null | undefined

export function hrefForLink(link: LinkValue, locale: SiteLocale): string | null {
  if (!link) return null
  if (link.kind === 'internal' && link.reference && typeof link.reference.value === 'object') {
    const doc = link.reference.value
    if (link.reference.relationTo === 'pages' && 'internalName' in doc && doc.slug) {
      if (doc._status !== 'published') return null
      return pagePath(locale, doc.internalName, doc.slug)
    }
    if (link.reference.relationTo === 'accommodations' && doc.slug) {
      if (doc._status !== 'published' || !('published' in doc) || !doc.published) return null
      return accommodationPath(locale, doc.slug)
    }
  }
  if (link.kind === 'url' && link.url) {
    try {
      const parsed = new URL(link.url)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString()
    } catch { return null }
  }
  if (link.kind === 'email' && link.email) return `mailto:${link.email}`
  if (link.kind === 'phone' && link.phone) return `tel:${link.phone.replace(/[^\d+]/g, '')}`
  if (link.kind === 'anchor' && link.anchor && /^[a-z][a-z\d-]*$/i.test(link.anchor)) return `#${link.anchor}`
  return null
}
