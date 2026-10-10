import { addCalendarDays, addCalendarYears, todayInVienna, validCalendarDay } from './calendar-day'
import type { SiteLocale } from './locale'

export type InquiryKind = 'stay' | 'seminar'

export type InquiryErrorCode =
  | 'date_not_future'
  | 'date_too_far'
  | 'invalid_inquiry'
  | 'rate_limited'
  | 'seminar_length'
  | 'seminar_room_count'
  | 'seminar_unavailable'
  | 'stay_length'
  | 'too_many_guests'
  | 'unknown_accommodation'

export type PublicInquiry = {
  locale: SiteLocale
  kind: InquiryKind
  accommodationSlugs: string[]
  arrival: string
  departure: string
  name: string
  email: string
  phone?: string
  guests: number
  message?: string
}

type InquiryResult =
  | { ok: true; value: PublicInquiry }
  | { ok: false; error: InquiryErrorCode }

export const MAX_INQUIRY_RANGE_DAYS = 90
export const MAX_INQUIRY_GUESTS = 20
export const MAX_INQUIRY_ACCOMMODATIONS = 3
export const INQUIRY_RATE_LIMIT = {
  email: { maximum: 3, windowMinutes: 60 },
  global: { maximum: 60, windowMinutes: 10 },
} as const

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length <= maxLength ? trimmed : null
}

export function calendarDayDifference(start: string, end: string): number {
  return (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000
}

export function inquiryDateLimits(kind: InquiryKind, arrival: string, today = todayInVienna()) {
  const latestDay = addCalendarYears(today, 3)
  const minimumOffset = kind === 'stay' ? 2 : 0
  const maximumOffset = kind === 'stay' ? MAX_INQUIRY_RANGE_DAYS : MAX_INQUIRY_RANGE_DAYS - 1

  return {
    earliestArrival: addCalendarDays(today, 1),
    latestArrival: kind === 'stay' ? addCalendarDays(latestDay, -2) : latestDay,
    earliestDeparture: addCalendarDays(arrival, minimumOffset),
    latestDeparture: [latestDay, addCalendarDays(arrival, maximumOffset)].sort()[0],
    latestDay,
  }
}

export function validatePublicInquiry(input: unknown, today = todayInVienna()): InquiryResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'invalid_inquiry' }
  }

  const value = input as Record<string, unknown>
  const kind = value.kind
  const slugs = value.accommodationSlugs
  const arrival = text(value.arrival, 10)
  const departure = text(value.departure, 10)
  const name = text(value.name, 120)
  const email = text(value.email, 254)
  const phone = text(value.phone, 40)
  const message = text(value.message, 2_000)
  const guests = value.guests

  if ((kind !== 'stay' && kind !== 'seminar') ||
    !Array.isArray(slugs) || slugs.length < 1 || slugs.length > MAX_INQUIRY_ACCOMMODATIONS ||
    !slugs.every((slug) => typeof slug === 'string' && /^[a-z0-9-]{1,80}$/.test(slug)) ||
    new Set(slugs).size !== slugs.length ||
    !arrival || !validCalendarDay(arrival) ||
    !departure || !validCalendarDay(departure) ||
    !name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    (phone === null && value.phone !== undefined) ||
    (message === null && value.message !== undefined) ||
    !Number.isInteger(guests) || (guests as number) < 1 || (guests as number) > MAX_INQUIRY_GUESTS) {
    return { ok: false, error: 'invalid_inquiry' }
  }

  const limits = inquiryDateLimits(kind, arrival, today)
  if (arrival < limits.earliestArrival) return { ok: false, error: 'date_not_future' }
  if (arrival > limits.latestDay || departure > limits.latestDay) return { ok: false, error: 'date_too_far' }

  const duration = calendarDayDifference(arrival, departure)
  if (kind === 'stay' && (duration < 2 || duration > MAX_INQUIRY_RANGE_DAYS)) {
    return { ok: false, error: 'stay_length' }
  }
  if (kind === 'seminar' && (duration < 0 || duration >= MAX_INQUIRY_RANGE_DAYS)) {
    return { ok: false, error: 'seminar_length' }
  }
  if (kind === 'seminar' && slugs.length !== 1) {
    return { ok: false, error: 'seminar_room_count' }
  }

  return {
    ok: true,
    value: {
      locale: value.locale === 'en' ? 'en' : 'de',
      kind,
      accommodationSlugs: slugs as string[],
      arrival,
      departure,
      name,
      email: email.toLowerCase(),
      phone: phone || undefined,
      guests: guests as number,
      message: message || undefined,
    },
  }
}

export function inquiryErrorMessage(error: string | undefined, locale: SiteLocale): string {
  const messages: Record<InquiryErrorCode, { de: string; en: string }> = {
    date_not_future: { de: 'Bitte wähle einen Termin in der Zukunft.', en: 'Please choose a future date.' },
    date_too_far: { de: 'Termine können höchstens drei Jahre im Voraus angefragt werden.', en: 'Dates can be requested up to three years in advance.' },
    invalid_inquiry: { de: 'Bitte prüfe deine Angaben und versuche es erneut.', en: 'Please check your details and try again.' },
    rate_limited: { de: 'Es sind gerade zu viele Anfragen eingegangen. Bitte versuche es später erneut oder schreibe uns direkt.', en: 'We have received too many inquiries just now. Please try again later or contact us directly.' },
    seminar_length: { de: 'Ein Seminar kann zwischen einem und 90 Tagen dauern.', en: 'A seminar can last between one and 90 days.' },
    seminar_room_count: { de: 'Bitte wähle genau einen Seminarraum.', en: 'Please choose exactly one seminar room.' },
    seminar_unavailable: { de: 'Der gewählte Raum ist für diese Personenzahl nicht geeignet.', en: 'The selected room is not suitable for this group size.' },
    stay_length: { de: 'Ein Aufenthalt kann zwischen zwei und 90 Nächten dauern.', en: 'A stay can last between two and 90 nights.' },
    too_many_guests: { de: 'Die gewählten Wohnungen bieten nicht genug Schlafplätze.', en: 'The selected apartments do not have enough beds.' },
    unknown_accommodation: { de: 'Eine gewählte Wohnung ist nicht mehr verfügbar. Bitte lade die Seite neu.', en: 'A selected apartment is no longer available. Please reload the page.' },
  }

  return error && error in messages ? messages[error as InquiryErrorCode][locale] : locale === 'de'
    ? 'Bitte versuche es später erneut oder schreibe uns direkt.'
    : 'Please try again later or contact us directly.'
}
