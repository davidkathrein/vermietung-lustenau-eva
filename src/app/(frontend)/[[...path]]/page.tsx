import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AvailabilityDialog } from '@/components/site/AvailabilityDialog'
import { InquiryForm } from '@/components/site/InquiryForm'
import { apartmentHref, copy, paths } from '@/lib/site-copy'
import { getPublicSite, type Locale, type PublicApartment } from '@/lib/public-site'

type Route = 'home' | 'apartments' | 'apartment' | 'seminar' | 'contact' | 'imprint' | 'privacy'

function resolveRoute(path: string[]): { locale: Locale; route: Route; slug?: string } | null {
  const locale: Locale = path[0] === 'en' ? 'en' : 'de'
  const segments = locale === 'en' ? path.slice(1) : path
  const section = segments[0]
  if (segments.length === 0) return { locale, route: 'home' }
  if (segments.length === 1) {
    const route = Object.entries(paths[locale]).find(
      ([, value]) => value.split('/').at(-1) === section,
    )?.[0]
    if (route && route !== 'home') return { locale, route: route as Route }
  }
  if (segments.length === 2 && section === paths[locale].apartments.split('/').at(-1)) {
    return { locale, route: 'apartment', slug: segments[1] }
  }
  return null
}

function Photo({
  apartment,
  locale,
  className = '',
}: {
  apartment: PublicApartment
  locale: Locale
  className?: string
}) {
  const image = apartment.photos[0]
  return image ? (
    <div className={`property-photo ${className}`}>
      <Image src={image.url} alt={image.alt} width={1200} height={800} unoptimized />
    </div>
  ) : (
    <div
      className={`photo-placeholder ${className}`}
      role="img"
      aria-label={copy[locale].photosPending}
    >
      <span aria-hidden>✳</span>
    </div>
  )
}

function ApartmentCard({
  apartment,
  locale,
  index,
}: {
  apartment: PublicApartment
  locale: Locale
  index: number
}) {
  const t = copy[locale]
  return (
    <article className="apartment-card">
      <Link
        href={apartmentHref(locale, apartment.slug)}
        aria-label={`${apartment.name} ${t.detail}`}
      >
        <Photo apartment={apartment} locale={locale} />
      </Link>
      <div className="card-body">
        <div className="card-meta">
          <span>0{index + 1} / 03</span>
          <span>
            {apartment.sleeps} {t.people}
          </span>
        </div>
        <h3>
          <Link href={apartmentHref(locale, apartment.slug)}>{apartment.name}</Link>
        </h3>
        <p>{apartment.teaser}</p>
        <Link className="text-link" href={apartmentHref(locale, apartment.slug)}>
          {t.detail} <span aria-hidden>↗</span>
        </Link>
      </div>
    </article>
  )
}

function ApartmentGrid({ apartments, locale }: { apartments: PublicApartment[]; locale: Locale }) {
  return apartments.length ? (
    <div className="apartment-grid">
      {apartments.map((apartment, index) => (
        <ApartmentCard key={apartment.slug} apartment={apartment} locale={locale} index={index} />
      ))}
    </div>
  ) : (
    <p className="empty-state">
      {locale === 'de' ? 'Wohnungen werden gerade vorbereitet.' : 'Apartments are being prepared.'}
    </p>
  )
}

function SiteHeader({
  locale,
  title,
  route,
  slug,
}: {
  locale: Locale
  title: string
  route: Route
  slug?: string
}) {
  const t = copy[locale]
  const p = paths[locale]
  const other: Locale = locale === 'de' ? 'en' : 'de'
  const translated = route === 'apartment' ? apartmentHref(other, slug || '') : paths[other][route]
  return (
    <header className="site-header">
      <Link className="wordmark" href={p.home}>
        {title}
      </Link>
      <nav aria-label={locale === 'de' ? 'Hauptnavigation' : 'Main navigation'}>
        <Link href={p.apartments}>{t.apartments}</Link>
        <Link href={p.seminar}>{t.seminar}</Link>
        <Link href={p.contact}>{t.contact}</Link>
      </nav>
      <div className="header-actions">
        <Link className="locale-link" href={translated} hrefLang={other} lang={other}>
          {other.toUpperCase()}
        </Link>
        <Link className="button button-small" href={`${p.home}#anfrage`}>
          {t.inquire}
        </Link>
      </div>
    </header>
  )
}

