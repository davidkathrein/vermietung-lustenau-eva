import { createHmac, timingSafeEqual } from 'node:crypto'

import type { ManualBlock } from '@/payload-types'

function icalDay(value: string): string { return value.slice(0, 10).replaceAll('-', '') }

function previousDay(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export function calendarToken(unitID: number, secret: string): string {
  return createHmac('sha256', secret).update(`accommodation:${unitID}:ical:v1`).digest('hex')
}

export function validCalendarToken(unitID: number, secret: string, supplied: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(supplied)) return false
  return timingSafeEqual(Buffer.from(calendarToken(unitID, secret)), Buffer.from(supplied))
}

export function calendarFeed(unitID: number, blocks: ManualBlock[], now = new Date()): string {
  const stamp = now.toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}Z$/, 'Z')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hausvermietung Lustenau//Calendar Export//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const block of blocks) {
    if (!block.active) continue
    const start = block.usage === 'seminar' ? previousDay(block.startDate) : block.startDate
    lines.push('BEGIN:VEVENT', `UID:block-${block.id}-unit-${unitID}@hausvermietung-lustenau`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${icalDay(start)}`, `DTEND;VALUE=DATE:${icalDay(block.endDate)}`, 'SUMMARY:Unavailable', 'TRANSP:OPAQUE', 'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}
