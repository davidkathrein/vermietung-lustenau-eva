import ICAL from 'ical.js'

import type { Accommodation } from '@/payload-types'

export type Availability = {
  accommodationId: number
  state: 'ready' | 'not-connected' | 'error'
  blockedDates: string[]
  checkedAt?: string
}

const MAX_FEED_BYTES = 2_000_000
const MAX_OCCURRENCES = 5_000

function formatDay(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vienna',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

function dayOf(time: ICAL.Time): string {
  if (time.isDate) {
    return `${time.year}-${String(time.month).padStart(2, '0')}-${String(time.day).padStart(2, '0')}`
  }
  return formatDay(time.toJSDate())
}

function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

export function expandManualBlock(startDate: string, endDate: string, from: string, through: string): string[] {
  const days: string[] = []
  for (let day = startDate.slice(0, 10); day < endDate.slice(0, 10) && day <= through; day = addDays(day, 1)) {
    if (day >= from) days.push(day)
  }
  return days
}

function addInterval(
  blocked: Set<string>,
  start: ICAL.Time,
  end: ICAL.Time,
  from: string,
  through: string,
): void {
  const first = dayOf(start)
  const lastExclusive = end.isDate
    ? dayOf(end)
    : addDays(formatDay(new Date(end.toJSDate().getTime() - 1)), 1)

  for (let day = first; day < lastExclusive && day <= through; day = addDays(day, 1)) {
    if (day >= from) blocked.add(day)
  }
}

export function parseBlockedDates(ics: string, from: string, through: string): string[] {
  const calendar = new ICAL.Component(ICAL.parse(ics))
  const components = calendar.getAllSubcomponents('vevent')
  const blocked = new Set<string>()
  const events = components.map((component) => new ICAL.Event(component))
  const masters = new Map<string, ICAL.Event>()

  for (const event of events) {
    if (!event.isRecurrenceException()) masters.set(event.uid, event)
  }
  for (const event of events) {
    if (event.isRecurrenceException()) masters.get(event.uid)?.relateException(event)
  }

  for (const event of events) {
    if (event.isRecurrenceException() || String(event.component.getFirstPropertyValue('status') ?? '').toUpperCase() === 'CANCELLED') {
      continue
    }

    if (!event.isRecurring()) {
      addInterval(blocked, event.startDate, event.endDate, from, through)
      continue
    }

    const iterator = event.iterator()
    for (let count = 0; count < MAX_OCCURRENCES; count += 1) {
      const occurrence = iterator.next()
      if (!occurrence || dayOf(occurrence) > through) break
      const details = event.getOccurrenceDetails(occurrence)
      if (String(details.item.component.getFirstPropertyValue('status') ?? '').toUpperCase() === 'CANCELLED') continue
      addInterval(blocked, details.startDate, details.endDate, from, through)
    }
  }

  return [...blocked].sort()
}

async function loadFeed(url: string): Promise<string> {
  const parsed = new URL(url)
  const hostname = parsed.hostname.toLowerCase()
  const allowed = hostname === 'airbnb.com' || hostname.endsWith('.airbnb.com') ||
    hostname === 'booking.com' || hostname.endsWith('.booking.com')
  if (parsed.protocol !== 'https:' || !allowed) throw new Error('Unsupported iCal host')

  const response = await fetch(parsed.toString(), {
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`iCal request failed: ${response.status}`)
  const text = await response.text()
  if (Buffer.byteLength(text, 'utf8') > MAX_FEED_BYTES) throw new Error('iCal feed too large')
  return text
}

export async function probeFeed(url: string): Promise<void> {
  const feed = await loadFeed(url)
  parseBlockedDates(feed, '2000-01-01', '2000-01-02')
}

export async function getAvailability(
  accommodation: Accommodation,
  from: string,
  through: string,
  manualDates: string[] = [],
): Promise<Availability> {
  const airbnb = accommodation.ical?.airbnb?.trim()
  const booking = accommodation.ical?.booking?.trim()
  const urls = [airbnb, booking].filter((url): url is string => Boolean(url))
  const settled = await Promise.allSettled(urls.map(async (url) => parseBlockedDates(await loadFeed(url), from, through)))
  const blocked = new Set([...manualDates, ...settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])])
  const state = settled.some((result) => result.status === 'rejected') ? 'error' : urls.length < 2 ? 'not-connected' : 'ready'
  return { accommodationId: accommodation.id, state, blockedDates: [...blocked].sort(), checkedAt: state === 'ready' ? new Date().toISOString() : undefined }
}
