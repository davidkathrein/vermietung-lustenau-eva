import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'

import { getPublicRouteInventory } from '@/lib/public-content'
import { absoluteSiteURL, isSiteIndexable } from '@/lib/site-url'

export const dynamic = 'force-dynamic'
const getCachedPublicRouteInventory = unstable_cache(getPublicRouteInventory, ['public-sitemap-routes'], { revalidate: 3600 })

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSiteIndexable()) return []
  const routes = await getCachedPublicRouteInventory()

  return routes.flatMap((route) => {
    const languages = route.de && route.en ? {
      de: absoluteSiteURL(route.de),
      en: absoluteSiteURL(route.en),
      'x-default': absoluteSiteURL(route.de),
    } : undefined

    return (['de', 'en'] as const).flatMap((locale) => {
      const path = route[locale]
      if (!path) return []
      return [{
        url: absoluteSiteURL(path),
        ...(languages && { alternates: { languages } }),
        changeFrequency: path === `/${locale}` ? 'weekly' as const : 'monthly' as const,
        priority: path === `/${locale}` ? 1 : 0.8,
      }]
    })
  })
}
