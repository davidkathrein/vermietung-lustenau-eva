import config from '@payload-config'
import { getPayload } from 'payload'

import { INQUIRY_RATE_LIMIT, MAX_INQUIRY_ACCOMMODATIONS, validatePublicInquiry, type InquiryErrorCode } from '@/lib/inquiry'

export const runtime = 'nodejs'

function errorResponse(error: InquiryErrorCode, status = 400) {
  return Response.json({ error }, { status })
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_PUBLIC_INQUIRIES !== 'true') {
    return Response.json({ error: 'feature_disabled' }, { status: 503 })
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'unsupported_media_type' }, { status: 415 })
  }

  const raw = await request.text()
  if (raw.length > 8_000) return Response.json({ error: 'request_too_large' }, { status: 413 })

  let input: unknown
  try {
    input = JSON.parse(raw) as unknown
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return errorResponse('invalid_inquiry')
  }
  if ((input as Record<string, unknown>).company) return Response.json({ ok: true }, { status: 202 })

  const validation = validatePublicInquiry(input)
  if (!validation.ok) return errorResponse(validation.error)
  const { accommodationSlugs, arrival, departure, email, guests, kind, locale, message, name, phone } = validation.value

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'accommodations',
    where: { and: [{ slug: { in: accommodationSlugs } }, { published: { equals: true } }, { _status: { equals: 'published' } }] },
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: MAX_INQUIRY_ACCOMMODATIONS,
  })
  if (docs.length !== accommodationSlugs.length) return errorResponse('unknown_accommodation')
  if (kind === 'seminar' && (!docs[0].seminarCapable || guests > (docs[0].seminarCapacity || 10))) {
    return errorResponse('seminar_unavailable')
  }
  if (kind === 'stay' && guests > docs.reduce((total, unit) => total + unit.sleeps, 0)) {
    return errorResponse('too_many_guests')
  }

  const now = Date.now()
  const [emailCount, globalCount] = await Promise.all([
    payload.count({
      collection: 'inquiries',
      where: {
        and: [
          { email: { equals: email } },
          { createdAt: { greater_than: new Date(now - INQUIRY_RATE_LIMIT.email.windowMinutes * 60_000).toISOString() } },
        ],
      },
    }),
    payload.count({
      collection: 'inquiries',
      where: {
        createdAt: { greater_than: new Date(now - INQUIRY_RATE_LIMIT.global.windowMinutes * 60_000).toISOString() },
      },
    }),
  ])
  if (emailCount.totalDocs >= INQUIRY_RATE_LIMIT.email.maximum || globalCount.totalDocs >= INQUIRY_RATE_LIMIT.global.maximum) {
    return Response.json({ error: 'rate_limited' satisfies InquiryErrorCode }, {
      status: 429,
      headers: { 'Retry-After': String(INQUIRY_RATE_LIMIT.email.windowMinutes * 60) },
    })
  }

  await payload.create({
    collection: 'inquiries',
    data: {
      kind,
      accommodations: docs.map((unit) => unit.id),
      arrival,
      departure,
      name,
      email,
      phone: phone || undefined,
      guests,
      message: message || undefined,
      status: 'new',
    },
  })

  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    try {
      const settings = await payload.findGlobal({ slug: 'site-settings', locale: 'de', fallbackLocale: false, depth: 0 })
      const recipients = [...new Set([process.env.SUPPORT_EMAIL, settings.contactEmail].filter((value): value is string => Boolean(value)))]
      if (recipients.length > 0) {
        const units = docs.map((unit) => unit.name).join(', ')
        const subject = `Neue ${kind === 'seminar' ? 'Seminaranfrage' : 'Aufenthaltsanfrage'} von ${name}`
        const lines = [
          subject,
          '',
          `Unterkunft: ${units}`,
          `Zeitraum: ${arrival} bis ${departure}`,
          `Personen: ${guests}`,
          `E-Mail: ${email}`,
          phone ? `Telefon: ${phone}` : null,
          message ? `Nachricht:\n${message}` : null,
          '',
          'Die Anfrage wurde im Payload-Admin gespeichert und ist noch keine Buchung.',
        ].filter((line): line is string => line !== null)

        await payload.sendEmail({ to: recipients, subject, text: lines.join('\n') })
      }
    } catch {
      console.error('Inquiry notification email failed after the inquiry was saved')
    }
  }
  return Response.json({ ok: true }, { status: 201 })
}
