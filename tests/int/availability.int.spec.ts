import { describe, expect, it } from 'vitest'

import { expandManualBlock, parseBlockedDates } from '../../src/lib/availability'

describe('iCal availability', () => {
  it('blocks manual dates through the day before the exclusive end', () => {
    expect(expandManualBlock('2026-09-20T00:00:00.000Z', '2026-09-23T00:00:00.000Z', '2026-09-21', '2026-09-24'))
      .toEqual(['2026-09-21', '2026-09-22'])
  })
  it('treats an all-day checkout date as free', () => {
    const feed = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:stay-1
DTSTART;VALUE=DATE:20260920
DTEND;VALUE=DATE:20260923
END:VEVENT
END:VCALENDAR`

    expect(parseBlockedDates(feed, '2026-09-19', '2026-09-24')).toEqual([
      '2026-09-20', '2026-09-21', '2026-09-22',
    ])
  })

  it('expands recurring blocks and ignores cancelled events', () => {
    const feed = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:recurring-1
DTSTART;VALUE=DATE:20260920
DTEND;VALUE=DATE:20260921
RRULE:FREQ=DAILY;COUNT=3
END:VEVENT
BEGIN:VEVENT
UID:recurring-1
RECURRENCE-ID;VALUE=DATE:20260921
DTSTART;VALUE=DATE:20260921
DTEND;VALUE=DATE:20260922
STATUS:CANCELLED
END:VEVENT
BEGIN:VEVENT
UID:cancelled-1
DTSTART;VALUE=DATE:20260925
DTEND;VALUE=DATE:20260926
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`

    expect(parseBlockedDates(feed, '2026-09-19', '2026-09-26')).toEqual([
      '2026-09-20', '2026-09-22',
    ])
  })
})
