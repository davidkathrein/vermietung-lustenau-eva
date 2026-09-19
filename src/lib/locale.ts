export type SiteLocale = 'de' | 'en'

export function isSiteLocale(value: string): value is SiteLocale {
  return value === 'de' || value === 'en'
}

export function apartmentBase(locale: SiteLocale): string {
  return locale === 'de' ? 'wohnungen' : 'apartments'
}

export function pagePath(locale: SiteLocale, internalName: string, slug: string): string {
  return internalName === 'homepage' ? `/${locale}` : `/${locale}/${encodeURIComponent(slug)}`
}

export function accommodationPath(locale: SiteLocale, slug: string): string {
  return `/${locale}/${apartmentBase(locale)}/${encodeURIComponent(slug)}`
}
