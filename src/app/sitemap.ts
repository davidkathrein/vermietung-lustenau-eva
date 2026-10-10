import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'

import { getPublicLocalizedRoutes } from '@/lib/public-content'
import { absoluteSiteURL, hasCanonicalSiteURL } from '@/lib/site-url'

export const dynamic = 'force-dynamic'
const getCachedPublicLocalizedRoutes = unstable_cache(getPublicLocalizedRoutes, ['public-sitemap-routes'], { revalidate: 3600 })

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!hasCanonicalSiteURL()) return []
  const routes = await getCachedPublicLocalizedRoutes()

  return routes.flatMap((route) => {
    const languages = {
      de: absoluteSiteURL(route.de),
      en: absoluteSiteURL(route.en),
      'x-default': absoluteSiteURL(route.de),
    }

    return (['de', 'en'] as const).map((locale) => ({
      url: absoluteSiteURL(route[locale]),
      alternates: { languages },
      changeFrequency: route[locale] === `/${locale}` ? 'weekly' as const : 'monthly' as const,
      priority: route[locale] === `/${locale}` ? 1 : 0.8,
    }))
  })
}