function SiteFooter({ locale, title }: { locale: Locale; title: string }) {
  const p = paths[locale]
  const t = copy[locale]
  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" href={p.home}>
          {title}
        </Link>
        <p>Lustenau · Vorarlberg</p>
      </div>
      <nav aria-label="Footer">
        <Link href={p.apartments}>{t.apartments}</Link>
        <Link href={p.seminar}>{t.seminar}</Link>
        <Link href={p.contact}>{t.contact}</Link>
        <Link href={p.imprint}>{t.imprint}</Link>
        <Link href={p.privacy}>{t.privacy}</Link>
      </nav>
      <small>
        © {new Date().getFullYear()} {title}
      </small>
    </footer>
  )
}

function InquirySection({
  locale,
  apartments,
  initialSlugs = [],
  kind = 'stay',
}: {
  locale: Locale
  apartments: PublicApartment[]
  initialSlugs?: string[]
  kind?: 'stay' | 'seminar'
}) {
  const t = copy[locale]
  return (
    <section className="inquiry-section section-shell" id="anfrage">
      <div className="section-intro">
        <span className="eyebrow">{kind === 'seminar' ? t.seminar : t.inquire}</span>
        <h2>{t.inquiryHeading}</h2>
        <p>{t.inquiryText}</p>
      </div>
      <InquiryForm
        locale={locale}
        apartments={apartments}
        initialSlugs={initialSlugs}
        kind={kind}
      />
    </section>
  )
}

function Home({
  locale,
  apartments,
  heroTitle,
  heroText,
  address,
}: {
  locale: Locale
  apartments: PublicApartment[]
  heroTitle?: string | null
  heroText?: string | null
  address: string
}) {
  const t = copy[locale]
  return (
    <>
      <section className="hero section-shell">
        <div className="hero-copy">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{heroTitle || t.hero}</h1>
          <p>{heroText || t.intro}</p>
          <div className="hero-actions">
            <Link className="button" href="#anfrage">
              {t.inquire} <span aria-hidden>↗</span>
            </Link>
            <Link className="text-link" href={paths[locale].apartments}>
              {t.explore} <span aria-hidden>→</span>
            </Link>
            <AvailabilityDialog locale={locale} apartments={apartments} />
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-arch">
            <span>{locale === 'de' ? 'Ein Ort für Ihre Zeit.' : 'A place to make your own.'}</span>
          </div>
          <p>{locale === 'de' ? 'Bilder der Unterkunft folgen' : 'Property photos to follow'}</p>
        </div>
      </section>
      <section className="section-shell apartments-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / {t.apartments}</span>
            <h2>{t.homeHeading}</h2>
          </div>
          <p>{t.homeText}</p>
        </div>
        <ApartmentGrid apartments={apartments} locale={locale} />
        <Link className="text-link section-link" href={paths[locale].apartments}>
          {t.explore} <span aria-hidden>→</span>
        </Link>
      </section>
      <section className="story-band">
        <div className="section-shell story-inner">
          <span className="eyebrow">02 / {t.location}</span>
          <h2>
            {locale === 'de'
              ? 'Mittendrin und doch bei sich.'
              : 'Close to it all. Space to yourself.'}
          </h2>
          <div>
            <p>{t.locationText}</p>
            <p>{address}</p>
          </div>
        </div>
      </section>
      <section className="section-shell split-promo">
        <div>
          <span className="eyebrow">03 / {t.seminar}</span>
          <h2>{t.seminarHeading}</h2>
          <p>{t.seminarIntro}</p>
          <Link className="text-link" href={paths[locale].seminar}>
            {t.seminar} <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className="promo-mark" aria-hidden>
          ✳
        </div>
      </section>
      <InquirySection locale={locale} apartments={apartments} />
    </>
  )
}

