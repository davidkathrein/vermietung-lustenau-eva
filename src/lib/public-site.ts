import config from '@payload-config'
import { getPayload } from 'payload'

import type { Accommodation, Media, SiteSetting } from '@/payload-types'

export type Locale = 'de' | 'en'

export type PublicApartment = Pick<
  Accommodation,
  | 'slug'
  | 'name'
  | 'teaser'
  | 'description'
  | 'sleeps'
  | 'bedSetup'
  | 'sizeSqm'
  | 'seminarCapable'
  | 'seminarCapacity'
> & {
  photos: { url: string; alt: string; caption?: string | null }[]
  floorplan?: { url: string; alt: string }
}

function media(value: number | Media | null | undefined) {
  return typeof value === 'object' && value?.url ? { url: value.url, alt: value.alt } : undefined
}

export async function getPublicSite(locale: Locale) {
  const payload = await getPayload({ config })
  const [settings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', locale, depth: 0 }),
    payload.find({
      collection: 'accommodations',
      where: { published: { equals: true } },
      locale,
      depth: 2,
      sort: 'sortOrder',
      limit: 3,
    }),
  ])

  const apartments: PublicApartment[] = result.docs.map((unit) => ({
    slug: unit.slug,
    name: unit.name,
    teaser: unit.teaser,
    description: unit.description,
    sleeps: unit.sleeps,
    bedSetup: unit.bedSetup,
    sizeSqm: unit.sizeSqm,
    seminarCapable: unit.seminarCapable,
    seminarCapacity: unit.seminarCapacity,
    photos: (unit.gallery ?? []).flatMap((item) => {
      const image = media(item.image)
      return image ? [{ ...image, caption: item.caption }] : []
    }),
    floorplan: media(unit.floorplan),
  }))

  return { settings: settings as SiteSetting, apartments }
}
