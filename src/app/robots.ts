import type { MetadataRoute } from 'next'

import { absoluteSiteURL, getSiteURL, isSiteIndexable } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  if (!isSiteIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin-', '/api/internal/', '/api/preview/', '/api/public-inquiries'],
    },
    sitemap: absoluteSiteURL('/sitemap.xml'),
    host: getSiteURL().origin,
  }
}
