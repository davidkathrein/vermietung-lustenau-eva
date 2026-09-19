import config from '@/payload.config'
import { getPayload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { blocksConflict } from '../../src/hooks/syncInquiryBlock'
import { calendarFeed, calendarToken, validCalendarToken } from '../../src/lib/calendar-export'
import { getRedirectTarget } from '../../src/lib/public-content'
import type { ManualBlock } from '../../src/payload-types'

describe('shared apartment and seminar calendar', () => {
  it('blocks the seminar on a stay arrival or departure day', () => {
    const stay = { start: '2026-10-05', end: '2026-10-08', usage: 'stay' as const }
    expect(blocksConflict({ start: '2026-10-05', end: '2026-10-06', usage: 'seminar' }, stay)).toBe(true)
    expect(blocksConflict({ start: '2026-10-08', end: '2026-10-09', usage: 'seminar' }, stay)).toBe(true)
    expect(blocksConflict({ start: '2026-10-09', end: '2026-10-10', usage: 'seminar' }, stay)).toBe(false)
    expect(blocksConflict({ start: '2026-10-08', end: '2026-10-10', usage: 'stay' }, stay)).toBe(false)
  })

  it('exports only active blocks and extends seminars to the previous night', () => {
    const secret = 'a'.repeat(32)
    const token = calendarToken(4, secret)
    expect(validCalendarToken(4, secret, token)).toBe(true)
    expect(validCalendarToken(5, secret, token)).toBe(false)
    const blocks = [
      { id: 1, active: true, usage: 'seminar', startDate: '2026-10-05T00:00:00.000Z', endDate: '2026-10-06T00:00:00.000Z' },
      { id: 2, active: false, usage: 'stay', startDate: '2026-10-07T00:00:00.000Z', endDate: '2026-10-09T00:00:00.000Z' },
    ] as ManualBlock[]
    const feed = calendarFeed(4, blocks, new Date('2026-09-18T00:00:00.000Z'))
    expect(feed).toContain('DTSTART;VALUE=DATE:20261004')
    expect(feed).toContain('DTEND;VALUE=DATE:20261006')
    expect(feed).not.toContain('block-2')
    expect(feed).not.toContain('Private reason')
  })

  it('creates a block on confirmation and retains it as inactive after cancellation', async () => {
    const payload = await getPayload({ config })
    const unit = await payload.create({ collection: 'accommodations', locale: 'de', draft: true, data: { slug: `seminar-test-${Date.now()}`, name: 'Seminarwohnung', teaser: 'Ein Test', sleeps: 2, seminarCapable: true } })
    let inquiryId: number | undefined
    try {
      const inquiry = await payload.create({ collection: 'inquiries', data: { kind: 'seminar', accommodations: [unit.id], arrival: '2026-11-05T00:00:00.000Z', name: 'Test Person', email: 'seminar@example.invalid', status: 'new' } })
      inquiryId = inquiry.id
      await payload.update({ collection: 'inquiries', id: inquiry.id, data: { status: 'confirmed', confirmDespiteUnknown: true } })
      const active = await payload.find({ collection: 'manual-blocks', where: { inquiry: { equals: inquiry.id } }, depth: 0 })
      expect(active.docs).toHaveLength(1)
      expect(active.docs[0]).toMatchObject({ active: true, usage: 'seminar' })
      await payload.update({ collection: 'inquiries', id: inquiry.id, data: { status: 'cancelled' } })
      const cancelled = await payload.findByID({ collection: 'manual-blocks', id: active.docs[0].id, depth: 0 })
      expect(cancelled.active).toBe(false)
    } finally {
      if (inquiryId) {
        const blocks = await payload.find({ collection: 'manual-blocks', where: { inquiry: { equals: inquiryId } }, depth: 0 })
        for (const block of blocks.docs) await payload.delete({ collection: 'manual-blocks', id: block.id })
        await payload.delete({ collection: 'inquiries', id: inquiryId })
      }
      await payload.delete({ collection: 'accommodations', id: unit.id })
    }
  })

  it('rejects a known platform block even when the other feed is unavailable and the exception is set', async () => {
    const payload = await getPayload({ config })
    const unit = await payload.create({
      collection: 'accommodations', locale: 'de', draft: true,
      data: {
        slug: `partial-feed-${Date.now()}`, name: 'Prüfwohnung', teaser: 'Ein Test', sleeps: 2,
        ical: { airbnb: 'https://www.airbnb.com/calendar/ical/test.ics', booking: 'https://ical.booking.com/test.ics' },
      },
    })
    const inquiry = await payload.create({
      collection: 'inquiries',
      data: { kind: 'stay', accommodations: [unit.id], arrival: '2026-11-05', departure: '2026-11-07', name: 'Test Person', email: 'partial-feed@example.invalid', status: 'new' },
    })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) =>
      String(url).includes('airbnb.com')
        ? new Response('BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:occupied\nDTSTART;VALUE=DATE:20261105\nDTEND;VALUE=DATE:20261106\nEND:VEVENT\nEND:VCALENDAR')
        : new Response('Feed unavailable', { status: 503 }),
    )
    try {
      await expect(payload.update({ collection: 'inquiries', id: inquiry.id, data: { status: 'confirmed', confirmDespiteUnknown: true } }))
        .rejects.toThrow('Plattform-Kalender meldet')
      const blocks = await payload.find({ collection: 'manual-blocks', where: { inquiry: { equals: inquiry.id } } })
      expect(blocks.docs).toHaveLength(0)
    } finally {
      fetchMock.mockRestore()
      await payload.delete({ collection: 'inquiries', id: inquiry.id })
      await payload.delete({ collection: 'accommodations', id: unit.id })
    }
  })
})

describe('localized slug redirects', () => {
  it('points an old public apartment slug to the current localized slug', async () => {
    const payload = await getPayload({ config })
    const oldSlug = `old-unit-${Date.now()}`
    const newSlug = `new-unit-${Date.now()}`
    const unit = await payload.create({ collection: 'accommodations', locale: 'de', draft: true, data: { slug: oldSlug, name: 'Prüfwohnung', teaser: 'Ein Test', sleeps: 1, published: true } })
    try {
      await payload.update({ collection: 'accommodations', id: unit.id, locale: 'en', draft: true, data: { slug: 'test-apartment', name: 'Test apartment', teaser: 'A test' } })
      await payload.update({ collection: 'accommodations', id: unit.id, locale: 'de', data: { _status: 'published' } })
      await payload.update({ collection: 'accommodations', id: unit.id, locale: 'en', data: { slug: 'test-apartment', name: 'Test apartment', teaser: 'A test', _status: 'published' } })
      await payload.update({ collection: 'accommodations', id: unit.id, locale: 'de', data: { slug: newSlug } })
      expect(await getRedirectTarget(`/de/wohnungen/${oldSlug}`, 'de')).toBe(`/de/wohnungen/${newSlug}`)
      await payload.update({ collection: 'accommodations', id: unit.id, locale: 'en', data: { slug: 'renamed-apartment' } })
      expect(await getRedirectTarget('/en/apartments/test-apartment', 'en')).toBe('/en/apartments/renamed-apartment')
    } finally {
      const redirects = await payload.find({ collection: 'slug-redirects', where: { targetId: { equals: unit.id } }, limit: 100 })
      for (const redirect of redirects.docs) await payload.delete({ collection: 'slug-redirects', id: redirect.id })
      await payload.delete({ collection: 'accommodations', id: unit.id })
    }
  })
})
