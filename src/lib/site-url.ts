function configuredSiteURL(): URL | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (!configured) return null

  try {
    const url = new URL(/^https?:\/\//.test(configured) ? configured : `https://${configured}`)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

export function getSiteURL(): URL {
  return configuredSiteURL() ?? new URL('http://localhost:3000')
}

export function hasCanonicalSiteURL(): boolean {
  return configuredSiteURL() !== null
}

export function isSiteIndexable(): boolean {
  if (!configuredSiteURL() || process.env.NODE_ENV !== 'production') return false
  return !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production'
}

export function absoluteSiteURL(path = '/'): string {
  return new URL(path, getSiteURL()).toString()
}
