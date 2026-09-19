import { describe, expect, it } from 'vitest'

import { POST } from '../../src/app/api/public-inquiries/route'
import { addCalendarDays, addCalendarYears, todayInVienna } from '../../src/lib/calendar-day'

function inquiry(arrival: string, departure?: string): Request {
  return new Request('http://localhost/api/public-inquiries', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      locale: 'de',
      kind: departure ? 'stay' : 'seminar',
      accommodationSlugs: ['wohnung-1'],
      arrival,
      departure: departure ?? arrival,
      name: 'Test Person',
      email: 'test@example.com',
      guests: 1,
    }),
  })
}

describe('public inquiry date boundaries', () => {
  it('rejects today because inquiries must be in the future', async () => {
    const response = await POST(inquiry(todayInVienna()))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Date must be in the future' })
  })

  it('rejects dates beyond the rolling three-year boundary', async () => {
    const today = todayInVienna()
    const arrival = addCalendarDays(addCalendarYears(today, 3), 1)
    const response = await POST(inquiry(arrival))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Date is more than three years away' })
  })

  it('also applies the three-year boundary to departure', async () => {
    const today = todayInVienna()
    const latestDay = addCalendarYears(today, 3)
    const response = await POST(inquiry(addCalendarDays(latestDay, -2), addCalendarDays(latestDay, 1)))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Date is more than three years away' })
  })

  it('rejects seminar ranges longer than 90 days', async () => {
    const arrival = addCalendarDays(todayInVienna(), 1)
    const response = await POST(new Request('http://localhost/api/public-inquiries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        locale: 'de', kind: 'seminar', accommodationSlugs: ['wohnung-1'],
        arrival, departure: addCalendarDays(arrival, 90),
        name: 'Test Person', email: 'test@example.com', guests: 1,
      }),
    }))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Seminar must be between 1 and 90 days' })
  })
})