function Apartments({ locale, apartments }: { locale: Locale; apartments: PublicApartment[] }) {
  const t = copy[locale]
  return (
    <>
      <section className="page-heading section-shell">
        <span className="eyebrow">01 / {t.apartments}</span>
        <h1>{t.apartmentHeading}</h1>
        <p>{t.apartmentIntro}</p>
        <AvailabilityDialog locale={locale} apartments={apartments} />
      </section>
      <section className="section-shell listing-section">
        <ApartmentGrid apartments={apartments} locale={locale} />
      </section>
      <section className="story-band">
        <div className="section-shell whole-house">
          <span className="eyebrow">{t.wholeHouse}</span>
          <h2>{t.wholeHouse}</h2>
          <p>{t.wholeHouseText}</p>
          <Link className="button" href="#anfrage">
            {t.inquire} <span aria-hidden>↗</span>
          </Link>
        </div>
      </section>
      <InquirySection locale={locale} apartments={apartments} />
    </>
  )
}

function ApartmentDetail({
  locale,
  apartment,
  apartments,
}: {
  locale: Locale
  apartment: PublicApartment
  apartments: PublicApartment[]
}) {
  const t = copy[locale]
  return (
    <>
      <section className="detail-hero section-shell">
        <div>
          <Link className="back-link" href={paths[locale].apartments}>
            ← {t.apartments}
          </Link>
          <span className="eyebrow">{t.detail}</span>
          <h1>{apartment.name}</h1>
          <p>{apartment.teaser}</p>
          <div className="detail-facts">
            <span>
              {apartment.sleeps} {t.people}
            </span>
            {apartment.sizeSqm && <span>{apartment.sizeSqm} m²</span>}
            <span>{t.kitchen}</span>
          </div>
          <div className="hero-actions">
            <Link className="button" href="#anfrage">
              {t.inquire} <span aria-hidden>↗</span>
            </Link>
            <AvailabilityDialog
              locale={locale}
              apartments={apartments}
              selectedSlug={apartment.slug}
            />
          </div>
        </div>
        <Photo apartment={apartment} locale={locale} className="detail-photo" />
      </section>
      <section className="section-shell detail-content">
        <div>
          <span className="eyebrow">{apartment.name}</span>
          <h2>
            {locale === 'de' ? 'Alles, was Sie wissen möchten.' : 'Everything you need to know.'}
          </h2>
          <p>{apartment.description || apartment.teaser}</p>
          {apartment.bedSetup && <p>{apartment.bedSetup}</p>}
          {apartment.seminarCapable && (
            <Link className="text-link" href={paths[locale].seminar}>
              {t.seminar} <span aria-hidden>↗</span>
            </Link>
          )}
        </div>
        <div className="floorplan">
          {apartment.floorplan ? (
            <Image
              src={apartment.floorplan.url}
              alt={apartment.floorplan.alt}
              width={700}
              height={500}
              unoptimized
            />
          ) : (
            <>
              <span aria-hidden>⌗</span>
              <p>{t.planPending}</p>
            </>
          )}
        </div>
      </section>
      {apartment.photos.length > 1 && (
        <section className="section-shell gallery-grid">
          {apartment.photos.slice(1).map((photo) => (
            <Image
              key={photo.url}
              src={photo.url}
              alt={photo.alt}
              width={900}
              height={700}
              unoptimized
            />
          ))}
        </section>
      )}
      <InquirySection locale={locale} apartments={apartments} initialSlugs={[apartment.slug]} />
    </>
  )
}

