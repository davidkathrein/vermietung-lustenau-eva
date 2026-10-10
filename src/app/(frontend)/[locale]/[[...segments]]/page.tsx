import config from '@payload-config'
import type { Metadata } from 'next'
import { cookies, draftMode, headers } from 'next/headers'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPayload } from 'payload'

import { InquiryForm } from '@/components/site/InquiryForm'
import { LivePage } from '@/components/site/LivePage'
import { AccommodationGallery } from '@/components/site/AccommodationGallery'
import { PageBlocks } from '@/components/site/PageBlocks'
import { Badge } from '@/components/ui/badge'
import { Button, ButtonLink } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowUpRightIcon } from '@/components/ui/link-icons'
import { accommodationPath, apartmentBase, isSiteLocale, pagePath, type SiteLocale } from '@/lib/locale'
import { publicImage } from '@/lib/media'
import { getPublicAccommodationBySlug, getPublicAccommodations, getPublicHomepage, getPublicLocalizedRoutes, getPublicPageBySlug, getRedirectTarget } from '@/lib/public-content'
import { isSiteIndexable } from '@/lib/site-url'
import type { Accommodation, Page } from '@/payload-types'

type Props = { params: Promise<{ locale: string; segments?: string[] }> }

async function previewPage(id: string, locale: SiteLocale): Promise<Page | null> {
  const [draft, cookieStore, requestHeaders] = await Promise.all([draftMode(), cookies(), headers()])
  if (!draft.isEnabled || cookieStore.get('preview-page-id')?.value !== id || !/^\d+$/.test(id)) return null
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: requestHeaders }).catch(() => null)
  if (!auth?.user) return null
  return payload.findByID({ collection: 'pages', id: Number(id), locale, fallbackLocale: false, draft: true, depth: 2, user: auth.user, overrideAccess: false }).catch(() => null)
}

async function resolveContent(locale: SiteLocale, segments: string[]): Promise<{ type: 'page'; page: Page; preview: boolean } | { type: 'accommodation'; accommodation: Accommodation } | null> {
  if (segments[0] === '__preview' && segments.length === 2) {
    const page = await previewPage(segments[1], locale)
    return page ? { type: 'page', page, preview: true } : null
  }
  if (segments.length === 0) {
    const page = await getPublicHomepage(locale)
    return page ? { type: 'page', page, preview: false } : null
  }
  if (segments.length === 2 && segments[0] === apartmentBase(locale)) {
    const accommodation = await getPublicAccommodationBySlug(locale, segments[1])
    return accommodation ? { type: 'accommodation', accommodation } : null
  }
  if (segments.length === 1) {
    const page = await getPublicPageBySlug(locale, segments[0])
    return page ? { type: 'page', page, preview: false } : null
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, segments = [] } = await params
  if (!isSiteLocale(locale)) return {}
  const content = await resolveContent(locale, segments)
  if (!content) return { robots: { index: false, follow: false } }
  const siteIndexable = isSiteIndexable()
  const currentPath = content.type === 'accommodation'
    ? accommodationPath(locale, content.accommodation.slug)
    : pagePath(locale, content.page.internalName, content.page.slug)
  const route = content.type === 'page' && content.preview
    ? undefined
    : (await getPublicLocalizedRoutes()).find((candidate) => candidate[locale] === currentPath)
  const alternates = content.type === 'page' && content.preview ? undefined : {
    canonical: currentPath,
    languages: route ? { de: route.de, en: route.en, 'x-default': route.de } : undefined,
  }
  if (content.type === 'accommodation') {
    return {
      title: content.accommodation.name,
      description: content.accommodation.teaser,
      alternates,
      robots: { index: siteIndexable, follow: siteIndexable },
      openGraph: { title: content.accommodation.name, description: content.accommodation.teaser, url: currentPath, locale },
    }
  }
  return {
    title: content.page.seo?.metaTitle || content.page.title,
    description: content.page.seo?.metaDescription,
    alternates,
    robots: content.preview ? { index: false, follow: false } : { index: siteIndexable, follow: siteIndexable },
    openGraph: {
      title: content.page.seo?.metaTitle || content.page.title,
      description: content.page.seo?.metaDescription || undefined,
      url: currentPath,
      locale,
      images: content.page.seo?.image && typeof content.page.seo.image === 'object' && content.page.seo.image.url ? [content.page.seo.image.url] : undefined,
    },
  }
}

