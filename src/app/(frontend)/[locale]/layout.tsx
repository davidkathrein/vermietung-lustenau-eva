import type { Metadata } from 'next'
import { Figtree, Lora } from 'next/font/google'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { hrefForLink } from '@/lib/href'
import { isSiteLocale, pagePath } from '@/lib/locale'
import { getPublicAccommodations, getPublicContactPage, getPublicLocalizedRoutes, getPublicSettings } from '@/lib/public-content'
import { getSiteURL } from '@/lib/site-url'

import '../styles.css'

const heading = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
const body = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: getSiteURL(),
  applicationName: 'Wohnen in Lustenau',
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isSiteLocale(locale)) {
    return <html lang="de" className={`${heading.variable} ${body.variable}`}><body>{children}</body></html>
  }
  const [settings, accommodations, contactPage, localizedRoutes] = await Promise.all([getPublicSettings(locale), getPublicAccommodations(locale), getPublicContactPage(locale), getPublicLocalizedRoutes()])
  const siteName = settings.siteName || 'Wohnen in Lustenau'
  const footerLinks = settings.footer?.links?.flatMap((row) => {
    const href = hrefForLink(row.link, locale)
    return href && row.link?.label ? [{ id: row.id, href, label: row.link.label, newTab: row.link.newTab }] : []
  }) || []
  const navigationLinks = settings.navigation?.flatMap((row) => {
    const href = hrefForLink(row.link, locale)
    return href && row.link?.label ? [{ id: row.id, href, label: row.link.label, newTab: row.link.newTab }] : []
  }) || []
  const inquiryHref = contactPage ? `${pagePath(locale, contactPage.internalName, contactPage.slug)}#anfrage` : null

  return (
    <html lang={locale} className={`${heading.variable} ${body.variable}`}>
      <body>
        <div className="flex min-h-svh flex-col">
          <SiteHeader inquiryHref={inquiryHref} locale={locale} navigationLinks={navigationLinks} routes={localizedRoutes} siteName={siteName} />
          <div className="flex-1">{children}</div>
          <SiteFooter accommodations={accommodations} footerLinks={footerLinks} locale={locale} settings={settings} siteName={siteName} />
        </div>
      </body>
    </html>
  )
}
