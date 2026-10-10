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
    await expect(response.json()).resolves.toEqual({ error: 'date_not_future' })
  })

  it('rejects dates beyond the rolling three-year boundary', async () => {
    const today = todayInVienna()
    const arrival = addCalendarDays(addCalendarYears(today, 3), 1)
    const response = await POST(inquiry(arrival))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'date_too_far' })
  })

  it('also applies the three-year boundary to departure', async () => {
    const today = todayInVienna()
    const latestDay = addCalendarYears(today, 3)
    const response = await POST(inquiry(addCalendarDays(latestDay, -2), addCalendarDays(latestDay, 1)))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'date_too_far' })
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
    await expect(response.json()).resolves.toEqual({ error: 'seminar_length' })
  })

  it('rejects a departure before a stay starts', async () => {
    const arrival = addCalendarDays(todayInVienna(), 4)
    const response = await POST(inquiry(arrival, addCalendarDays(arrival, -1)))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'stay_length' })
  })
})
