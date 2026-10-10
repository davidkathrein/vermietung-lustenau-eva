import Link from 'next/link'

import { Separator } from '@/components/ui/separator'
import { accommodationPath, type SiteLocale } from '@/lib/locale'
import type { Accommodation, SiteSetting } from '@/payload-types'

import type { SiteNavigationLink } from './SiteHeader'

export function SiteFooter({ accommodations, footerLinks, locale, settings, siteName }: {
  accommodations: Accommodation[]
  footerLinks: SiteNavigationLink[]
  locale: SiteLocale
  settings: SiteSetting
  siteName: string
}) {
  const footer = settings.footer
  const columnCount = 2 + Number(footerLinks.length > 0) + Number(Boolean(settings.contactEmail || settings.contactPhone))

  return <footer className="site-footer">
    <div className="site-container">
      <div className={`site-footer__top site-footer__top--${columnCount}`}>
        <div className="site-footer__brand">
          <p>{footer?.title || siteName}</p>
          {footer?.description && <div className="site-footer__description">{footer.description}</div>}
          {(settings.streetAddress || settings.postalCode || settings.city) && <address>{settings.streetAddress}<br />{settings.postalCode} {settings.city}</address>}
        </div>
        <div>
          <p className="site-footer__heading">{footer?.apartmentsHeading || (locale === 'de' ? 'Wohnungen' : 'Apartments')}</p>
          <ul>{accommodations.map((unit) => <li key={unit.id}><Link href={accommodationPath(locale, unit.slug)}>{unit.name}</Link></li>)}</ul>
        </div>
        {footerLinks.length > 0 && <div>
          <p className="site-footer__heading">{footer?.linksHeading || (locale === 'de' ? 'Weitere Seiten' : 'More pages')}</p>
          <ul>{footerLinks.map((link) => <li key={link.id ?? link.href}><Link href={link.href} target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noopener noreferrer' : undefined}>{link.label}</Link></li>)}</ul>
        </div>}
        {(settings.contactEmail || settings.contactPhone) && <div>
          <p className="site-footer__heading">{footer?.contactHeading || (locale === 'de' ? 'Kontakt' : 'Contact')}</p>
          {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}
          {settings.contactPhone && <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`}>{settings.contactPhone}</a>}
        </div>}
      </div>
      <Separator className="site-footer__rule" />
      <div className="site-footer__bottom"><p>© {new Date().getFullYear()} {footer?.copyrightText || siteName}</p><span>Lustenau · Vorarlberg</span></div>
    </div>
  </footer>
}
