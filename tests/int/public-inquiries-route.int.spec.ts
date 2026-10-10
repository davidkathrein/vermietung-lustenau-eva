import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addCalendarDays, todayInVienna } from '../../src/lib/calendar-day'

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
  findGlobal: vi.fn(),
  sendEmail: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => mocks) }))

import { POST } from '../../src/app/api/public-inquiries/route'

function validInquiry() {
  const arrival = addCalendarDays(todayInVienna(), 2)
  return new Request('http://localhost/api/public-inquiries', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      locale: 'de',
      kind: 'seminar',
      accommodationSlugs: ['wohnung-1'],
      arrival,
      departure: arrival,
      name: 'Test Person',
      email: 'Test@Example.com',
      guests: 4,
    }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.find.mockResolvedValue({ docs: [{ id: 1, name: 'Wohnung 1', seminarCapable: true, seminarCapacity: 10, sleeps: 4 }] })
  mocks.count.mockResolvedValue({ totalDocs: 0 })
  mocks.create.mockResolvedValue({ id: 42 })
  mocks.findGlobal.mockResolvedValue({ contactEmail: 'contact@example.com' })
  mocks.sendEmail.mockResolvedValue(undefined)
  vi.stubEnv('RESEND_API_KEY', 'test-key')
  vi.stubEnv('EMAIL_FROM', 'sender@example.com')
  vi.stubEnv('SUPPORT_EMAIL', 'support@example.com')
})

afterEach(() => vi.unstubAllEnvs())

describe('public inquiry persistence and abuse controls', () => {
  it.each(['settings lookup', 'email delivery'])('returns 201 after persistence when %s fails', async (failure) => {
    if (failure === 'settings lookup') mocks.findGlobal.mockRejectedValue(new Error('settings unavailable'))
    else mocks.sendEmail.mockRejectedValue(new Error('provider unavailable'))

    const response = await POST(validInquiry())

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'inquiries',
      data: expect.objectContaining({ email: 'test@example.com' }),
    }))
  })

  it('returns 429 without persisting or notifying when the email quota is reached', async () => {
    mocks.count.mockResolvedValueOnce({ totalDocs: 3 }).mockResolvedValueOnce({ totalDocs: 0 })

    const response = await POST(validInquiry())

    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('3600')
    await expect(response.json()).resolves.toEqual({ error: 'rate_limited' })
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.findGlobal).not.toHaveBeenCalled()
    expect(mocks.sendEmail).not.toHaveBeenCalled()
  })
})