function Seminar({ locale, apartments }: { locale: Locale; apartments: PublicApartment[] }) {
  const t = copy[locale]
  const room = apartments.find((unit) => unit.seminarCapable)
  return (
    <>
      <section className="page-heading section-shell">
        <span className="eyebrow">{t.seminar}</span>
        <h1>{t.seminarHeading}</h1>
        <p>{t.seminarIntro}</p>
        <div className="hero-actions">
          <Link className="button" href="#anfrage">
            {locale === 'de' ? 'Seminar anfragen' : 'Request a seminar'} <span aria-hidden>↗</span>
          </Link>
          {room && (
            <AvailabilityDialog
              locale={locale}
              apartments={apartments}
              selectedSlug={room.slug}
              seminar
            />
          )}
        </div>
      </section>
      <section className="section-shell seminar-feature">
        <div className="feature-illustration">
          <span aria-hidden>✳</span>
        </div>
        <div>
          <span className="eyebrow">
            {locale === 'de' ? 'Ein Raum · zwei Möglichkeiten' : 'One room · two uses'}
          </span>
          <h2>
            {locale === 'de'
              ? 'Zusammenkommen mit Raum für Ideen.'
              : 'Come together with room for ideas.'}
          </h2>
          <p>
            {locale === 'de'
              ? 'Für bis zu zehn Teilnehmende, mit kleiner Küche und vorhandener Ausstattung. Termine vergeben wir nach persönlicher Prüfung.'
              : 'For up to ten participants, with a small kitchen and existing equipment. Dates are confirmed after a personal check.'}
          </p>
        </div>
      </section>
      {room && (
        <InquirySection
          locale={locale}
          apartments={apartments}
          initialSlugs={[room.slug]}
          kind="seminar"
        />
      )}
    </>
  )
}

function Contact({
  locale,
  address,
  email,
  phone,
}: {
  locale: Locale
  address: string
  email?: string | null
  phone?: string | null
}) {
  const t = copy[locale]
  return (
    <section className="page-heading section-shell contact-page">
      <span className="eyebrow">{t.contact}</span>
      <h1>{t.contactHeading}</h1>
      <p>{t.contactIntro}</p>
      <div className="contact-grid">
        <div>
          <h2>{locale === 'de' ? 'Adresse' : 'Address'}</h2>
          <p>{address}</p>
          {email && (
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
          {phone && (
            <p>
              <a href={`tel:${phone}`}>{phone}</a>
            </p>
          )}
        </div>
        <div>
          <h2>{locale === 'de' ? 'Ihr Aufenthalt' : 'Your stay'}</h2>
          <p>
            {locale === 'de'
              ? 'Sie haben schon einen Zeitraum im Sinn?'
              : 'Already have dates in mind?'}
          </p>
          <Link className="button" href={`${paths[locale].apartments}#anfrage`}>
            {t.inquire} <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default async function PublicPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const parsed = resolveRoute(path)
  if (!parsed) notFound()
  const { locale, route, slug } = parsed
  const { settings, apartments } = await getPublicSite(locale)
  const t = copy[locale]
  const title = settings.siteName || (locale === 'de' ? 'Wohnen in Lustenau' : 'Stay in Lustenau')
  const address = [
    settings.streetAddress,
    [settings.postalCode, settings.city].filter(Boolean).join(' '),
    settings.country,
  ]
    .filter(Boolean)
    .join(', ')
  const apartment =
    route === 'apartment' ? apartments.find((unit) => unit.slug === slug) : undefined
  if (route === 'apartment' && !apartment) notFound()

  return (
    <div className="site" lang={locale}>
      <SiteHeader locale={locale} title={title} route={route} slug={slug} />
      <main>
        {route === 'home' && (
          <Home
            locale={locale}
            apartments={apartments}
            heroTitle={settings.heroTitle}
            heroText={settings.heroText}
            address={address}
          />
        )}
        {route === 'apartments' && <Apartments locale={locale} apartments={apartments} />}
        {route === 'apartment' && apartment && (
          <ApartmentDetail locale={locale} apartment={apartment} apartments={apartments} />
        )}
        {route === 'seminar' && <Seminar locale={locale} apartments={apartments} />}
        {route === 'contact' && (
          <Contact
            locale={locale}
            address={address}
            email={settings.contactEmail}
            phone={settings.contactPhone}
          />
        )}
        {(route === 'imprint' || route === 'privacy') && (
          <section className="page-heading section-shell legal-page">
            <span className="eyebrow">{route === 'imprint' ? t.imprint : t.privacy}</span>
            <h1>{route === 'imprint' ? t.imprint : t.privacy}</h1>
            <p>{t.legalPending}</p>
          </section>
        )}
      </main>
      <SiteFooter locale={locale} title={title} />
    </div>
  )
}
