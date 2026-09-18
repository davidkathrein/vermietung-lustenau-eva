import config from '@/payload.config'
import { getPayload } from 'payload'
import { describe, expect, it } from 'vitest'

import { GET as getPublicAvailability } from '../../src/app/api/public-availability/route'

describe('public access', () => {
  it('does not expose private iCal URLs', async () => {
    const payload = await getPayload({ config })
    const slug = `access-check-${Date.now()}`
    const created = await payload.create({
      collection: 'accommodations',
      data: {
        slug,
        name: 'Access check',
        teaser: 'Access check',
        sleeps: 1,
        published: true,
        ical: {
          airbnb: 'https://www.airbnb.com/calendar/ical/private.ics',
          booking: 'https://ical.booking.com/private.ics',
        },
      },
    })

    try {
      const publicRecord = await payload.findByID({
        collection: 'accommodations',
        id: created.id,
        overrideAccess: false,
      })
      expect(JSON.stringify(publicRecord)).not.toContain('private.ics')
    } finally {
      await payload.delete({ collection: 'accommodations', id: created.id })
    }
  })

  it('includes an admin block in public availability without exposing its reason', async () => {
    const payload = await getPayload({ config })
    const slug = `block-check-${Date.now()}`
    const unit = await payload.create({
      collection: 'accommodations',
      data: { slug, name: 'Block check', teaser: 'Block check', sleeps: 1, published: true },
    })
    const block = await payload.create({
      collection: 'manual-blocks',
      data: {
        accommodation: unit.id,
        startDate: '2026-10-05T00:00:00.000Z',
        endDate: '2026-10-07T00:00:00.000Z',
        reason: 'Private reason',
      },
    })

    try {
      const response = await getPublicAvailability(new Request('http://localhost/api/public-availability?from=2026-10-04&through=2026-10-08'))
      const body = await response.json()
      const result = body.units.find((candidate: { slug: string }) => candidate.slug === slug)
      expect(result).toMatchObject({ state: 'not-connected', blockedDates: ['2026-10-05', '2026-10-06'] })
      expect(JSON.stringify(body)).not.toContain('Private reason')
    } finally {
      await payload.delete({ collection: 'manual-blocks', id: block.id })
      await payload.delete({ collection: 'accommodations', id: unit.id })
    }
  })
})
