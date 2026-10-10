import { describe, expect, it } from 'vitest'

import { addCalendarDays, addCalendarYears } from '../../src/lib/calendar-day'
import { inquiryErrorMessage, validatePublicInquiry } from '../../src/lib/inquiry'

const today = '2026-01-15'
const arrival = addCalendarDays(today, 10)

function input(overrides: Record<string, unknown> = {}) {
  return {
    locale: 'de',
    kind: 'stay',
    accommodationSlugs: ['wohnung-1'],
    arrival,
    departure: addCalendarDays(arrival, 2),
    name: 'Test Person',
    email: 'test@example.com',
    guests: 2,
    ...overrides,
  }
}

describe('shared inquiry validation', () => {
  it.each([
    { label: 'two-night stay', value: input(), ok: true },
    { label: '90-night stay', value: input({ departure: addCalendarDays(arrival, 90) }), ok: true },
    { label: 'one-night stay', value: input({ departure: addCalendarDays(arrival, 1) }), ok: false, error: 'stay_length' },
    { label: '91-night stay', value: input({ departure: addCalendarDays(arrival, 91) }), ok: false, error: 'stay_length' },
    { label: 'one-day seminar', value: input({ kind: 'seminar', departure: arrival }), ok: true },
    { label: '90-day seminar', value: input({ kind: 'seminar', departure: addCalendarDays(arrival, 89) }), ok: true },
    { label: '91-day seminar', value: input({ kind: 'seminar', departure: addCalendarDays(arrival, 90) }), ok: false, error: 'seminar_length' },
  ])('handles the $label boundary', ({ value, ok, error }) => {
    const result = validatePublicInquiry(value, today)
    expect(result.ok).toBe(ok)
    if (!result.ok) expect(result.error).toBe(error)
  })

  it('accepts valid requests on the rolling three-year boundary', () => {
    const latest = addCalendarYears(today, 3)
    expect(validatePublicInquiry(input({ kind: 'seminar', arrival: latest, departure: latest }), today).ok).toBe(true)
    expect(validatePublicInquiry(input({ arrival: addCalendarDays(latest, -2), departure: latest }), today).ok).toBe(true)
  })

  it('rejects dates after the rolling three-year boundary', () => {
    const tooLate = addCalendarDays(addCalendarYears(today, 3), 1)
    const result = validatePublicInquiry(input({ kind: 'seminar', arrival: tooLate, departure: tooLate }), today)
    expect(result).toEqual({ ok: false, error: 'date_too_far' })
  })

  it.each([
    ['duplicate slugs', { accommodationSlugs: ['wohnung-1', 'wohnung-1'] }],
    ['more than three slugs', { accommodationSlugs: ['one', 'two', 'three', 'four'] }],
    ['an overlong phone number', { phone: '1'.repeat(41) }],
    ['a non-string optional message', { message: 42 }],
  ])('rejects %s', (_label, overrides) => {
    expect(validatePublicInquiry(input(overrides), today)).toEqual({ ok: false, error: 'invalid_inquiry' })
  })

  it('accepts omitted optional fields and localizes domain errors', () => {
    expect(validatePublicInquiry(input({ email: 'Person@Example.COM' }), today)).toMatchObject({ ok: true, value: { email: 'person@example.com' } })
    expect(inquiryErrorMessage('too_many_guests', 'de')).toContain('Schlafplätze')
    expect(inquiryErrorMessage('too_many_guests', 'en')).toContain('enough beds')
    expect(inquiryErrorMessage('rate_limited', 'de')).toContain('zu viele Anfragen')
    expect(inquiryErrorMessage('feature_disabled', 'en')).toContain('try again later')
  })
})
