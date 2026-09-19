// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'

import { GET as calendarGET } from '../../src/app/api/internal/calendar-check/route'
import { GET as instagramGET } from '../../src/app/api/internal/instagram-sync/route'
import { authorizedCron } from '../../src/lib/cron-auth'

const previous = process.env.CRON_SECRET
const secret = 'c'.repeat(64)

afterEach(() => {
  if (previous === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = previous
})

describe('shared cron authorization', () => {
  it('accepts only the configured bearer secret', () => {
    process.env.CRON_SECRET = secret
    const request = (authorization?: string) => new Request('http://localhost/api/internal/calendar-check', {
      headers: authorization ? { Authorization: authorization } : {},
    })
    expect(authorizedCron(request(`Bearer ${secret}`))).toBe(true)
    expect(authorizedCron(request(secret))).toBe(false)
    expect(authorizedCron(request(`Bearer ${'x'.repeat(64)}`))).toBe(false)
    expect(authorizedCron(request(`Bearer ${secret} extra`))).toBe(false)
    expect(authorizedCron(request())).toBe(false)
    process.env.CRON_SECRET = 'too-short'
    expect(authorizedCron(request('Bearer too-short'))).toBe(false)
  })

  it('keeps both cron endpoints closed without the shared secret', async () => {
    delete process.env.CRON_SECRET
    const request = (path: string) => new Request(`http://localhost${path}`, { headers: { Authorization: `Bearer ${secret}` } })
    expect((await calendarGET(request('/api/internal/calendar-check'))).status).toBe(401)
    expect((await instagramGET(request('/api/internal/instagram-sync'))).status).toBe(401)
  })
})
