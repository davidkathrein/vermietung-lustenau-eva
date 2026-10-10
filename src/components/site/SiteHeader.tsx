import Link from 'next/link'
import { Suspense } from 'react'

import { ButtonLink } from '@/components/ui/button'
import type { LocalizedRoute, SiteLocale } from '@/lib/locale'

import { LanguageSwitcher, LanguageSwitcherFallback } from './LanguageSwitcher'
import { MobileNavigation } from './MobileNavigation'
import { ScrollAwareHeader } from './ScrollAwareHeader'

export type SiteNavigationLink = {
  id?: string | null
  href: string
  label: string
  newTab?: boolean | null
}

export function SiteHeader({ inquiryHref, locale, navigationLinks, routes, siteName }: {
  inquiryHref: string | null
  locale: SiteLocale
  navigationLinks: SiteNavigationLink[]
  routes: LocalizedRoute[]
  siteName: string
}) {
  const inquiryLabel = locale === 'de' ? 'Anfrage senden' : 'Send inquiry'

  return <>
    <a href="#main-content" className="site-skip-link">{locale === 'de' ? 'Zum Inhalt springen' : 'Skip to content'}</a>
    <ScrollAwareHeader>
      <div className="site-container site-header__inner">
        <Link href={`/${locale}`} className="site-brand"><span>{siteName}</span><small>Lustenau · Vorarlberg</small></Link>
        <nav aria-label={locale === 'de' ? 'Hauptnavigation' : 'Main navigation'} className="site-nav">
          {navigationLinks.map((link) => <Link key={link.id ?? link.href} href={link.href} className="site-nav__link" target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noopener noreferrer' : undefined}>{link.label}</Link>)}
        </nav>
        <Suspense fallback={<LanguageSwitcherFallback locale={locale} />}>
          <LanguageSwitcher locale={locale} routes={routes} />
        </Suspense>
        {inquiryHref && <ButtonLink href={inquiryHref} size="sm" className="site-inquiry-cta">{inquiryLabel}</ButtonLink>}
        <MobileNavigation openLabel={locale === 'de' ? 'Menü öffnen' : 'Open menu'} closeLabel={locale === 'de' ? 'Menü schließen' : 'Close menu'}>
          <nav aria-label={locale === 'de' ? 'Mobile Hauptnavigation' : 'Mobile main navigation'} className="site-mobile-menu__nav">
            {navigationLinks.map((link) => <Link key={link.id ?? link.href} href={link.href} target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noopener noreferrer' : undefined}>{link.label}</Link>)}
          </nav>
          <div className="site-mobile-menu__footer">
            <Suspense fallback={<LanguageSwitcherFallback locale={locale} />}>
              <LanguageSwitcher locale={locale} routes={routes} />
            </Suspense>
            {inquiryHref && <ButtonLink href={inquiryHref} size="lg" className="site-mobile-menu__cta">{inquiryLabel}</ButtonLink>}
          </div>
        </MobileNavigation>
      </div>
    </ScrollAwareHeader>
  </>
}
