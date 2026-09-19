import { Figtree, Lora } from 'next/font/google'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { LanguageSwitcher, LanguageSwitcherFallback } from '@/components/site/LanguageSwitcher'
import { MobileNavigation } from '@/components/site/MobileNavigation'
import { ScrollAwareHeader } from '@/components/site/ScrollAwareHeader'
import { ButtonLink } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { hrefForLink } from '@/lib/href'
import { accommodationPath, isSiteLocale, pagePath } from '@/lib/locale'
import { getPublicAccommodations, getPublicContactPage, getPublicLocalizedRoutes, getPublicSettings } from '@/lib/public-content'

import '../styles.css'

const heading = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
const body = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isSiteLocale(locale)) notFound()
  const [settings, accommodations, contactPage, localizedRoutes] = await Promise.all([getPublicSettings(locale), getPublicAccommodations(locale), getPublicContactPage(locale), getPublicLocalizedRoutes()])
  const siteName = settings.siteName || 'Wohnen in Lustenau'
  const footer = settings.footer
  const footerLinks = footer?.links?.flatMap((row) => {
    const href = hrefForLink(row.link, locale)
    return href && row.link?.label ? [{ id: row.id, href, label: row.link.label, newTab: row.link.newTab }] : []
  }) || []
  const footerColumnCount = 2 + Number(footerLinks.length > 0) + Number(Boolean(settings.contactEmail || settings.contactPhone))
  const navigationLinks = settings.navigation?.flatMap((row) => {
    const href = hrefForLink(row.link, locale)
    return href && row.link?.label ? [{ id: row.id, href, label: row.link.label, newTab: row.link.newTab }] : []
  }) || []
  const inquiryHref = contactPage ? `${pagePath(locale, contactPage.internalName, contactPage.slug)}#anfrage` : null

  return (
    <html lang={locale} className={`${heading.variable} ${body.variable}`}>
      <body>
        <div className="flex min-h-svh flex-col">
          <ScrollAwareHeader>
            <div className="site-container site-header__inner">
              <Link href={`/${locale}`} className="site-brand"><span>{siteName}</span><small>Lustenau · Vorarlberg</small></Link>
              <nav aria-label={locale === 'de' ? 'Hauptnavigation' : 'Main navigation'} className="site-nav">
                {navigationLinks.map((link) => <Link key={link.id} href={link.href} className="site-nav__link" target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noopener noreferrer' : undefined}>{link.label}</Link>)}
              </nav>
              <Suspense fallback={<LanguageSwitcherFallback locale={locale} />}>
                <LanguageSwitcher locale={locale} routes={localizedRoutes} />
              </Suspense>
              {inquiryHref && <ButtonLink href={inquiryHref} size="sm" className="site-booking-cta" aria-label={locale === 'de' ? 'Buchung anfragen' : 'Request booking'}>{locale === 'de' ? 'Buchung anfragen' : 'Request booking'}</ButtonLink>}
              <MobileNavigation openLabel={locale === 'de' ? 'Menü öffnen' : 'Open menu'} closeLabel={locale === 'de' ? 'Menü schließen' : 'Close menu'}>
                <nav aria-label={locale === 'de' ? 'Mobile Hauptnavigation' : 'Mobile main navigation'} className="site-mobile-menu__nav">
                  {navigationLinks.map((link) => <Link key={link.id} href={link.href} target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noopener noreferrer' : undefined}>{link.label}</Link>)}
                </nav>
                <div className="site-mobile-menu__footer">
                  <Suspense fallback={<LanguageSwitcherFallback locale={locale} />}>
                    <LanguageSwitcher locale={locale} routes={localizedRoutes} />
                  </Suspense>
                  {inquiryHref && <ButtonLink href={inquiryHref} size="lg" className="site-mobile-menu__cta">{locale === 'de' ? 'Buchung anfragen' : 'Request booking'}</ButtonLink>}
                </div>
              </MobileNavigation>
            </div>
          </ScrollAwareHeader>
          <div className="flex-1">{children}</div>
          <footer className="site-footer">
            <div className="site-container">
              <div className={`site-footer__top site-footer__top--${footerColumnCount}`}>
                <div className="site-footer__brand"><p>{footer?.title || siteName}</p>{footer?.description && <div className="site-footer__description">{footer.description}</div>}{(settings.streetAddress || settings.postalCode || settings.city) && <address>{settings.streetAddress}<br />{settings.postalCode} {settings.city}</address>}</div>
                <div><p className="site-footer__heading">{footer?.apartmentsHeading || (locale === 'de' ? 'Wohnungen' : 'Apartments')}</p><ul>{accommodations.map((unit) => <li key={unit.id}><Link href={accommodationPath(locale, unit.slug)}>{unit.name}</Link></li>)}</ul></div>
                {footerLinks.length > 0 && <div><p className="site-footer__heading">{footer?.linksHeading || (locale === 'de' ? 'Weitere Seiten' : 'More pages')}</p><ul>{footerLinks.map((link) => <li key={link.id}><Link href={link.href} target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noopener noreferrer' : undefined}>{link.label}</Link></li>)}</ul></div>}
                {(settings.contactEmail || settings.contactPhone) && <div><p className="site-footer__heading">{footer?.contactHeading || (locale === 'de' ? 'Kontakt' : 'Contact')}</p>{settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}{settings.contactPhone && <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`}>{settings.contactPhone}</a>}</div>}
              </div>
              <Separator className="site-footer__rule" />
              <div className="site-footer__bottom"><p>© {new Date().getFullYear()} {footer?.copyrightText || siteName}</p><span>Lustenau · Vorarlberg</span></div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
