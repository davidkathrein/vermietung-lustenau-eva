import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRightIcon } from '@/components/ui/link-icons'
import { accommodationPath, type SiteLocale } from '@/lib/locale'
import type { Accommodation } from '@/payload-types'

import { MediaFigure } from './MediaFigure'

export function AccommodationCard({ locale, unit, index }: { locale: SiteLocale; unit: Accommodation; index: number }) {
  return <Link
    href={accommodationPath(locale, unit.slug)}
    className="site-stay-card-link"
    aria-label={`${unit.name} ${locale === 'de' ? 'ansehen' : 'view'}`}
  >
    <Card className="site-stay-card">
      {unit.gallery?.[0]?.image
        ? <MediaFigure media={unit.gallery[0].image} className="site-stay-card__media" sizes="(max-width: 760px) calc(100vw - 2rem), (max-width: 1024px) 50vw, 33vw" />
        : <div className="site-stay-card__fallback"><span>0{index + 1}</span></div>}
      <CardHeader className="site-stay-card__header">
        <p className="site-stay-card__index">{locale === 'de' ? 'Wohnung' : 'Apartment'} 0{index + 1}</p>
        <CardTitle>{unit.name}</CardTitle>
        <div className="site-stay-card__badges">
          <Badge variant="outline" className="site-stay-card__badge">{unit.sleeps} {locale === 'de' ? 'Personen' : 'guests'}</Badge>
          {unit.seminarCapable && <Badge variant="secondary" className="site-stay-card__badge">{locale === 'de' ? 'Seminarraum' : 'Seminar room'}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="site-stay-card__content">
        <p>{unit.teaser}</p>
        <span className="site-card-link">{locale === 'de' ? 'Wohnung ansehen' : 'View apartment'}<ArrowUpRightIcon aria-hidden="true" /></span>
      </CardContent>
    </Card>
  </Link>
}
