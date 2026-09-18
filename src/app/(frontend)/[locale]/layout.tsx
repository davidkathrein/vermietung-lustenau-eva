import { Fraunces, Sora } from 'next/font/google'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
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

  return (
    <html lang={locale} className={`${heading.variable} ${body.variable}`}>
      <body>
        <div className="flex min-h-svh flex-col">
          <header className="border-b border-border/70 bg-background/95">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8">
              <Link href={`/${locale}`} className="font-heading text-xl tracking-tight md:text-2xl">{siteName}</Link>
              <nav aria-label={locale === 'de' ? 'Hauptnavigation' : 'Main navigation'} className="flex flex-wrap items-center gap-1">
                {settings.navigation?.map((row) => {
                  const href = hrefForLink(row.link, locale)
                  if (!href || !row.link?.label) return null
                  return <Link key={row.id} href={href} className={buttonVariants({ variant: 'ghost', size: 'sm' })} target={row.link.newTab ? '_blank' : undefined} rel={row.link.newTab ? 'noopener noreferrer' : undefined}>{row.link.label}</Link>
                })}
                <Link href={locale === 'de' ? '/en' : '/de'} className={buttonVariants({ variant: 'outline', size: 'sm' })} hrefLang={locale === 'de' ? 'en' : 'de'}>{locale === 'de' ? 'EN' : 'DE'}</Link>
              </nav>
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="bg-primary py-12 text-primary-foreground">
            <div className={`mx-auto grid max-w-7xl gap-10 px-5 md:px-8 ${footerLinks.length ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div><p className="font-heading text-2xl">{footer?.title || siteName}</p>{footer?.description && <p className="mt-3 whitespace-pre-line text-sm opacity-80">{footer.description}</p>}<p className="mt-3 text-sm opacity-80">{settings.streetAddress}<br />{settings.postalCode} {settings.city}</p></div>
              <div><p className="mb-3 text-sm font-semibold uppercase tracking-widest opacity-70">{footer?.apartmentsHeading || (locale === 'de' ? 'Wohnungen' : 'Apartments')}</p><ul className="space-y-2">{accommodations.map((unit) => <li key={unit.id}><Link href={accommodationPath(locale, unit.slug)} className="text-sm hover:underline">{unit.name}</Link></li>)}</ul></div>
              {footerLinks.length > 0 && <div><p className="mb-3 text-sm font-semibold uppercase tracking-widest opacity-70">{footer?.linksHeading || (locale === 'de' ? 'Weitere Seiten' : 'More pages')}</p><ul className="space-y-2">{footerLinks.map((link) => <li key={link.id}><Link href={link.href} className="text-sm hover:underline" target={link.newTab ? '_blank' : undefined} rel={link.newTab ? 'noopener noreferrer' : undefined}>{link.label}</Link></li>)}</ul></div>}
              <div><p className="mb-3 text-sm font-semibold uppercase tracking-widest opacity-70">{footer?.contactHeading || (locale === 'de' ? 'Kontakt' : 'Contact')}</p>{settings.contactEmail && <a href={`mailto:${settings.contactEmail}`} className="block text-sm hover:underline">{settings.contactEmail}</a>}{settings.contactPhone && <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`} className="mt-2 block text-sm hover:underline">{settings.contactPhone}</a>}</div>
            </div>
            <div className="mx-auto mt-10 max-w-7xl px-5 md:px-8"><Separator className="opacity-20" /><p className="mt-5 text-xs opacity-65">© {new Date().getFullYear()} {footer?.copyrightText || siteName}</p></div>
          </footer>
        </div>
      </body>
    </html>
  )
}