export default async function ContentPage({ params }: Props) {
  const { locale, segments = [] } = await params
  if (!isSiteLocale(locale)) notFound()
  const content = await resolveContent(locale, segments)
  if (!content) {
    const oldPath = `/${locale}${segments.length ? `/${segments.join('/')}` : ''}`
    const target = await getRedirectTarget(oldPath, locale)
    if (target && target !== oldPath) permanentRedirect(target)
    notFound()
  }
  const accommodations = await getPublicAccommodations(locale)

  if (content.type === 'page') {
    if (content.preview) {
      const requestHeaders = await headers()
      const host = requestHeaders.get('host') || 'localhost:3000'
      const protocol = requestHeaders.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
      return <><div className="flex items-center justify-between bg-brand-accent px-5 py-2 text-xs font-semibold text-brand-accent-foreground"><span>{locale === 'de' ? 'Entwurfsvorschau' : 'Draft preview'}</span><form action="/api/preview/exit" method="post"><Button type="submit" variant="link" size="sm">{locale === 'de' ? 'Vorschau verlassen' : 'Exit preview'}</Button></form></div><LivePage initialPage={content.page} locale={locale} accommodations={accommodations} serverURL={`${protocol}://${host}`} /></>
    }
    return <PageBlocks page={content.page} locale={locale} accommodations={accommodations} />
  }

  const unit = content.accommodation
  const gallery = unit.gallery?.flatMap((row, index) => {
    const image = row.image
    if (!image || typeof image !== 'object' || !image.url) return []
    const responsiveImage = publicImage(image, unit.name)
    return responsiveImage ? [{ id: String(row.id ?? `${image.id}-${index}`), ...responsiveImage, caption: image.caption }] : []
  }) ?? []
  const floorplan = typeof unit.floorplan === 'object' && unit.floorplan?.url ? unit.floorplan : null
  return <main id="main-content">
    <div className="site-room site-container">
      <Link href={`/${locale}/${apartmentBase(locale)}`} className="site-back"><ArrowLeftIcon aria-hidden="true" />{locale === 'de' ? 'Alle Wohnungen' : 'All apartments'}</Link>
      <div className="site-room__heading">
        <div><p className="site-eyebrow">{locale === 'de' ? 'Wohnen in Lustenau' : 'Stay in Lustenau'}</p><h1>{unit.name}</h1></div>
        <div className="site-room__lead"><p>{unit.teaser}</p><div className="site-room__badges"><Badge variant="outline">{locale === 'de' ? `Bis zu ${unit.sleeps} Personen` : `Up to ${unit.sleeps} guests`}</Badge>{unit.sizeSqm && <Badge variant="outline">{unit.sizeSqm} m²</Badge>}{unit.seminarCapable && <Badge variant="outline">{locale === 'de' ? 'Auch als Seminarraum' : 'Also for seminars'}</Badge>}</div></div>
      </div>
      {gallery.length ? <AccommodationGallery images={gallery} locale={locale} name={unit.name} /> : <div className="site-room__placeholder">{unit.name}</div>}
      <div className="site-room__details">
        <div><p className="site-eyebrow">{locale === 'de' ? 'Der Raum' : 'The space'}</p>{unit.description && <p className="site-room__description">{unit.description}</p>}</div>
        <div className="site-room__summary"><p className="site-room__summary-label">{locale === 'de' ? 'Auf einen Blick' : 'At a glance'}</p><dl><div><dt>{locale === 'de' ? 'Gäste' : 'Guests'}</dt><dd>{locale === 'de' ? `Bis zu ${unit.sleeps} Personen` : `Up to ${unit.sleeps} guests`}</dd></div>{unit.sizeSqm && <div><dt>{locale === 'de' ? 'Größe' : 'Size'}</dt><dd>{unit.sizeSqm} m²</dd></div>}{unit.bedSetup && <div><dt>{locale === 'de' ? 'Schlafplätze' : 'Sleeping arrangements'}</dt><dd>{unit.bedSetup}</dd></div>}{unit.seminarCapable && unit.seminarCapacity && <div><dt>{locale === 'de' ? 'Seminar' : 'Seminar'}</dt><dd>{locale === 'de' ? `Bis zu ${unit.seminarCapacity} Personen` : `Up to ${unit.seminarCapacity} people`}</dd></div>}</dl><div className="site-room__summary-actions"><ButtonLink href="#anfrage" size="lg" className="site-action">{locale === 'de' ? 'Anfrage senden' : 'Send inquiry'}<ArrowUpRightIcon aria-hidden="true" /></ButtonLink>{floorplan && <ButtonLink href={floorplan.url!} target="_blank" rel="noopener noreferrer" variant="outline" size="lg" className="site-action">{locale === 'de' ? 'Grundriss ansehen' : 'View floor plan'}<span className="sr-only"> ({locale === 'de' ? 'öffnet in neuem Tab' : 'opens in a new tab'})</span><ArrowUpRightIcon aria-hidden="true" /></ButtonLink>}</div></div>
      </div>
    </div>
    <section id="anfrage" className="site-inquiry site-section"><div className="site-container"><div className="site-section-intro"><p className="site-eyebrow">{locale === 'de' ? 'Unverbindlich anfragen' : 'No-obligation inquiry'}</p><h2>{locale === 'de' ? 'Verfügbarkeit und Anfrage' : 'Availability and inquiry'}</h2></div><InquiryForm locale={locale} accommodations={accommodations} mode={unit.seminarCapable ? 'both' : 'stay'} preselectedAccommodation={unit.slug} /></div></section>
  </main>
}
