import config from '@payload-config'
import { getPayload } from 'payload'

import { todayInVienna, validCalendarDay } from '@/lib/calendar-day'

export const runtime = 'nodejs'

type InquiryInput = {
  locale?: unknown
  kind?: unknown
  accommodationSlugs?: unknown
  arrival?: unknown
  departure?: unknown
  name?: unknown
  email?: unknown
  phone?: unknown
  guests?: unknown
  message?: unknown
  company?: unknown
}

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length <= maxLength ? trimmed : null
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_PUBLIC_INQUIRIES !== 'true') {
    return Response.json({ error: 'Inquiries are not enabled' }, { status: 503 })
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'Expected JSON' }, { status: 415 })
  }

  const raw = await request.text()
  if (raw.length > 8_000) return Response.json({ error: 'Request too large' }, { status: 413 })

  let input: InquiryInput
  try {
    input = JSON.parse(raw) as InquiryInput
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (input.company) return Response.json({ ok: true }, { status: 202 })

  const kind = input.kind
  const locale = input.locale === 'en' ? 'en' : 'de'
  const slugs = input.accommodationSlugs
  const arrival = text(input.arrival, 10)
  const departure = text(input.departure, 10)
  const name = text(input.name, 120)
  const email = text(input.email, 254)
  const phone = text(input.phone, 40)
  const message = text(input.message, 2_000)
  const guests = input.guests

  if ((kind !== 'stay' && kind !== 'seminar') ||
    !Array.isArray(slugs) || slugs.length < 1 || slugs.length > 3 ||
    !slugs.every((slug) => typeof slug === 'string' && /^[a-z0-9-]{1,80}$/.test(slug)) ||
    new Set(slugs).size !== slugs.length ||
    !arrival || !validCalendarDay(arrival) ||
    !name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    (phone === null && input.phone !== undefined) ||
    (message === null && input.message !== undefined) ||
    !Number.isInteger(guests) || (guests as number) < 1 || (guests as number) > 20) {
    return Response.json({ error: 'Invalid inquiry' }, { status: 400 })
  }

  const today = todayInVienna()
  if (arrival < today) return Response.json({ error: 'Date is in the past' }, { status: 400 })
  if (kind === 'stay') {
    if (!departure || !validCalendarDay(departure)) return Response.json({ error: 'Departure required' }, { status: 400 })
    const nights = (Date.parse(`${departure}T00:00:00Z`) - Date.parse(`${arrival}T00:00:00Z`)) / 86_400_000
    if (nights < 2 || nights > 90) return Response.json({ error: 'Stay must be between 2 and 90 nights' }, { status: 400 })
  } else if (slugs.length !== 1) {
    return Response.json({ error: 'A seminar uses exactly one room' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'accommodations',
    where: { and: [{ slug: { in: slugs as string[] } }, { published: { equals: true } }, { _status: { equals: 'published' } }] },
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: 3,
  })
  if (docs.length !== slugs.length) return Response.json({ error: 'Unknown accommodation' }, { status: 400 })
  if (kind === 'seminar' && (!docs[0].seminarCapable || (guests as number) > (docs[0].seminarCapacity || 10))) {
    return Response.json({ error: 'Seminar room unavailable' }, { status: 400 })
  }
  if (kind === 'stay' && (guests as number) > docs.reduce((total, unit) => total + unit.sleeps, 0)) {
    return Response.json({ error: 'Too many guests' }, { status: 400 })
  }

  await payload.create({
    collection: 'inquiries',
    data: {
      kind,
      accommodations: docs.map((unit) => unit.id),
      arrival,
      departure: kind === 'stay' ? departure : undefined,
      name,
      email,
      phone: phone || undefined,
      guests: guests as number,
      message: message || undefined,
      status: 'new',
    },
  })
  return Response.json({ ok: true }, { status: 201 })
}
