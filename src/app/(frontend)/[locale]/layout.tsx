import { Fraunces, Sora } from 'next/font/google'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { hrefForLink } from '@/lib/href'
import { accommodationPath, isSiteLocale } from '@/lib/locale'
import { getPublicAccommodations, getPublicSettings } from '@/lib/public-content'

import '../styles.css'

const heading = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const body = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isSiteLocale(locale)) notFound()
  const [settings, accommodations] = await Promise.all([getPublicSettings(locale), getPublicAccommodations(locale)])
  const siteName = settings.siteName || 'Wohnen in Lustenau'
  const footer = settings.footer
  const footerLinks = footer?.links?.flatMap((row) => {
    const href = hrefForLink(row.link, locale)
    return href && row.link?.label ? [{ id: row.id, href, label: row.link.label, newTab: row.link.newTab }] : []
  }) || []
  const footerColumnCount = 2 + Number(footerLinks.length > 0) + Number(Boolean(settings.contactEmail || settings.contactPhone))

  return (
    <html lang={locale} className={`${heading.variable} ${body.variable}`}>
      <body>
        <div className="flex min-h-svh flex-col">
          <header className="site-header">
            <div className="site-container site-header__inner">
              <Link href={`/${locale}`} className="site-brand"><span>{siteName}</span><small>Lustenau · Vorarlberg</small></Link>
              <nav aria-label={locale === 'de' ? 'Hauptnavigation' : 'Main navigation'} className="site-nav">
                {settings.navigation?.map((row) => {
                  const href = hrefForLink(row.link, locale)
                  if (!href || !row.link?.label) return null
                  return <Link key={row.id} href={href} className="site-nav__link" target={row.link.newTab ? '_blank' : undefined} rel={row.link.newTab ? 'noopener noreferrer' : undefined}>{row.link.label}</Link>
                })}
              </nav>
              <Link href={locale === 'de' ? '/en' : '/de'} className="site-language" hrefLang={locale === 'de' ? 'en' : 'de'} aria-label={locale === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}>{locale === 'de' ? 'EN' : 'DE'}</Link>
            </div>
          </header>
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
